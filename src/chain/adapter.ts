export type TxProof = {
  label: string;
  txId: string;
  url?: string;
  status?: 'confirmed' | 'pending' | 'mock';
  timestamp?: number;
  replacedPendingId?: string;
};

export interface ChainAdapter {
  ensureAccount(nickname: string): Promise<{ accountId: string }>;
  grantStarter(accountId: string, amount: number): Promise<TxProof>;
  payout(accountId: string, amount: number): Promise<TxProof>; // NPC -> player
  burnOrFee(accountId: string, amount: number): Promise<TxProof>; // player -> treasury
  mintBonus(accountIds: string[], amount: number): Promise<TxProof[]>;
  proposeBuy(
    accountId: string,
    amount: number
  ): Promise<{ proposalId: string; proof: TxProof }>;
  approve(proposalId: string): Promise<TxProof>; // guardian (demo)
  balanceOf(accountId: string): Promise<number>;
}
