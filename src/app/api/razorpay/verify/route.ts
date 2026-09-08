import crypto from 'crypto';
import { NextResponse } from 'next/server';

/* Verifies a completed Razorpay payment: the signature is an HMAC of
   order_id|payment_id with the secret key, so it can only be produced by
   Razorpay. Credits are granted client-side ONLY after this returns ok. */

export async function POST(req: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: 'Payments are not configured on this deployment.' }, { status: 503 });
  }
  let body: { orderId?: string; paymentId?: string; signature?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
  if (!body.orderId || !body.paymentId || !body.signature) {
    return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
  }
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(body.orderId + '|' + body.paymentId)
    .digest('hex');
  const ok = expected.length === body.signature.length
    && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(body.signature));
  if (!ok) {
    return NextResponse.json({ error: 'Signature check failed.' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
