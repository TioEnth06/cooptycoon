import { NextResponse } from 'next/server';
import { getChainAdapter } from '@/chain';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const proposalId = String(body.proposalId ?? '0');

    const adapter = getChainAdapter();
    const proof = await adapter.approve(proposalId);

    return NextResponse.json({
      ok: true,
      proof,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Guardian approval failed';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 200 }
    );
  }
}
