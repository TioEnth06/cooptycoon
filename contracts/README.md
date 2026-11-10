# NEAR Testnet Contracts & Deployment (`$COOP` & Sputnik DAO)

Coop Tycoon supports two chain modes via `ChainAdapter`:
- **`CHAIN_MODE=mock` (Default):** Zero-setup, instant in-memory ledger & DAO proposals so anyone can clone and run `npm run dev` immediately.
- **`CHAIN_MODE=live`:** Real NEAR **testnet** transactions signed server-side via `near-api-js` (`Account`, `JsonRpcProvider`, `KeyPairSigner`).

---

## Deployed Testnet Accounts & Contracts

All accounts and contracts below are live and verified on **NEAR Testnet**:

| Role | Account / Contract ID | Explorer Link |
|---|---|---|
| **Root / Treasury Account** | `coop-treasury-7158.testnet` | [View on NearBlocks](https://testnet.nearblocks.io/address/coop-treasury-7158.testnet) |
| **NPC Buyer Wallet** | `coop-npc-7158.testnet` | [View on NearBlocks](https://testnet.nearblocks.io/address/coop-npc-7158.testnet) |
| **Guardian Council Account** | `coop-guardian-7158.testnet` | [View on NearBlocks](https://testnet.nearblocks.io/address/coop-guardian-7158.testnet) |
| **`$COOP` NEP-141 Token Contract** | `coop-coin-7158.testnet` | [View on NearBlocks](https://testnet.nearblocks.io/address/coop-coin-7158.testnet) |
| **Coop Class Sputnik DAO v2** | `coop-class-7158.sputnikv2.testnet` | [View on NearBlocks](https://testnet.nearblocks.io/address/coop-class-7158.sputnikv2.testnet) |

---

## Verification Transactions on NEAR Testnet

| Step | Transaction Hash | Explorer Link |
|---|---|---|
| **Create Sputnik DAO (`sputnikv2.testnet`)** | `5QcNibz3mm4CZQLgsLtHDnCsnfXfZ1f83Qpnq1LohJSK` | [NearBlocks Tx](https://testnet.nearblocks.io/txns/5QcNibz3mm4CZQLgsLtHDnCsnfXfZ1f83Qpnq1LohJSK) |
| **Deploy `$COOP` NEP-141 WASM** | `6JKLxMv7k52E6NZweAJBr4QHQLhdJJDpmsRXZAMMhZ5a` | [NearBlocks Tx](https://testnet.nearblocks.io/txns/6JKLxMv7k52E6NZweAJBr4QHQLhdJJDpmsRXZAMMhZ5a) |
| **Initialize `$COOP` Metadata (`decimals: 0`)** | `GVjnRHcsLrYb1iUR4jWbrPPGus2goUw9JtEtsQkPCaiZ` | [NearBlocks Tx](https://testnet.nearblocks.io/txns/GVjnRHcsLrYb1iUR4jWbrPPGus2goUw9JtEtsQkPCaiZ) |
| **Mint Initial Supply to Treasury** | `piuoYdHd6C4wofYED3BtboHqguQoXLSEoM3qTiucj6j` | [NearBlocks Tx](https://testnet.nearblocks.io/txns/piuoYdHd6C4wofYED3BtboHqguQoXLSEoM3qTiucj6j) |
| **Fund NPC Buyer Wallet (`ft_transfer` 50,000 COOP)** | `5oCtxL92xKUKidozrEYdkuNXFKgh495zuTGfwiBSBz8c` | [NearBlocks Tx](https://testnet.nearblocks.io/txns/5oCtxL92xKUKidozrEYdkuNXFKgh495zuTGfwiBSBz8c) |
| **Create DAO Proposal (`add_proposal`)** | `BKaS2YHdpQC8FG5JYzFxNtoJSdDjR7ZMMSfNE28oopyi` | [NearBlocks Tx](https://testnet.nearblocks.io/txns/BKaS2YHdpQC8FG5JYzFxNtoJSdDjR7ZMMSfNE28oopyi) |
| **Guardian Approves Proposal (`act_proposal: VoteApprove`)** | `DEvycVfGYBnXFuns4aai5FXkLs7kVdS9ZEXMg94vDsgb` | [NearBlocks Tx](https://testnet.nearblocks.io/txns/DEvycVfGYBnXFuns4aai5FXkLs7kVdS9ZEXMg94vDsgb) |

---

## Re-running Provisioning From Scratch

To provision a brand new set of testnet accounts, deploy the NEP-141 contract (`contracts/fungible_token.wasm`), register NEP-145 storage, fund the NPC buyer, and create a fresh Sputnik DAO on `sputnikv2.testnet`:

```bash
npm run setup:testnet
```

This generates `.env.testnet.generated` (git-ignored so private keys are never committed) and updates `contracts/deployed-testnet.json`.
