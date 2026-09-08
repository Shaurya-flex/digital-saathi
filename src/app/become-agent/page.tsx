'use client';

/* Supply-side onboarding: apply as a digital agent (form + skills test →
   background check → Active). */

import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { Footer } from '@/components/layout/Footer';
import { cfg, money, mutate, toast, uid } from '@/lib/store';

export default function BecomeAgent() {
  const router = useRouter();
  const c = cfg();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
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
    toast('Application received. Verification and a skills test follow.', 'ok');
    router.push('/');
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
            <h3>Apply</h3>
            <label className="f">Full name</label><input type="text" name="name" required />
            <label className="f">Phone</label><input type="tel" name="phone" required />
            <label className="f">Languages you work in</label><input type="text" name="langs" defaultValue="Hindi, English" />
            <label className="f">Skills</label><input type="text" name="skills" defaultValue="Travel booking, Government forms" />
            <label className="f">Hours a day you can work</label><input type="number" name="hours" defaultValue={4} />
            <button className="btn mt" type="submit">Submit application</button>
            <p className="tiny muted">Identity verification and a short skills test follow. Both are simulated in this demo build.</p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
