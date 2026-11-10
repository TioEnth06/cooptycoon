# PROMPTS: copy-paste prompts for Cursor (use with @docs)

Always start a new chat per task. Attach `@docs/PRD.md @docs/GAME_RULES.md @docs/ARCHITECTURE.md @docs/TASKS.md`.

## T0.4 NEAR refs
"Read @docs/NEAR_REFERENCES.md. Summarize in @docs/RESEARCH_NOTES.md which social login, FT contract, and Sputnik proposal kind we will use, and list anything unverified. Do not write code."

## T1.1 Scaffold
"Do task T1.1 from @docs/TASKS.md. Create the Next.js app with the folder structure in @docs/ARCHITECTURE.md, install dependencies, add .env.example and .gitignore. Make `npm run dev` and `npm run build` work. Do not add features."

## T1.2 Constants
"Do task T1.2. Create src/game/constants.ts with every constant from the table in @docs/GAME_RULES.md (exact names and values), types.ts from @docs/ARCHITECTURE.md, and rng.ts with a seeded mulberry32 PRNG that keeps its state in the game state."

## T1.3 Engine and tests
"Do task T1.3. Implement nextDay(state) in src/game/engine.ts following the 'Day tick: order of operations' section exactly, and eggPrice/sell in market.ts using the formula in @docs/GAME_RULES.md. Pure functions only. Add Vitest tests for price clamp, tick order, sickness thresholds with seed 42, and savings penalty. Run tests and fix."

## T1.4 Mentor
"Do task T1.4. Implement mentor.ts using the trigger table in @docs/GAME_RULES.md. First match wins, max 2 messages per day, use the exact templates with values filled in."

## T1.5 UI
"Do task T1.5. Build the main mobile-first screen following @docs/DESIGN.md: TopBar, Coop with Hen components, ActionBar, MentorBubble, SavingsJar. Wire to a Zustand store. No chain code yet. Use emoji/SVG, no image assets. Never show words like wallet or blockchain."

## T1.6 Mock chain
"Do task T1.6. Create ChainAdapter interface and MockChainAdapter per @docs/ARCHITECTURE.md, plus the /api/chain routes returning {ok, proof?, error?}. Wire starter grant, egg sale payout, and fee/burn to the adapter. Game must be fully playable in mock mode."

## T1.7 Tutorial
"Do task T1.7. Add the first-session tutorial from @docs/GAME_RULES.md with highlighted next step and short friendly copy."

## T2.1 NEAR adapter
"Do task T2.1. Implement NearChainAdapter in src/chain/near.ts with near-api-js on testnet. Read @docs/RESEARCH_NOTES.md first. Implement ensureAccount (with storage_deposit), grantStarter, payout, burnOrFee, balanceOf. Use env vars in @docs/ARCHITECTURE.md. Failures must not block the game (toast + retry once). Keep CHAIN_MODE=mock as default."

## T2.2 DAO
"Do task T2.2. Implement proposeBuy and approve against the Sputnik DAO using the simplest supported proposal kind. Add ApprovalModal with an 'Approve as guardian' button for demo. Mock mode must behave the same."

## T2.3 Class goal
"Do task T2.3. Add ClassGoal bar with 4 simulated classmates, trigger season bonus mint when classSavings >= CLASS_GOAL_TARGET, and a Celebration animation."

## T2.4 Proof and demo mode
"Do task T2.4. Add ProofDrawer listing tx links (small, hidden by default) and a demo mode (NEXT_PUBLIC_DEMO_MODE) with seeded RNG and a 'Fast-forward 3 days' button."

## T2.5 Polish
"Do task T2.5. Add animations from @docs/DESIGN.md (egg pop, coin fly to balance, idle wobble, sick shake, mentor bubble slide-in, count-up balance). Respect prefers-reduced-motion."

## T2.6 README
"Do task T2.6. Write README.md following @docs/SUBMISSION.md. Be accurate about onchain vs simulated. Include run steps for mock and live mode."

## Bug-fix prompt
"Here is the error: <paste>. Find the root cause, fix minimally, run build and tests, and do not refactor unrelated code."
