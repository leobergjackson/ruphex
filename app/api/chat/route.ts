import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { validateMessages } from '@/lib/validate';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM: Groq.Chat.ChatCompletionMessageParam = {
  role: 'system',
  content:
    'You are Recibo, a helpful AI assistant with multimodal capabilities — text, voice, files, and on-chain payments on Arbitrum. Be concise, accurate, and friendly.',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = validateMessages(body?.messages);

    const stream = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
      messages: [SYSTEM, ...messages],
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Accel-Buffering': 'no',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Chat failed';
    console.error('[Chat]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
