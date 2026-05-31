import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audio = formData.get('audio') as File | null;

  if (!audio) {
    return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
  }

  const efForm = new FormData();
  efForm.append('file', audio, audio.name || 'recording.webm');
  efForm.append('model', 'scribe_v1');

  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY! },
    body: efForm,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[ElevenLabs STT]', res.status, err);
    return NextResponse.json({ error: 'Transcription failed' }, { status: res.status });
  }

  const data = await res.json();
  console.log('[ElevenLabs STT] transcribed:', data.text?.slice(0, 60));
  return NextResponse.json({ text: data.text ?? '' });
}
