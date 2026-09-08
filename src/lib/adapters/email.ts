/* Transactional email adapter (Resend). */
export interface EmailAdapter {
  name: string; env: string; live: boolean;
  send(to: string, subject: string, html: string): Promise<{ ok: boolean }>;
}
export const email: EmailAdapter = {
  name: 'Email', env: 'RESEND_API_KEY', live: false,
  async send(to, subject) {
    console.info('[adapter:email] mock send', { to, subject });
    return { ok: true };
  },
};
