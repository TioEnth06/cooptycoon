# Coop Tycoon

> **A cozy chicken-coop simulation where kids learn saving, investing, and risk by running a tiny egg business — powered by NEAR (testnet), with a rule-based mentor (Professor Hoot), NPC buyers with wallets, and a family/class Sputnik DAO as guardian.**

![Coop Tycoon Screenshot Placeholder](docs/screenshot-placeholder.png)
*(Live Demo: [https://cooptycoon-peach.vercel.app](https://cooptycoon-peach.vercel.app))*

Built for **NEAR HACKATHON 2026**.

---

## Hackathon Tracks & How Each Is Satisfied

| Track | How Coop Tycoon Satisfies It |
|---|---|
| **Games With Real Economies** | The economy **is** the gameplay. The NPC egg buyer has its own wallet (`coop-npc-7158.testnet`) and pays players in `$COOP` (`coop-coin-7158.testnet`); egg prices move dynamically with supply and demand (`3` to `8` COOP). Players log in with a nickname, Passkey, or `.testnet` handle and never see wallet popups, gas prompts, or blockchain jargon in the main UI. |
| **Social Money** | A Class/Family DAO deployed on **Sputnik DAO v2** (`coop-class-7158.sputnikv2.testnet`) acts as guardian for large purchases (`>= 30 COOP` when buying additional hens). Caring for hens and saving coins builds **Reputation**, unlocking the **Gold Feed Bag** (`-10%` daily feed cost at `Reputation >= 5`). |
| **Memecoins With Mechanics** | The `$COOP` NEP-141 token enforces economic rules: a **season bonus payout** (`+50 COOP` `ft_transfer` from the treasury to every member) when the class hits the collective savings goal (`500 COOP`), daily **2% Savings Jar interest**, and a **10% early-withdrawal penalty** transferred to the treasury if withdrawn before the 3-day lock expires. |

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

Click the **Proof** receipt icon in the top-right corner of the app at any time to inspect live transaction hashes and open them on `testnet.nearblocks.io`.

---

## Login Methods (How Account Provisioning Works)

| Login Option | How It Works End-to-End |
|---|---|
| **Guest Login (Nickname)** | Player enters a nickname (e.g. `sunny`); server creates a unique custodial sub-account `{nick}.{ROOT_ACCOUNT}` (appending a numeric suffix if already taken), registers NEP-145 `storage_deposit` on `coop-coin-7158.testnet`, and sends the `100 COOP` starter grant. |
| **NEAR Testnet Handle (`NEAR FastAuth` button)** | Player enters an existing `.testnet` account ID (or handle); server registers NEP-145 `storage_deposit` for that `.testnet` account and transfers `100 COOP` directly to it. |
| **Passkey (WebAuthn)** | Uses browser `navigator.credentials.create` to generate a local WebAuthn credential and provisions a unique custodial sub-account `{name}-{credId}.{ROOT_ACCOUNT}` on NEAR Testnet. |
| **Google / Email (Simulated Social Handle)** | In-app email prompt that derives a custodial sub-account `{username}.{ROOT_ACCOUNT}` on NEAR Testnet without requiring external OAuth client secrets. |

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
| **`$COOP` balances (Player sub-account, NPC buyer, Treasury)** | **Onchain NEP-141** (`CHAIN_MODE=live`) / In-memory ledger (`CHAIN_MODE=mock`) |
| **Starter grant (`100 COOP`) & Season bonus payout (`+50 COOP`)** | **Onchain `ft_transfer` from Treasury** (`live`) / Ledger (`mock`) |
| **NPC buyer payout for eggs** | **Onchain `ft_transfer` from NPC wallet to player** (`live`) / Ledger (`mock`) |
| **Hen purchase guardian approval (`>= 30 COOP`)** | **Onchain Sputnik DAO proposal (`add_proposal` + `act_proposal`)** (`live`) / Mock proposal (`mock`) |
| **Early-withdrawal 10% penalty** | **Onchain `ft_transfer` of 10% to Treasury** (`live`) / Ledger (`mock`) |
| **Savings jar balance, coop state, hens, cleanliness, market stock** | **Offchain deterministic game state** (persisted in `localStorage`) |
| **Class goal total (`500 COOP`)** | **Offchain computed** (player jar + 4 simulated classmates); **season bonus payout triggered onchain** |

---

## Architecture Overview

- **Frontend & State:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, custom vector game art (`src/components/icons/GameIcons.tsx`), and Zustand (`src/store/gameStore.ts`).
- **Game Modes (`src/game/levels.ts` & `src/game/quests.ts`):**
  - **Career Mode:** 5 progressive levels (*First eggs*, *Growing flock*, *Feed crisis*, *Patient saver*, *Class goal*) with 1–3 star ratings, unlock progression, and level completion bonuses.
  - **Challenge Mode:** 3 ready-made crisis scenarios (*Feed Crisis*, *Sick Coop*, *Egg Glut*).
  - **Sandbox Mode:** Free play with no day limit and a one-time 20-coin emergency rescue grant.
  - **Daily Quests & 7 Badges:** 3 deterministic daily quests rewarding `+1 Reputation` each, plus 7 collectible farm badges.
- **Pure Game Engine (`src/game/`):**
  - `constants.ts`: Single source of truth for all numbers (`STARTER_GRANT = 100`, `HEN_PRICE = 30`, `CLEAN_COST = 3`, `MEDICINE_COST = 8`, etc.).
  - `rng.ts`: Seeded `mulberry32` PRNG (`DEMO_SEED = 42` in demo mode).
  - `engine.ts`: Deterministic 10-step `nextDay(state)` tick (feed -> cleanliness -> sickness rolls -> egg production -> market decay -> feed spike roll -> 2% savings interest -> day increment -> rule-based mentor -> class goal check).
  - `market.ts`: Dynamic supply/demand `eggPrice(marketStock)` clamped to `[3, 8]` and NPC wallet cap.
  - `mentor.ts`: Rule-based mentor (Professor Hoot) with 11 priority-ordered cause-and-effect triggers (max 2 messages per day).
- **Chain Layer (`src/chain/` & `src/app/api/chain/*`):**
  - `ChainAdapter` interface implemented by `MockChainAdapter` (`src/chain/mock.ts`) and `NearChainAdapter` (`src/chain/near.ts`) using modern `near-api-js` (`Account`, `JsonRpcProvider`, `KeyPairSigner`).
  - Non-blocking API calls that immediately record a `pending` proof and retry once in the background if an RPC call fails.

---

## Testing & Verification

Run the Vitest unit test suite (`17` tests across engine, levels, and chain adapter) and production build:

```bash
npm test
npm run build
```

---

## Safety, Honesty & Known Limitations

- **Safety & Honesty:** Uses virtual **NEAR testnet** tokens only — zero real monetary value, no fiat/crypto onramps, no gambling or random-reward/lootbox mechanics. Educational simulation only, not financial advice.
- **Known Limitations:**
  - **Custodial guest sub-accounts:** To keep login 100% frictionless for children (no wallet popups or seed phrases), guest sub-accounts (`{nick}.{ROOT_ACCOUNT}`) are created and signed server-side by the treasury account.
  - **Simulated classmates:** The 4 classmates in the Class Goal sheet (`Maya`, `Leo`, `Sam`, `Zoe`) are simulated locally with a steady `3%/day` savings growth so single-player sessions and judges can experience the collective goal loop.
  - **Rule-based mentor (Professor Hoot):** Uses deterministic, rule-based cause-and-effect templates (`src/game/mentor.ts`) rather than a live LLM so explanations are instant, child-safe, and predictable.

## License

MIT
