import { NextRequest, NextResponse } from 'next/server';
import { validateTTSText, withTimeout } from '@/lib/validate';

// ElevenLabs "George" — clear, neutral English voice
const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = validateTTSText(body?.text);

    const res = await withTimeout(
      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }),
      25_000
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[ElevenLabs TTS]', res.status, err);
      return NextResponse.json({ error: 'TTS failed' }, { status: res.status });
    }

    return new Response(res.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'TTS failed';
    console.error('[TTS]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
