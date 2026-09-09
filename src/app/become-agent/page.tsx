'use client';

/* Supply-side onboarding: apply as a digital agent (form + skills test →
   background check → Active). */

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { demoAllowed } from '@/lib/owner';
import { submitApplication } from '@/lib/sync/requests';
import { cfg, getDB, money, mutate, toast, uid } from '@/lib/store';

export default function BecomeAgent() {
  const router = useRouter();
  const c = cfg();
  const [sending, setSending] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    if (d.website) return; // honeypot
    if (!/^[\d\s+‑-]{10,14}$/.test(d.phone || '')) { toast('Enter a 10-digit phone number.', 'warn'); return; }
    setSending(true);
    const sent = await submitApplication({
      kind: 'agent', name: d.name, phone: d.phone, city: d.city,
      data: { languages: d.langs, skills: d.skills, hours_per_day: d.hours },
    });
    if (demoAllowed() && getDB().mode === 'demo') {
      mutate((db) => {
        db.agents.push({
          id: uid('a'), name: d.name, city: 'Remote', lang: (d.langs || '').split(',').map((s) => s.trim()).filter(Boolean),
          skills: (d.skills || '').split(',').map((s) => s.trim()).filter(Boolean),
          rating: 0, done: 0, cancel: 0, dispute: 0, sla: 'New', resp_min: 0,
          earnings: 0, pending: 0, wk_earnings: 0,
          verified: false, aadhaar: false, pan: false, skill_test: 'pending', bg_check: 'pending',
          level: 'New', status: 'Active', online: false,
        });
      });
    }
    setSending(false);
    if (sent || demoAllowed()) {
      toast('Application received! Verification and a short skills test follow — expect a call within 2 working days.', 'ok');
      router.push('/');
    } else {
      toast('Could not submit right now. Please try again in a minute.', 'warn');
    }
  };

  return (
    <>
      <main id="main" className="wrap" style={{ padding: '2rem 0 3rem' }}>
        <h1>Become a Digital Saathi agent</h1>
        <p className="muted" style={{ maxWidth: '60ch' }}>
          When the AI cannot finish a task safely, it goes to a person. That person could be you. Work from home, pick
          tasks from a queue, get paid per completed task.
        </p>
        <div className="grid g2 mt2">
          <div className="card pad">
            <h3>Typical tasks</h3>
            <p className="small muted">
              Train and bus bookings · appointment calls · government form filling · document preparation · email
              drafting · research · customer follow-ups
            </p>
            <h3 className="mt">What you earn</h3>
            <table>
              <tbody>
                <tr><th>Task price</th><th>Platform fee</th><th>You keep</th></tr>
                {[80, 120, 250].map((v) => (
                  <tr key={v}>
                    <td>{money(v)}</td>
                    <td>{Math.round(c.commission.agent * 100)}%</td>
                    <td><strong>{money(v * (1 - c.commission.agent))}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form className="card pad" onSubmit={submit}>
            <h3>Apply — takes 2 minutes</h3>
            <label className="f">Full name</label><input type="text" name="name" required maxLength={80} />
            <label className="f">Phone (we call this number to verify)</label><input type="tel" name="phone" required inputMode="tel" placeholder="98765 43210" />
            <label className="f">City</label><input type="text" name="city" maxLength={60} placeholder="Anywhere in India — this is remote work" />
            <label className="f">Languages you work in</label><input type="text" name="langs" defaultValue="Hindi, English" maxLength={100} />
            <label className="f">Skills</label><input type="text" name="skills" defaultValue="Travel booking, Government forms" maxLength={140} />
            <label className="f">Hours a day you can work</label><input type="number" name="hours" defaultValue={4} min={1} max={12} />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" />
            <button className="btn mt" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Submit application'}</button>
            <p className="tiny muted">Next steps: verification call → short skills test on the same call → you start picking tasks from the queue.</p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
