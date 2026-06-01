import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
    services: {
      groq: !!process.env.GROQ_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      push: !!(process.env.PUSH_CHANNEL_PRIVATE_KEY && process.env.PUSH_CHANNEL_ADDRESS),
      walletconnect: !!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      contract: !!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    },
  });
}
