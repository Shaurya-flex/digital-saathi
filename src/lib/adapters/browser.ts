/* Browser / computer-use adapter. Phase 4: agent-assisted portal automation.
   Product rule: it never completes a login or captcha on the user's behalf —
   that is exactly where a task hands over to a human agent. */
export interface BrowserAdapter {
  name: string; env: string; live: boolean;
  run(instruction: string): Promise<{ ok: boolean; note: string }>;
}
export const browser: BrowserAdapter = {
  name: 'Browser / computer use', env: 'SAATHI_OPERATOR_KEY', live: false,
  async run(instruction) {
    console.info('[adapter:browser] mock run', { instruction });
    return { ok: false, note: 'DEMO — operator integration required' };
  },
};
