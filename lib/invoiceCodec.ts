export interface InvoicePayload {
  id: string;
  to: string;
  amount: string;
  amountDisplay: string;
  desc: string;
  client: string;
  due: string;
}

export function encodeInvoice(p: InvoicePayload): string {
  const safe = { ...p, desc: p.desc.slice(0, 80), client: p.client.slice(0, 60) };
  const json = JSON.stringify(safe);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return encodeURIComponent(b64);
}

export function decodeInvoice(raw: string): InvoicePayload | null {
  try {
    const b64 = decodeURIComponent(raw);
    const json = decodeURIComponent(escape(atob(b64)));
    const p = JSON.parse(json) as InvoicePayload;
    if (!p.id || !p.to || !p.amount || !p.amountDisplay) return null;
    if (!/^0x[a-fA-F0-9]{40}$/.test(p.to)) return null;
    if (isNaN(Number(p.amount))) return null;
    return p;
  } catch {
    return null;
  }
}
