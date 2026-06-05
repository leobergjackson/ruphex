/**
 * Mint a settled Ruphex invoice as a RARE Protocol NFT.
 *
 * Ruphex is the receipt rail for LATAM creators: once a USDC invoice settles on Arbitrum,
 * this script mints the proof-of-payment + work provenance on the RARE Protocol via the
 * official RARE CLI (`@rareprotocol/rare-cli`). See RARE.md for the full walkthrough.
 *
 * Usage:
 *   npm run rare:mint -- --invoice ./invoice.json
 *   npm run rare:mint -- --reference RCB-2026-014 --description "Brand identity" \
 *     --amount 700 --freelancer 0xCreator --client 0xClient --tx 0xPaymentHash --country MX
 *
 * Requires a one-time setup (see RARE.md):
 *   npm i -g @rareprotocol/rare-cli
 *   rare configure --chain sepolia --private-key 0x...
 *   rare collection deploy erc721 "Ruphex LATAM" "RCB" --chain sepolia   # -> RARE_COLLECTION_ADDRESS
 *
 * Env:
 *   RARE_COLLECTION_ADDRESS   RARE collection to mint into (required unless --contract passed)
 *   RARE_CHAIN                defaults to "sepolia"
 *   RARE_DRY_RUN=1            print the command without minting (no on-chain action)
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { buildMintArgs, buildRuphexMetadata, type PaidInvoice } from "../lib/rare";

function parseFlags(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out[key] = next;
        i++;
      } else {
        out[key] = "true";
      }
    }
  }
  return out;
}

function loadInvoice(flags: Record<string, string>): PaidInvoice {
  if (flags.invoice) {
    return JSON.parse(readFileSync(flags.invoice, "utf8")) as PaidInvoice;
  }
  const required = ["reference", "description", "amount", "freelancer", "client", "tx"];
  const missing = required.filter((k) => !flags[k]);
  if (missing.length) {
    console.error(
      `Missing flags: ${missing.map((m) => "--" + m).join(", ")}\n` +
        `Pass --invoice ./invoice.json or all of: ${required.map((r) => "--" + r).join(", ")}`,
    );
    process.exit(1);
  }
  return {
    reference: flags.reference,
    description: flags.description,
    amountUSDC: Number(flags.amount),
    freelancer: flags.freelancer,
    client: flags.client,
    paymentTxHash: flags.tx,
    country: flags.country,
    image: flags.image,
  };
}

function main() {
  const flags = parseFlags(process.argv.slice(2));
  const invoice = loadInvoice(flags);
  const contract = flags.contract ?? process.env.RARE_COLLECTION_ADDRESS;

  if (!contract) {
    console.error(
      "No RARE collection address. Set RARE_COLLECTION_ADDRESS or pass --contract 0x...\n" +
        'Deploy one with: rare collection deploy erc721 "Ruphex LATAM" "RCB" --chain sepolia',
    );
    process.exit(1);
  }

  const meta = buildRuphexMetadata(invoice);
  const args = buildMintArgs(invoice, contract);

  console.log(`\n🇲🇽  Ruphex → RARE Protocol`);
  console.log(`    ${meta.name}: ${invoice.amountUSDC} USDC for "${invoice.description}"`);
  console.log(`    Payment (Arbitrum Sepolia): ${invoice.paymentTxHash}`);
  console.log(`    Minting provenance on RARE (${process.env.RARE_CHAIN ?? "sepolia"})…\n`);

  const dryRun = process.env.RARE_DRY_RUN === "1" || flags["dry-run"] === "true";
  console.log(`$ rare ${args.join(" ")}\n`);
  if (dryRun) {
    console.log("RARE_DRY_RUN set — not minting. Remove it to mint for real.");
    return;
  }

  // Pass argv directly (no shell) so values with spaces — name, description — stay intact.
  // On Windows the global npm bin is `rare.cmd`; name it explicitly since there's no shell to resolve PATHEXT.
  const bin = process.platform === "win32" ? "rare.cmd" : "rare";
  const result = spawnSync(bin, args, { stdio: "inherit" });
  if (result.error) {
    console.error(
      "\nCould not run `rare`. Install the RARE CLI: npm i -g @rareprotocol/rare-cli (Node 22+).",
    );
    process.exit(1);
  }
  process.exit(result.status ?? 0);
}

main();
