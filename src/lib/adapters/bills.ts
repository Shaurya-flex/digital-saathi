/* BBPS bill-payment adapter. */
export interface BillInfo {
  kind: string; biller: string; ca: string; amount: number; due: string; period: string;
}
export interface BillsAdapter {
  name: string; env: string; live: boolean;
  fetch(kind: string): BillInfo;
  pay(bill: BillInfo, paymentId: string): Promise<{ ok: boolean; receipt: string }>;
}
export const bills: BillsAdapter = {
  name: 'Bill payment API (BBPS)', env: 'SAATHI_BBPS_KEY', live: false,
  fetch(kind) {
    return {
      kind,
      biller: kind === 'electricity' ? 'BSES Rajdhani' : 'Local board',
      ca: '1502•••441',
      amount: kind === 'electricity' ? 1284 : 640,
      due: '12 Sep 2026', period: 'Aug 2026',
    };
  },
  async pay(bill, paymentId) {
    console.info('[adapter:bills] mock pay', { bill: bill.kind, paymentId });
    return { ok: true, receipt: 'DEMO-RCPT' };
  },
};
