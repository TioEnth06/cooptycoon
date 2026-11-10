import { NextResponse } from 'next/server';
import { getChainAdapter } from '@/chain';
import { SEASON_BONUS_MINT } from '@/game/constants';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const accountIds: string[] = Array.isArray(body.accountIds)
      ? body.accountIds
      : [String(body.accountId || 'farmer.coop.testnet')];
    const amount = Number(body.amount ?? SEASON_BONUS_MINT);

    const adapter = getChainAdapter();
    const proofs = await adapter.mintBonus(accountIds, amount);

    return NextResponse.json({
      ok: true,
      proof: proofs[0],
      proofs,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Chain bonus mint failed';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 200 }
    );
  }
}
