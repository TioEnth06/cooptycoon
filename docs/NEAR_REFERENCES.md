# NEAR_REFERENCES: what to read and verify before coding

Copy the content of these pages into `docs/near-refs/*.md` (or add as Cursor @Docs). Cursor must read them before writing any chain code. Verified from docs.near.org search results on 10 Nov 2026; re-check anything that fails.

## Must-read list
| # | Topic | Source | Why |
|---|---|---|---|
| 1 | Hackathon starter kit | docs.near.org/getting-started/hackathons | Links to faucets, SDKs, wallet/auth, CLI, templates |
| 2 | NEAR Auth (social login) | docs.near.org/web3-apps/tutorials/near-auth and docs.auth.near.org | Google/Apple/email/passkey login, testnet config available |
| 3 | FT standard (NEP-141/145) | docs.near.org/primitives/ft/standard | Methods, storage registration |
| 4 | FT example contract | github.com/near-examples/FT | Deployable NEP-141 contract for $COOP |
| 5 | Sputnik DAO usage | docs.near.org/primitives/dao | create DAO, add_proposal, act_proposal |
| 6 | Sputnik contract README | github.com/near-daos/sputnik-dao-contract | proposal kinds, policy, bond |
| 7 | Create transactions (JS) | docs.near.org/integrations/create-transactions | near-api-js server-side signing |
| 8 | Smart contracts quickstart | docs.near.org/smart-contracts/quickstart | testnet account via faucet, deploy |
| 9 | Hackathon track prompts | github.com/nearai/near-hackathon-prompt-examples (tracks 09, 11, 12) | Track-specific guidance |
| 10 | HACKATHON.md | nearhackathon.com/HACKATHON.md | Dates, submission steps, demo tips |

## Verified facts that affect the build
- **Testnet accounts:** created with NEAR CLI and funded by a faucet, e.g. `near create-account <name>.testnet --useFaucet`.
- **JS library:** use the current near-api-js API (`Account`, `JsonRpcProvider`, `KeyPairSigner`). Do NOT use old `connect`/`keyStores` patterns from outdated tutorials.
- **Token registration (NEP-145):** every account must `storage_deposit` on the FT contract before receiving tokens. Reference cost is 0.00125 NEAR.
- **ft_transfer:** requires exactly 1 yoctoNEAR attached deposit.
- **Sputnik factory on testnet:** `sputnikv2.testnet`; creating a DAO needs an attached deposit (docs example uses 6 NEAR).
- **Sputnik proposals:** `add_proposal` default policy requires a minimum bond (1 NEAR by default). Council members act with `act_proposal` (VoteApprove etc.). The policy can be configured at creation, so consider a low bond.
- **Proposal kind choice:** `Transfer` actually moves DAO funds. For a simple "guardian approves purchase" signal, use a non-executing kind; confirm available kinds in the Sputnik README.
- **Explorer:** testnet.nearblocks.io (verify URL format for tx links).
- **RPC:** docs examples use `https://rpc.testnet.near.org`; if rate-limited or deprecated, pick an alternative RPC from the docs.

## Funding checklist (testnet NEAR, via faucet)
| Account | Needs NEAR for |
|---|---|
| ROOT / TREASURY | contract deploy, storage deposits for players, gas |
| NPC | gas for payouts |
| GUARDIAN | proposal bond (if not reduced), gas for act_proposal |
| DAO creator | ~6 NEAR for factory create |
Request faucet funds early (Day 0); faucet limits may apply.

## Account model decision
- **Primary (reliable):** custodial guest accounts created by the server. Fast, no UI friction.
- **Upgrade (if time):** NEAR Auth social login so the player's own key signs. Prompts for track 09 may recommend a specific approach; follow it if simpler.
