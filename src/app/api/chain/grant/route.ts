import { NextResponse } from 'next/server';
import { getChainAdapter } from '@/chain';
import { STARTER_GRANT } from '@/game/constants';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nickname = String(body.nickname || 'farmer');
    const amount = Number(body.amount ?? STARTER_GRANT);

    const adapter = getChainAdapter();
    const { accountId } = await adapter.ensureAccount(nickname);
    const proof = await adapter.grantStarter(accountId, amount);

    return NextResponse.json({
      ok: true,
      accountId,
      proof,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chain grant failed';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 200 }
    );
  }
}
