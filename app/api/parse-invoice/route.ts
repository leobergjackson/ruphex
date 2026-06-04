import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

type ParsedInvoice = {
  clientName: string | null;
  clientEmail: string | null;
  description: string | null;
  amountUSD: number | null;
  dueDate: string | null;
  notes: string | null;
};

const PLACEHOLDER_VALUES = new Set([
  '',
  'your_key',
  '<groq_api_key>',
  'your_groq_api_key',
]);

function isConfigured(value: string | undefined) {
  return value !== undefined && !PLACEHOLDER_VALUES.has(value.trim().toLowerCase());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().split('T')[0];
}

function parseLocalInvoice(invoiceText: string): ParsedInvoice {
  const email = invoiceText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;
  const amountMatch = invoiceText.match(/(?:USD|USDC|\$)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i)
    ?? invoiceText.match(/([0-9][0-9,]*(?:\.[0-9]{1,2})?)\s*(?:USD|USDC|dollars?)/i);
  const amountUSD = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : null;

  const isoDate = invoiceText.match(/\b(20\d{2})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b/);
  const dueInDays = invoiceText.match(/\b(?:due|vence|vencimiento)?\s*(?:in|en|a)?\s*(\d{1,3})\s*(?:days?|dias|días)\b/i);
  const dueDate = isoDate
    ? `${isoDate[1]}-${isoDate[2].padStart(2, '0')}-${isoDate[3].padStart(2, '0')}`
    : dueInDays
      ? addDays(new Date(), Number(dueInDays[1]))
      : null;

  const clientLine = invoiceText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^(?:client|cliente|bill to|facturar a|para):/i.test(line));
  const clientName = clientLine?.replace(/^(?:client|cliente|bill to|facturar a|para):\s*/i, '').trim() || null;

  const descriptionLine = invoiceText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^(?:description|descripción|descripcion|concept|concepto|service|servicio):/i.test(line));
  const description = descriptionLine?.replace(/^(?:description|descripción|descripcion|concept|concepto|service|servicio):\s*/i, '').trim()
    || invoiceText.split(/\r?\n/).map((line) => line.trim()).find(Boolean)
    || null;

  return {
    clientName,
    clientEmail: email,
    description,
    amountUSD: Number.isFinite(amountUSD) ? amountUSD : null,
    dueDate,
    notes: 'Parsed locally because GROQ_API_KEY is not configured.',
  };
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;

  try {
    const { invoiceText } = await req.json();
    if (typeof invoiceText !== 'string' || !invoiceText.trim()) {
      return NextResponse.json({ error: 'invoiceText vacío' }, { status: 400 });
    }

    if (!isConfigured(apiKey)) {
      return NextResponse.json(parseLocalInvoice(invoiceText));
    }

    const groq = new Groq({ apiKey });
    const today = new Date().toISOString().split('T')[0];
    const prompt = `Eres un asistente de facturación para freelancers en América Latina.
Extrae los campos del siguiente texto de factura.

REGLAS:
- Si el monto está escrito en palabras (ej: "trescientos dólares"), conviértelo a número (300).
- Si ves montos en MXN, ARS, COP u otras monedas LATAM, conviértelos a USD aproximado y anota la conversión en "notes".
- Si hay IVA o impuestos, inclúyelos en el monto total.
- "dueDate" debe ser YYYY-MM-DD. Si dice "a 30 días", calcula desde hoy: ${today}.
- Si no encuentras un campo, devuelve null. Nunca inventes datos.

Responde SOLO con JSON válido. Sin texto antes ni después. Sin backticks de markdown.

{
  "clientName": string | null,
  "clientEmail": string | null,
  "description": string | null,
  "amountUSD": number | null,
  "dueDate": string | null,
  "notes": string | null
}

TEXTO DE FACTURA:
${invoiceText}`;

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      max_completion_tokens: 1000,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      return NextResponse.json({ error: 'Respuesta inesperada de Groq' }, { status: 502 });
    }

    let raw = content.trim();
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) raw = raw.slice(start, end + 1);

    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Parse failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
