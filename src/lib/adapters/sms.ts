/* Transactional SMS adapter (MSG91 / Twilio / Fast2SMS for OTP). */
export interface SmsAdapter {
  name: string; env: string; live: boolean;
  send(phone: string, text: string): Promise<{ ok: boolean }>;
}
export const sms: SmsAdapter = {
  name: 'SMS', env: 'SAATHI_SMS_KEY / FAST2SMS_KEY', live: false,
  async send(phone, text) {
    console.info('[adapter:sms] mock send', { phone, text: text.slice(0, 40) });
    return { ok: true };
  },
};
