/* Payment adapter (Razorpay + UPI). SERVER-SIDE ONLY in production:
   order creation, webhook signature verification and refunds run in API
   routes; no key ever reaches the browser. The demo simulates instantly
   and labels every transaction. */
export interface PaymentOrder { id: string; amount: number; status: 'created' | 'paid' | 'failed' }
export interface PaymentsAdapter {
  name: string; env: string; live: boolean;
  createOrder(amountPaise: number, receipt: string): Promise<PaymentOrder>;
  verifyWebhook(payload: string, signature: string): boolean;
}
export const payments: PaymentsAdapter = {
  name: 'Payment gateway (Razorpay / UPI)', env: 'RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (server only)', live: false,
  async createOrder(amountPaise, receipt) {
    console.info('[adapter:payments] mock order', { amountPaise, receipt });
    return { id: 'order_DEMO', amount: amountPaise, status: 'paid' };
  },
  verifyWebhook() {
    // Production: HMAC-SHA256 of the payload with RAZORPAY_KEY_SECRET,
    // compared in constant time, before any credit or debit is recorded.
    return false;
  },
};
