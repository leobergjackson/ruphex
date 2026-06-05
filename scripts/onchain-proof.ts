/**
 * Capture the real on-chain proofs for the README, end to end.
 *
 *   1. Sends a real USDC transfer on Arbitrum Sepolia (the "client pays creator" proof).
 *   2. Mints the Ruphex provenance NFT on the RARE Protocol via the RARE CLI (if configured).
 *
 * Prints both tx hashes ready to paste into README.md — no faked output.
 *
 * Usage:
 *   # .env.local needs a FUNDED key (Arbitrum Sepolia ETH for gas + USDC to send):
 *   #   PROOF_PRIVATE_KEY=0x...        wallet that pays
 *   #   PROOF_RECIPIENT=0x...          creator that gets paid
 *   #   PROOF_AMOUNT=1                 USDC (default 1)
 *   #   RARE_COLLECTION_ADDRESS=0x...  optional — enables the RARE provenance mint
 *   npm run proof
 *
 * Faucets: https://faucet.quicknode.com/arbitrum/sepolia (ETH) · https://faucet.circle.com (USDC)
 */

import { spawnSync } from 'node:child_process';
import { createWalletClient, createPublicClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import { USDC_ADDRESS, USDC_DECIMALS, ERC20_ABI, ARBISCAN_TX } from '../lib/usdc';
import { buildMintArgs, type PaidInvoice } from '../lib/rare';

function need(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing ${name} in .env.local — see the header of scripts/onchain-proof.ts`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const pk = need('PROOF_PRIVATE_KEY') as `0x${string}`;
  const recipient = need('PROOF_RECIPIENT') as `0x${string}`;
  const amount = process.env.PROOF_AMOUNT ?? '1';
  const rpc = process.env.NEXT_PUBLIC_ARB_SEPOLIA_RPC_URL ?? 'https://sepolia-rollup.arbitrum.io/rpc';

  const account = privateKeyToAccount(pk);
  const wallet = createWalletClient({ account, chain: arbitrumSepolia, transport: http(rpc) });
  const pub = createPublicClient({ chain: arbitrumSepolia, transport: http(rpc) });

  console.log(`\n🇲🇽  Ruphex on-chain proof`);
  console.log(`    Payer:   ${account.address}`);
  console.log(`    Creator: ${recipient}`);
  console.log(`    Amount:  ${amount} USDC on Arbitrum Sepolia\n`);

  // 1) Real USDC payment on Arbitrum Sepolia
  const paymentTxHash = await wallet.writeContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [recipient, parseUnits(amount, USDC_DECIMALS)],
  });
  console.log(`✓ USDC payment sent: ${paymentTxHash}`);
  await pub.waitForTransactionReceipt({ hash: paymentTxHash });
  console.log(`  ${ARBISCAN_TX}${paymentTxHash}\n`);

  // 2) RARE provenance mint (only if a collection is configured)
  const collection = process.env.RARE_COLLECTION_ADDRESS;
  if (!collection) {
    console.log('RARE_COLLECTION_ADDRESS not set — skipping provenance mint.');
    console.log('Deploy one: rare collection deploy erc721 "Ruphex LATAM" "RCB" --chain sepolia\n');
    printReadme(paymentTxHash, null);
    return;
  }

  const invoice: PaidInvoice = {
    reference: `RCB-${new Date().getFullYear()}-PROOF`,
    description: 'Ruphex on-chain proof — LATAM creator payment',
    amountUSDC: Number(amount),
    freelancer: recipient,
    client: account.address,
    paymentTxHash,
    country: process.env.PROOF_COUNTRY ?? 'MX',
  };
  const args = buildMintArgs(invoice, collection);
  console.log(`Minting provenance on RARE…\n$ rare ${args.join(' ')}\n`);
  const bin = process.platform === 'win32' ? 'rare.cmd' : 'rare';
  const res = spawnSync(bin, args, { stdio: 'inherit' });
  if (res.error) {
    console.error('Could not run `rare`. Install: npm i -g @rareprotocol/rare-cli (Node 22+).');
  }
  printReadme(paymentTxHash, 'see RARE CLI output above');
}

function printReadme(paymentTx: string, rareTx: string | null) {
  console.log('── Paste into README.md ──────────────────────────────');
  console.log(`1. Client pays creator — USDC transfer (Arbitrum Sepolia): ${paymentTx}`);
  console.log(`2. Ruphex minted on RARE Protocol (Ethereum Sepolia): ${rareTx ?? '[run with RARE_COLLECTION_ADDRESS]'}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
