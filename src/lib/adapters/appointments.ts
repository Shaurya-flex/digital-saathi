/* Appointment adapter — slot search and booking requests. */
export interface Slot { time: string; with: string; note: string }
export interface AppointmentsAdapter {
  name: string; env: string; live: boolean;
  slots(kind: string, day: string): Slot[];
  request(slot: Slot): Promise<{ ok: boolean }>;
}
export const appointments: AppointmentsAdapter = {
  name: 'Appointment API', env: 'SAATHI_APPT_KEY', live: false,
  slots() {
    return ['11:15 AM', '5:40 PM', '7:00 PM'].map((time) => ({
      time, with: 'Dr. Meera Joshi', note: 'General physician',
    }));
  },
  async request(slot) {
    console.info('[adapter:appointments] mock request', slot);
    return { ok: true };
  },
};
