'use client';

/**
 * Client-side NEAR Social & Testnet Login Helper
 *
 * Supports:
 * 1. NEAR Testnet Wallet / FastAuth redirect (testnet.mynearwallet.com)
 *    with function-call access key for $COOP NEP-141 contract (`coop-coin-7158.testnet`).
 * 2. One-click Social Login (Google, Apple, Email, WebAuthn Passkey)
 *    that provisions a deterministic NEAR testnet account server-side.
 */

const PENDING_KEY_STORAGE = 'coop-tycoon-near-pending-key';

export type AuthMethod =
  | 'near-wallet'
  | 'google'
  | 'apple'
  | 'email'
  | 'passkey'
  | 'guest';

export function buildNearWalletLoginUrl(contractId = 'coop-coin-7158.testnet'): string {
  if (typeof window === 'undefined') return 'https://testnet.mynearwallet.com/login/';

  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete('account_id');
  currentUrl.searchParams.delete('public_key');
  currentUrl.searchParams.delete('all_keys');

  const successUrl = new URL(currentUrl.toString());
  successUrl.searchParams.set('near_auth_cb', '1');

  const failureUrl = new URL(currentUrl.toString());

  const walletUrl = new URL('https://testnet.mynearwallet.com/login/');
  walletUrl.searchParams.set('title', 'Coop Tycoon');
  walletUrl.searchParams.set('contract_id', contractId);
  walletUrl.searchParams.set('success_url', successUrl.toString());
  walletUrl.searchParams.set('failure_url', failureUrl.toString());

  return walletUrl.toString();
}

export function redirectToNearSocialLogin(contractId = 'coop-coin-7158.testnet'): void {
  if (typeof window === 'undefined') return;
  const url = buildNearWalletLoginUrl(contractId);
  window.location.assign(url);
}

export function consumeNearWalletCallback(): { accountId: string; nickname: string } | null {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  const accountId = url.searchParams.get('account_id');
  if (!accountId) return null;

  // Clean URL query params so reload doesn't re-trigger
  url.searchParams.delete('account_id');
  url.searchParams.delete('public_key');
  url.searchParams.delete('all_keys');
  url.searchParams.delete('near_auth_cb');
  window.history.replaceState({}, '', url.pathname + url.search);

  localStorage.removeItem(PENDING_KEY_STORAGE);
  const nickname = accountId.replace(/\.testnet$/, '').split('.')[0] || 'Farmer';
  return { accountId, nickname };
}

export async function createPasskeyCredential(displayName: string): Promise<string> {
  const clean = displayName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'farmer';
  if (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential &&
    navigator.credentials &&
    typeof navigator.credentials.create === 'function'
  ) {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const cred = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'Coop Tycoon (NEAR Testnet)' },
          user: {
            id: userId,
            name: `${clean}@cooptycoon.near`,
            displayName: displayName || 'Coop Farmer',
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          timeout: 30000,
          authenticatorSelection: {
            userVerification: 'preferred',
          },
        },
      });
      if (cred && cred.id) {
        const suffix = cred.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 6);
        return `${clean}-${suffix}`;
      }
    } catch {
      // Fallback if user cancels OS passkey prompt or in iframe
    }
  }
  return `${clean}-pk`;
}
