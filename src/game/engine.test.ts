import { describe, expect, it } from 'vitest';
import {
  CLASS_GOAL_TARGET,
  CLEANLINESS_DROP_PER_DAY,
  DEMO_SEED,
  EGG_BASE_PRICE,
  EGG_PRICE_MAX,
  EGG_PRICE_MIN,
  FEED_BASE_PRICE,
  MARKET_STOCK_DECAY,
  MARKET_TARGET_STOCK,
  SAVINGS_INTEREST_PER_DAY,
  SEASON_BONUS_MINT,
  SICK_DEATH_DAYS,
} from './constants';
import {
  createInitialGameState,
  depositToJar,
  nextDay,
  withdrawFromJar,
} from './engine';
import { eggPrice, sell } from './market';

describe('Coop Tycoon Game Engine & Market Rules', () => {
  it('clamps eggPrice between EGG_PRICE_MIN (3) and EGG_PRICE_MAX (8)', () => {
    // At neutral demand (stock == MARKET_TARGET_STOCK == 10), price is EGG_BASE_PRICE (5)
    expect(eggPrice(MARKET_TARGET_STOCK)).toBe(EGG_BASE_PRICE);

    // At 0 stock, ratio = 1 -> 5 * 1.5 = 7.5
    expect(eggPrice(0)).toBe(7.5);

    // Extreme negative stock should clamp to EGG_PRICE_MAX (8)
    expect(eggPrice(-10)).toBe(EGG_PRICE_MAX);

    // High oversupply (e.g. stock = 30 -> ratio = -2 -> 5 * (1 - 1) = 0) clamps to EGG_PRICE_MIN (3)
    expect(eggPrice(30)).toBe(EGG_PRICE_MIN);
  });

  it('sells eggs at fixed start-of-sale price, updates marketStock, and respects NPC wallet cap', () => {
    const initial = {
      ...createInitialGameState(DEMO_SEED),
      eggs: 4,
      marketStock: 10, // price = 5
      balance: 50,
      npcBalance: 12, // can only afford 2 eggs at price 5 (10 COOP)
    };

    const res = sell(initial, 4);
    expect(res.unitPrice).toBe(5);
    expect(res.soldCount).toBe(2);
    expect(res.revenue).toBe(10);
    expect(res.state.eggs).toBe(2);
    expect(res.state.balance).toBe(60);
    expect(res.state.marketStock).toBe(12);
    expect(res.state.npcBalance).toBe(2);
    expect(res.events.some((e) => e.type === 'npc_low_funds')).toBe(true);
  });

  it('executes nextDay tick in the exact order of operations', () => {
    const state = {
      ...createInitialGameState(DEMO_SEED),
      balance: 100,
      cleanliness: 100,
      marketStock: 10,
      jar: 50,
    };

    const { state: next, mentorMessages } = nextDay(state);

    // 1. Daily feed paid (1 hen * 2 COOP = 2 COOP)
    expect(next.balance).toBe(98);
    // 2. Cleanliness dropped by 20
    expect(next.cleanliness).toBe(100 - CLEANLINESS_DROP_PER_DAY);
    // 4. Healthy fed hen produced 1 egg
    expect(next.eggs).toBe(1);
    // 5. Market stock decayed by 20%
    expect(next.marketStock).toBe(10 * (1 - MARKET_STOCK_DECAY));
    // 7. Savings interest 2% added to 50 -> 51
    expect(next.jar).toBe(50 * (1 + SAVINGS_INTEREST_PER_DAY));
    // 8. Day incremented
    expect(next.day).toBe(2);
    // 9. Mentor message generated (max 2)
    expect(mentorMessages.length).toBeGreaterThanOrEqual(1);
    expect(mentorMessages.length).toBeLessThanOrEqual(2);
  });

  it('produces at least one sick hen under 4 days of neglect (no feed, no cleaning) with DEMO_SEED = 42', () => {
    let state = {
      ...createInitialGameState(DEMO_SEED),
      balance: 0, // cannot afford feed -> unfed (40% sickness chance per hen per day)
      cleanliness: 30, // dirty (< 40)
      hens: [
        { id: 'hen-1', sickDays: 0, fedToday: false },
        { id: 'hen-2', sickDays: 0, fedToday: false },
      ],
    };

    let everGotSick = false;
    for (let d = 0; d < 4; d++) {
      const res = nextDay(state);
      state = res.state;
      if (
        state.hens.some((h) => h.sickDays > 0) ||
        res.events.some((e) => e.type === 'hen_died')
      ) {
        everGotSick = true;
      }
    }

    expect(everGotSick).toBe(true);
  });

  it('kills an untreated sick hen on its 3rd sick day (SICK_DEATH_DAYS = 3)', () => {
    const state = {
      ...createInitialGameState(DEMO_SEED),
      hens: [{ id: 'sick-hen', sickDays: SICK_DEATH_DAYS - 1, fedToday: true }],
    };

    const res = nextDay(state);
    expect(res.state.hens.length).toBe(0);
    expect(res.events.some((e) => e.type === 'hen_died')).toBe(true);
    expect(res.mentorMessages[0]).toContain('A sick hen was not treated in time');
  });

  it('applies 10% early-withdrawal penalty before SAVINGS_MIN_LOCK_DAYS (3 days) and 0% after', () => {
    let state = createInitialGameState(DEMO_SEED);
    const dep = depositToJar(state, 40);
    state = dep.state;
    expect(state.jar).toBe(40);
    expect(state.balance).toBe(60);
    expect(state.jarDepositDay).toBe(1);

    // Withdraw 20 on day 2 (only 1 day elapsed < 3 days lock) -> 10% penalty = 2 COOP
    state = { ...state, day: 2 };
    const early = withdrawFromJar(state, 20);
    expect(early.isEarly).toBe(true);
    expect(early.penalty).toBe(2);
    expect(early.received).toBe(18);
    expect(early.state.jar).toBe(20);
    expect(early.state.balance).toBe(78);
    expect(early.mentorMessages[0]).toBe(
      'You withdrew early and 2 COOP was lost. Patience pays.'
    );

    // Withdraw remaining 20 on day 4 (4 - 1 = 3 days >= lock) -> 0 penalty
    const matureState = { ...early.state, day: 4 };
    const mature = withdrawFromJar(matureState, 20);
    expect(mature.isEarly).toBe(false);
    expect(mature.penalty).toBe(0);
    expect(mature.received).toBe(20);
    expect(mature.state.jar).toBe(0);
  });

  it('triggers class goal bonus (+50 COOP and season + 1) when classSavings >= CLASS_GOAL_TARGET (500)', () => {
    // Initial classmates sum: 95 + 88 + 102 + 90 = 375
    const state = {
      ...createInitialGameState(DEMO_SEED),
      balance: 20,
      jar: 120, // 375 + 120 = 495; after 1 day tick interest + classmate growth > 500
    };

    const res = nextDay(state);
    const totalClass =
      res.state.jar + res.state.classmates.reduce((s, c) => s + c.jar, 0);
    expect(totalClass).toBeGreaterThanOrEqual(CLASS_GOAL_TARGET);
    expect(res.events.some((e) => e.type === 'goal_reached')).toBe(true);
    expect(res.state.season).toBe(2);
    // Balance was 20 - 2 (feed) + 50 (season bonus) = 68
    expect(res.state.balance).toBe(20 - FEED_BASE_PRICE + SEASON_BONUS_MINT);
  });
});
