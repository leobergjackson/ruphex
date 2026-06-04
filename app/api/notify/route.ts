import { NextRequest, NextResponse } from 'next/server';
import { notifyPaymentReceived } from '@/lib/push';

export const runtime = 'nodejs';

interface NotifyBody {
  freelancerAddress: string;
  amountDisplay: string;
  description: string;
  txHash: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as NotifyBody;

    const { freelancerAddress, amountDisplay, description, txHash } = body;

    if (!freelancerAddress || !amountDisplay || !txHash) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(freelancerAddress)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    // Fire and forget — don't await, don't block the response
    notifyPaymentReceived({ freelancerAddress, amountDisplay, description, txHash })
      .catch(err => console.error('[Push] Background notification error:', err));

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error('[Push] Route error:', error);
    // Always return 200 — Push failure must never surface to the user
    return NextResponse.json({ sent: false, error: 'Internal error' });
  }
}
