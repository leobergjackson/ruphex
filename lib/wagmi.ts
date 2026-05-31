import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'viem/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'Recibo',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [arbitrumSepolia],
  ssr: true,
});
