import { describe, expect, it } from 'vitest';
import { DEMO_SEED, EGG_BASE_PRICE, HEN_PRICE } from './constants';
import { createInitialGameState, nextDay } from './engine';
import {
  CAREER_LEVELS,
  CHALLENGE_SCENARIOS,
  calculateStars,
  evaluateLevelOutcome,
  isBankrupt,
  netWorth,
} from './levels';
import { checkNewlyUnlockedBadges, getDailyQuestsForDay } from './quests';

describe('Coop Tycoon Levels, Challenges, Quests & Badges (G1, G4, G5)', () => {
  it('computes netWorth = coins + jar + hens * HEN_PRICE + eggs * EGG_BASE_PRICE', () => {
    const state = {
      ...createInitialGameState(DEMO_SEED),
      balance: 80,
      jar: 25,
      hens: [
        { id: '1', sickDays: 0, fedToday: true },
        { id: '2', sickDays: 0, fedToday: true },
      ],
      eggs: 4,
    };

    expect(netWorth(state)).toBe(80 + 25 + 2 * HEN_PRICE + 4 * EGG_BASE_PRICE);
  });

  it('defines 5 Career levels and 3 Challenge scenarios', () => {
    expect(CAREER_LEVELS).toHaveLength(5);
    expect(CHALLENGE_SCENARIOS).toHaveLength(3);
  });

  it('awards 3 stars when goal met within parDays and zero sick-hen days, 2 stars if sick days > 0, and 1 star after parDays', () => {
    const level1 = CAREER_LEVELS[0]; // target: sell 4 eggs, parDays: 4, dayLimit: 6
    const base = {
      ...createInitialGameState(DEMO_SEED),
      totalEggsSold: level1.goal.target,
      day: 4, // daysUsed = 3 <= parDays (4)
      totalSickHenDays: 0,
    };

    expect(calculateStars(base, level1)).toBe(3);
    expect(calculateStars({ ...base, totalSickHenDays: 1 }, level1)).toBe(2);
    expect(calculateStars({ ...base, day: 6 }, level1)).toBe(1);
  });

  it('detects bankruptcy when coins < feed cost AND eggs == 0 AND jar == 0, and grants Sandbox rescue once', () => {
    const bankruptState = {
      ...createInitialGameState(DEMO_SEED),
      balance: 1, // < 2 feed cost
      eggs: 0,
      jar: 0,
    };

    expect(isBankrupt(bankruptState)).toBe(true);
    expect(
      evaluateLevelOutcome(bankruptState, 'career', CAREER_LEVELS[0]).status
    ).toBe('lost_bankrupt');

    // In Sandbox mode, nextDay triggers rescue grant (+20 coins) once
    const sandboxTick = nextDay(bankruptState, { isSandbox: true });
    expect(sandboxTick.state.sandboxRescueUsed).toBe(true);
    expect(sandboxTick.state.balance).toBe(21);
    expect(sandboxTick.events.some((e) => e.type === 'sandbox_rescue')).toBe(
      true
    );
  });

  it('triggers forcedEvents feed spike on Day 4 in Level 3', () => {
    const level3 = CAREER_LEVELS[2];
    const day3State = {
      ...createInitialGameState(DEMO_SEED),
      day: 3,
      feedSpikeDaysLeft: 0,
    };

    const res = nextDay(day3State, { forcedEvents: level3.forcedEvents });
    expect(res.state.day).toBe(4);
    expect(res.state.feedSpikeDaysLeft).toBe(5);
    expect(res.events.some((e) => e.type === 'feed_spike_started')).toBe(true);
  });

  it('generates 3 deterministic daily quests and unlocks badges accurately', () => {
    const q1 = getDailyQuestsForDay(1);
    const q1Again = getDailyQuestsForDay(1);
    expect(q1).toHaveLength(3);
    expect(q1.map((q) => q.id)).toEqual(q1Again.map((q) => q.id));

    const richState = {
      ...createInitialGameState(DEMO_SEED),
      totalEggsSold: 2,
      cleanDaysStreak: 5,
      jar: 60,
      totalSickHenDays: 0,
    };

    const badges = checkNewlyUnlockedBadges(richState, [], {
      levelWonId: 3,
      hadBankruptRetry: true,
      goalReached: true,
    });
    expect(badges.map((b) => b.id)).toEqual([
      'first_egg',
      'clean_freak',
      'saver',
      'class_hero',
      'healthy_flock',
      'crisis_survivor',
      'comeback',
    ]);
  });
});
