'use client';

/* Supply-side onboarding: apply as a local service partner. Applications
   are recorded on the operator's desk (Supabase) so verification and
   onboarding actually happen; the honeypot field silently drops bots. */

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { PHYSICAL_CATS } from '@/lib/config';
import { METRO_CITIES, demoAllowed } from '@/lib/owner';
import { submitApplication } from '@/lib/sync/requests';
import { cfg, getDB, money, mutate, toast, uid } from '@/lib/store';

export default function Partner() {
  const router = useRouter();
  const c = cfg();
  const [sending, setSending] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    if (d.website) return; // honeypot — real people never see this field
    if (!/^[\d\s+‑-]{10,14}$/.test(d.phone || '')) { toast('Enter a 10-digit phone number.', 'warn'); return; }
    setSending(true);
    const sent = await submitApplication({
      kind: 'provider', name: d.name, phone: d.phone, city: d.city,
      data: { service: d.cat, locality: d.locality, base_price: d.base, radius_km: d.radius, experience_years: d.exp, languages: d.langs },
    });
    if (demoAllowed() && getDB().mode === 'demo') {
      mutate((db) => {
        db.providers.push({
          id: uid('p'), name: d.name, owner: d.name, cat: d.cat, city: d.city || 'Delhi',
          locality: d.locality || d.city || 'Delhi', rating: 0, jobs: 0,
          radius: +d.radius || 5, eta: 45, base: +d.base || 249, status: 'Under verification',
          badges: ['Phone verified'], resp: 20, completion: 0,
          x: 20 + Math.random() * 60, y: 20 + Math.random() * 60, open: false,
        });
      });
    }
    setSending(false);
    if (sent || demoAllowed()) {
      toast('Application received! We verify identity first — expect a call within 2 working days.', 'ok');
      router.push('/');
    } else {
      toast('Could not submit right now. Please try again in a minute.', 'warn');
    }
  };

  return (
    <>
      <main id="main" className="wrap" style={{ padding: '2rem 0 3rem' }}>
        <h1>Become a local service partner</h1>
        <p className="muted" style={{ maxWidth: '60ch' }}>
          Jobs from customers near you, with the price agreed before you leave home. You set your hours, your service
          radius and your starting price.
        </p>
        <div className="grid g2 mt2">
          <div className="card pad">
            <h3>What you earn</h3>
            <table>
              <tbody>
                <tr><th>Customer pays</th><th>Platform fee</th><th>You keep</th></tr>
                {[500, 1200, 2500].map((v) => (
                  <tr key={v}>
                    <td>{money(v)}</td>
                    <td>{Math.round(c.commission.provider * 100)}% ({money(v * c.commission.provider)})</td>
                    <td><strong>{money(v * (1 - c.commission.provider))}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="small muted mt">Paid out weekly. No joining fee, no lead-buying.</p>
          </div>
          <form className="card pad" onSubmit={submit}>
            <h3>Apply — takes 2 minutes</h3>
            <label className="f">Business or your name</label><input type="text" name="name" required maxLength={80} />
            <label className="f">Phone (we call this number to verify)</label><input type="tel" name="phone" required inputMode="tel" placeholder="98765 43210" />
            <label className="f">Service</label>
            <select name="cat" defaultValue="Electrician">
              {PHYSICAL_CATS.flatMap((cat) => cat.items).map((i) => <option key={i}>{i}</option>)}
            </select>
            <div className="grid g2">
              <div>
                <label className="f">City</label>
                <select name="city" defaultValue="Delhi NCR">
                  {METRO_CITIES.map((m) => <option key={m}>{m}</option>)}
                  <option>Other</option>
                </select>
              </div>
              <div><label className="f">Locality</label><input type="text" name="locality" maxLength={60} /></div>
            </div>
            <div className="grid g2">
              <div><label className="f">Starting price (₹)</label><input type="number" name="base" defaultValue={249} min={49} /></div>
              <div><label className="f">Service radius (km)</label><input type="number" name="radius" defaultValue={6} min={1} /></div>
            </div>
            <div className="grid g2">
              <div><label className="f">Years of experience</label><input type="number" name="exp" defaultValue={3} min={0} /></div>
              <div><label className="f">Languages</label><input type="text" name="langs" defaultValue="Hindi" maxLength={60} /></div>
            </div>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" />
            <button className="btn mt" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Submit application'}</button>
            <p className="tiny muted">
              Next steps: verification call → Aadhaar/PAN check on that call → you start receiving jobs.
              No joining fee, ever.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
