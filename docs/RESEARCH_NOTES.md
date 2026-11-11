# RESEARCH_NOTES (Verified for NEAR Testnet Build)
See `docs/NEAR_REFERENCES.md` for the source list and verified facts.

## 1. Account & Login Model (Track 09 - Games With Real Economies)
- **Primary (implemented & default):** Custodial guest accounts (`{nickname}.{ROOT_ACCOUNT}`).
  - Players log in with only a nickname (zero wallet UI, zero gas prompts, zero extension install).
  - Server-side `NearChainAdapter.ensureAccount(nickname)` derives/creates `{sanitizedNick}.{ROOT_ACCOUNT}` (or maps to `{ROOT_ACCOUNT}` if sub-account creation is skipped) and calls `storage_deposit` on `COOP_TOKEN_CONTRACT` paid by `TREASURY_ACCOUNT`.
- **Upgrade option:** NEAR Auth (`docs.auth.near.org`) supports social login (Google/Apple/email/passkey) on testnet, while custodial guest login ensures 100% reliability for kid players and hackathon judges.

## 2. NEP-141 Token Contract (`$COOP`) (Track 11 - Memecoins With Mechanics)
- **Standard:** NEP-141 (`near-examples/FT` or standard fungible token contract).
- **Decimals:** `0` (whole integer coins for simplicity) or `24` (scaled in adapter if needed; our deployed contract uses `0` decimals so `100` raw = `100 COOP`).
- **Methods used:**
  - `storage_deposit({ account_id, registration_only: true })` with `0.00125 NEAR` (`1250000000000000000000` yoctoNEAR) attached deposit paid by `TREASURY_ACCOUNT`.
  - `ft_transfer({ receiver_id, amount, memo })` with `1 yoctoNEAR` (`1`) attached deposit and `30 TGas`.
  - `ft_balance_of({ account_id })` (view call).
- **Payout & Penalty mechanics:**
  - `TREASURY_ACCOUNT` holds the initial pre-funded supply of `$COOP` (e.g., `1,000,000,000 COOP`).
  - **Starter grant (`100 COOP`)** and **Season Bonus Payout (`50 COOP` when Class Goal reached)** execute `ft_transfer` from `TREASURY_ACCOUNT` to the player's sub-account.
  - **NPC Egg Payout** executes `ft_transfer` from `NPC_ACCOUNT` wallet to the player's sub-account.
  - **Early-Withdrawal Penalty (`10%`)** executes `ft_transfer` of 10% from the player's sub-account back to `TREASURY_ACCOUNT` (with memo `"Early-withdrawal penalty"`).

## 3. Sputnik DAO v2 (`sputnikv2.testnet`) (Track 12 - Social Money)
- **Factory:** `sputnikv2.testnet` on NEAR testnet.
- **DAO Account:** `{dao_name}.sputnikv2.testnet` (with `GUARDIAN_ACCOUNT` in the `council` role).
- **Proposal Kind:** `{ "Vote": null }` (`kind: "Vote"`).
  - Non-executing governance signal ideal for guardian approval of large purchases (`>= 30 COOP` for buying a 2nd+ hen) without moving NEAR out of the DAO treasury.
- **Methods used:**
  - `add_proposal({ proposal: { description: "Approve purchase of 1 Hen (30 COOP) for <accountId>", kind: "Vote" } })` with attached bond (e.g. `0.1 NEAR` or `1 NEAR` depending on DAO policy). Returns sequential integer `proposal_id`.
  - `act_proposal({ id: Number(proposalId), action: "VoteApprove" })` called by `GUARDIAN_ACCOUNT` with `100 TGas`.
  - `get_proposal({ id: Number(proposalId) })` (view call).

## 4. Explorer URL & RPC Endpoints
- **Explorer:** `https://testnet.nearblocks.io/txns/{txHash}`
- **Primary Testnet RPC:** `https://test.rpc.fastnear.com` (reliable, high rate-limit) with fallback to `https://rpc.testnet.near.org`.
