import {
  CLASS_GOAL_TARGET,
  CLASSMATE_DAILY_GROWTH,
  CLEAN_COST,
  CLEANLINESS_DROP_PER_DAY,
  CLEANLINESS_START,
  DEMO_SEED,
  DIRTY_THRESHOLD,
  EGG_PRICE_MIN,
  EGGS_PER_HEALTHY_HEN_PER_DAY,
  FEED_BASE_PRICE,
  FEED_SPIKE_CHANCE,
  FEED_SPIKE_DAYS,
  FEED_SPIKE_MULT,
  GOLD_FEED_BAG_DISCOUNT,
  MARKET_STOCK_DECAY,
  MEDICINE_COST,
  NPC_DAILY_BUDGET,
  REPUTATION_PERK_THRESHOLD,
  SAVINGS_EARLY_PENALTY,
  SAVINGS_INTEREST_PER_DAY,
  SAVINGS_MIN_LOCK_DAYS,
  SEASON_BONUS_MINT,
  SICK_CHANCE_BASE,
  SICK_CHANCE_DIRTY,
  SICK_CHANCE_UNFED,
  SICK_DEATH_DAYS,
  STARTER_GRANT,
} from './constants';
import { eggPrice } from './market';
import { generateMentorMessages } from './mentor';
import { nextRandom } from './rng';
import { DayEvent, GameState, Hen } from './types';

export function getFeedPricePerHen(state: Pick<GameState, 'feedSpikeDaysLeft' | 'reputation'>): number {
  const spikeMult = state.feedSpikeDaysLeft > 0 ? FEED_SPIKE_MULT : 1;
  const base = FEED_BASE_PRICE * spikeMult;
  const discount =
    state.reputation >= REPUTATION_PERK_THRESHOLD ? 1 - GOLD_FEED_BAG_DISCOUNT : 1;
  return Math.round(base * discount * 100) / 100;
}

export function getClassSavingsTotal(state: Pick<GameState, 'jar' | 'classmates'>): number {
  const classmatesTotal = state.classmates.reduce((sum, c) => sum + c.jar, 0);
  return Math.round((state.jar + classmatesTotal) * 100) / 100;
}

export function createInitialGameState(seed: number = DEMO_SEED): GameState {
  return {
    day: 1,
    balance: STARTER_GRANT,
    hens: [
      {
        id: 'hen-1',
        name: 'Clover',
        sickDays: 0,
        fedToday: true,
      },
    ],
    eggs: 0,
    cleanliness: CLEANLINESS_START,
    marketStock: 6,
    feedSpikeDaysLeft: 0,
    jar: 0,
    jarDepositDay: null,
    reputation: 0,
    season: 1,
    seed,
    rngState: seed,
    pendingApproval: null,
    tutorialStep: 1,
    classmates: [
      { name: 'Maya', jar: 95 },
      { name: 'Leo', jar: 88 },
      { name: 'Sam', jar: 102 },
      { name: 'Zoe', jar: 90 },
    ],
    npcBalance: NPC_DAILY_BUDGET,
    dailyIncome: 0,
    dailyExtraCosts: 0,
    seasonGoalReachedInSeason: false,
  };
}

export type NextDayResult = {
  state: GameState;
  events: DayEvent[];
  mentorMessages: string[];
};

/**
 * Day tick: order of operations from docs/GAME_RULES.md:
 * 1. Apply daily feed: cost = hens * feedPrice(day). If player cannot pay, hens are unfed (list which).
 * 2. Cleanliness -= CLEANLINESS_DROP_PER_DAY (min 0).
 * 3. For each hen: roll sickness using the highest applicable chance (unfed > dirty > base). Sick hens get `sickDays += 1`; hens at SICK_DEATH_DAYS die.
 * 4. Production: each healthy, fed hen makes EGGS_PER_HEALTHY_HEN_PER_DAY eggs into inventory.
 * 5. Market: `marketStock *= (1 - MARKET_STOCK_DECAY)`.
 * 6. Feed event: if no spike active and rng < 0.15, start spike for FEED_SPIKE_DAYS; decrement active spike.
 * 7. Savings interest: `jar += jar * SAVINGS_INTEREST_PER_DAY`.
 * 8. Increment `day`.
 * 9. Generate mentor message (see triggers).
 * 10. Check class goal.
 */
export function nextDay(prevState: GameState): NextDayResult {
  const events: DayEvent[] = [];
  let rngState = prevState.rngState;
  let balance = prevState.balance;

  const drawRng = () => {
    const r = nextRandom(rngState);
    rngState = r.nextState;
    return r.value;
  };

  // 1. Apply daily feed: cost = hens * feedPrice(day). If player cannot pay, hens are unfed (list which).
  const feedPrice = getFeedPricePerHen(prevState);
  let feedCostPaid = 0;
  const unfedHenIds: string[] = [];

  const hensAfterFeed: Hen[] = prevState.hens.map((hen) => {
    if (balance >= feedPrice) {
      balance = Math.round((balance - feedPrice) * 100) / 100;
      feedCostPaid = Math.round((feedCostPaid + feedPrice) * 100) / 100;
      return { ...hen, fedToday: true };
    } else {
      unfedHenIds.push(hen.id);
      return { ...hen, fedToday: false };
    }
  });

  if (feedCostPaid > 0) {
    events.push({
      type: 'feed_paid',
      data: { cost: feedCostPaid, unitPrice: feedPrice },
    });
  }
  if (unfedHenIds.length > 0) {
    events.push({
      type: 'hens_unfed',
      data: { count: unfedHenIds.length, ids: unfedHenIds.join(','), feedCost: feedPrice },
    });
  }

  // 2. Cleanliness -= CLEANLINESS_DROP_PER_DAY (min 0).
  const cleanliness = Math.max(0, prevState.cleanliness - CLEANLINESS_DROP_PER_DAY);
  events.push({
    type: 'cleanliness_dropped',
    data: { cleanliness },
  });

  // 3. For each hen: roll sickness using the highest applicable chance (unfed > dirty > base).
  // Sick hens get `sickDays += 1`; hens at SICK_DEATH_DAYS die.
  const isDirty = cleanliness < DIRTY_THRESHOLD;
  const survivingHens: Hen[] = [];

  for (const hen of hensAfterFeed) {
    if (hen.sickDays > 0) {
      // Already sick hen gets sickDays += 1
      const nextSickDays = hen.sickDays + 1;
      if (nextSickDays >= SICK_DEATH_DAYS) {
        events.push({
          type: 'hen_died',
          data: { henId: hen.id },
        });
      } else {
        survivingHens.push({ ...hen, sickDays: nextSickDays });
      }
    } else {
      // Roll sickness using highest applicable chance (unfed > dirty > base)
      let chance = SICK_CHANCE_BASE;
      let reason: 'unfed' | 'dirty' | 'base' = 'base';
      if (!hen.fedToday) {
        chance = SICK_CHANCE_UNFED;
        reason = 'unfed';
      } else if (isDirty) {
        chance = SICK_CHANCE_DIRTY;
        reason = 'dirty';
      }

      const roll = drawRng();
      if (roll < chance) {
        const nextSickDays = 1;
        survivingHens.push({ ...hen, sickDays: nextSickDays });
        if (reason === 'unfed') {
          events.push({
            type: 'hen_sick_unfed',
            data: { henId: hen.id, feedCost: feedPrice },
          });
        } else if (reason === 'dirty') {
          events.push({
            type: 'hen_sick_dirty',
            data: { henId: hen.id, cleanliness },
          });
        } else {
          // Even if base roll triggered when coop is somewhat dirty or normal, still surface dirty message so kids understand coop care
          events.push({
            type: 'hen_sick_dirty',
            data: { henId: hen.id, cleanliness },
          });
        }
      } else {
        survivingHens.push(hen);
      }
    }
  }

  // 4. Production: each healthy, fed hen makes EGGS_PER_HEALTHY_HEN_PER_DAY eggs into inventory.
  const healthyFedCount = survivingHens.filter(
    (h) => h.sickDays === 0 && h.fedToday
  ).length;
  const producedEggs = healthyFedCount * EGGS_PER_HEALTHY_HEN_PER_DAY;
  const eggs = prevState.eggs + producedEggs;

  if (producedEggs > 0) {
    events.push({
      type: 'eggs_produced',
      data: { eggs: producedEggs },
    });
  }

  // 5. Market: `marketStock *= (1 - MARKET_STOCK_DECAY)`. Also top up NPC daily budget.
  const marketStock =
    Math.round(prevState.marketStock * (1 - MARKET_STOCK_DECAY) * 100) / 100;
  const npcBalance = Math.max(prevState.npcBalance, NPC_DAILY_BUDGET);

  const currentEggPrice = eggPrice(marketStock);

  // Evaluate daily profit / loss based on produced egg value + sales vs daily costs
  const totalDayCosts =
    Math.round((feedCostPaid + prevState.dailyExtraCosts) * 100) / 100;
  const impliedEggIncome =
    prevState.dailyIncome > 0
      ? prevState.dailyIncome
      : Math.round(producedEggs * currentEggPrice * 100) / 100;
  const netResult = Math.round((impliedEggIncome - totalDayCosts) * 100) / 100;

  if (netResult > 0 && producedEggs > 0) {
    events.push({
      type: 'profit_day',
      data: {
        profit: netResult,
        eggs: producedEggs,
        price: currentEggPrice,
        costs: totalDayCosts,
      },
    });
  } else if (netResult < 0) {
    events.push({
      type: 'loss_day',
      data: {
        loss: Math.abs(netResult),
        costs: totalDayCosts,
        income: impliedEggIncome,
      },
    });
  }

  if (currentEggPrice <= EGG_PRICE_MIN + 0.3) {
    events.push({
      type: 'price_low',
      data: { price: currentEggPrice },
    });
  }

  // 6. Feed event: if no spike active and rng < 0.15, start spike for FEED_SPIKE_DAYS; decrement active spike.
  let feedSpikeDaysLeft = prevState.feedSpikeDaysLeft;
  const spikeRoll = drawRng();
  if (feedSpikeDaysLeft > 0) {
    feedSpikeDaysLeft = Math.max(0, feedSpikeDaysLeft - 1);
  } else if (spikeRoll < FEED_SPIKE_CHANCE) {
    feedSpikeDaysLeft = FEED_SPIKE_DAYS;
    const spikedPrice =
      Math.round(
        FEED_BASE_PRICE *
          FEED_SPIKE_MULT *
          (prevState.reputation >= REPUTATION_PERK_THRESHOLD
            ? 1 - GOLD_FEED_BAG_DISCOUNT
            : 1) *
          100
      ) / 100;
    events.push({
      type: 'feed_spike_started',
      data: { days: FEED_SPIKE_DAYS, price: spikedPrice },
    });
  }

  // 7. Savings interest: `jar += jar * SAVINGS_INTEREST_PER_DAY`.
  let jar = prevState.jar;
  if (jar > 0) {
    const interest = Math.round(jar * SAVINGS_INTEREST_PER_DAY * 100) / 100;
    jar = Math.round((jar + interest) * 100) / 100;
    if (interest > 0) {
      events.push({
        type: 'savings_interest',
        data: { interest },
      });
    }
  }

  // Simulated classmates grow 3% per day
  const classmates = prevState.classmates.map((c) => ({
    ...c,
    jar: Math.round(c.jar * (1 + CLASSMATE_DAILY_GROWTH) * 100) / 100,
  }));

  // Reputation: +1 for each day with all hens fed and healthy; +1 for day with savings jar > 0
  let reputation = prevState.reputation;
  const allFedAndHealthy =
    survivingHens.length > 0 &&
    survivingHens.every((h) => h.fedToday && h.sickDays === 0);
  if (allFedAndHealthy) {
    reputation += 1;
  }
  if (jar > 0) {
    reputation += 1;
  }

  // 8. Increment `day`.
  const day = prevState.day + 1;

  // 10. Check class goal (before mentor messages so Goal reached trigger can be included in mentor messages)
  let season = prevState.season;
  let seasonGoalReachedInSeason = prevState.seasonGoalReachedInSeason;
  const classSavings = getClassSavingsTotal({ jar, classmates });

  if (classSavings >= CLASS_GOAL_TARGET && !seasonGoalReachedInSeason) {
    balance = Math.round((balance + SEASON_BONUS_MINT) * 100) / 100;
    season += 1;
    seasonGoalReachedInSeason = true;
    events.push({
      type: 'goal_reached',
      data: { bonus: SEASON_BONUS_MINT, classSavings, season },
    });
  }

  // 9. Generate mentor message (see triggers).
  const mentorMessages = generateMentorMessages(events);

  const nextState: GameState = {
    ...prevState,
    day,
    balance,
    hens: survivingHens,
    eggs,
    cleanliness,
    marketStock,
    feedSpikeDaysLeft,
    jar,
    reputation,
    season,
    rngState,
    classmates,
    npcBalance,
    dailyIncome: 0,
    dailyExtraCosts: 0,
    seasonGoalReachedInSeason,
  };

  return {
    state: nextState,
    events,
    mentorMessages,
  };
}

/**
 * Helper pure functions for player actions between ticks
 */
export function cleanCoopAction(state: GameState): {
  state: GameState;
  cleaned: boolean;
} {
  if (state.balance < CLEAN_COST || state.cleanliness >= 100) {
    return { state, cleaned: false };
  }
  return {
    cleaned: true,
    state: {
      ...state,
      balance: Math.round((state.balance - CLEAN_COST) * 100) / 100,
      cleanliness: 100,
      dailyExtraCosts: Math.round((state.dailyExtraCosts + CLEAN_COST) * 100) / 100,
    },
  };
}

export function cureHenAction(
  state: GameState,
  henId?: string
): { state: GameState; curedHenId: string | null } {
  if (state.balance < MEDICINE_COST) {
    return { state, curedHenId: null };
  }
  const target = henId
    ? state.hens.find((h) => h.id === henId && h.sickDays > 0)
    : state.hens.find((h) => h.sickDays > 0);
  if (!target) {
    return { state, curedHenId: null };
  }
  return {
    curedHenId: target.id,
    state: {
      ...state,
      balance: Math.round((state.balance - MEDICINE_COST) * 100) / 100,
      hens: state.hens.map((h) =>
        h.id === target.id ? { ...h, sickDays: 0 } : h
      ),
      dailyExtraCosts:
        Math.round((state.dailyExtraCosts + MEDICINE_COST) * 100) / 100,
    },
  };
}

export function depositToJar(
  state: GameState,
  amount: number
): { state: GameState; deposited: number } {
  const validAmount = Math.min(state.balance, Math.max(0, Math.floor(amount)));
  if (validAmount <= 0) {
    return { state, deposited: 0 };
  }
  const nextJar = Math.round((state.jar + validAmount) * 100) / 100;
  let nextBalance = Math.round((state.balance - validAmount) * 100) / 100;
  let nextSeason = state.season;
  let seasonGoalReachedInSeason = state.seasonGoalReachedInSeason;

  const classSavings = getClassSavingsTotal({
    jar: nextJar,
    classmates: state.classmates,
  });

  if (classSavings >= CLASS_GOAL_TARGET && !seasonGoalReachedInSeason) {
    nextBalance = Math.round((nextBalance + SEASON_BONUS_MINT) * 100) / 100;
    nextSeason += 1;
    seasonGoalReachedInSeason = true;
  }

  return {
    deposited: validAmount,
    state: {
      ...state,
      balance: nextBalance,
      jar: nextJar,
      // Reset lock timer on any deposit per GAME_RULES.md
      jarDepositDay: state.day,
      season: nextSeason,
      seasonGoalReachedInSeason,
    },
  };
}

export type WithdrawResult = {
  state: GameState;
  withdrawn: number;
  received: number;
  penalty: number;
  isEarly: boolean;
  events: DayEvent[];
  mentorMessages: string[];
};

export function withdrawFromJar(
  state: GameState,
  amount: number
): WithdrawResult {
  const validAmount = Math.min(state.jar, Math.max(0, Math.round(amount * 100) / 100));
  if (validAmount <= 0) {
    return {
      state,
      withdrawn: 0,
      received: 0,
      penalty: 0,
      isEarly: false,
      events: [],
      mentorMessages: [],
    };
  }

  const daysLocked =
    state.jarDepositDay !== null ? state.day - state.jarDepositDay : SAVINGS_MIN_LOCK_DAYS;
  const isEarly = daysLocked < SAVINGS_MIN_LOCK_DAYS;
  const penalty = isEarly
    ? Math.round(validAmount * SAVINGS_EARLY_PENALTY * 100) / 100
    : 0;
  const received = Math.round((validAmount - penalty) * 100) / 100;
  const nextJar = Math.max(0, Math.round((state.jar - validAmount) * 100) / 100);

  const events: DayEvent[] = [];
  if (isEarly && penalty > 0) {
    events.push({
      type: 'early_withdraw',
      data: { penalty },
    });
  }

  const mentorMessages = events.length > 0 ? generateMentorMessages(events) : [];

  return {
    withdrawn: validAmount,
    received,
    penalty,
    isEarly,
    events,
    mentorMessages,
    state: {
      ...state,
      jar: nextJar,
      jarDepositDay: nextJar === 0 ? null : state.jarDepositDay,
      balance: Math.round((state.balance + received) * 100) / 100,
    },
  };
}
