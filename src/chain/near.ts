import {
  Account,
  JsonRpcProvider,
  KeyPair,
  KeyPairSigner,
  type KeyPairString,
} from 'near-api-js';
import { ChainAdapter, TxProof } from './adapter';

const STORAGE_DEPOSIT_YOCTO = BigInt('1250000000000000000000'); // 0.00125 NEAR
const SUBACCOUNT_INIT_BALANCE_YOCTO = BigInt('2000000000000000000000'); // 0.002 NEAR minimal state for sub-account
const ONE_YOCTO = BigInt('1');
const PROPOSAL_BOND_YOCTO = BigInt('1000000000000000000000000'); // 1 NEAR default Sputnik v2 bond
const DEFAULT_GAS = BigInt('50000000000000'); // 50 TGas
const DAO_GAS = BigInt('150000000000000'); // 150 TGas

function getRpcUrl(): string {
  return process.env.NEAR_RPC_URL || 'https://test.rpc.fastnear.com';
}

function getExplorerTxUrl(txId: string): string {
  const base =
    process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://testnet.nearblocks.io';
  return `${base.replace(/\/$/, '')}/txns/${txId}`;
}

function getAccountSigner(accountId: string, privateKey: string): Account {
  const provider = new JsonRpcProvider({ url: getRpcUrl() });
  const normalizedKey = (
    privateKey.startsWith('ed25519:') ? privateKey : `ed25519:${privateKey}`
  ) as KeyPairString;
  const keyPair = KeyPair.fromString(normalizedKey);
  const signer = new KeyPairSigner(keyPair);
  return new Account(accountId, provider, signer);
}

function extractTxHash(outcome: unknown): string {
  if (
    outcome &&
    typeof outcome === 'object' &&
    'transaction' in outcome &&
    outcome.transaction &&
    typeof outcome.transaction === 'object' &&
    'hash' in outcome.transaction &&
    typeof outcome.transaction.hash === 'string'
  ) {
    return outcome.transaction.hash;
  }
  if (
    outcome &&
    typeof outcome === 'object' &&
    'transaction_outcome' in outcome &&
    outcome.transaction_outcome &&
    typeof outcome.transaction_outcome === 'object' &&
    'id' in outcome.transaction_outcome &&
    typeof outcome.transaction_outcome.id === 'string'
  ) {
    return outcome.transaction_outcome.id;
  }
  return `near-tx-${Date.now()}`;
}

export class NearChainAdapter implements ChainAdapter {
  private get treasuryAccount(): Account {
    const id = process.env.TREASURY_ACCOUNT || process.env.ROOT_ACCOUNT;
    const key = process.env.TREASURY_PRIVATE_KEY;
    if (!id || !key) {
      throw new Error('Missing TREASURY_ACCOUNT or TREASURY_PRIVATE_KEY');
    }
    return getAccountSigner(id, key);
  }

  private get npcAccount(): Account {
    const id = process.env.NPC_ACCOUNT || process.env.TREASURY_ACCOUNT;
    const key =
      process.env.NPC_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY;
    if (!id || !key) {
      throw new Error('Missing NPC_ACCOUNT or NPC_PRIVATE_KEY');
    }
    return getAccountSigner(id, key);
  }

  private get guardianAccount(): Account {
    const id = process.env.GUARDIAN_ACCOUNT || process.env.TREASURY_ACCOUNT;
    const key =
      process.env.GUARDIAN_PRIVATE_KEY || process.env.TREASURY_PRIVATE_KEY;
    if (!id || !key) {
      throw new Error('Missing GUARDIAN_ACCOUNT or GUARDIAN_PRIVATE_KEY');
    }
    return getAccountSigner(id, key);
  }

  private get ftContractId(): string {
    const id = process.env.COOP_TOKEN_CONTRACT;
    if (!id) {
      throw new Error('Missing COOP_TOKEN_CONTRACT');
    }
    return id;
  }

  private get daoContractId(): string {
    const id = process.env.DAO_CONTRACT;
    if (!id) {
      throw new Error('Missing DAO_CONTRACT');
    }
    return id;
  }

  private async isStorageRegistered(accountId: string): Promise<boolean> {
    try {
      const provider = new JsonRpcProvider({ url: getRpcUrl() });
      const res = await provider.callFunction({
        contractId: this.ftContractId,
        method: 'storage_balance_of',
        args: { account_id: accountId },
      });
      return res !== null && res !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Ensures each player gets a unique sub-account `{nick}.{ROOT_ACCOUNT}` (or their explicit `.testnet` account)
   * with NEP-145 `storage_deposit` registered on the $COOP token contract.
   * Never maps players back to a shared ROOT_ACCOUNT balance.
   */
  async ensureAccount(nickname: string): Promise<{ accountId: string }> {
    const trimmed = nickname.trim().toLowerCase();
    const treasury = this.treasuryAccount;
    const root =
      process.env.ROOT_ACCOUNT ||
      process.env.TREASURY_ACCOUNT ||
      'coop.testnet';

    // Case 1: Caller passed a full .testnet account (and not a sub-account of root that still needs creation)
    if (
      trimmed.endsWith('.testnet') &&
      !trimmed.includes(' ') &&
      !trimmed.endsWith(`.${root}`)
    ) {
      const registered = await this.isStorageRegistered(trimmed);
      if (!registered) {
        await treasury.callFunctionRaw({
          contractId: this.ftContractId,
          methodName: 'storage_deposit',
          args: {
            account_id: trimmed,
            registration_only: true,
          },
          gas: DEFAULT_GAS,
          deposit: STORAGE_DEPOSIT_YOCTO,
        });
      }
      return { accountId: trimmed };
    }

    // Case 2: Derive a clean sub-account prefix `{prefix}.{ROOT_ACCOUNT}`
    const rawPrefix = trimmed.endsWith(`.${root}`)
      ? trimmed.slice(0, -(root.length + 1))
      : trimmed;
    const basePrefix =
      rawPrefix.replace(/[^a-z0-9_-]/g, '').slice(0, 14) || 'player';

    const rawKey = process.env.TREASURY_PRIVATE_KEY!;
    const normalizedKey = (
      rawKey.startsWith('ed25519:') ? rawKey : `ed25519:${rawKey}`
    ) as KeyPairString;
    const treasuryPubKey = KeyPair.fromString(normalizedKey).getPublicKey();

    let candidatePrefix = basePrefix;
    let candidateAccountId = `${candidatePrefix}.${root}`;

    // If the sub-account already has FT storage registered, append a short deterministic/random suffix
    // so a new guest with the same nickname gets a fresh sub-account balance
    const alreadyUsed = await this.isStorageRegistered(candidateAccountId);
    if (alreadyUsed && !trimmed.endsWith(`.${root}`)) {
      const suffix = Math.floor(100 + Math.random() * 900);
      candidatePrefix = `${basePrefix.slice(0, 10)}${suffix}`;
      candidateAccountId = `${candidatePrefix}.${root}`;
    }

    // Create the sub-account under ROOT_ACCOUNT if it doesn't exist yet onchain
    try {
      await treasury.createSubAccount({
        accountOrPrefix: candidatePrefix,
        publicKey: treasuryPubKey,
        nearToTransfer: SUBACCOUNT_INIT_BALANCE_YOCTO,
      });
    } catch {
      // Sub-account already exists onchain; proceed to storage_deposit
    }

    const registered = await this.isStorageRegistered(candidateAccountId);
    if (!registered) {
      await treasury.callFunctionRaw({
        contractId: this.ftContractId,
        methodName: 'storage_deposit',
        args: {
          account_id: candidateAccountId,
          registration_only: true,
        },
        gas: DEFAULT_GAS,
        deposit: STORAGE_DEPOSIT_YOCTO,
      });
    }

    return { accountId: candidateAccountId };
  }

  private resolveOnchainReceiver(accountId: string): string {
    const cleaned = accountId.trim().toLowerCase();
    const root =
      process.env.ROOT_ACCOUNT ||
      process.env.TREASURY_ACCOUNT ||
      'coop.testnet';
    if (cleaned.endsWith('.testnet')) {
      return cleaned;
    }
    const prefix = cleaned.replace(/[^a-z0-9_-]/g, '').slice(0, 16) || 'player';
    return `${prefix}.${root}`;
  }

  async grantStarter(accountId: string, amount: number): Promise<TxProof> {
    const treasury = this.treasuryAccount;
    const receiverId = this.resolveOnchainReceiver(accountId);
    const outcome = await treasury.callFunctionRaw({
      contractId: this.ftContractId,
      methodName: 'ft_transfer',
      args: {
        receiver_id: receiverId,
        amount: String(Math.round(amount)),
        memo: `Starter grant for ${receiverId}`,
      },
      gas: DEFAULT_GAS,
      deposit: ONE_YOCTO,
    });

    const txId = extractTxHash(outcome);
    return {
      label: `Starter grant (+${amount} COOP)`,
      txId,
      url: getExplorerTxUrl(txId),
      status: 'confirmed',
      timestamp: Date.now(),
    };
  }

  async payout(accountId: string, amount: number): Promise<TxProof> {
    const npc = this.npcAccount;
    const receiverId = this.resolveOnchainReceiver(accountId);
    const outcome = await npc.callFunctionRaw({
      contractId: this.ftContractId,
      methodName: 'ft_transfer',
      args: {
        receiver_id: receiverId,
        amount: String(Math.round(amount)),
        memo: `NPC egg purchase payout to ${receiverId}`,
      },
      gas: DEFAULT_GAS,
      deposit: ONE_YOCTO,
    });

    const txId = extractTxHash(outcome);
    return {
      label: `NPC egg payout (+${amount} COOP)`,
      txId,
      url: getExplorerTxUrl(txId),
      status: 'confirmed',
      timestamp: Date.now(),
    };
  }

  async burnOrFee(accountId: string, amount: number): Promise<TxProof> {
    const root =
      process.env.ROOT_ACCOUNT ||
      process.env.TREASURY_ACCOUNT ||
      'coop.testnet';
    const senderId = this.resolveOnchainReceiver(accountId);
    const treasuryKey = process.env.TREASURY_PRIVATE_KEY!;

    // If the player account is a custodial sub-account of ROOT_ACCOUNT, sign with the custodial key
    // to transfer the 10% early-withdrawal penalty back to TREASURY_ACCOUNT.
    const signerAccount = senderId.endsWith(`.${root}`)
      ? getAccountSigner(senderId, treasuryKey)
      : this.treasuryAccount;
    const receiverId = senderId.endsWith(`.${root}`)
      ? root
      : process.env.NPC_ACCOUNT || root;

    const outcome = await signerAccount.callFunctionRaw({
      contractId: this.ftContractId,
      methodName: 'ft_transfer',
      args: {
        receiver_id: receiverId,
        amount: String(Math.max(1, Math.round(amount))),
        memo: `Early-withdrawal penalty from ${senderId}`,
      },
      gas: DEFAULT_GAS,
      deposit: ONE_YOCTO,
    });

    const txId = extractTxHash(outcome);
    return {
      label: `Early-withdrawal penalty (-${amount} COOP)`,
      txId,
      url: getExplorerTxUrl(txId),
      status: 'confirmed',
      timestamp: Date.now(),
    };
  }

  async mintBonus(accountIds: string[], amount: number): Promise<TxProof[]> {
    const treasury = this.treasuryAccount;
    const proofs: TxProof[] = [];
    const primaryAccount = accountIds[0] || treasury.accountId;
    const receiverId = this.resolveOnchainReceiver(primaryAccount);

    const outcome = await treasury.callFunctionRaw({
      contractId: this.ftContractId,
      methodName: 'ft_transfer',
      args: {
        receiver_id: receiverId,
        amount: String(Math.round(amount)),
        memo: `Class Goal season bonus payout (+${amount} COOP)`,
      },
      gas: DEFAULT_GAS,
      deposit: ONE_YOCTO,
    });

    const txId = extractTxHash(outcome);
    proofs.push({
      label: `Season bonus payout (+${amount} COOP)`,
      txId,
      url: getExplorerTxUrl(txId),
      status: 'confirmed',
      timestamp: Date.now(),
    });

    return proofs;
  }

  async proposeBuy(
    accountId: string,
    amount: number
  ): Promise<{ proposalId: string; proof: TxProof }> {
    const proposer = this.guardianAccount;
    const outcome = await proposer.callFunctionRaw({
      contractId: this.daoContractId,
      methodName: 'add_proposal',
      args: {
        proposal: {
          description: `Approve purchase of 1 Hen for ${amount} COOP by ${accountId}`,
          kind: 'Vote',
        },
      },
      gas: DAO_GAS,
      deposit: PROPOSAL_BOND_YOCTO,
    });

    const txId = extractTxHash(outcome);

    let proposalId = '0';
    try {
      const provider = new JsonRpcProvider({ url: getRpcUrl() });
      const lastId = await provider.callFunction({
        contractId: this.daoContractId,
        method: 'get_last_proposal_id',
        args: {},
      });
      if (typeof lastId === 'number' && lastId > 0) {
        proposalId = String(lastId - 1);
      }
    } catch {
      proposalId = '0';
    }

    return {
      proposalId,
      proof: {
        label: `DAO Proposal #${proposalId}: Buy Hen (${amount} COOP)`,
        txId,
        url: getExplorerTxUrl(txId),
        status: 'confirmed',
        timestamp: Date.now(),
      },
    };
  }

  async approve(proposalId: string): Promise<TxProof> {
    const guardian = this.guardianAccount;
    const numericId = Number.isNaN(Number(proposalId)) ? 0 : Number(proposalId);
    const outcome = await guardian.callFunctionRaw({
      contractId: this.daoContractId,
      methodName: 'act_proposal',
      args: {
        id: numericId,
        action: 'VoteApprove',
      },
      gas: DAO_GAS,
      deposit: BigInt(0),
    });

    const txId = extractTxHash(outcome);
    return {
      label: `Guardian approved DAO Proposal #${numericId}`,
      txId,
      url: getExplorerTxUrl(txId),
      status: 'confirmed',
      timestamp: Date.now(),
    };
  }

  async balanceOf(accountId: string): Promise<number> {
    const provider = new JsonRpcProvider({ url: getRpcUrl() });
    const target = this.resolveOnchainReceiver(accountId);
    const raw = await provider.callFunction({
      contractId: this.ftContractId,
      method: 'ft_balance_of',
      args: { account_id: target },
    });
    return Number(raw || 0);
  }
}
