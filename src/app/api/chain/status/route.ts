import { NextResponse } from 'next/server';
import { getChainAdapter, isLiveChainMode } from '@/chain';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId') || 'farmer.coop.testnet';
    const adapter = getChainAdapter();
    const balance = await adapter.balanceOf(accountId);

    return NextResponse.json({
      ok: true,
      mode: isLiveChainMode() ? 'live' : 'mock',
      network: process.env.NEAR_NETWORK || 'testnet',
      tokenContract: process.env.COOP_TOKEN_CONTRACT || 'coop-ft.testnet (mock)',
      daoContract:
        process.env.DAO_CONTRACT || 'coop-class.sputnikv2.testnet (mock)',
      explorerUrl:
        process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://testnet.nearblocks.io',
      balance,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Status check failed';
    return NextResponse.json({
      ok: false,
      mode: isLiveChainMode() ? 'live' : 'mock',
      error: message,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action || 'burn');
    const accountId = String(body.accountId || 'farmer.coop.testnet');
    const amount = Number(body.amount || 0);

    const adapter = getChainAdapter();

    if (action === 'burn' && amount > 0) {
      const proof = await adapter.burnOrFee(accountId, amount);
      return NextResponse.json({ ok: true, proof });
    }

    const balance = await adapter.balanceOf(accountId);
    return NextResponse.json({ ok: true, balance });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chain action failed';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 200 }
    );
  }
}
