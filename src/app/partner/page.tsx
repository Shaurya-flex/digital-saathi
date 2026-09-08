'use client';

/* Supply-side onboarding: apply as a local service partner.
   Submissions land as status "Under verification" for admin review. */

import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { Footer } from '@/components/layout/Footer';
import { DemoFlag } from '@/components/ui/DemoFlag';
import { PHYSICAL_CATS } from '@/lib/config';
import { cfg, money, mutate, toast, uid } from '@/lib/store';

export default function Partner() {
  const router = useRouter();
  const c = cfg();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    mutate((db) => {
      db.providers.push({
        id: uid('p'), name: d.name, owner: d.name, cat: d.cat, city: d.city || 'Delhi',
        locality: d.locality || d.city || 'Delhi', rating: 0, jobs: 0,
        radius: +d.radius || 5, eta: 45, base: +d.base || 249, status: 'Under verification',
        badges: ['Phone verified'], resp: 20, completion: 0,
        x: 20 + Math.random() * 60, y: 20 + Math.random() * 60, open: false,
      });
    });
    toast('Application received. An admin will verify you.', 'ok');
    router.push('/');
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
            <h3>Apply</h3>
            <label className="f">Business or your name</label><input type="text" name="name" required />
            <label className="f">Phone</label><input type="tel" name="phone" required />
            <label className="f">Service</label>
            <select name="cat" defaultValue="Electrician">
              {PHYSICAL_CATS.flatMap((cat) => cat.items).map((i) => <option key={i}>{i}</option>)}
            </select>
            <div className="grid g2">
              <div><label className="f">City</label><input type="text" name="city" defaultValue="Delhi" /></div>
              <div><label className="f">Locality</label><input type="text" name="locality" /></div>
            </div>
            <div className="grid g2">
              <div><label className="f">Starting price (₹)</label><input type="number" name="base" defaultValue={249} /></div>
              <div><label className="f">Service radius (km)</label><input type="number" name="radius" defaultValue={6} /></div>
            </div>
            <label className="f">Identity document</label>
            <div className="between card" style={{ padding: '.6rem' }}>
              <span className="small muted">Aadhaar or PAN upload</span><DemoFlag>Demo</DemoFlag>
            </div>
            <button className="btn mt" type="submit">Submit application</button>
            <p className="tiny muted">Applications go to “Under verification”. An admin approves before you can accept jobs.</p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
