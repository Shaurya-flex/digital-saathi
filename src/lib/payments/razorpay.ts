'use client';

/* Razorpay checkout, end to end: order created server-side (price looked up
   there, never trusted from the browser), the hosted checkout collects the
   payment (UPI, cards, netbanking, wallets — no card data ever touches this
   app), and the signature is verified server-side before anything is
   credited. Activates when RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET are set;
   until then paymentsLive() is false and callers show the labelled demo. */

declare global {
  interface Window { Razorpay?: new (o: Record<string, unknown>) => { open: () => void } }
}

export const paymentsLive = () => process.env.NEXT_PUBLIC_PAYMENTS_LIVE === '1';

let scriptLoading: Promise<boolean> | null = null;
function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  if (!scriptLoading) {
    scriptLoading = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => { scriptLoading = null; resolve(false); };
      document.body.appendChild(s);
    });
  }
  return scriptLoading;
}

export interface PayResult { ok: boolean; paymentId?: string; error?: string }

/** Run a real payment for a catalogue item. Resolves only after server-side
    signature verification (or with a user-readable error). */
export async function payFor(
  item: { kind: 'pack' | 'plan' | 'wallet'; id: string },
  buyer: { name?: string; email?: string },
): Promise<PayResult> {
  try {
    const orderRes = await fetch('/api/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!orderRes.ok) {
      const e = await orderRes.json().catch(() => ({}));
      return { ok: false, error: e.error || 'Could not start the payment.' };
    }
    const order = await orderRes.json();
    if (!(await loadCheckout()) || !window.Razorpay) {
      return { ok: false, error: 'Could not load the payment window. Check your connection.' };
    }
    return await new Promise<PayResult>((resolve) => {
      const rz = new window.Razorpay!({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Digital Saathi',
        description: order.label,
        prefill: { name: buyer.name || '', email: buyer.email || '' },
        theme: { color: '#232C6B' },
        modal: { ondismiss: () => resolve({ ok: false, error: 'Payment cancelled.' }) },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const v = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: resp.razorpay_order_id,
              paymentId: resp.razorpay_payment_id,
              signature: resp.razorpay_signature,
            }),
          });
          if (v.ok) resolve({ ok: true, paymentId: resp.razorpay_payment_id });
          else resolve({ ok: false, error: 'Payment could not be verified. If money left your account it will auto-refund; contact support with id ' + resp.razorpay_payment_id + '.' });
        },
      });
      rz.open();
    });
  } catch {
    return { ok: false, error: 'Payment failed to start. Try again.' };
  }
}
