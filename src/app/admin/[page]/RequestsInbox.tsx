'use client';

/* The operator's desk: live service requests and partner/agent applications
   recorded in Supabase (owner accounts only, enforced by RLS). Work each
   request: contact the customer in one tap, move the status, deliver.
   Approving an application creates the live, bookable provider/agent row
   (docs/SUPABASE.md §7) — that is what actually populates the marketplace
   real customers see, not just a status label. */

import { useCallback, useEffect, useState } from 'react';
import { StatusTag } from '@/components/ui/Tag';
import { authConfigured } from '@/lib/auth/supabase';
import { approveAgentApplication, approveProviderApplication } from '@/lib/sync/marketplace';
import {
  fetchAllApplications, fetchAllRequests, setApplicationStatusAsOwner,
  setRequestStatusAsOwner, type ApplicationRow, type RequestRow,
} from '@/lib/sync/requests';
import { toast, when } from '@/lib/store';

const REQ_FLOW = ['Understanding', 'In progress', 'Completed', 'Cancelled'];
// 'verified' is set only by the Approve action below, never by hand — that
// is the one path that actually creates the live marketplace row.
const APP_FLOW = ['new', 'contacted', 'rejected'];

const wa = (phone: string, text: string) =>
  'https://wa.me/' + phone.replace(/[^\d]/g, '').replace(/^0/, '91') + '?text=' + encodeURIComponent(text);

export function RequestsInbox() {
  const [reqs, setReqs] = useState<RequestRow[] | null>(null);
  const [apps, setApps] = useState<ApplicationRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [r, a] = await Promise.all([fetchAllRequests(), fetchAllApplications()]);
    setReqs(r); setApps(a);
    setLoading(false);
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  if (!authConfigured()) {
    return <div className="card muted">Connect Supabase to receive requests here (docs/SUPABASE.md).</div>;
  }

  const open = (reqs || []).filter((r) => !['Completed', 'Cancelled', 'Failed', 'Refunded'].includes(r.status));
  const closed = (reqs || []).filter((r) => ['Completed', 'Cancelled', 'Failed', 'Refunded'].includes(r.status));
  const pendingApps = (apps || []).filter((a) => a.status !== 'verified' && a.status !== 'rejected');

  const approve = async (a: ApplicationRow) => {
    setApproving(a.id);
    const result = a.kind === 'provider' ? await approveProviderApplication(a) : await approveAgentApplication(a);
    setApproving(null);
    if (result) {
      toast(`${a.name} is now live — customers can see and book them.`, 'ok');
      void refresh();
    } else {
      toast('Could not approve. Check the live-marketplace tables exist (docs/SUPABASE.md §7).', 'warn');
    }
  };

  const reqCard = (r: RequestRow) => (
    <div key={r.id} className="card mb">
      <div className="between">
        <div>
          <strong>{r.description || r.intent}</strong>
          <div className="small muted">
            {r.name || 'Customer'} · {r.city || 'city not set'} · {r.intent}
            {r.lang ? ' · speaks ' + r.lang : ''} · {when(r.created_at)}
          </div>
          <div className="small" style={{ marginTop: '.25rem' }}>
            {r.phone ? <a className="linkish" href={wa(r.phone, `Namaste ${r.name?.split(' ')[0] || ''}! Digital Saathi here about your request: "${r.description}". `)} target="_blank" rel="noreferrer">📱 WhatsApp</a> : <span className="muted">no phone —</span>}
            {' · '}
            <a className="linkish" href={'mailto:' + r.email + '?subject=' + encodeURIComponent('Your Digital Saathi request')}>✉️ {r.email}</a>
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: '11rem' }}>
          <StatusTag status={r.status} />
          <select className="mt" style={{ minHeight: 36 }} value={REQ_FLOW.includes(r.status) ? r.status : ''}
            onChange={async (e) => {
              if (!e.target.value) return;
              const ok = await setRequestStatusAsOwner(r.id, e.target.value);
              toast(ok ? 'Updated.' : 'Update failed.', ok ? 'ok' : 'warn');
              if (ok) void refresh();
            }}>
            <option value="" disabled>Move to…</option>
            {REQ_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="between">
        <h2 style={{ margin: 0 }}>Requests inbox</h2>
        <button className="btn ghost sm" onClick={() => void refresh()} disabled={loading}>{loading ? 'Loading…' : '↻ Refresh'}</button>
      </div>
      <p className="muted small">
        Every service request from a signed-in user and every partner/agent application lands here the moment it
        happens. Contact, deliver, move the status — the customer sees progress in their own task view.
      </p>

      <h3 className="sechead">Open requests {open.length ? <span className="tag warm">{open.length}</span> : null}</h3>
      {reqs === null ? <div className="card muted">Could not load (are you signed in as an owner account?).</div>
        : open.length ? open.map(reqCard)
        : <div className="card muted">No open requests. New ones appear as soon as a user asks for something.</div>}

      <h3 className="sechead">Applications needing approval {pendingApps.length ? <span className="tag warm">{pendingApps.length}</span> : null}</h3>
      {apps === null ? <div className="card muted">Could not load applications.</div>
        : apps.length ? apps.map((a) => (
          <div key={a.id} className="card mb">
            <div className="between">
              <div>
                <strong>{a.name}</strong> <span className={'tag ' + (a.kind === 'provider' ? 'go' : 'warm')}>{a.kind === 'provider' ? 'Service partner' : 'Digital agent'}</span>
                {a.status === 'verified' ? <span className="tag go">🟢 Live</span> : a.status === 'rejected' ? <span className="tag stop">Rejected</span> : null}
                <div className="small muted">{a.city || '—'} · {when(a.created_at)}</div>
                <div className="small">{Object.entries(a.data || {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}</div>
                <a className="linkish small" href={wa(a.phone, `Namaste ${a.name.split(' ')[0]}! Digital Saathi here about your ${a.kind} application. `)} target="_blank" rel="noreferrer">📱 {a.phone}</a>
              </div>
              <div style={{ textAlign: 'right' }}>
                {a.status !== 'verified' && a.status !== 'rejected' ? (
                  <button className="btn go sm" disabled={approving === a.id} onClick={() => void approve(a)}>
                    {approving === a.id ? 'Approving…' : '✓ Approve — go live'}
                  </button>
                ) : null}
                <select className="mt" style={{ minHeight: 36, maxWidth: '9rem' }}
                  value={APP_FLOW.includes(a.status) ? a.status : ''}
                  onChange={async (e) => {
                    if (!e.target.value) return;
                    const ok = await setApplicationStatusAsOwner(a.id, e.target.value);
                    toast(ok ? 'Updated.' : 'Update failed.', ok ? 'ok' : 'warn');
                    if (ok) void refresh();
                  }}>
                  <option value="" disabled>Move to…</option>
                  {APP_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )) : <div className="card muted">No applications yet.</div>}

      {closed.length ? (
        <>
          <h3 className="sechead">Closed</h3>
          {closed.slice(0, 10).map(reqCard)}
        </>
      ) : null}
    </>
  );
}
