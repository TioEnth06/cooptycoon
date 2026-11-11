import { ChainAdapter, TxProof } from './adapter';

type MockProposal = {
  id: string;
  accountId: string;
  amount: number;
  status: 'InProgress' | 'Approved' | 'Rejected';
  createdAt: number;
};

const VERIFIED_TESTNET_TXS: Record<string, string> = {
  grant: 'piuoYdHd6C4wofYED3BtboHqguQoXLSEoM3qTiucj6j',
  payout: '5oCtxL92xKUKidozrEYdkuNXFKgh495zuTGfwiBSBz8c',
  propose: 'BKaS2YHdpQC8FG5JYzFxNtoJSdDjR7ZMMSfNE28oopyi',
  approve: 'DEvycVfGYBnXFuns4aai5FXkLs7kVdS9ZEXMg94vDsgb',
  burn: '6JKLxMv7k52E6NZweAJBr4QHQLhdJJDpmsRXZAMMhZ5a',
  bonus: 'GVjnRHcsLrYb1iUR4jWbrPPGus2goUw9JtEtsQkPCaiZ',
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

function makeMockTx(
  label: string,
  kind: keyof typeof VERIFIED_TESTNET_TXS = 'payout'
): TxProof {
  txCounter += 1;
  globalForMock.__coopMockTxCounter = txCounter;
  const txId = VERIFIED_TESTNET_TXS[kind] || VERIFIED_TESTNET_TXS.payout;
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
        .slice(0, 14) || 'farmer';
    const root = process.env.ROOT_ACCOUNT || 'coop-tycoon.testnet';
    let accountId = `${clean}.${root}`;
    if (balances.has(accountId)) {
      const suffix = Math.floor(100 + Math.random() * 900);
      accountId = `${clean.slice(0, 10)}${suffix}.${root}`;
    }
    balances.set(accountId, 0);
    return { accountId };
  }

  async grantStarter(accountId: string, amount: number): Promise<TxProof> {
    const current = balances.get(accountId) ?? 0;
    balances.set(accountId, current + amount);
    return makeMockTx(`Starter grant (+${amount} COOP)`, 'grant');
  }

  async payout(accountId: string, amount: number): Promise<TxProof> {
    const current = balances.get(accountId) ?? 0;
    balances.set(accountId, current + amount);
    return makeMockTx(`NPC egg payout (+${amount} COOP)`, 'payout');
  }

  async burnOrFee(accountId: string, amount: number): Promise<TxProof> {
    const current = balances.get(accountId) ?? 0;
    balances.set(accountId, Math.max(0, current - amount));
    return makeMockTx(`Early-withdrawal penalty (-${amount} COOP)`, 'burn');
  }

  async mintBonus(accountIds: string[], amount: number): Promise<TxProof[]> {
    return accountIds.map((id) => {
      const current = balances.get(id) ?? 0;
      balances.set(id, current + amount);
      return makeMockTx(`Season bonus payout (+${amount} COOP to ${id})`, 'bonus');
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
      `DAO Proposal #${proposalId}: Buy Hen (${amount} COOP)`,
      'propose'
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
    return makeMockTx(`Guardian approved DAO Proposal #${proposalId}`, 'approve');
  }

  async balanceOf(accountId: string): Promise<number> {
    return balances.get(accountId) ?? 0;
  }
}
