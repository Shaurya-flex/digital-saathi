/* Recharge adapter (Jio, Airtel, Vi, BSNL — mobile/DTH/FASTag).
   Swap the bodies for a real recharge-broker API; nothing else changes. */
export interface RechargePlan {
  code: string; price: number; days: number; data: string; note: string; operator: string;
}
export interface RechargeResult { ok: boolean; ref: string; note: string }
export interface RechargeAdapter {
  name: string; env: string; live: boolean;
  getPlans(operator: string, circle?: string): RechargePlan[];
  recharge(number: string, planCode: string, paymentId: string): Promise<RechargeResult>;
}
export const recharge: RechargeAdapter = {
  name: 'Recharge API', env: 'SAATHI_RECHARGE_KEY', live: false,
  getPlans(operator) {
    return [
      { code: 'R199', price: 199, days: 28, data: '1.5 GB/day', note: 'Unlimited calls' },
      { code: 'R299', price: 299, days: 28, data: '2 GB/day', note: 'Unlimited calls + 100 SMS/day' },
      { code: 'R449', price: 449, days: 56, data: '2 GB/day', note: 'Best value for 2 months' },
      { code: 'R719', price: 719, days: 70, data: '2 GB/day', note: 'Longest validity' },
    ].map((p) => ({ ...p, operator }));
  },
  async recharge(number, planCode, paymentId) {
    console.info('[adapter:recharge] mock recharge', { number, planCode, paymentId });
    return { ok: true, ref: 'DEMO-' + planCode, note: 'DEMO — integration required' };
  },
};
