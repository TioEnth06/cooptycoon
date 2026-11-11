# GAME_RULES: single source of truth for all numbers

Currency: **COOP** (virtual token, testnet). Time: **Day** (one tick per "Next Day" press).

## Constants (copy to `src/game/constants.ts`)
| Name | Value | Notes |
|---|---|---|
| STARTER_GRANT | 100 | COOP given on first login |
| HEN_PRICE | 30 | COOP per hen |
| MAX_HENS | 5 | coop capacity |
| GUARDIAN_THRESHOLD | 30 | purchases >= this need guardian approval |
| FEED_BASE_PRICE | 2 | COOP per hen per day |
| FEED_SPIKE_MULT | 1.5 | during feed price spike |
| FEED_SPIKE_DAYS | 3 | duration of spike |
| EGGS_PER_HEALTHY_HEN_PER_DAY | 1 | |
| EGG_BASE_PRICE | 5 | COOP at neutral demand |
| EGG_PRICE_MIN | 3 | clamp |
| EGG_PRICE_MAX | 8 | clamp |
| MARKET_TARGET_STOCK | 10 | eggs the NPC "wants" per day |
| MARKET_STOCK_DECAY | 0.2 | 20% of market stock disappears each day |
| CLEANLINESS_START | 100 | |
| CLEANLINESS_DROP_PER_DAY | 20 | per day, per coop |
| CLEAN_COST | 3 | COOP, resets cleanliness to 100 |
| DIRTY_THRESHOLD | 40 | cleanliness below this raises sickness risk |
| SICK_CHANCE_BASE | 0.05 | per hen per day |
| SICK_CHANCE_DIRTY | 0.25 | when cleanliness < DIRTY_THRESHOLD |
| SICK_CHANCE_UNFED | 0.40 | when hen was not fed that day |
| MEDICINE_COST | 8 | COOP, cures one sick hen |
| SICK_DEATH_DAYS | 3 | untreated sick hen dies on 3rd sick day |
| SAVINGS_INTEREST_PER_DAY | 0.02 | 2% per day on jar balance |
| SAVINGS_MIN_LOCK_DAYS | 3 | |
| SAVINGS_EARLY_PENALTY | 0.10 | 10% early-withdrawal penalty transferred to treasury if before lock ends |
| CLASS_GOAL_TARGET | 500 | total COOP in all members' savings jars |
| SEASON_BONUS_MINT | 50 | COOP season bonus payout to each member when goal reached |
| DEMO_SEED | 42 | RNG seed in demo mode |

## Randomness
Use a seeded PRNG (mulberry32). Seed = `DEMO_SEED` in demo mode, otherwise a per-player seed stored in state. Randomness only affects sickness and feed price spikes. Never use randomness for rewards.

## Day tick: order of operations
1. Apply daily feed: cost = hens * feedPrice(day). If player cannot pay, hens are unfed (list which).
2. Cleanliness -= CLEANLINESS_DROP_PER_DAY (min 0).
3. For each hen: roll sickness using the highest applicable chance (unfed > dirty > base). Sick hens get `sickDays += 1`; hens at SICK_DEATH_DAYS die.
4. Production: each healthy, fed hen makes EGGS_PER_HEALTHY_HEN_PER_DAY eggs into inventory.
5. Market: `marketStock *= (1 - MARKET_STOCK_DECAY)`.
6. Feed event: if no spike active and rng < 0.15, start spike for FEED_SPIKE_DAYS; decrement active spike.
7. Savings interest: `jar += jar * SAVINGS_INTEREST_PER_DAY`.
8. Increment `day`.
9. Generate mentor message (see triggers).
10. Check class goal.

## Egg price formula (NPC buyer)
```
ratio = (MARKET_TARGET_STOCK - marketStock) / MARKET_TARGET_STOCK   // -inf..1
price = clamp(EGG_BASE_PRICE * (1 + 0.5 * ratio), EGG_PRICE_MIN, EGG_PRICE_MAX)
```
Selling N eggs: pay `price * N` (price fixed at start of sale), then `marketStock += N`.
NPC buyer has its own wallet and pays from its balance; if its balance is too low, it pays what it can and the mentor explains ("the buyer ran out of coins; try again tomorrow"). NPC wallet is topped up by the treasury each day (NPC_DAILY_BUDGET = 60).

## Feed price
`feedPrice = FEED_BASE_PRICE * (spikeActive ? FEED_SPIKE_MULT : 1)`

## Purchases and approvals
- Buying a hen costs HEN_PRICE. Since HEN_PRICE >= GUARDIAN_THRESHOLD, every hen purchase needs guardian approval, except the very first hen (tutorial: auto-approved).
- Flow: child requests, DAO proposal created, guardian approves (demo: "Approve as guardian" button), purchase completes.
- Medicine and cleaning never need approval.

## Savings jar
- Deposit any amount. Interest daily. Withdraw anytime.
- If withdrawn before `SAVINGS_MIN_LOCK_DAYS` since deposit, a 10% early-withdrawal penalty applies to the withdrawn amount (transferred to the treasury).
- Track `jarDepositDay` per deposit (use weighted simplest approach: reset lock timer on any deposit).

## Class goal
- `classSavings` = sum of all members' jar balances (demo: includes 4 simulated classmates with fixed balances that grow 3% per day).
- When `classSavings >= CLASS_GOAL_TARGET` for the first time in a season: trigger SEASON_BONUS_MINT COOP season bonus payout to each member, show celebration, season counter +1, target stays the same.

## Reputation (simple)
`reputation += 1` for each: day with all hens fed and healthy; day with savings jar > 0. Reputation >= 5 unlocks the "Gold Feed Bag" perk: feed cost -10% (applied to feedPrice). Keep it visible but minor.

## Mentor message triggers (rule-based; first match wins, max 2 messages per day)
| Trigger | Message template |
|---|---|
| Feed spike started | "Feed got more expensive for {days} days. Your cost per hen is now {price}. Selling more eggs or keeping a reserve helps." |
| Hen got sick (dirty coop) | "Your coop was only {cleanliness}% clean, so a hen got sick. Cleaning costs {CLEAN_COST}; medicine costs {MEDICINE_COST}. Prevention is cheaper." |
| Hen got sick (unfed) | "A hen went hungry and got sick. Skipping feed saved {feedCost} but may cost {MEDICINE_COST} in medicine." |
| Hen died | "A sick hen was not treated in time. That is a real risk of any investment: waiting can cost more than acting." |
| Profit day | "Profit today: {profit} COOP ({eggs} eggs x {price} minus {costs} costs)." |
| Loss day | "Loss today: {loss} COOP because costs ({costs}) were higher than egg income ({income})." |
| Price low | "Egg price is low ({price}) because many eggs were sold recently. Waiting a day can help." |
| Savings interest | "Your savings jar earned {interest} COOP. Small steady gains add up." |
| Early withdraw | "You withdrew early and {penalty} COOP was lost. Patience pays." |
| Goal reached | "The whole class reached the savings goal! Everyone gets {SEASON_BONUS_MINT} COOP." |
| Idle (none above) | "Steady day. Check feed, coop, and your savings." |

Tone: friendly, short (max 2 sentences), explains cause and effect, never shames.

## Tutorial (first session)
1. Grant 100 COOP. 2. Free first hen (auto-approved, price still counted in mentor text as "worth 30"). 3. Press Next Day twice. 4. Sell eggs. 5. Mentor explains profit. 6. Buying second hen shows guardian approval.

## Balance sanity check (must hold)
- 1 hen, fully cared for: income ~5/day, cost 2/day (+3 cleaning every ~3 days ~ 1/day), net ~2/day. Payback on a 30 COOP hen ~ 15 days. This is intentionally slow; demo mode fast-forward and class goal make progress visible.
- Neglect (no feed, no cleaning) for 4 days must produce at least one sick hen with high probability.
