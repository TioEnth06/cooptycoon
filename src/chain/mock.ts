import { ChainAdapter, TxProof } from './adapter';

type MockProposal = {
  id: string;
  accountId: string;
  amount: number;
  status: 'InProgress' | 'Approved' | 'Rejected';
  createdAt: number;
};

// Persist across Next.js hot reloads in development
const globalForMock = globalThis as unknown as {
  __coopMockBalances?: Map<string, number>;
  __coopMockProposals?: Map<string, MockProposal>;
  __coopMockTxCounter?: number;
};

const balances =
  globalForMock.__coopMockBalances ?? new Map<string, number>();
const proposals =
  globalForMock.__coopMockProposals ?? new Map<string, MockProposal>();
let txCounter = globalForMock.__coopMockTxCounter ?? 1000;

globalForMock.__coopMockBalances = balances;
globalForMock.__coopMockProposals = proposals;

function makeMockTx(label: string): TxProof {
  txCounter += 1;
  globalForMock.__coopMockTxCounter = txCounter;
  const randomSuffix = Math.random().toString(36).slice(2, 10);
  const txId = `mock-tx-${txCounter}-${randomSuffix}`;
  const explorerBase =
    process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://testnet.nearblocks.io';
  return {
    label,
    txId,
    url: `${explorerBase}/txns/${txId}`,
    status: 'mock',
    timestamp: Date.now(),
  };
}

export class MockChainAdapter implements ChainAdapter {
  async ensureAccount(nickname: string): Promise<{ accountId: string }> {
    const clean =
      nickname
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '')
        .slice(0, 20) || 'farmer';
    const root = process.env.ROOT_ACCOUNT || 'coop-tycoon.testnet';
    const accountId = `${clean}.${root}`;
    if (!balances.has(accountId)) {
      balances.set(accountId, 0);
    }
    return { accountId };
  }

  async grantStarter(accountId: string, amount: number): Promise<TxProof> {
    const current = balances.get(accountId) ?? 0;
    balances.set(accountId, current + amount);
    return makeMockTx(`Starter grant (+${amount} COOP)`);
  }

  async payout(accountId: string, amount: number): Promise<TxProof> {
    const current = balances.get(accountId) ?? 0;
    balances.set(accountId, current + amount);
    return makeMockTx(`NPC egg payout (+${amount} COOP)`);
  }

  async burnOrFee(accountId: string, amount: number): Promise<TxProof> {
    const current = balances.get(accountId) ?? 0;
    balances.set(accountId, Math.max(0, current - amount));
    return makeMockTx(`Burn / treasury fee (-${amount} COOP)`);
  }

  async mintBonus(accountIds: string[], amount: number): Promise<TxProof[]> {
    return accountIds.map((id) => {
      const current = balances.get(id) ?? 0;
      balances.set(id, current + amount);
      return makeMockTx(`Season bonus mint (+${amount} COOP to ${id})`);
    });
  }

  async proposeBuy(
    accountId: string,
    amount: number
  ): Promise<{ proposalId: string; proof: TxProof }> {
    const proposalId = String(proposals.size + 1);
    proposals.set(proposalId, {
      id: proposalId,
      accountId,
      amount,
      status: 'InProgress',
      createdAt: Date.now(),
    });
    const proof = makeMockTx(
      `DAO Proposal #${proposalId}: Buy Hen (${amount} COOP)`
    );
    return { proposalId, proof };
  }

  async approve(proposalId: string): Promise<TxProof> {
    const existing = proposals.get(proposalId);
    if (existing) {
      existing.status = 'Approved';
      if (existing.accountId) {
        const current = balances.get(existing.accountId) ?? 0;
        balances.set(
          existing.accountId,
          Math.max(0, current - existing.amount)
        );
      }
    }
    return makeMockTx(`Guardian approved DAO Proposal #${proposalId}`);
  }

  async balanceOf(accountId: string): Promise<number> {
    return balances.get(accountId) ?? 0;
  }
}
