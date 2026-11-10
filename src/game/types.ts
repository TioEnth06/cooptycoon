export type Hen = {
  id: string;
  name?: string;
  sickDays: number;
  fedToday: boolean;
};

export type Classmate = {
  name: string;
  jar: number;
};

export type PendingApproval = {
  kind: 'buy_hen';
  proposalId: string;
};

export type GameMode = 'career' | 'challenge' | 'sandbox';

export type GameState = {
  day: number;
  balance: number; // mirrors onchain balance
  hens: Hen[];
  eggs: number;
  cleanliness: number;
  marketStock: number;
  feedSpikeDaysLeft: number;
  jar: number;
  jarDepositDay: number | null;
  reputation: number;
  season: number;
  seed: number;
  rngState: number;
  pendingApproval: PendingApproval | null;
  tutorialStep: number;
  classmates: Classmate[];
  npcBalance: number;
  dailyIncome: number; // tracks egg sale income during the current day
  dailyExtraCosts: number; // tracks clean/medicine costs during the current day
  seasonGoalReachedInSeason: boolean;

  // Extended tracking for GAME_MODES.md (levels, challenges, quests, badges)
  totalEggsSold: number;
  dailyEggsSold: number;
  totalSickHenDays: number;
  hensLost: number;
  jarHoldDaysAt100: number;
  cleanDaysStreak: number; // cleanliness >= 60 streak
  sandboxRescueUsed: boolean;
};

export type DayEvent = {
  type:
    | 'feed_paid'
    | 'hens_unfed'
    | 'cleanliness_dropped'
    | 'hen_sick_dirty'
    | 'hen_sick_unfed'
    | 'hen_sick_base'
    | 'hen_died'
    | 'eggs_produced'
    | 'feed_spike_started'
    | 'savings_interest'
    | 'early_withdraw'
    | 'goal_reached'
    | 'profit_day'
    | 'loss_day'
    | 'price_low'
    | 'npc_low_funds'
    | 'sandbox_rescue';
  data?: Record<string, number | string>;
};
