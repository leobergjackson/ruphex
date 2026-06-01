export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

const MAX_MESSAGES = 50;
const MAX_CONTENT_CHARS = 8_000;
const MAX_TTS_CHARS = 5_000;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB

const ALLOWED_AUDIO_TYPES = new Set([
  'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg',
  'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/m4a',
]);

export function validateMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('messages must be a non-empty array');
  }
  return raw
    .slice(-MAX_MESSAGES)
    .filter((m) => m && typeof m === 'object' && typeof m.content === 'string')
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content).slice(0, MAX_CONTENT_CHARS),
    }));
}

export function validateTTSText(text: unknown): string {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('text must be a non-empty string');
  }
  return text.trim().slice(0, MAX_TTS_CHARS);
}

export function validateAudioFile(file: File | null): File {
  if (!file) throw new Error('No audio file provided');
  if (file.size > MAX_AUDIO_BYTES) throw new Error('Audio file too large (max 25 MB)');
  // Be lenient: if type is empty (some browsers don't set it) let it through
  if (file.type && !ALLOWED_AUDIO_TYPES.has(file.type)) {
    throw new Error(`Unsupported audio type: ${file.type}`);
  }
  return file;
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}
