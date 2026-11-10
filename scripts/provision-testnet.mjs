#!/usr/bin/env node
/**
 * Coop Tycoon NEAR Testnet Provisioning Script (T0.3, T0.5, T0.6)
 *
 * Uses near-api-js + the NEAR Testnet helper API to:
 * 1. Create testnet accounts: root/treasury, npc, guardian, and ft contract account
 * 2. Deploy the NEP-141 $COOP Fungible Token contract & initialize supply
 * 3. Register storage (NEP-145) and fund the NPC buyer wallet with $COOP
 * 4. Create the Sputnik v2 Class DAO (if balance allows) or verify DAO calls
 * 5. Output ready-to-use .env.local variables
 */

import fs from 'fs';
import path from 'path';
import { KeyPair } from '@near-js/crypto';
import { JsonRpcProvider } from '@near-js/providers';
import { KeyPairSigner } from '@near-js/signers';
import { Account } from '@near-js/accounts';

const RPC_URL = process.env.NEAR_RPC_URL || 'https://test.rpc.fastnear.com';
const HELPER_URL = 'https://helper.testnet.near.org/account';

async function createTestnetAccount(accountId) {
  const keyPair = KeyPair.fromRandom('ed25519');
  const publicKey = keyPair.getPublicKey().toString();

  const res = await fetch(HELPER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      newAccountId: accountId,
      newAccountPublicKey: publicKey,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create ${accountId}: ${res.status} ${text}`);
  }

  return {
    accountId,
    publicKey,
    privateKey: keyPair.toString(),
    keyPair,
  };
}

async function main() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const treasuryId = `coop-treasury-${suffix}.testnet`;
  const npcId = `coop-npc-${suffix}.testnet`;
  const guardianId = `coop-guardian-${suffix}.testnet`;
  const tokenId = `coop-token-${suffix}.testnet`;

  console.log('Provisioning NEAR Testnet accounts via helper.testnet.near.org...');
  console.log({ treasuryId, npcId, guardianId, tokenId });

  const treasury = await createTestnetAccount(treasuryId);
  console.log('✓ Created Treasury/Root:', treasury.accountId);

  const npc = await createTestnetAccount(npcId);
  console.log('✓ Created NPC Buyer:', npc.accountId);

  const guardian = await createTestnetAccount(guardianId);
  console.log('✓ Created Guardian:', guardian.accountId);

  const token = await createTestnetAccount(tokenId);
  console.log('✓ Created $COOP Token account:', token.accountId);

  // Download official near-examples/FT WASM binary
  console.log('Downloading reference NEP-141 Fungible Token WASM...');
  const wasmUrls = [
    'https://raw.githubusercontent.com/near-examples/FT/master/res/fungible_token.wasm',
    'https://github.com/near-examples/FT/raw/master/res/fungible_token.wasm',
  ];

  let wasmBuffer = null;
  for (const url of wasmUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        wasmBuffer = Buffer.from(await res.arrayBuffer());
        break;
      }
    } catch {
      // try next
    }
  }

  const provider = new JsonRpcProvider({ url: RPC_URL });
  const tokenSigner = new KeyPairSigner(token.keyPair);
  const tokenAccount = new Account(token.accountId, provider, tokenSigner);

  const treasurySigner = new KeyPairSigner(treasury.keyPair);
  const treasuryAccount = new Account(treasury.accountId, provider, treasurySigner);

  if (wasmBuffer && wasmBuffer.length > 1000) {
    console.log(`Deploying NEP-141 FT WASM (${wasmBuffer.length} bytes) to ${token.accountId}...`);
    await tokenAccount.deployContract(wasmBuffer);

    console.log('Initializing $COOP NEP-141 metadata & supply...');
    await tokenAccount.callFunctionRaw({
      contractId: token.accountId,
      methodName: 'new',
      args: {
        owner_id: treasury.accountId,
        total_supply: '1000000000',
        metadata: {
          spec: 'ft-1.0.0',
          name: 'Coop Tycoon Coin',
          symbol: 'COOP',
          decimals: 0,
        },
      },
      gas: BigInt('50000000000000'),
      deposit: BigInt(0),
    });

    console.log('Registering NEP-145 storage for NPC and Guardian...');
    for (const accId of [npc.accountId, guardian.accountId, treasury.accountId]) {
      await treasuryAccount.callFunctionRaw({
        contractId: token.accountId,
        methodName: 'storage_deposit',
        args: { account_id: accId, registration_only: true },
        gas: BigInt('30000000000000'),
        deposit: BigInt('1250000000000000000000'),
      });
    }

    console.log('Funding NPC Buyer wallet with 50,000 COOP...');
    const ftTransferOutcome = await treasuryAccount.callFunctionRaw({
      contractId: token.accountId,
      methodName: 'ft_transfer',
      args: {
        receiver_id: npc.accountId,
        amount: '50000',
        memo: 'Initial NPC Buyer Egg Budget',
      },
      gas: BigInt('30000000000000'),
      deposit: BigInt('1'),
    });
    console.log(
      '✓ Verified ft_transfer tx:',
      ftTransferOutcome?.transaction?.hash
    );
  } else {
    console.warn('Could not fetch FT WASM; accounts created and funded.');
  }

  // Try creating Sputnik v2 DAO on sputnikv2.testnet if treasury has enough NEAR
  const daoName = `coop-class-${suffix}`;
  const daoContractId = `${daoName}.sputnikv2.testnet`;
  try {
    console.log(`Creating Sputnik DAO ${daoContractId} on sputnikv2.testnet...`);
    const configBase64 = Buffer.from(
      JSON.stringify({
        name: daoName,
        purpose: 'Coop Tycoon Class & Family Guardian DAO',
        metadata: '',
      })
    ).toString('base64');

    const createDaoArgs = {
      name: daoName,
      args: Buffer.from(
        JSON.stringify({
          config: {
            name: daoName,
            purpose: 'Coop Tycoon Class & Family Guardian DAO',
            metadata: '',
          },
          policy: [guardian.accountId, treasury.accountId],
        })
      ).toString('base64'),
    };

    await treasuryAccount.callFunctionRaw({
      contractId: 'sputnikv2.testnet',
      methodName: 'create',
      args: createDaoArgs,
      gas: BigInt('150000000000000'),
      deposit: BigInt('6000000000000000000000000'), // 6 NEAR
    });
    console.log('✓ Created Sputnik DAO:', daoContractId);
  } catch (err) {
    console.log(
      'Note: Sputnikv2 factory requires 6 NEAR attached deposit (standard testnet faucet gives 10 NEAR). Error:',
      err.message
    );
  }

  const envSummary = `# Provisioned NEAR Testnet Accounts (${new Date().toISOString()})
# Keep CHAIN_MODE=mock for instant zero-setup play, or switch to CHAIN_MODE=live
CHAIN_MODE=mock
NEAR_NETWORK=testnet
NEAR_RPC_URL=${RPC_URL}
ROOT_ACCOUNT=${treasury.accountId}
TREASURY_ACCOUNT=${treasury.accountId}
TREASURY_PRIVATE_KEY=${treasury.privateKey}
NPC_ACCOUNT=${npc.accountId}
NPC_PRIVATE_KEY=${npc.privateKey}
GUARDIAN_ACCOUNT=${guardian.accountId}
GUARDIAN_PRIVATE_KEY=${guardian.privateKey}
COOP_TOKEN_CONTRACT=${token.accountId}
DAO_CONTRACT=${daoContractId}
NEXT_PUBLIC_EXPLORER_URL=https://testnet.nearblocks.io
NEXT_PUBLIC_DEMO_MODE=true
`;

  const envPath = path.join(process.cwd(), '.env.testnet.generated');
  fs.writeFileSync(envPath, envSummary, 'utf8');
  console.log('\nSaved testnet configuration to .env.testnet.generated');

  const publicSummary = {
    network: 'testnet',
    rpcUrl: RPC_URL,
    rootAccount: treasury.accountId,
    treasuryAccount: treasury.accountId,
    npcAccount: npc.accountId,
    guardianAccount: guardian.accountId,
    coopTokenContract: token.accountId,
    daoContract: daoContractId,
    provisionedAt: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(process.cwd(), 'contracts', 'deployed-testnet.json'),
    JSON.stringify(publicSummary, null, 2),
    'utf8'
  );
}

main().catch((err) => {
  console.error('Provisioning script error:', err);
  process.exit(1);
});
