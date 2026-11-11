# ARCHITECTURE

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion.
- State: Zustand (persist to localStorage for game state).
- Blockchain: NEAR **testnet**, via `near-api-js`.
- Tests: Vitest for `src/game/` pure logic.
- Deploy: Vercel (optional). Judges can also run locally.

## Principle: chain is real but hidden, and optional in dev
Everything goes through `ChainAdapter`. Two implementations:
- `MockChainAdapter`: in-memory ledger, fake tx ids. Default. Zero setup.
- `NearChainAdapter`: real testnet calls. Enabled with `CHAIN_MODE=live`.

## What is onchain vs offchain
| Thing | Where |
|---|---|
| $COOP balances (player sub-account, NPC buyer, treasury) | Onchain NEP-141 (live) / ledger (mock) |
| Starter grant, season bonus payout | Onchain `ft_transfer` from treasury (live) |
| NPC buyer payout for eggs | Onchain `ft_transfer` from NPC account to player |
| Hen purchase approval | Onchain Sputnik DAO proposal (live) / mock proposal |
| Savings jar, coop state, hens, cleanliness | Offchain game state |
| Early-withdrawal penalty | Onchain 10% transfer to treasury (live) / ledger (mock) |
| Class goal total | Offchain computed; season bonus payout triggered onchain |

Be honest about this in the README.

## Folder structure
```
src/
  app/
    page.tsx                 # main game screen
    api/
      chain/
        grant/route.ts       # starter grant
        payout/route.ts      # NPC buyer pays player
        mint-bonus/route.ts  # season bonus
        propose/route.ts     # create DAO proposal
        approve/route.ts     # guardian approves (demo)
        status/route.ts      # balances + proof links
  game/
    constants.ts             # from GAME_RULES.md
    rng.ts                   # mulberry32
    types.ts
    engine.ts                # nextDay(state) -> {state, events}
    market.ts                # eggPrice, sell
    mentor.ts                # rule-based messages
    engine.test.ts
  chain/
    adapter.ts               # ChainAdapter interface
    mock.ts
    near.ts
    index.ts                 # picks adapter from CHAIN_MODE
  store/
    gameStore.ts
  components/
    Coop.tsx  Hen.tsx  TopBar.tsx  ActionBar.tsx
    MentorBubble.tsx  SavingsJar.tsx  ClassGoal.tsx
    ApprovalModal.tsx  ProofDrawer.tsx  Celebration.tsx
contracts/
  README.md                  # how the FT contract and DAO were deployed
docs/
```

## Types (src/game/types.ts)
```ts
export type Hen = { id: string; sickDays: number; fedToday: boolean };
export type GameState = {
  day: number;
  balance: number;          // mirrors onchain balance
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
  pendingApproval: { kind: 'buy_hen'; proposalId: string } | null;
  tutorialStep: number;
  classmates: { name: string; jar: number }[];
};
export type DayEvent = { type: string; data?: Record<string, number | string> };
```

## ChainAdapter (src/chain/adapter.ts)
```ts
export type TxProof = { label: string; txId: string; url?: string };
export interface ChainAdapter {
  ensureAccount(nickname: string): Promise<{ accountId: string }>;
  grantStarter(accountId: string, amount: number): Promise<TxProof>;
  payout(accountId: string, amount: number): Promise<TxProof>;       // NPC -> player
  burnOrFee(accountId: string, amount: number): Promise<TxProof>;    // player -> treasury
  mintBonus(accountIds: string[], amount: number): Promise<TxProof[]>;
  proposeBuy(accountId: string, amount: number): Promise<{ proposalId: string; proof: TxProof }>;
  approve(proposalId: string): Promise<TxProof>;                     // guardian (demo)
  balanceOf(accountId: string): Promise<number>;
}
```

## Login
- Goal: no wallet UI. Candidate: **NEAR Auth** (Google/Apple/email/passkey, testnet config available at docs.auth.near.org). Confirm against the Games track prompt (see `docs/RESEARCH_NOTES.md`).
- **Fallback (must exist):** guest login. User types a nickname; the server creates/derives a custodial testnet sub-account (e.g. `{nick}.{ROOT_ACCOUNT}`) and registers storage for $COOP. State this limitation in the README.

## JS library note
Use the current near-api-js API: `Account`, `JsonRpcProvider`, `KeyPairSigner` (server-side signing from env keys). Do not use old `connect`/`keyStores` examples. Network RPC example: `https://rpc.testnet.near.org` (switch if rate-limited).

## Token contract ($COOP)
- Use the reference NEP-141 fungible token example (NEAR examples) or a minimal Rust/JS FT contract. 24-decimals not needed to show; UI shows whole numbers. Store decimals = 0 or 2 to keep it simple.
- Owner/minter account = `TREASURY_ACCOUNT`. Mint = `ft_transfer` from a pre-minted supply (simplest) or a custom `mint` method if using a mintable contract.
- Each player account needs `storage_deposit` before receiving tokens; do this in `ensureAccount`.
- Verify method names against docs.near.org / the track prompt before coding (see `docs/NEAR_REFERENCES.md`).
- `ft_transfer` requires exactly 1 yoctoNEAR attached; the treasury/NPC signer must attach it.
- Registration cost reference is 0.00125 NEAR per account; the treasury pays it in `ensureAccount`.

## DAO (Sputnik)
- Create one DAO on testnet: "Coop Class DAO" with the guardian as council member.
- Hen purchase: `proposeBuy` creates a proposal (for example a Transfer or a Vote-type proposal; pick the simplest that Sputnik supports); guardian approves via `approve`.
- Demo: an "Approve as guardian" button calls `/api/chain/approve`, which signs with the guardian key from env.
- Mock mode: proposals live in memory; approve flips status.
- Factory on testnet: `sputnikv2.testnet` (creating a DAO needs an attached deposit; docs example uses 6 NEAR).
- Default policy requires a proposal bond (1 NEAR default). Reduce it at DAO creation or fund the proposer account.
- `Transfer` proposals move real DAO funds; prefer a non-executing kind for "approval" and confirm kinds in the Sputnik README.
- Council acts with `act_proposal` (VoteApprove). Verify everything in `docs/NEAR_REFERENCES.md` before coding.

## Environment variables (.env.example)
```
CHAIN_MODE=mock                 # mock | live
NEAR_NETWORK=testnet
ROOT_ACCOUNT=                   # e.g. coop.testnet
TREASURY_ACCOUNT=
TREASURY_PRIVATE_KEY=           # server only, never commit
NPC_ACCOUNT=
NPC_PRIVATE_KEY=
GUARDIAN_ACCOUNT=
GUARDIAN_PRIVATE_KEY=
COOP_TOKEN_CONTRACT=
DAO_CONTRACT=
NEXT_PUBLIC_EXPLORER_URL=https://testnet.nearblocks.io
NEXT_PUBLIC_DEMO_MODE=true
```

## Error handling
- Any live chain call failing must NOT block the game: show a gentle toast, keep local state, mark proof as "pending", and retry once in background.
- All API routes return `{ ok: boolean, proof?: TxProof, error?: string }`.

## Testing
- Vitest tests for: egg price clamp, day tick order, sickness thresholds (with fixed seed), savings penalty, class goal trigger.
- Manual test script in `docs/TASKS.md` Definition of Done.
