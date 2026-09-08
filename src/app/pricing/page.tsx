'use client';

/* Dedicated pricing page (linked from the main nav): plans, top-up packs,
   per-task credit costs and the transparent marketplace split. */

import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { cfg, money } from '@/lib/store';

const NICE: Record<string, string> = {
  ask: 'Ask anything', translate: 'Translation', doc_summary: 'Explain a document',
  research: 'Web research', deep_research: 'Deep research', form_help: 'Form filling help',
  recharge: 'Mobile recharge', bill: 'Bill fetch & pay', travel_search: 'Travel search',
  booking: 'Booking assistance', human_agent: 'Verified human agent', workflow: 'Multi-step workflow',
};

export default function PricingPage() {
  const c = cfg();
  return (
    <>
      <main id="main">
        <section className="section">
          <div className="wrap">
            <h1>Simple, honest pricing</h1>
            <p className="muted lede" style={{ maxWidth: '60ch' }}>
              Every plan is a monthly bundle of credits — Digital Saathi usage units. You always see the credit
              cost and any real-money cost <em>before</em> a task runs, and nothing is charged without your yes.
            </p>
            <div className="grid g3 mt2">
              {c.plans.map((p) => (
                <div key={p.id} className={'price' + (p.id === 'family' ? ' pick' : '')}>
                  {p.id === 'family' ? <span className="tag warm">Most chosen</span> : null}
                  <h3 style={{ marginTop: '.4rem' }}>{p.name}</h3>
                  <div className="amt">
                    {p.price ? money(p.price) : 'Free'}
                    <span className="small muted" style={{ fontFamily: 'Mukta' }}>{p.price ? '/month' : ''}</span>
                  </div>
                  <div className="small muted">
                    {p.credits.toLocaleString('en-IN')} credits{p.seats > 1 ? ' · up to ' + p.seats + ' people' : ''}
                  </div>
                  <ul>{p.perks.map((x) => <li key={x}>{x}</li>)}</ul>
                  <Link className={'btn' + (p.id === 'family' ? '' : ' ghost')} style={{ marginTop: 'auto' }} href="/login">
                    Choose {p.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap grid g2">
            <div className="card pad">
              <h3>What tasks cost</h3>
              <p className="small muted">Credits per task. Cheap AI work stays cheap — you never pay reasoning-model prices for a recharge.</p>
              <table>
                <tbody>
                  <tr><th>Task</th><th>Credits</th></tr>
                  {Object.entries(c.pricing).map(([k, v]) => (
                    <tr key={k}><td>{NICE[k] || k.replace(/_/g, ' ')}</td><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div className="card pad">
                <h3>Top-up packs</h3>
                <p className="small muted">Ran out mid-month? Packs never expire with an active plan.</p>
                <table>
                  <tbody>
                    <tr><th>Credits</th><th>Price</th></tr>
                    {c.packs.map((k) => (
                      <tr key={k.c}><td>{k.c.toLocaleString('en-IN')}</td><td>{money(k.p)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card pad mt">
                <h3>Local services &amp; human agents</h3>
                <p className="small">
                  Doorstep jobs are billed at the professional&rsquo;s own price plus a {Math.round(c.commission.provider * 100)}% platform fee,
                  shown before you book. Human-agent tasks carry a flat service fee; the agent keeps {Math.round((1 - c.commission.agent) * 100)}%.
                  No hidden cuts, ever — the same split is shown to the professional.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section center">
          <div className="narrow">
            <h2>Start free. Upgrade when it earns it.</h2>
            <p className="muted">50 welcome credits on sign-up — enough to try a recharge, a bill fetch and a document explainer.</p>
            <Link className="btn" href="/login">Create your free account</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
