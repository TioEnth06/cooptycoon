// Single source of truth for all game numbers from docs/GAME_RULES.md

export const STARTER_GRANT = 100; // COOP given on first login
export const HEN_PRICE = 30; // COOP per hen
export const MAX_HENS = 5; // coop capacity
export const GUARDIAN_THRESHOLD = 30; // purchases >= this need guardian approval
export const FEED_BASE_PRICE = 2; // COOP per hen per day
export const FEED_SPIKE_MULT = 1.5; // during feed price spike
export const FEED_SPIKE_DAYS = 3; // duration of spike
export const EGGS_PER_HEALTHY_HEN_PER_DAY = 1;
export const EGG_BASE_PRICE = 5; // COOP at neutral demand
export const EGG_PRICE_MIN = 3; // clamp
export const EGG_PRICE_MAX = 8; // clamp
export const MARKET_TARGET_STOCK = 10; // eggs the NPC "wants" per day
export const MARKET_STOCK_DECAY = 0.2; // 20% of market stock disappears each day
export const CLEANLINESS_START = 100;
export const CLEANLINESS_DROP_PER_DAY = 20; // per day, per coop
export const CLEAN_COST = 3; // COOP, resets cleanliness to 100
export const DIRTY_THRESHOLD = 40; // cleanliness below this raises sickness risk
export const SICK_CHANCE_BASE = 0.05; // per hen per day
export const SICK_CHANCE_DIRTY = 0.25; // when cleanliness < DIRTY_THRESHOLD
export const SICK_CHANCE_UNFED = 0.40; // when hen was not fed that day
export const MEDICINE_COST = 8; // COOP, cures one sick hen
export const SICK_DEATH_DAYS = 3; // untreated sick hen dies on 3rd sick day
export const SAVINGS_INTEREST_PER_DAY = 0.02; // 2% per day on jar balance
export const SAVINGS_MIN_LOCK_DAYS = 3;
export const SAVINGS_EARLY_PENALTY = 0.10; // 10% early-withdrawal penalty transferred to treasury if before lock ends
export const CLASS_GOAL_TARGET = 500; // total COOP in all members' savings jars
export const SEASON_BONUS_MINT = 50; // COOP season bonus payout to each member when goal reached
export const DEMO_SEED = 42; // RNG seed in demo mode

// Additional constants specified in GAME_RULES.md sections
export const NPC_DAILY_BUDGET = 60; // NPC wallet topped up each day
export const CLASSMATE_DAILY_GROWTH = 0.03; // 3% per day for simulated classmates
export const REPUTATION_PERK_THRESHOLD = 5; // unlocks "Gold Feed Bag" (-10% feed cost)
export const GOLD_FEED_BAG_DISCOUNT = 0.10; // 10% discount on feedPrice
export const FEED_SPIKE_CHANCE = 0.15; // rng < 0.15 starts feed spike
