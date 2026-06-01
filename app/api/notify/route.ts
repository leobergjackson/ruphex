import { NextRequest, NextResponse } from 'next/server';
import { withTimeout } from '@/lib/validate';

export async function POST(req: NextRequest) {
  const pk = process.env.PUSH_CHANNEL_PRIVATE_KEY;
  const channelAddress = process.env.PUSH_CHANNEL_ADDRESS;

  if (!pk || !channelAddress) {
    console.log('[Push] No channel keys configured — skipping notification');
    return NextResponse.json({ skipped: true });
  }

  try {
    const { title, body } = await req.json();

    const [{ PushAPI, CONSTANTS }, { ethers }] = await Promise.all([
      import('@pushprotocol/restapi'),
      import('ethers'),
    ]);

    const signer = new ethers.Wallet(pk);

    const user = await withTimeout(
      PushAPI.initialize(signer, { env: CONSTANTS.ENV.STAGING }),
      20_000
    );

    await withTimeout(
      user.channel.send(['*'], { notification: { title, body } }),
      20_000
    );

    console.log(`[Push] Notification sent — channel ${channelAddress}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Push failed';
    console.error('[Push]', msg);
    // Return 200 so the client doesn't treat this as a hard error —
    // notifications are best-effort and shouldn't fail a chat turn.
    return NextResponse.json({ error: msg, skipped: true });
  }
}
