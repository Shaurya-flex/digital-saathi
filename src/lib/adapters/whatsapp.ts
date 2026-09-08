/* WhatsApp Business API adapter (Phase 4). */
export interface WhatsappAdapter {
  name: string; env: string; live: boolean;
  send(phone: string, template: string, params: string[]): Promise<{ ok: boolean }>;
}
export const whatsapp: WhatsappAdapter = {
  name: 'WhatsApp', env: 'SAATHI_WA_TOKEN', live: false,
  async send(phone, template, params) {
    console.info('[adapter:whatsapp] mock send', { phone, template, params });
    return { ok: true };
  },
};
