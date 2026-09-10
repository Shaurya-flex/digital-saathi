'use client';

/* Sign in / create account. Real users: Google (one tap) or name + email
   (magic sign-in link) via Supabase — docs/SUPABASE.md. No passwords are
   ever created or stored. The fabricated demo personas are kept only behind
   /login?demo=1 as a sandbox — they never appear in the real flow. */

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { useDB } from '@/hooks/useDB';
import { authConfigured, currentSupaUser, signInWithEmail, signInWithGoogle } from '@/lib/auth/supabase';
import { homeFor, login } from '@/lib/auth/session';
import { demoAllowed } from '@/lib/owner';
import { cfg, resetAll, toast } from '@/lib/store';
import type { User } from '@/lib/types';

/* Official multicolour Google "G". */
function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function Login() {
  const { db, ready } = useDB();
  const router = useRouter();
  const [demo, setDemo] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);

  useEffect(() => {
    setDemo(demoAllowed() && new URLSearchParams(window.location.search).get('demo') === '1');
  }, []);

  // Coming back from Google OAuth or the email link (or already signed in):
  // go straight in. AppBoot's auth listener creates the account and restores
  // the backup.
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

  const emailSignup = async (e: FormEvent) => {
    e.preventDefault();
    const em = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast('Please enter a valid email address.', 'warn'); return; }
    setEmailBusy(true);
    const err = await signInWithEmail(em, name.trim() || undefined);
    setEmailBusy(false);
    if (err) toast(err, 'warn');
    else setLinkSentTo(em);
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
              <button className="gbtn" onClick={google} disabled={waiting}>
                <GoogleG />
                {waiting ? 'Opening Google…' : 'Continue with Google'}
              </button>

              <div className="orline">or create an account with email</div>

              {linkSentTo ? (
                <div className="statebox ok">
                  <div className="bigstate">✉️ Check your email</div>
                  <p className="sline">
                    We sent a sign-in link to <strong>{linkSentTo}</strong>. Tap it on this device and your
                    account opens — no password needed.
                  </p>
                  <button className="linkish small" onClick={() => setLinkSentTo(null)}>Use a different email</button>
                </div>
              ) : (
                <form onSubmit={emailSignup}>
                  <label className="f" htmlFor="suName">Your name</label>
                  <input id="suName" type="text" autoComplete="name" placeholder="Asha Verma"
                    value={name} onChange={(e) => setName(e.target.value)} />
                  <label className="f" htmlFor="suEmail">Email</label>
                  <input id="suEmail" type="email" autoComplete="email" placeholder="you@example.com" required
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button className="btn wide mt" type="submit" disabled={emailBusy}>
                    {emailBusy ? 'Sending your link…' : 'Create account'}
                  </button>
                  <p className="tiny muted" style={{ margin: '.5rem 0 0' }}>
                    Already have an account? The same link signs you straight in.
                  </p>
                </form>
              )}

              {!authConfigured() ? (
                <p className="small muted mt" style={{ margin: '0.8rem 0 0' }}>
                  Sign-in is not connected on this deployment yet — the operator needs to add the
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
            <p className="tiny muted mt">
              By continuing you agree to our <Link href="/terms">Terms &amp; Conditions</Link> and{' '}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
            {demoAllowed() ? (
              <p className="small muted mt">
                Just exploring? <a className="linkish" href="/login?demo=1">Open the demo sandbox</a> — fabricated
                accounts, nothing you do there is real.
              </p>
            ) : null}
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
