# TASKS: 2-day plan (one task per Cursor prompt)

Rule: finish a task, run it, commit, then move on. If a task is blocked >30 min, switch to mock mode and continue.

## Day 0 (setup, before Day 1)
- [x] T0.1 Read `HACKATHON.md` and the track prompts (Games 09, Memecoins 11, Social 12) from github.com/nearai/near-hackathon-prompt-examples; summarize into `docs/RESEARCH_NOTES.md`: social login method, FT contract example, Sputnik proposal kinds.
- [ ] T0.2 Create public GitHub repo, push these docs.
- [ ] T0.3 Create NEAR testnet accounts: root, treasury, npc, guardian (`near create-account <name>.testnet --useFaucet`). Fund via faucet; see funding checklist in `docs/NEAR_REFERENCES.md`.
- [x] T0.4 Copy the must-read pages from `docs/NEAR_REFERENCES.md` into `docs/near-refs/` (or add as Cursor @Docs).
- [ ] T0.5 Deploy the FT contract (near-examples/FT) to testnet, `storage_deposit` for NPC/guardian, verify `ft_transfer` works from CLI.
- [ ] T0.6 Create the Sputnik DAO on testnet (factory `sputnikv2.testnet`), add the guardian as council, test one proposal + `act_proposal` from CLI.

## Day 1: foundation and game loop
- [ ] T1.1 (1h) Scaffold Next.js + TS + Tailwind + Framer Motion + Zustand + Vitest. Add `.env.example`, `.gitignore`. Create `src/` folders from ARCHITECTURE.md.
- [ ] T1.2 (1h) `src/game/constants.ts`, `types.ts`, `rng.ts` from GAME_RULES.md.
- [ ] T1.3 (2h) `engine.ts` `nextDay`, `market.ts` `eggPrice`/`sell`, plus Vitest tests (price clamp, tick order, sickness with fixed seed, savings penalty).
- [ ] T1.4 (1h) `mentor.ts` with all triggers from GAME_RULES.md.
- [ ] T1.5 (2h) Main screen UI: TopBar (balance, day), Coop with hens, ActionBar (Feed is automatic in tick; buttons: Clean, Medicine, Sell Eggs, Next Day, Save/Withdraw), MentorBubble. Mobile-first. Use DESIGN.md.
- [ ] T1.6 (1h) `MockChainAdapter` + `ChainAdapter` + `/api/chain/*` routes wired to the store. Game fully playable in mock mode.
- [ ] T1.7 (1h) Tutorial flow (tutorialStep) and starter grant.
**Day 1 done when:** a new player can login as guest, get 100 COOP, free hen, play 3 days, sell eggs, see mentor messages, all in mock mode.

## Day 2: chain, social, demo, submit
- [ ] T2.1 (2h) `NearChainAdapter`: ensureAccount (+storage_deposit), grantStarter, payout, burnOrFee using the FT contract. Test on testnet.
- [ ] T2.2 (1.5h) Sputnik DAO: proposeBuy + approve; ApprovalModal with guardian button.
- [ ] T2.3 (1h) Class goal: 4 simulated classmates, ClassGoal bar, season bonus mint, Celebration animation.
- [ ] T2.4 (1h) ProofDrawer listing tx links; demo mode (seeded events, fast-forward 3 days).
- [ ] T2.5 (1h) Polish animations (egg pop, coin fly, sick hen, mentor bubble) per DESIGN.md.
- [ ] T2.6 (1h) README per `docs/SUBMISSION.md`, `.env.example` check, fresh-clone test in mock mode.
- [ ] T2.7 (1h) Record demo per `docs/DEMO_SCRIPT.md`; post on X; submit form.

## Buffer (Nov 13-14)
Fix bugs only. No new features. Submit before 14 Nov 2026, 23:59 UTC (aim for 13 Nov).

## Definition of Done (manual test)
1. Fresh clone, `npm i`, `npm run dev`, mock mode works with no env.
2. Guest login to 100 COOP, one free hen.
3. Next Day x3 produces eggs, mentor message each day.
4. Skip cleaning for 4 days: a hen eventually gets sick, mentor explains.
5. Buy second hen: guardian approval modal appears; approving completes purchase.
6. Savings jar: deposit, interest after a day, early withdraw shows penalty.
7. Class goal reaches target in demo mode, celebration plays, +50 COOP.
8. Live mode (if configured): proofs appear in the Proof drawer with working explorer links.
9. `npm run build` and `npm run test` pass.
