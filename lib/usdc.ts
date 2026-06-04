/**
 * USDC on Arbitrum Sepolia — the payment rail for LATAM creators.
 *
 * Clients pay invoices in USDC here (sub-cent fees, instant finality); the settled
 * payment is then minted as a Recibo on the RARE Protocol (see lib/rare.ts).
 */
import { arbitrumSepolia } from "viem/chains";

/** Circle's USDC on Arbitrum Sepolia (6 decimals). Override via NEXT_PUBLIC_USDC_ADDRESS. */
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS ??
  "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d") as `0x${string}`;

export const USDC_DECIMALS = 6;
export const PAYMENT_CHAIN = arbitrumSepolia;

/** Block explorer base for Arbitrum Sepolia, for linking tx hashes in the UI. */
export const ARBISCAN_TX = "https://sepolia.arbiscan.io/tx/";

/** Minimal ERC-20 ABI — just what the payment flow needs. */
export const ERC20_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;
