import { GameState } from './types';

export type QuestId =
  | 'sell_3_eggs'
  | 'clean_coop'
  | 'all_fed_healthy'
  | 'deposit_jar'
  | 'check_market'
  | 'ask_mentor';

export type DailyQuest = {
  id: QuestId;
  label: string;
  completed: boolean;
};

const QUEST_POOL: { id: QuestId; label: string }[] = [
  { id: 'sell_3_eggs', label: 'Sell at least 2 eggs today' },
  { id: 'clean_coop', label: 'Sweep & clean the coop' },
  { id: 'all_fed_healthy', label: 'Keep all hens fed and healthy' },
  { id: 'deposit_jar', label: 'Deposit coins into your Savings Jar' },
  { id: 'check_market', label: 'Check the Class Goal or Market price' },
  { id: 'ask_mentor', label: 'Tap Professor Hoot for a farm tip' },
];

/**
 * Deterministic 3 quests per day based on `day` number from docs/GAME_MODES.md.
 * Reward: +1 reputation each (never coins).
 */
export function getDailyQuestsForDay(
  day: number,
  completedIds: QuestId[] = []
): DailyQuest[] {
  const picked: DailyQuest[] = [];
  const startIdx = ((day - 1) * 2) % QUEST_POOL.length;

  for (let i = 0; i < 3; i++) {
    const item = QUEST_POOL[(startIdx + i) % QUEST_POOL.length];
    picked.push({
      id: item.id,
      label: item.label,
      completed: completedIds.includes(item.id),
    });
  }
  return picked;
}

export type BadgeId =
  | 'first_egg'
  | 'clean_freak'
  | 'healthy_flock'
  | 'saver'
  | 'crisis_survivor'
  | 'class_hero'
  | 'comeback';

export type BadgeDef = {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
};

export const BADGE_DEFS: BadgeDef[] = [
  {
    id: 'first_egg',
    name: 'First Egg',
    description: 'Sell your very first egg to the town buyer.',
    icon: '🥚',
  },
  {
    id: 'clean_freak',
    name: 'Clean Freak',
    description: 'Keep coop cleanliness at 60% or higher for 5 days in a row.',
    icon: '🧹',
  },
  {
    id: 'healthy_flock',
    name: 'Healthy Flock',
    description: 'Finish any level with zero sick-hen days.',
    icon: '💚',
  },
  {
    id: 'saver',
    name: 'Saver',
    description: 'Reach 50 or more coins in your Savings Jar.',
    icon: '🏺',
  },
  {
    id: 'crisis_survivor',
    name: 'Crisis Survivor',
    description: 'Complete Career Level 3 (Feed Crisis).',
    icon: '🌾',
  },
  {
    id: 'class_hero',
    name: 'Class Hero',
    description: 'Trigger the collective Class Goal Season Bonus.',
    icon: '🏆',
  },
  {
    id: 'comeback',
    name: 'Comeback',
    description: 'Recover after an Out-of-Coins retry and win the level.',
    icon: '🦅',
  },
];

export function checkNewlyUnlockedBadges(
  state: GameState,
  alreadyUnlocked: BadgeId[],
  context?: {
    levelWonId?: number;
    hadBankruptRetry?: boolean;
    goalReached?: boolean;
  }
): BadgeDef[] {
  const newlyUnlocked: BadgeDef[] = [];

  const tryUnlock = (id: BadgeId, condition: boolean) => {
    if (condition && !alreadyUnlocked.includes(id)) {
      const def = BADGE_DEFS.find((b) => b.id === id);
      if (def) newlyUnlocked.push(def);
    }
  };

  tryUnlock('first_egg', state.totalEggsSold >= 1);
  tryUnlock('clean_freak', state.cleanDaysStreak >= 5);
  tryUnlock('saver', state.jar >= 50);
  tryUnlock('class_hero', Boolean(context?.goalReached) || state.season > 1);

  if (context?.levelWonId !== undefined) {
    tryUnlock('healthy_flock', state.totalSickHenDays === 0);
    tryUnlock('crisis_survivor', context.levelWonId === 3);
    tryUnlock('comeback', Boolean(context.hadBankruptRetry));
  }

  return newlyUnlocked;
}
