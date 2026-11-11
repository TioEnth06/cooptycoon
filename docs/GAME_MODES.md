# GAME_MODES: levels, win/lose, quests, badges

Goal: turn the simulation into a game with goals, stakes, and progress. Keep all numbers in `src/game/levels.ts` (and shared constants in `constants.ts`). No gacha, no random rewards, no pressure timers. Numbers below are starting points: playtest and adjust only in `levels.ts`.

## Modes (home screen, 3 big buttons)
| Mode | What | Why |
|---|---|---|
| Career | 5 levels with targets, stars, unlocks | Main game, teaches concepts step by step |
| Challenge | 3 ready-made crisis scenarios | Fast drama for the demo video |
| Sandbox | Free play, no targets, no game over | Relaxed practice |

## Net worth (used for targets)
`netWorth = coins + jar + hens * HEN_PRICE + eggs * EGG_BASE_PRICE`

## Career levels
| # | Name | Concept taught | Goal | Day limit | Setup |
|---|---|---|---|---|---|
| 1 | First eggs | Income vs cost | Sell 8 eggs | 6 | 1 free hen, 100 coins |
| 2 | Growing flock | Reinvesting | Net worth >= 160 | 12 | start as level 1 |
| 3 | Feed crisis | Risk and reserves | Net worth >= 200 and no hen lost | 15 | feed spike on days 4-8 |
| 4 | Patient saver | Saving and interest | Keep 100 in jar for 5 days, reputation >= 5 | 15 | 2 hens |
| 5 | Class goal | Cooperation | Class savings >= CLASS_GOAL_TARGET | 20 | simulated classmates; triggers season bonus payout |

Level `LevelDef` shape:
```ts
type LevelDef = {
  id: number; name: string; concept: string;
  dayLimit: number;
  goal: { kind: 'sell_eggs'|'net_worth'|'jar_hold'|'class_savings'; target: number; extra?: Record<string, number> };
  setup: Partial<GameState>;
  forcedEvents?: { day: number; type: 'feed_spike'; days: number }[];
  parDays: number;     // for 2nd star
  introText: string;   // mentor intro
};
```

## Stars (per level)
- 1 star: goal reached within the day limit.
- 2 stars: goal reached within `parDays`.
- 3 stars: also zero sick-hen days (healthy flock).
Stars are saved in local state; level N+1 unlocks when level N has >= 1 star.

## Win / lose
- **Win:** goal met before the day limit. Show level-complete screen: stars, profit summary, what you learned (one mentor sentence tied to the concept).
- **Lose (time):** day limit reached without goal. Show "Almost there" with mentor tip and Retry.
- **Lose (bankrupt):** coins < feed cost for current hens AND eggs == 0 AND jar == 0. Show "Out of coins" with mentor explanation and Retry from level start. Never show shaming text.
- Sandbox: no lose state; bankrupt triggers a gentle "rescue grant" of 20 coins once per session with a mentor lesson about emergency reserves.

## Challenge scenarios
| Name | Setup | Goal |
|---|---|---|
| Feed Crisis | feed x1.5 for 5 days from day 1, 3 hens, 60 coins | Survive 10 days without losing a hen |
| Sick Coop | cleanliness 30, 2 of 3 hens sick, 50 coins | Cure all hens and net worth >= 120 by day 8 |
| Egg Glut | market stock 25 (price floor), 4 hens | Net worth >= 150 by day 10 using the savings jar wisely |

## Daily quests (3 per day, deterministic from day number)
Pool: sell 3 eggs; clean the coop; keep all hens fed and healthy; deposit any amount into the jar; check the market price; ask the mentor (tap bubble).
Reward: +1 reputation each (never coins). Show a small checklist card above the action bar.

## Badges (stored locally; shown in a Badges sheet)
| Badge | Condition |
|---|---|
| First Egg | sell first egg |
| Clean Freak | keep cleanliness >= 60 for 5 days |
| Healthy Flock | finish a level with no sick hens |
| Saver | jar >= 50 |
| Crisis Survivor | finish level 3 |
| Class Hero | trigger the class goal bonus |
| Comeback | recover after bankrupt retry and win |

## UI screens to add
1. Home / mode select (logo, Career, Challenge, Sandbox).
2. Level select (map or list, stars, locks).
3. Level intro card (concept, goal, day limit).
4. HUD additions: goal progress bar, day counter "Day 4/12", quest card.
5. End-of-day summary sheet (income, costs, profit, mentor).
6. Level complete / failed screens.
7. Badges sheet.

## Chain tie-ins (keep small)
- Level complete (>=1 star) may call a `payout` of a small fixed amount from the NPC/treasury (e.g. 10 coins) once per level. Do not repeat on replay.
- Level 5 triggers the season bonus payout.
- Proof drawer lists these proofs.
