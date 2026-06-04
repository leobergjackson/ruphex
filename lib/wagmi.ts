import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

const ARB_SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_ARB_SEPOLIA_RPC_URL ?? 'https://sepolia-rollup.arbitrum.io/rpc';
const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'recibo-local-dev';

export const wagmiConfig = getDefaultConfig({
  appName: 'Recibo',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(ARB_SEPOLIA_RPC_URL),
  },
  ssr: true,
});

export const CHAIN_ID = 421614;
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS ?? '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d') as `0x${string}`;
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '') as `0x${string}`;
