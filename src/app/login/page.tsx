'use client';

/* Demo login: pick a ready-made account (no password — everything stays in
   this browser). Production replaces this with phone + OTP via NextAuth. */

import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { DemoFlag } from '@/components/ui/DemoFlag';
import { useDB } from '@/hooks/useDB';
import { homeFor, login } from '@/lib/auth/session';
import { cfg, resetAll, toast } from '@/lib/store';
import type { User } from '@/lib/types';

const FLOWS = [
  'Recharge a phone and approve the payment',
  'Fetch and pay an electricity bill',
  'Explain a PDF from the vault',
  'Search trains and hit the human handover',
  'Find an electrician and book one',
  'Schedule a doctor appointment',
  'Ask something odd and watch it escalate',
  'Add a family member with permissions',
  'Buy a credit pack',
  'Switch subscription plan',
  'Sign in as the electrician and accept the job',
  'Complete it, then rate the professional',
];

export default function Login() {
  const { db, ready } = useDB();
  const router = useRouter();

  const roleLine = (u: User): string => {
    if (!db) return '';
    if (u.role === 'customer') {
      const plan = cfg().plans.find((p) => p.id === u.plan);
      return `Plan: ${plan?.name || '—'} · ${u.credits} credits`;
    }
    if (u.role === 'agent') {
      const a = db.agents.find((x) => x.id === u.id);
      return a ? `${a.cat || 'Digital agent'} · ${a.city} · ${a.online ? 'Online' : 'Offline'}` : 'Digital agent';
    }
    if (u.role === 'provider') {
      const pv = db.providers.find((x) => x.id === u.id);
      return pv ? `${pv.cat} · ${pv.locality}, ${pv.city} · ${pv.rating}★` : 'Local service partner';
    }
    return 'Full operations dashboard';
  };

  return (
    <>
      <main id="main" className="wrap" style={{ padding: '2.4rem 0 4rem' }}>
        <h1>Pick a demo account</h1>
        <p className="muted">No password. This prototype stores everything in this browser only.</p>
        <div className="grid g3 mt">
          {ready && db ? db.users.map((u) => (
            <button
              key={u.id}
              className="card"
              style={{ textAlign: 'left', cursor: 'pointer', borderWidth: '1.5px' }}
              onClick={() => {
                const role = login(u.id);
                if (role) router.push(homeFor(role));
              }}
            >
              <div className="row">
                <span className={'tag ' + (u.role === 'admin' ? 'stop' : u.role === 'provider' ? 'go' : u.role === 'agent' ? 'warm' : '')}>{u.role}</span>
                {u.easy ? <span className="tag warm">Easy Mode</span> : null}
              </div>
              <h3 style={{ margin: '.5rem 0 .2rem' }}>{u.name}</h3>
              <p className="small muted" style={{ margin: 0 }}>{u.city} · {roleLine(u)}</p>
            </button>
          )) : null}
        </div>
        <div className="card mt2">
          <div className="between">
            <div>
              <strong>Real sign-up</strong>
              <p className="small muted" style={{ margin: '.2rem 0 0' }}>
                Phone number and OTP. Needs a backend — not part of this demo build.
              </p>
            </div>
            <DemoFlag />
          </div>
        </div>
        <h2 className="mt2">Twelve flows to try</h2>
        <div className="card">
          <ol className="small muted" style={{ columns: 2, columnGap: '2rem', margin: 0, paddingLeft: '1.1rem' }}>
            {FLOWS.map((f) => <li key={f}>{f}</li>)}
          </ol>
        </div>
        <p className="mt">
          <button
            className="linkish"
            onClick={() => {
              if (window.confirm('Wipe all demo data in this browser?')) {
                resetAll();
                toast('Demo data reset.', 'ok');
              }
            }}
          >
            Reset all demo data
          </button>
        </p>
      </main>
      <Footer />
    </>
  );
}
