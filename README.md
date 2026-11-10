# Coop Tycoon

> **A cozy chicken-coop simulation where kids learn saving, investing, and risk by running a tiny egg business — powered by NEAR (testnet), with an AI mentor, NPC buyers with wallets, and a family/class Sputnik DAO as guardian.**

Built for **NEAR HACKATHON 2026**.

---

## Hackathon Tracks & How Each Is Satisfied

| Track | How Coop Tycoon Satisfies It |
|---|---|
| **Games With Real Economies** | The economy **is** the gameplay. The NPC egg buyer has its own wallet (`coop-npc-7158.testnet`) and pays players in `$COOP` (`coop-coin-7158.testnet`); egg prices move dynamically with supply and demand (`3` to `8` COOP). Players log in with a nickname and never see wallets, gas, or blockchain jargon in the main UI. |
| **Social Money** | A Class/Family DAO deployed on **Sputnik DAO v2** (`coop-class-7158.sputnikv2.testnet`) acts as guardian for large purchases (`>= 30 COOP` when buying additional hens). Caring for hens and saving coins builds **Reputation**, unlocking the **Gold Feed Bag** (`-10%` daily feed cost at `Reputation >= 5`). |
| **Memecoins With Mechanics** | The `$COOP` NEP-141 token enforces economic rules: a **Season Bonus Mint** (`+50 COOP` to every member) when the class hits the collective savings goal (`500 COOP`), daily **2% Savings Jar interest**, and a **10% early-withdrawal penalty burn** if withdrawn before the 3-day lock expires. |

---

## Quick Start

### 1. Mock Mode (Default — Zero Setup, Instant Play)

Mock mode runs out of the box with no environment variables or keys required:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Live Mode (NEAR Testnet)

Live mode executes real NEP-141 (`$COOP`) token transfers and Sputnik DAO v2 (`add_proposal` / `act_proposal`) transactions on **NEAR Testnet**:

```bash
cp .env.example .env.local
```

Configure `.env.local` with `CHAIN_MODE=live` and the testnet keys (or generate a fresh set of testnet accounts, NEP-141 contract, and Sputnik DAO automatically with `npm run setup:testnet`):

```env
CHAIN_MODE=live
NEAR_NETWORK=testnet
NEAR_RPC_URL=https://test.rpc.fastnear.com
ROOT_ACCOUNT=coop-treasury-7158.testnet
TREASURY_ACCOUNT=coop-treasury-7158.testnet
TREASURY_PRIVATE_KEY=ed25519:...
NPC_ACCOUNT=coop-npc-7158.testnet
NPC_PRIVATE_KEY=ed25519:...
GUARDIAN_ACCOUNT=coop-guardian-7158.testnet
GUARDIAN_PRIVATE_KEY=ed25519:...
COOP_TOKEN_CONTRACT=coop-coin-7158.testnet
DAO_CONTRACT=coop-class-7158.sputnikv2.testnet
NEXT_PUBLIC_EXPLORER_URL=https://testnet.nearblocks.io
NEXT_PUBLIC_DEMO_MODE=true
```

Then start the server:

```bash
npm run dev
```

Click the **🧾 Proof** icon in the top-right corner of the app at any time to inspect live transaction hashes and open them on `testnet.nearblocks.io`.

---

## Deployed NEAR Testnet Contracts & Verification Links

See [`contracts/README.md`](contracts/README.md) and [`contracts/deployed-testnet.json`](contracts/deployed-testnet.json) for full deployment details:

- **`$COOP` NEP-141 Token Contract:** [`coop-coin-7158.testnet`](https://testnet.nearblocks.io/address/coop-coin-7158.testnet)
- **Coop Class Sputnik DAO v2:** [`coop-class-7158.sputnikv2.testnet`](https://testnet.nearblocks.io/address/coop-class-7158.sputnikv2.testnet)
- **Treasury / Root Account:** [`coop-treasury-7158.testnet`](https://testnet.nearblocks.io/address/coop-treasury-7158.testnet)
- **NPC Egg Buyer Account:** [`coop-npc-7158.testnet`](https://testnet.nearblocks.io/address/coop-npc-7158.testnet)
- **Guardian Council Account:** [`coop-guardian-7158.testnet`](https://testnet.nearblocks.io/address/coop-guardian-7158.testnet)

---

## What Is Onchain vs. Simulated (Offchain)

| Feature / State | Where It Lives |
|---|---|
| **`$COOP` balances (Player, NPC buyer, Treasury)** | **Onchain NEP-141** (`CHAIN_MODE=live`) / In-memory ledger (`CHAIN_MODE=mock`) |
| **Starter grant (`100 COOP`) & Season bonus (`+50 COOP`)** | **Onchain mint / `ft_transfer` from Treasury** (`live`) / Ledger (`mock`) |
| **NPC buyer payout for eggs** | **Onchain `ft_transfer` from NPC wallet to player** (`live`) / Ledger (`mock`) |
| **Hen purchase guardian approval (`>= 30 COOP`)** | **Onchain Sputnik DAO proposal (`add_proposal` + `act_proposal`)** (`live`) / Mock proposal (`mock`) |
| **Early-withdrawal 10% penalty burn** | **Onchain burn / transfer to Treasury** (`live`) / Ledger (`mock`) |
| **Savings jar balance, coop state, hens, cleanliness, market stock** | **Offchain deterministic game state** (persisted in `localStorage`) |
| **Class goal total (`500 COOP`)** | **Offchain computed** (player jar + 4 simulated classmates); **bonus mint triggered onchain** |

---

## Architecture Overview

- **Frontend & State:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, and Zustand (`src/store/gameStore.ts`).
- **Pure Game Engine (`src/game/`):**
  - `constants.ts`: Single source of truth for all numbers (`STARTER_GRANT = 100`, `HEN_PRICE = 30`, `CLEAN_COST = 3`, `MEDICINE_COST = 8`, etc.).
  - `rng.ts`: Seeded `mulberry32` PRNG (`DEMO_SEED = 42` in demo mode).
  - `engine.ts`: Deterministic 10-step `nextDay(state)` tick (feed -> cleanliness -> sickness rolls -> egg production -> market decay -> feed spike roll -> 2% savings interest -> day increment -> rule-based mentor -> class goal check).
  - `market.ts`: Dynamic supply/demand `eggPrice(marketStock)` clamped to `[3, 8]` and NPC wallet cap.
  - `mentor.ts`: 11 priority-ordered cause-and-effect mentor triggers (max 2 messages per day).
- **Chain Layer (`src/chain/` & `src/app/api/chain/*`):**
  - `ChainAdapter` interface implemented by `MockChainAdapter` (`src/chain/mock.ts`) and `NearChainAdapter` (`src/chain/near.ts`) using modern `near-api-js` (`Account`, `JsonRpcProvider`, `KeyPairSigner`).
  - Non-blocking API calls with automatic background retry so RPC latency never interrupts a child's gameplay.

---

## Testing & Verification

Run the Vitest unit test suite and production build:

```bash
npm test
npm run build
```

---

## Safety, Honesty & Known Limitations

- **Safety & Honesty:** Uses virtual **NEAR testnet** tokens only — zero real monetary value, no fiat/crypto onramps, no gambling or random-reward/lootbox mechanics. Educational simulation only, not financial advice.
- **Known Limitations:**
  - **Custodial guest accounts:** To keep login 100% frictionless for children (no wallet popups or seed phrases), guest accounts are managed server-side under the root/treasury testnet account.
  - **Simulated classmates:** The 4 classmates in the Class Goal sheet (`Maya`, `Leo`, `Sam`, `Zoe`) are simulated locally with a steady `3%/day` savings growth so single-player sessions and judges can experience the collective goal loop.
  - **Rule-based AI mentor:** Professor Hoot uses deterministic, rule-based cause-and-effect templates (`src/game/mentor.ts`) so explanations are instant, safe, and predictable.

## License

MIT
