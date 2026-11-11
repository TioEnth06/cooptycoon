import { describe, expect, it, vi } from 'vitest';
import { MockChainAdapter } from './mock';
import { TxProof } from './adapter';
import { callChainNonBlocking, mergeProofList } from '@/store/gameStore';
import { createInitialGameState } from '@/game/engine';
import { DEMO_SEED } from '@/game/constants';
import { sell } from '@/game/market';

describe('ChainAdapter Separate Player Balances, NPC Low Funds & Non-Blocking Retry', () => {
  it('creates two distinct player sub-accounts (even when given the same nickname) and maintains separate balances', async () => {
    const adapter = new MockChainAdapter();

    const player1 = await adapter.ensureAccount('sunny');
    const player2 = await adapter.ensureAccount('sunny');

    // Collision is handled safely so each guest gets a unique sub-account
    expect(player1.accountId).not.toBe(player2.accountId);
    expect(player1.accountId).toMatch(/^sunny\./);
    expect(player2.accountId).toMatch(/^sunny\d+\./);

    await adapter.grantStarter(player1.accountId, 100);
    await adapter.grantStarter(player2.accountId, 100);

    // Player 1 sells eggs (+15 COOP) and Player 2 pays an early-withdrawal penalty (-5 COOP)
    await adapter.payout(player1.accountId, 15);
    await adapter.burnOrFee(player2.accountId, 5);

    const balance1 = await adapter.balanceOf(player1.accountId);
    const balance2 = await adapter.balanceOf(player2.accountId);

    expect(balance1).toBe(115);
    expect(balance2).toBe(95);
  });

  it('pays what the NPC buyer can afford when NPC wallet balance is low and explains via mentor message', () => {
    const state = {
      ...createInitialGameState(DEMO_SEED),
      eggs: 5,
      marketStock: 10, // unitPrice = 5 COOP
      balance: 40,
      npcBalance: 11, // can only afford 2 eggs (10 COOP) out of 5 requested
    };

    const res = sell(state, 5);
    expect(res.soldCount).toBe(2);
    expect(res.revenue).toBe(10);
    expect(res.state.eggs).toBe(3); // 3 eggs remain unsold in player's basket
    expect(res.state.balance).toBe(50);
    expect(res.state.npcBalance).toBe(1);
    expect(res.mentorNote).toContain('buyer ran out of coins');
  });

  it('shows a pending proof immediately when RPC is called, retries once on failure, and replaces with confirmed proof on retry success', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('RPC timeout'))
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
          proof: {
            label: 'NPC egg payout (+10 COOP)',
            txId: 'tx-confirmed-after-retry',
            status: 'confirmed',
          },
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    let proofs: TxProof[] = [];
    let notices: string[] = [];

    await callChainNonBlocking(
      '/api/chain/payout',
      { accountId: 'alice.coop.testnet', amount: 10 },
      'NPC egg payout (+10 COOP)',
      (proof) => {
        proofs = mergeProofList(proofs, proof);
      },
      (notice) => notices.push(notice),
      10 // fast retry delay for test
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(notices).toContain('Syncing receipt in background...');
    expect(proofs).toHaveLength(1);
    expect(proofs[0].status).toBe('confirmed');
    expect(proofs[0].txId).toBe('tx-confirmed-after-retry');

    vi.unstubAllGlobals();
  });

  it('keeps proof as pending without blocking gameplay if both initial RPC call and retry fail', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('RPC offline'));
    vi.stubGlobal('fetch', fetchMock);

    let proofs: TxProof[] = [];

    await callChainNonBlocking(
      '/api/chain/payout',
      { accountId: 'bob.coop.testnet', amount: 10 },
      'NPC egg payout (+10 COOP)',
      (proof) => {
        proofs = mergeProofList(proofs, proof);
      },
      undefined,
      10
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(proofs).toHaveLength(1);
    expect(proofs[0].status).toBe('pending');
    expect(proofs[0].txId).toMatch(/^pending-/);

    vi.unstubAllGlobals();
  });
});
