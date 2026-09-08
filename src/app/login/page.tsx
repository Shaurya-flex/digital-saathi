'use client';

/* Sign in. Real users: Google via Supabase (docs/SUPABASE.md). The old
   fabricated demo personas are kept only behind /login?demo=1 as a sandbox
   for exploring the product — they never appear in the real flow. */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { useDB } from '@/hooks/useDB';
import { authConfigured, currentSupaUser, signInWithGoogle } from '@/lib/auth/supabase';
import { homeFor, login } from '@/lib/auth/session';
import { cfg, resetAll, toast } from '@/lib/store';
import type { User } from '@/lib/types';

export default function Login() {
  const { db, ready } = useDB();
  const router = useRouter();
  const [demo, setDemo] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    setDemo(new URLSearchParams(window.location.search).get('demo') === '1');
  }, []);

  // Coming back from Google OAuth (or already signed in): go straight in.
  // AppBoot's auth listener creates the account and restores the backup.
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    (async () => {
      const su = await currentSupaUser();
      if (alive && su) {
        setWaiting(true);
        setTimeout(() => router.replace('/app/ask'), 400);
      }
    })();
    return () => { alive = false; };
  }, [ready, router]);

  const google = async () => {
    setWaiting(true);
    const err = await signInWithGoogle();
    if (err) {
      setWaiting(false);
      toast(err, 'warn');
    }
  };

  const roleLine = (u: User): string => {
    if (!db) return '';
    if (u.role === 'customer') {
      const plan = cfg().plans.find((p) => p.id === u.plan);
      return `Plan: ${plan?.name || '—'} · ${u.credits} credits`;
    }
    if (u.role === 'agent') {
      const a = db.agents.find((x) => x.id === u.id);
      return a ? `${a.cat || 'Digital agent'} · ${a.city}` : 'Digital agent';
    }
    if (u.role === 'provider') {
      const pv = db.providers.find((x) => x.id === u.id);
      return pv ? `${pv.cat} · ${pv.locality}, ${pv.city} · ${pv.rating}★` : 'Local service partner';
    }
    return 'Full operations dashboard';
  };

  return (
    <>
      <main id="main" className="wrap" style={{ padding: '2.4rem 0 4rem', maxWidth: demo ? undefined : 560 }}>
        {!demo ? (
          <>
            <h1>Sign in to Digital Saathi</h1>
            <p className="muted">One account for your tasks, bookings, documents, family and reminders — backed up automatically.</p>
            <div className="card pad mt">
              <button className="btn big" style={{ width: '100%' }} onClick={google} disabled={waiting}>
                {waiting ? 'Opening Google…' : 'Continue with Google'}
              </button>
              {!authConfigured() ? (
                <p className="small muted mt" style={{ margin: '0.8rem 0 0' }}>
                  Google sign-in is not connected on this deployment yet — the operator needs to add the
                  Supabase keys (see <code>docs/SUPABASE.md</code>).
                </p>
              ) : (
                <p className="small muted mt" style={{ margin: '0.8rem 0 0' }}>
                  We only receive your name and email. No passwords are stored by Digital Saathi.
                </p>
              )}
            </div>
            <div className="card mt">
              <strong>What you get free</strong>
              <ul className="small muted" style={{ margin: '.4rem 0 0', paddingLeft: '1.1rem' }}>
                <li>50 welcome credits — recharges, bill fetch, document help</li>
                <li>Automatic cloud backup of your data</li>
                <li>Recurring reminders so bills and recharges are never missed</li>
                <li>Verified local professionals near your location</li>
              </ul>
            </div>
            <p className="small muted mt">
              Just exploring? <a className="linkish" href="/login?demo=1">Open the demo sandbox</a> — fabricated
              accounts, nothing you do there is real.
            </p>
          </>
        ) : (
          <>
            <h1>Demo sandbox</h1>
            <p className="muted">
              Fabricated accounts for exploring every side of the product — customer, elderly user, agent,
              electrician, admin. Everything stays in this browser. <a className="linkish" href="/login">Back to real sign-in</a>
            </p>
            <div className="grid g3 mt">
              {ready && db ? db.users.filter((u) => !u.id.startsWith('g_')).map((u) => (
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
              {ready && db && db.mode === 'real' ? (
                <div className="card muted">
                  This device is in real-user mode — demo personas were removed.
                  <button className="linkish mt" onClick={() => { resetAll(); toast('Demo data seeded.', 'ok'); }}>Re-seed the demo sandbox</button>
                </div>
              ) : null}
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
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
