'use client';

/* Owner-only setup panel on Admin → Integrations: which real services this
   deployment has keys for (booleans from the server, never values) and a
   one-click "Run database setup" that creates every table and policy the
   app needs — so the operator never has to paste SQL by hand. */

import { useCallback, useEffect, useState } from 'react';
import { accessToken, authConfigured } from '@/lib/auth/supabase';
import { toast } from '@/lib/store';

interface Status {
  supabase: boolean; database: boolean; anthropic: boolean; openrouter: boolean; sarvam: boolean;
  aiProvider: 'anthropic' | 'openrouter' | 'sarvam' | null;
  razorpay: boolean; paymentsLive: boolean;
  models: { light: string; standard: string; reasoning: string }; owners: number;
}

export function SetupPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const token = await accessToken();
      if (!token) { setStatus(null); return; }
      const res = await fetch('/api/admin/status', { headers: { Authorization: 'Bearer ' + token } });
      setStatus(res.ok ? await res.json() : null);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const migrate = async () => {
    setRunning(true);
    setResult(null);
    try {
      const token = await accessToken();
      const res = await fetch('/api/admin/migrate', { method: 'POST', headers: { Authorization: 'Bearer ' + (token || '') } });
      const j = await res.json();
      if (res.ok) {
        setResult(`Done — ${j.done} statements applied, ${j.owners} owner account(s) granted admin access in the database.`);
        toast('Database is set up.', 'ok');
      } else {
        setResult(`Failed after ${j.done ?? 0}/${j.total ?? '?'} statements: ${j.error}`);
        toast('Database setup failed — see the message.', 'warn');
      }
    } catch {
      setResult('Could not reach the server.');
    } finally {
      setRunning(false);
    }
  };

  if (!authConfigured()) return null;

  const badge = (on: boolean, onText = 'Live', offText = 'Not set') =>
    <span className={'tag ' + (on ? 'go' : 'stop')}>{on ? onText : offText}</span>;

  return (
    <div className="card mb">
      <div className="between">
        <div>
          <strong>This deployment</strong>
          <p className="small muted" style={{ margin: '.2rem 0 0' }}>Keys live in Vercel; the app only reports whether each one is present.</p>
        </div>
        <button className="btn ghost sm" onClick={() => void refresh()} disabled={loading}>{loading ? 'Checking…' : '↻ Re-check'}</button>
      </div>
      {status ? (
        <>
          <div className="grid g4 mt">
            <div className="stat"><span className="small muted">Sign-in &amp; data (Supabase)</span><b style={{ fontSize: '1rem', paddingTop: '.4rem' }}>{badge(status.supabase)}</b></div>
            <div className="stat"><span className="small muted">Database setup (DATABASE_URL)</span><b style={{ fontSize: '1rem', paddingTop: '.4rem' }}>{badge(status.database, 'Ready', 'Not set')}</b></div>
            <div className="stat"><span className="small muted">Saathi AI ({status.aiProvider || 'no provider'})</span><b style={{ fontSize: '1rem', paddingTop: '.4rem' }}>{badge(Boolean(status.aiProvider), 'Live', 'No key')}</b></div>
            <div className="stat"><span className="small muted">Indian-language speech (Sarvam)</span><b style={{ fontSize: '1rem', paddingTop: '.4rem' }}>{badge(status.sarvam)}</b></div>
            <div className="stat"><span className="small muted">Payments (Razorpay)</span><b style={{ fontSize: '1rem', paddingTop: '.4rem' }}>{badge(status.razorpay && status.paymentsLive, 'Live', status.razorpay ? 'Keys set, not switched on' : 'Not set')}</b></div>
          </div>
          <p className="tiny muted mt">
            AI models — light: <code>{status.models.light}</code> · standard: <code>{status.models.standard}</code> · reasoning: <code>{status.models.reasoning}</code>
          </p>
          <div className="between mt" style={{ alignItems: 'flex-start' }}>
            <div>
              <strong>Database setup</strong>
              <p className="small muted" style={{ margin: '.2rem 0 0' }}>
                Creates the tables and access rules for users, requests, applications, live partners and agents.
                Safe to run again after changing the owner email list.
              </p>
            </div>
            <button className="btn go" onClick={() => void migrate()} disabled={running || !status.database}>
              {running ? 'Running…' : 'Run database setup'}
            </button>
          </div>
          {!status.database ? (
            <p className="small muted mt">
              Add <code>DATABASE_URL</code> in Vercel (Supabase → Project Settings → Database → Connection string → URI,
              choose the <em>pooler</em> address) and redeploy, then this button works.
            </p>
          ) : null}
          {result ? <p className={'small mt ' + (result.startsWith('Done') ? '' : 'muted')}>{result}</p> : null}
        </>
      ) : !loading ? (
        <p className="small muted mt">Could not read deployment status (are you signed in as an owner account?).</p>
      ) : null}
    </div>
  );
}
