import {
  CLASS_GOAL_TARGET,
  EGG_BASE_PRICE,
  HEN_PRICE,
} from './constants';
import { getClassSavingsTotal, getFeedPricePerHen } from './engine';
import { GameMode, GameState } from './types';

export type LevelGoalKind =
  | 'sell_eggs'
  | 'net_worth'
  | 'jar_hold'
  | 'class_savings'
  | 'survive_days'
  | 'cure_and_worth';

export type LevelDef = {
  id: number;
  name: string;
  concept: string;
  dayLimit: number;
  goal: {
    kind: LevelGoalKind;
    target: number;
    extra?: Record<string, number>;
  };
  setup: Partial<GameState>;
  forcedEvents?: { day: number; type: 'feed_spike'; days: number }[];
  parDays: number; // for 2nd star
  introText: string; // mentor intro
  learnedText: string; // one mentor sentence tied to the concept on win
  isChallenge?: boolean;
};

/**
 * Net worth formula from docs/GAME_MODES.md:
 * netWorth = coins + jar + hens * HEN_PRICE + eggs * EGG_BASE_PRICE
 */
export function netWorth(
  state: Pick<GameState, 'balance' | 'jar' | 'hens' | 'eggs'>
): number {
  const val =
    state.balance +
    state.jar +
    state.hens.length * HEN_PRICE +
    state.eggs * EGG_BASE_PRICE;
  return Math.round(val * 100) / 100;
}

export const CAREER_LEVELS: LevelDef[] = [
  {
    id: 1,
    name: 'First eggs',
    concept: 'Income vs cost',
    dayLimit: 6,
    parDays: 4,
    goal: {
      kind: 'sell_eggs',
      target: 4, // Balanced for 1 starter hen within 6 days (adjustable in levels.ts)
    },
    setup: {
      balance: 100,
      hens: [{ id: 'hen-1', name: 'Clover', sickDays: 0, fedToday: true }],
      eggs: 0,
      cleanliness: 100,
      jar: 0,
    },
    introText:
      'Feed your hen each day, collect fresh eggs, and sell them when the price is right!',
    learnedText:
      'You learned that a business makes a profit when egg sales bring in more coins than daily feed and cleaning costs!',
  },
  {
    id: 2,
    name: 'Growing flock',
    concept: 'Reinvesting',
    dayLimit: 12,
    parDays: 8,
    goal: {
      kind: 'net_worth',
      target: 160,
    },
    setup: {
      balance: 100,
      hens: [{ id: 'hen-1', name: 'Clover', sickDays: 0, fedToday: true }],
      eggs: 2,
      cleanliness: 100,
      jar: 15,
    },
    introText:
      'Use your coins to buy a second hen (with Guardian approval) so your flock produces twice as many eggs!',
    learnedText:
      'Reinvesting your coins into a second hen grew your daily egg income faster than holding idle cash!',
  },
  {
    id: 3,
    name: 'Feed crisis',
    concept: 'Risk and reserves',
    dayLimit: 15,
    parDays: 10,
    goal: {
      kind: 'net_worth',
      target: 200,
      extra: { maxHensLost: 0 },
    },
    setup: {
      balance: 95,
      hens: [
        { id: 'hen-1', name: 'Clover', sickDays: 0, fedToday: true },
        { id: 'hen-2', name: 'Sunny', sickDays: 0, fedToday: true },
      ],
      eggs: 2,
      cleanliness: 100,
      jar: 25,
    },
    forcedEvents: [{ day: 4, type: 'feed_spike', days: 5 }],
    introText:
      'A grain shortage is coming on Day 4! Keep enough coins in reserve so every hen stays fed and healthy.',
    learnedText:
      'Keeping an emergency reserve protected your flock when feed prices suddenly spiked!',
  },
  {
    id: 4,
    name: 'Patient saver',
    concept: 'Saving and interest',
    dayLimit: 15,
    parDays: 10,
    goal: {
      kind: 'jar_hold',
      target: 100,
      extra: { holdDays: 5, minReputation: 5 },
    },
    setup: {
      balance: 90,
      hens: [
        { id: 'hen-1', name: 'Clover', sickDays: 0, fedToday: true },
        { id: 'hen-2', name: 'Sunny', sickDays: 0, fedToday: true },
      ],
      eggs: 2,
      cleanliness: 100,
      jar: 40,
      jarDepositDay: 1,
    },
    introText:
      'Build your Savings Jar to 100 coins, hold it for 5 days to earn steady interest, and reach Reputation 5!',
    learnedText:
      'Patience pays: compound interest and good habits grew your savings and unlocked the Gold Feed Bag!',
  },
  {
    id: 5,
    name: 'Class goal',
    concept: 'Cooperation',
    dayLimit: 20,
    parDays: 12,
    goal: {
      kind: 'class_savings',
      target: CLASS_GOAL_TARGET,
    },
    setup: {
      balance: 100,
      hens: [
        { id: 'hen-1', name: 'Clover', sickDays: 0, fedToday: true },
        { id: 'hen-2', name: 'Sunny', sickDays: 0, fedToday: true },
      ],
      eggs: 2,
      cleanliness: 100,
      jar: 45,
      jarDepositDay: 1,
      classmates: [
        { name: 'Maya', jar: 95 },
        { name: 'Leo', jar: 88 },
        { name: 'Sam', jar: 102 },
        { name: 'Zoe', jar: 90 },
      ],
    },
    introText:
      'Save together with Maya, Leo, Sam, and Zoe! When total class savings reach 500 coins, everyone gets a +50 coin Season Bonus!',
    learnedText:
      'Working and saving together as a class unlocked a shared reward that helped every member!',
  },
];

export const CHALLENGE_SCENARIOS: LevelDef[] = [
  {
    id: 101,
    name: 'Feed Crisis',
    concept: 'Emergency Budgeting',
    dayLimit: 10,
    parDays: 10,
    isChallenge: true,
    goal: {
      kind: 'survive_days',
      target: 10,
      extra: { maxHensLost: 0 },
    },
    setup: {
      balance: 60,
      feedSpikeDaysLeft: 5,
      hens: [
        { id: 'hen-1', name: 'Clover', sickDays: 0, fedToday: true },
        { id: 'hen-2', name: 'Sunny', sickDays: 0, fedToday: true },
        { id: 'hen-3', name: 'Pip', sickDays: 0, fedToday: true },
      ],
      eggs: 1,
      cleanliness: 80,
      jar: 0,
    },
    introText:
      'Feed costs 1.5x for the next 5 days and you have 3 hungry hens! Survive 10 days without losing a single hen.',
    learnedText:
      'Steady egg sales and careful spending carried your 3 hens safely through the 5-day feed crisis!',
  },
  {
    id: 102,
    name: 'Sick Coop',
    concept: 'Prevention & Recovery',
    dayLimit: 8,
    parDays: 6,
    isChallenge: true,
    goal: {
      kind: 'cure_and_worth',
      target: 120,
    },
    setup: {
      balance: 50,
      cleanliness: 30,
      hens: [
        { id: 'hen-1', name: 'Clover', sickDays: 1, fedToday: true },
        { id: 'hen-2', name: 'Sunny', sickDays: 1, fedToday: true },
        { id: 'hen-3', name: 'Pip', sickDays: 0, fedToday: true },
      ],
      eggs: 0,
      jar: 0,
    },
    introText:
      'The coop is only 30% clean and 2 of your 3 hens are sick! Clean up, cure your flock, and reach 120 Net Worth by Day 8.',
    learnedText:
      'Acting fast with medicine and cleaning saved your flock from costly losses!',
  },
  {
    id: 103,
    name: 'Egg Glut',
    concept: 'Market Timing & Saving',
    dayLimit: 10,
    parDays: 8,
    isChallenge: true,
    goal: {
      kind: 'net_worth',
      target: 150,
    },
    setup: {
      balance: 30,
      marketStock: 25, // price floor (3 coins)
      hens: [
        { id: 'hen-1', name: 'Clover', sickDays: 0, fedToday: true },
        { id: 'hen-2', name: 'Sunny', sickDays: 0, fedToday: true },
        { id: 'hen-3', name: 'Pip', sickDays: 0, fedToday: true },
        { id: 'hen-4', name: 'Daisy', sickDays: 0, fedToday: true },
      ],
      eggs: 0,
      cleanliness: 100,
      jar: 10,
      jarDepositDay: 1,
    },
    introText:
      'The town market is flooded with 25 eggs, pushing prices to the floor! Hold eggs until demand recovers and use your Savings Jar to hit 150 Net Worth by Day 10.',
    learnedText:
      'Waiting for oversupply to clear let you sell eggs at a much higher price!',
  },
];

export function getLevelDef(mode: GameMode, levelId: number): LevelDef | null {
  if (mode === 'career') {
    return CAREER_LEVELS.find((l) => l.id === levelId) ?? CAREER_LEVELS[0];
  }
  if (mode === 'challenge') {
    return (
      CHALLENGE_SCENARIOS.find((c) => c.id === levelId) ??
      CHALLENGE_SCENARIOS[0]
    );
  }
  return null;
}

export type GoalProgress = {
  current: number;
  target: number;
  percent: number;
  label: string;
  met: boolean;
  failedConstraint: boolean;
};

export function getGoalProgress(
  state: GameState,
  level: LevelDef | null
): GoalProgress {
  if (!level) {
    const nw = netWorth(state);
    return {
      current: nw,
      target: 200,
      percent: Math.min(100, Math.round((nw / 200) * 100)),
      label: `Net Worth: ${Math.round(nw)} coins`,
      met: false,
      failedConstraint: false,
    };
  }

  const { goal } = level;
  const maxHensLost = goal.extra?.maxHensLost;
  const failedHensLost =
    maxHensLost !== undefined && state.hensLost > maxHensLost;

  switch (goal.kind) {
    case 'sell_eggs': {
      const current = state.totalEggsSold;
      const pct = Math.min(100, Math.round((current / goal.target) * 100));
      return {
        current,
        target: goal.target,
        percent: pct,
        label: `Sell Eggs: ${current}/${goal.target}`,
        met: current >= goal.target && !failedHensLost,
        failedConstraint: failedHensLost,
      };
    }

    case 'net_worth': {
      const current = Math.round(netWorth(state));
      const pct = Math.min(100, Math.round((current / goal.target) * 100));
      const extraText =
        maxHensLost === 0 ? ` • Hens lost: ${state.hensLost}/0` : '';
      return {
        current,
        target: goal.target,
        percent: pct,
        label: `Net Worth: ${current}/${goal.target}${extraText}`,
        met: current >= goal.target && !failedHensLost,
        failedConstraint: failedHensLost,
      };
    }

    case 'jar_hold': {
      const holdTarget = goal.extra?.holdDays ?? 5;
      const minRep = goal.extra?.minReputation ?? 5;
      const holdProgress = Math.min(1, state.jarHoldDaysAt100 / holdTarget);
      const repProgress = Math.min(1, state.reputation / minRep);
      const pct = Math.min(
        100,
        Math.round(((holdProgress + repProgress) / 2) * 100)
      );
      const met =
        state.jar >= goal.target &&
        state.jarHoldDaysAt100 >= holdTarget &&
        state.reputation >= minRep;
      return {
        current: state.jarHoldDaysAt100,
        target: holdTarget,
        percent: pct,
        label: `100+ in Jar: ${state.jarHoldDaysAt100}/${holdTarget}d • Rep: ${state.reputation}/${minRep}`,
        met,
        failedConstraint: false,
      };
    }

    case 'class_savings': {
      const current = Math.round(getClassSavingsTotal(state));
      const pct = Math.min(100, Math.round((current / goal.target) * 100));
      return {
        current,
        target: goal.target,
        percent: pct,
        label: `Class Savings: ${current}/${goal.target} coins`,
        met: current >= goal.target,
        failedConstraint: false,
      };
    }

    case 'survive_days': {
      const daysSurvived = Math.max(0, state.day - 1);
      const pct = Math.min(
        100,
        Math.round((daysSurvived / goal.target) * 100)
      );
      return {
        current: daysSurvived,
        target: goal.target,
        percent: pct,
        label: `Survive ${goal.target} Days (${daysSurvived}/${goal.target}) • Zero hens lost`,
        met: daysSurvived >= goal.target && !failedHensLost,
        failedConstraint: failedHensLost,
      };
    }

    case 'cure_and_worth': {
      const currentWorth = Math.round(netWorth(state));
      const sickCount = state.hens.filter((h) => h.sickDays > 0).length;
      const pct = Math.min(
        100,
        Math.round((currentWorth / goal.target) * 100)
      );
      return {
        current: currentWorth,
        target: goal.target,
        percent: pct,
        label: `Healthy flock (${sickCount} sick) & Net Worth ${currentWorth}/${goal.target}`,
        met:
          sickCount === 0 &&
          state.hens.length >= 3 &&
          currentWorth >= goal.target,
        failedConstraint: state.hensLost > 0,
      };
    }
  }
}

/**
 * Bankrupt detection from docs/GAME_MODES.md:
 * coins < feed cost for current hens AND eggs == 0 AND jar == 0
 */
export function isBankrupt(state: GameState): boolean {
  if (state.hens.length === 0 && state.balance < HEN_PRICE && state.jar === 0 && state.eggs === 0) {
    return true;
  }
  const feedCost = state.hens.length * getFeedPricePerHen(state);
  return (
    state.hens.length > 0 &&
    state.balance < feedCost &&
    state.eggs === 0 &&
    state.jar === 0
  );
}

/**
 * Stars (per level) from docs/GAME_MODES.md:
 * - 1 star: goal reached within the day limit.
 * - 2 stars: goal reached within `parDays`.
 * - 3 stars: also zero sick-hen days (healthy flock).
 */
export function calculateStars(
  state: GameState,
  level: LevelDef
): 0 | 1 | 2 | 3 {
  const progress = getGoalProgress(state, level);
  if (!progress.met || state.day > level.dayLimit + 1) {
    return 0;
  }
  // Days used is (day - 1) if checked after day increment or current day if checked mid-day
  const daysUsed = Math.max(1, state.day - 1);
  if (daysUsed <= level.parDays) {
    if (state.totalSickHenDays === 0) {
      return 3;
    }
    return 2;
  }
  return 1;
}

export type LevelOutcome =
  | { status: 'playing' }
  | { status: 'won'; stars: 1 | 2 | 3 }
  | { status: 'lost_time' }
  | { status: 'lost_bankrupt' }
  | { status: 'lost_constraint' };

export function evaluateLevelOutcome(
  state: GameState,
  mode: GameMode,
  level: LevelDef | null
): LevelOutcome {
  if (mode === 'sandbox' || !level) {
    return { status: 'playing' };
  }

  const progress = getGoalProgress(state, level);
  if (progress.failedConstraint) {
    return { status: 'lost_constraint' };
  }

  if (progress.met) {
    const stars = (calculateStars(state, level) || 1) as 1 | 2 | 3;
    return { status: 'won', stars };
  }

  if (isBankrupt(state)) {
    return { status: 'lost_bankrupt' };
  }

  if (state.day > level.dayLimit) {
    return { status: 'lost_time' };
  }

  return { status: 'playing' };
}
