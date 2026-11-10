'use client';

/**
 * Client-side NEAR Social & Testnet Login Helper
 *
 * Replaces retired MyNearWallet redirect with:
 * 1. In-App NEAR FastAuth / Social Login (Google, Apple, Email, Passkey)
 *    that provisions a deterministic NEAR testnet account server-side with zero wallet friction.
 * 2. Direct `.testnet` account connection (for judges/users who want to connect an existing
 *    NEAR Testnet account like `alice.testnet` or create a fresh one on the spot).
 */

export type AuthMethod =
  | 'near-wallet'
  | 'google'
  | 'apple'
  | 'email'
  | 'passkey'
  | 'guest';

export function consumeNearWalletCallback(): {
  accountId: string;
  nickname: string;
} | null {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  const accountId = url.searchParams.get('account_id');
  if (!accountId) return null;

  url.searchParams.delete('account_id');
  url.searchParams.delete('public_key');
  url.searchParams.delete('all_keys');
  url.searchParams.delete('near_auth_cb');
  window.history.replaceState({}, '', url.pathname + url.search);

  const nickname =
    accountId.replace(/\.testnet$/, '').split('.')[0] || 'Farmer';
  return { accountId, nickname };
}

export function normalizeNearAccountId(rawInput: string): {
  accountId: string;
  nickname: string;
} {
  const cleaned = rawInput
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');

  if (!cleaned) {
    return {
      accountId: 'sunny.coop-treasury-7158.testnet',
      nickname: 'Sunny',
    };
  }

  if (cleaned.endsWith('.testnet')) {
    const nick = cleaned.replace(/\.testnet$/, '').split('.')[0] || 'farmer';
    return {
      accountId: cleaned,
      nickname: nick.charAt(0).toUpperCase() + nick.slice(1),
    };
  }

  const nickOnly = cleaned.replace(/[^a-z0-9_-]/g, '').slice(0, 16) || 'farmer';
  return {
    accountId: `${nickOnly}.coop-treasury-7158.testnet`,
    nickname: nickOnly.charAt(0).toUpperCase() + nickOnly.slice(1),
  };
}

export async function createPasskeyCredential(
  displayName: string
): Promise<string> {
  const clean =
    displayName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'farmer';
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
        const suffix = cred.id
          .replace(/[^a-zA-Z0-9]/g, '')
          .toLowerCase()
          .slice(0, 6);
        return `${clean}-${suffix}`;
      }
    } catch {
      // Fallback if user cancels OS passkey prompt
    }
  }
  return `${clean}-pk`;
}
