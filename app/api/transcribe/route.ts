import { NextRequest, NextResponse } from 'next/server';
import { validateAudioFile, withTimeout } from '@/lib/validate';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = validateAudioFile(formData.get('audio') as File | null);

    const efForm = new FormData();
    efForm.append('file', audio, audio.name || 'recording.webm');
    efForm.append('model', 'scribe_v1');

    const res = await withTimeout(
      fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY! },
        body: efForm,
      }),
      25_000
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[ElevenLabs STT]', res.status, err);
      return NextResponse.json({ error: 'Transcription failed' }, { status: res.status });
    }

    const data = await res.json();
    console.log('[ElevenLabs STT] transcribed:', data.text?.slice(0, 60));
    return NextResponse.json({ text: data.text ?? '' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Transcription failed';
    console.error('[Transcribe]', msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
