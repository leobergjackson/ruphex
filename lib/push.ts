import * as PushAPI from '@pushprotocol/restapi';
import { ethers } from 'ethers';
import { ENV } from '@pushprotocol/restapi/src/lib/constants';

// Recibo's channel signer — this is a throwaway wallet used only
// to sign notifications on behalf of the Recibo channel.
// In production this would be a dedicated channel wallet.
// For the hackathon demo, generate a fresh wallet and use its private key.

const CHANNEL_PRIVATE_KEY = process.env.PUSH_CHANNEL_PRIVATE_KEY ?? '';
const CHANNEL_ADDRESS = process.env.PUSH_CHANNEL_ADDRESS ?? '';

export interface NotifyPaymentParams {
  freelancerAddress: string;
  amountDisplay: string;
  description: string;
  txHash: string;
}

export async function notifyPaymentReceived(params: NotifyPaymentParams): Promise<void> {
  if (!CHANNEL_PRIVATE_KEY || !CHANNEL_ADDRESS) {
    console.log('[Push] No channel keys configured — skipping notification');
    return;
  }

  try {
    const signer = new ethers.Wallet(CHANNEL_PRIVATE_KEY);

    await PushAPI.payloads.sendNotification({
      signer,
      type: 3, // targeted notification to one wallet
      identityType: 2, // direct payload
      notification: {
        title: `Recibo: Pago recibido ✓`,
        body: `${params.amountDisplay} USDC por "${params.description}"`,
      },
      payload: {
        title: `Pago confirmado en Arbitrum`,
        body: `Recibiste ${params.amountDisplay} USDC por "${params.description}". TX: ${params.txHash.slice(0, 10)}···`,
        cta: `https://sepolia.arbiscan.io/tx/${params.txHash}`,
        img: '',
      },
      recipients: `eip155:421614:${params.freelancerAddress}`,
      channel: `eip155:421614:${CHANNEL_ADDRESS}`,
      env: ENV.STAGING, // use STAGING for testnet
    });

    console.log('[Push] Notification sent to', params.freelancerAddress);
  } catch (error) {
    // Never let Push failure break the payment confirmation flow
    console.error('[Push] Notification failed (non-critical):', error);
  }
}
