import { NextResponse } from 'next/server';
import { getChainAdapter } from '@/chain';
import { HEN_PRICE } from '@/game/constants';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const accountId = String(body.accountId || 'farmer.coop.testnet');
    const amount = Number(body.amount ?? HEN_PRICE);

    const adapter = getChainAdapter();
    const { proposalId, proof } = await adapter.proposeBuy(accountId, amount);

    return NextResponse.json({
      ok: true,
      proposalId,
      proof,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'DAO proposal creation failed';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 200 }
    );
  }
}
