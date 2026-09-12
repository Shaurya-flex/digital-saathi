'use client';

/* The stakeholder hub — on the line of Blinkit's separate "customer app /
   delivery partner / store partner" ecosystem pages. Digital Saathi has
   three sides: the customer asking for help (demand), the local service
   partner who shows up at the door, and the digital agent who finishes what
   the AI can't (supply, physical and digital). This page is where all three
   are recruited from one place, with the same transparent numbers used
   everywhere else in the product. */

import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { useSiteLang } from '@/hooks/useSiteLang';
import { METRO_CITIES } from '@/lib/owner';
import { cfg, money } from '@/lib/store';

export default function NetworkHub() {
  const c = cfg();
  const { t } = useSiteLang();
  const providerKeep = Math.round((1 - c.commission.provider) * 100);
  const agentKeep = Math.round((1 - c.commission.agent) * 100);

  return (
    <>
      <main id="main">
        <section className="hero">
          <div className="wrap">
            <p className="kicker">One network · three sides · everyone sees the same numbers</p>
            <h1 style={{ maxWidth: '22ch' }}>
            {t('One network that connects everyone — the ones who ask, and the ones who deliver.',
               'Ek network jo sabko jodta hai — jo maangta hai aur jo pura karta hai.')}
          </h1>
            <p className="lede" style={{ maxWidth: '62ch' }}>
              Digital Saathi works because three kinds of people are on it: the customer who asks, the local
              professional who shows up, and the digital agent who finishes what the AI can&rsquo;t do alone. Pick
              where you belong below — the commission, the payout and the rules are the same for everyone, shown
              before every job, not buried in a contract.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap grid g3">
            <div className="card pad">
              <span className="tag">Demand side</span>
              <h2 className="mt" style={{ fontSize: '1.5rem' }}>Customers</h2>
              <p className="small muted">
                Speak or type what you need — recharge, bills, documents, appointments, a repair at home. Saathi does
                the AI work itself and hands anything physical or complex to a verified partner.
              </p>
              <ul className="small muted" style={{ paddingLeft: '1.1rem' }}>
                <li>50 free credits on sign-up, no card required</li>
                <li>Every price shown before you approve it</li>
                <li>A verified human takes over when the AI shouldn&rsquo;t decide alone</li>
                <li>One account for your family&rsquo;s tasks, documents and bills</li>
              </ul>
              <Link className="btn wide mt" href="/login">Create your free account</Link>
            </div>

            <div className="card pad">
              <span className="tag go">Supply side · physical</span>
              <h2 className="mt" style={{ fontSize: '1.5rem' }}>Service partners</h2>
              <p className="small muted">
                Electricians, plumbers, AC technicians, salons, cleaners. Jobs come to you with the price already
                agreed — you accept, show up, get paid.
              </p>
              <ul className="small muted" style={{ paddingLeft: '1.1rem' }}>
                <li>You keep {providerKeep}% of every job, shown upfront</li>
                <li>No joining fee, no lead-buying, weekly payout</li>
                <li>Set your own hours, radius and starting price</li>
                <li>Ratings and a police-verified badge build your reputation</li>
              </ul>
              <Link className="btn go wide mt" href="/partner">Apply as a service partner</Link>
            </div>

            <div className="card pad">
              <span className="tag warm">Supply side · digital</span>
              <h2 className="mt" style={{ fontSize: '1.5rem' }}>Digital agents</h2>
              <p className="small muted">
                When a task needs a login, a captcha or a phone call the AI shouldn&rsquo;t make alone — train
                booking, government forms, appointment calls — it lands in your queue.
              </p>
              <ul className="small muted" style={{ paddingLeft: '1.1rem' }}>
                <li>You keep {agentKeep}% of every task, paid on completion</li>
                <li>Work from anywhere, claim tasks in your own languages</li>
                <li>Senior agents (50+ tasks, SLA &gt; 90%) earn more per task</li>
                <li>Nothing is charged to the customer until you finish</li>
              </ul>
              <Link className="btn warm wide mt" href="/become-agent">Apply as a digital agent</Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <h2>How the three sides connect</h2>
            <div className="grid g4 mt">
              {[
                ['1. You ask', 'A customer speaks or types a request, in their own language.'],
                ['2. Saathi decides', 'Saathi does the AI-only work itself, at near-zero cost, and shows the price for anything else before touching it.'],
                ['3. The right side picks it up', 'A physical job goes to the nearest verified service partner; anything needing judgement or a login goes to a digital agent.'],
                ['4. Everyone sees the split', 'Commission, payout and platform fee are shown on every job — to the customer, and to whoever is doing the work.'],
              ].map(([t, d]) => (
                <div key={t} className="card">
                  <h3 style={{ fontSize: '1.05rem' }}>{t}</h3>
                  <p className="small muted" style={{ margin: 0 }}>{d}</p>
                </div>
              ))}
            </div>
            <p className="small muted mt">
              We are rolling this out gradually — starting with the digital tasks Saathi can do safely on its own, then
              adding local service categories city by city as verified partners join. See{' '}
              <Link className="linkish" href="/terms">how we scale</Link> for the detail.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <h2>Where partner onboarding starts</h2>
            <p className="muted">Doorstep services will open metro by metro once verified partners join, starting with:</p>
            <div className="chips mt">
              {METRO_CITIES.map((m) => <span key={m} className="chip" style={{ cursor: 'default' }}>📍 {m}</span>)}
            </div>
          </div>
        </section>

        <section className="section center">
          <div className="narrow">
            <h2>Which side are you on?</h2>
            <p className="muted">Pick one — you can always add another role to the same account later.</p>
            <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link className="btn big" href="/login">I need something done</Link>
              <Link className="btn go big" href="/partner">I offer a home service</Link>
              <Link className="btn warm big" href="/become-agent">I want to work tasks online</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
