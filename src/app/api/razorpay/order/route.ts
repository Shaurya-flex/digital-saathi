import { NextResponse } from 'next/server';
import { DEFAULT_CONFIG } from '@/lib/config';

/* Creates a Razorpay order for a credit pack or plan. The price is looked up
   SERVER-SIDE from the catalogue — the client only names the item, so a
   tampered request cannot buy anything at a made-up price. Keys never leave
   the server; the browser only ever sees the public key id. */

export async function POST(req: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Payments are not configured on this deployment.' }, { status: 503 });
  }

  let body: { kind?: string; id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  // Server-side price lookup — the single source of truth.
  let amountInr = 0;
  let label = '';
  if (body.kind === 'pack') {
    const pack = DEFAULT_CONFIG.packs.find((p) => String(p.c) === String(body.id));
    if (pack) { amountInr = pack.p; label = pack.c + ' credits'; }
  } else if (body.kind === 'plan') {
    const plan = DEFAULT_CONFIG.plans.find((p) => p.id === body.id);
    if (plan && plan.price > 0) { amountInr = plan.price; label = plan.name + ' plan (1 month)'; }
  }
  if (!amountInr) {
    return NextResponse.json({ error: 'Unknown item.' }, { status: 400 });
  }

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(keyId + ':' + keySecret).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountInr * 100, // paise
      currency: 'INR',
      receipt: `saathi_${body.kind}_${body.id}_${Date.now()}`,
      notes: { item: label },
    }),
  });
  if (!res.ok) {
    return NextResponse.json({ error: 'Could not start the payment. Try again.' }, { status: 502 });
  }
  const order = await res.json();
  return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId, label });
}
