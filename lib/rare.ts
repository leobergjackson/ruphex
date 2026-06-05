/**
 * RARE Protocol integration for Ruphex.
 *
 * Ruphex is the receipt rail for LATAM creators: a freelancer in Bogotá, México City,
 * or Buenos Aires gets paid in USDC on Arbitrum, and the settled payment is then minted
 * as a "Ruphex" on the RARE Protocol — a 1/1 proof-of-payment NFT that doubles as
 * on-chain provenance for the creative work they delivered.
 *
 * Two chains, one story:
 *   • Payment settles on Arbitrum Sepolia (fast, sub-cent fees for everyday LATAM invoices).
 *   • Provenance is minted on the RARE Protocol (Ethereum Sepolia), where creators already
 *     curate and own their work.
 *
 * This module is the single source of truth for turning a paid invoice into RARE NFT
 * metadata and into the exact `rare collection mint` arguments. It is consumed by the
 * `scripts/rare-mint.ts` CLI (see RARE.md) and is import-safe for the web app.
 */

/** A settled USDC invoice, as produced when a LATAM freelancer is paid through Ruphex. */
export interface PaidInvoice {
  /** Human invoice reference, e.g. "RCB-2026-014". */
  reference: string;
  /** What was delivered — the creative work this Ruphex gives provenance to. */
  description: string;
  /** Amount paid, in USDC (whole units, e.g. 700 for 700 USDC). */
  amountUSDC: number;
  /** Freelancer / creator wallet that received payment. */
  freelancer: string;
  /** Client wallet that paid. */
  client: string;
  /** Arbitrum Sepolia tx hash of the USDC payment that settled this invoice. */
  paymentTxHash: string;
  /** ISO date the invoice was settled (defaults to now). */
  settledAt?: string;
  /** LATAM country the creator is based in, e.g. "MX", "CO", "AR", "BR". */
  country?: string;
  /** Optional local path or URL to the delivered artwork/asset to attach. */
  image?: string;
}

/** ERC-721 / RARE metadata attribute pair. */
export interface MetadataAttribute {
  trait_type: string;
  value: string | number;
}

/** Standard NFT metadata, shaped for the RARE Protocol. */
export interface RuphexMetadata {
  name: string;
  description: string;
  attributes: MetadataAttribute[];
}

/** RARE CLI supports Sepolia/Base — Arbitrum is intentionally the payment layer, not the mint layer. */
export const RARE_CHAIN = (process.env.RARE_CHAIN ?? "sepolia").trim();

/** Short, explorer-friendly form of a hash/address for human-readable copy. */
function short(hash: string): string {
  return hash.length > 12 ? `${hash.slice(0, 6)}…${hash.slice(-4)}` : hash;
}

/**
 * Build RARE NFT metadata for a settled invoice.
 * The description leads with the LATAM creator story so the provenance reads well on RARE.
 */
export function buildRuphexMetadata(invoice: PaidInvoice): RuphexMetadata {
  const settledAt = invoice.settledAt ?? new Date().toISOString();
  const region = invoice.country ? ` (${invoice.country})` : "";

  return {
    name: `Ruphex ${invoice.reference}`,
    description:
      `On-chain proof of payment for a LATAM creator${region}. ` +
      `${invoice.amountUSDC} USDC settled on Arbitrum for "${invoice.description}", ` +
      `minted on the RARE Protocol as permanent provenance of the delivered work. ` +
      `Paid by ${short(invoice.client)} to ${short(invoice.freelancer)}.`,
    attributes: [
      { trait_type: "Invoice", value: invoice.reference },
      { trait_type: "Amount (USDC)", value: invoice.amountUSDC },
      { trait_type: "Payment Network", value: "Arbitrum Sepolia" },
      { trait_type: "Payment Tx", value: invoice.paymentTxHash },
      { trait_type: "Provenance Network", value: "RARE Protocol (Sepolia)" },
      { trait_type: "Creator", value: invoice.freelancer },
      { trait_type: "Client", value: invoice.client },
      { trait_type: "Region", value: invoice.country ?? "LATAM" },
      { trait_type: "Settled", value: settledAt },
    ],
  };
}

/**
 * Build the argument list for `rare collection mint` from a paid invoice.
 * Returns argv (no shell string) so the caller can spawn it safely without injection.
 *
 * @param invoice  the settled invoice
 * @param contract the RARE collection address to mint into (from `rare collection deploy`)
 */
export function buildMintArgs(invoice: PaidInvoice, contract: string): string[] {
  const meta = buildRuphexMetadata(invoice);
  const args = [
    "collection",
    "mint",
    "--chain",
    RARE_CHAIN,
    "--contract",
    contract,
    "--name",
    meta.name,
    "--description",
    meta.description,
  ];

  for (const attr of meta.attributes) {
    args.push("--attribute", `${attr.trait_type}=${attr.value}`);
  }

  if (invoice.image) args.push("--image", invoice.image);

  return args;
}
