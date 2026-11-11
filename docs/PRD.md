# PRD: Coop Tycoon

## One-liner
A cozy chicken-coop simulation where kids learn saving, investing, and risk by running a tiny egg business. The in-game economy runs on NEAR (testnet), with a rule-based mentor (Professor Hoot), NPC buyers with wallets, and a family/class DAO as guardian.

## Problem
Children rarely get hands-on practice with money decisions (saving vs spending, reinvesting, risk). Lectures do not stick. Games do, but most "finance games" have no real economic system behind them.

## Solution
A turn-based simulation: buy hens, feed and clean the coop, sell eggs to an NPC buyer whose price moves with supply and demand. Mistakes cost money in a visible, explainable way. A rule-based mentor (Professor Hoot) explains why you gained or lost. A class/family DAO lets a guardian approve big purchases and funds shared goals.

## Target users
- Players: children about 8-14.
- Guardians: parent or teacher who approves big purchases and watches class goals.
- Judges: NEAR Hackathon judges (Claude Code and Codex screen first, then humans).

## Hackathon tracks (select all three in the form)
| Track | How we satisfy it |
|---|---|
| Games With Real Economies | The economy IS the gameplay. NPC buyer has its own wallet and pays players in $COOP; price moves with supply/demand. Players never see the chain (guest/Passkey/testnet handle login). |
| Social Money | Class/Family DAO (Sputnik DAO) holds a shared treasury; guardians approve large purchases; reputation unlocks perks. We build what communities do with a DAO, not a new multisig. |
| Memecoins With Mechanics | $COOP token has rules: season bonus payout from the treasury when the whole class hits a collective savings goal; savings jar interest; 10% early-withdrawal penalty transferred to the treasury. |

## Core loop (must work end to end)
1. Login (guest nickname, Passkey, or `.testnet` handle).
2. Receive starter grant of $COOP.
3. Buy a hen (large purchase triggers guardian approval).
4. Each Day: feed, clean (optional), handle risk events.
5. Eggs are produced; sell to NPC buyer at the current price.
6. Decide: save, reinvest, or keep a reserve.
7. Rule-based mentor (Professor Hoot) explains the result of each Day.
8. Class goal progress rises; reaching it triggers a season bonus payout.

## In scope (build these)
- Game modes: Career (5 levels), Challenge (3 scenarios), Sandbox. See `docs/GAME_MODES.md`.
- Game feel: animations per `docs/ANIMATION.md`.
- Single player screen, mobile-first.
- One animal (hen), one product (egg), max 5 hens.
- Day-by-day simulation with a "Next Day" button.
- Rule-based mentor (Professor Hoot).
- NPC buyer with wallet and dynamic price.
- Savings jar with interest and 10% early-withdrawal penalty.
- $COOP NEP-141 token on testnet (mock mode fallback).
- Class DAO via Sputnik DAO on testnet (mock mode fallback): approve large purchases; collective goal.
- "Proof" drawer showing tx links (small, hidden by default).
- Demo mode: seeded events and a "fast-forward 3 days" button for the video.

## Out of scope (do NOT build)
- Other animals or crops, multiplayer realtime, chat.
- Real money, real investing, fiat, KYC.
- Gacha, loot boxes, any random-reward mechanic.
- Auto verification of real-world activity.
- Complex graphics, 3D, audio beyond optional mute-by-default SFX.
- Leaderboards across classes.

## Success criteria
- A judge can run it in under 5 minutes following the README.
- The demo video shows: login, buy hen, risk event, mentor explanation, guardian approval, class goal reached, season bonus payout.
- `CHAIN_MODE=mock` works with zero setup; `CHAIN_MODE=live` works on testnet with documented env vars.
- README is accurate about what is real onchain vs simulated.

## Safety and honesty
- Virtual testnet tokens only; no real value.
- Educational simulation, not financial advice.
- No dark patterns, no countdown pressure, no gambling-like mechanics.
