import { NextResponse } from 'next/server';
import crypto from 'crypto';

const DOCS_URL = 'https://bitso.com/business/developers';
const BITSO_API_BASE_URL = process.env.BITSO_API_BASE_URL ?? 'https://stage.bitso.com';
const PREVIEW_CURRENCIES = new Set(['usdc', 'usd', 'mxn', 'usdcarb']);

type BitsoBalance = {
  currency?: string;
  available?: string;
  locked?: string;
  total?: string;
};

function authHeader(method: string, path: string): string {
  const apiKey = process.env.BITSO_API_KEY ?? '';
  const apiSecret = process.env.BITSO_API_SECRET ?? '';
  const nonce = Date.now().toString();
  const message = `${nonce}${method}${path}`;
  const signature = crypto.createHmac('sha256', apiSecret).update(message).digest('hex');
  return `Bitso ${apiKey}:${nonce}:${signature}`;
}

function sanitizeBalances(balances: BitsoBalance[]) {
  return balances
    .filter((balance) => PREVIEW_CURRENCIES.has((balance.currency ?? '').toLowerCase()))
    .slice(0, 6)
    .map((balance) => ({
      currency: (balance.currency ?? '').toUpperCase(),
      available: balance.available ?? '0',
      total: balance.total ?? balance.available ?? '0',
    }));
}

export async function GET() {
  if (!process.env.BITSO_API_KEY || !process.env.BITSO_API_SECRET) {
    return NextResponse.json({
      enabled: false,
      reason: 'Bitso API keys not configured',
      docsUrl: DOCS_URL,
    });
  }

  try {
    const method = 'GET';
    const path = '/api/v3/balance';
    const res = await fetch(`${BITSO_API_BASE_URL}${path}`, {
      headers: { Authorization: authHeader(method, path) },
    });

    if (!res.ok) {
      return NextResponse.json({
        enabled: false,
        reason: 'Bitso auth failed (check key permissions)',
        docsUrl: DOCS_URL,
      });
    }

    const data = await res.json();
    const balancesPreview = sanitizeBalances(data?.payload?.balances ?? []);
    const source = BITSO_API_BASE_URL.includes('stage') ? 'bitso-stage' : 'bitso';

    return NextResponse.json({
      enabled: true,
      balancesPreview,
      source,
    });
  } catch {
    return NextResponse.json({
      enabled: false,
      reason: 'Bitso API request failed',
      docsUrl: DOCS_URL,
    });
  }
}
