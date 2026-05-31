import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { title, body } = await req.json();

  const pk = process.env.PUSH_CHANNEL_PRIVATE_KEY;
  const channelAddress = process.env.PUSH_CHANNEL_ADDRESS;

  if (!pk || !channelAddress) {
    console.log('[Push] No channel keys configured — skipping notification');
    return NextResponse.json({ skipped: true });
  }

  try {
    const [{ PushAPI, CONSTANTS }, { ethers }] = await Promise.all([
      import('@pushprotocol/restapi'),
      import('ethers'),
    ]);

    const signer = new ethers.Wallet(pk);

    const user = await PushAPI.initialize(signer, {
      env: CONSTANTS.ENV.STAGING,
    });

    await user.channel.send(['*'], {
      notification: { title, body },
    });

    console.log(`[Push] Notification sent to ${channelAddress}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Push] Error:', err);
    return NextResponse.json({ error: 'Push failed' }, { status: 500 });
  }
}
