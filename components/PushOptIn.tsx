'use client';

import { useState } from 'react';
import * as PushAPI from '@pushprotocol/restapi';
import { ENV } from '@pushprotocol/restapi/src/lib/constants';
import { useWalletClient } from 'wagmi';

interface Props { address: string; }

export default function PushOptIn({ address }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const { data: walletClient } = useWalletClient();

  const CHANNEL_ADDRESS = process.env.NEXT_PUBLIC_PUSH_CHANNEL_ADDRESS ?? '';

  const handleOptIn = async () => {
    if (!walletClient || !CHANNEL_ADDRESS) return;
    setStatus('loading');
    try {
      // Create ethers signer from wagmi walletClient
      const { account, chain, transport } = walletClient;
      const { ethers } = await import('ethers');
      const provider = new ethers.providers.Web3Provider(transport as any, {
        chainId: chain.id,
        name: chain.name,
        ensAddress: undefined,
      });
      const signer = provider.getSigner(account.address);

      await PushAPI.channels.subscribe({
        signer,
        channelAddress: `eip155:421614:${CHANNEL_ADDRESS}`,
        userAddress: `eip155:421614:${address}`,
        onSuccess: () => setStatus('done'),
        onError: () => setStatus('error'),
        env: ENV.STAGING,
      });
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <span className="label-accent">ACTIVADO ✓</span>
    );
  }

  return (
    <button
      className="btn-secondary"
      onClick={handleOptIn}
      disabled={status === 'loading' || !CHANNEL_ADDRESS}
      style={{ height: '36px', fontSize: '12px', padding: '0 16px', whiteSpace: 'nowrap' }}
    >
      {status === 'loading' ? 'Activando···' : status === 'error' ? 'Reintentar' : 'Activar →'}
    </button>
  );
}
