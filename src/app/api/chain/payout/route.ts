import { NextResponse } from 'next/server';
import { getChainAdapter } from '@/chain';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const accountId = String(body.accountId || 'farmer.coop.testnet');
    const amount = Number(body.amount || 0);

    if (amount <= 0) {
      return NextResponse.json({ ok: false, error: 'Invalid payout amount' });
    }

    const adapter = getChainAdapter();
    const proof = await adapter.payout(accountId, amount);

    return NextResponse.json({
      ok: true,
      proof,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chain payout failed';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 200 }
    );
  }
}
