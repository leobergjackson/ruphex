import { NextRequest } from 'next/server';

// ElevenLabs "George" — clear, neutral English voice
const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text?.trim()) {
    return new Response('No text provided', { status: 400 });
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
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
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('[ElevenLabs TTS]', res.status, err);
    return new Response('TTS failed', { status: res.status });
  }

  return new Response(res.body, {
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}
