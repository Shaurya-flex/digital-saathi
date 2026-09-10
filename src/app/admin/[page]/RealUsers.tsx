'use client';

/* Admin → Users → "Signed-up users (cloud)": every real account, and a
   read-only preview of one account rendered the way that person sees their
   own app — so an owner can actually diagnose a stuck task or a confusing
   screen instead of guessing. Nothing here can act on the user's behalf;
   there are no buttons that mutate their data, only view it. Enforced by
   Row Level Security (docs/SUPABASE.md §6) in addition to the UI. */

import { useCallback, useEffect, useState } from 'react';
import { StatusTag } from '@/components/ui/Tag';
import { authConfigured } from '@/lib/auth/supabase';
import { fetchAllProfiles, fetchUserSnapshot, type ProfileRow, type UserSnapshot } from '@/lib/sync/adminUsers';
import { cfg, money, taskName, when } from '@/lib/store';

export function RealUsers() {
  const [rows, setRows] = useState<ProfileRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [snap, setSnap] = useState<UserSnapshot | null>(null);
  const [snapLoading, setSnapLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setRows(await fetchAllProfiles());
    setLoading(false);
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  if (!authConfigured()) {
    return <div className="card muted">Connect Supabase to see signed-up users here (docs/SUPABASE.md).</div>;
  }

  const view = async (userId: string) => {
    if (openId === userId) { setOpenId(null); setSnap(null); return; }
    setOpenId(userId);
    setSnap(null);
    setSnapLoading(true);
    setSnap(await fetchUserSnapshot(userId));
    setSnapLoading(false);
  };

  return (
    <>
      <div className="between">
        <h3 className="sechead" style={{ marginTop: 0 }}>
          Signed-up users (cloud) {rows?.length ? <span className="tag plain">{rows.length}</span> : null}
        </h3>
        <button className="btn ghost sm" onClick={() => void refresh()} disabled={loading}>{loading ? 'Loading…' : '↻ Refresh'}</button>
      </div>
      <p className="muted small">
        Real accounts created with Google or email sign-in. &ldquo;View&rdquo; opens a read-only preview of that
        person&rsquo;s own account — exactly what they see, nothing you can act on for them.
      </p>
      {rows === null ? (
        <div className="card muted">Could not load (are you signed in as an owner account?).</div>
      ) : !rows.length ? (
        <div className="card muted">No one has signed up yet.</div>
      ) : (
        <div className="card scroll">
          <table>
            <tbody>
              <tr><th>Name</th><th>Email</th><th>City</th><th>Role</th><th>Plan</th><th>Credits</th><th>Wallet</th><th>Last active</th><th></th></tr>
              {rows.map((r) => (
                <tr key={r.user_id}>
                  <td>{r.name || '—'}</td>
                  <td className="small">{r.email || '—'}</td>
                  <td className="small">{r.city || '—'}</td>
                  <td className="small">{r.role}</td>
                  <td className="small">{r.plan || '—'}</td>
                  <td>{r.credits}</td>
                  <td>{money(r.wallet)}</td>
                  <td className="tiny muted">{r.updated_at ? when(r.updated_at) : '—'}</td>
                  <td><button className="btn ghost sm" onClick={() => void view(r.user_id)}>{openId === r.user_id ? 'Close' : 'View'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openId ? (
        <div className="panel mt" style={{ padding: '1.2rem' }}>
          {snapLoading ? (
            <p className="muted">Loading their account…</p>
          ) : !snap || !snap.user ? (
            <p className="muted">No backup found yet for this user — they may not have used the app on a synced device.</p>
          ) : (
            <UserPreview snap={snap} />
          )}
        </div>
      ) : null}
    </>
  );
}

function UserPreview({ snap }: { snap: UserSnapshot }) {
  const u = snap.user!;
  const plan = u.plan ? cfg().plans.find((p) => p.id === u.plan) : undefined;
  const live = snap.tasks.filter((t) => !['Completed', 'Cancelled', 'Failed', 'Refunded'].includes(t.status));
  const done = snap.tasks.filter((t) => ['Completed', 'Refunded'].includes(t.status));

  return (
    <>
      <div className="between">
        <div>
          <strong style={{ fontSize: '1.1rem' }}>{u.name}</strong>
          <div className="small muted">{u.email} · {u.city || 'city not set'} · {u.lang}{u.easy ? ' · Easy Mode' : ''}</div>
        </div>
        <span className="tiny muted">Backed up {snap.backedUpAt ? when(snap.backedUpAt) : '—'}</span>
      </div>

      <div className="grid g4 mt">
        <div className="stat"><span className="small muted">Plan</span><b style={{ fontSize: '1.1rem', paddingTop: '.3rem' }}>{plan?.name || 'Free'}</b></div>
        <div className="stat"><span className="small muted">Credits</span><b>{(u.credits || 0).toLocaleString('en-IN')}</b></div>
        <div className="stat"><span className="small muted">Wallet</span><b>{money(u.wallet)}</b></div>
        <div className="stat"><span className="small muted">Tasks</span><b>{snap.tasks.length}</b></div>
      </div>

      <h4 className="sechead">Tasks in progress {live.length ? <span className="tag warm">{live.length}</span> : null}</h4>
      {live.length ? live.map((t) => (
        <div key={t.task_id} className="card mb">
          <div className="between"><strong>{taskName(t)}</strong><StatusTag status={t.status} /></div>
          <div className="small muted">{t.description}</div>
          {t.data.phase ? <div className="tiny muted mt">Phase: {t.data.phase}</div> : null}
        </div>
      )) : <p className="small muted">Nothing in progress.</p>}

      <h4 className="sechead">Completed ({done.length})</h4>
      {done.length ? (
        <div className="card scroll">
          <table>
            <tbody>
              <tr><th>Task</th><th>Status</th><th>Amount</th><th>When</th></tr>
              {done.slice(0, 15).map((t) => (
                <tr key={t.task_id}>
                  <td className="small">{taskName(t)}</td>
                  <td><StatusTag status={t.status} /></td>
                  <td className="small">{t.user_price ? money(t.user_price) : '—'}</td>
                  <td className="tiny muted">{when(t.completed_at || t.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="small muted">No completed tasks yet.</p>}

      {snap.bookings.length ? (
        <>
          <h4 className="sechead">Bookings ({snap.bookings.length})</h4>
          {snap.bookings.map((b) => (
            <div key={b.id} className="card mb">
              <div className="between">
                <div><strong>{b.cat}</strong><div className="small muted">{b.when} · {b.address}</div></div>
                <span className={'tag ' + (b.status === 'Completed' ? 'go' : 'warm')}>{b.status}</span>
              </div>
            </div>
          ))}
        </>
      ) : null}

      {snap.documents.length ? (
        <>
          <h4 className="sechead">Documents ({snap.documents.length})</h4>
          <div className="chips">{snap.documents.map((d) => <span key={d.id} className="tag plain">{d.name}</span>)}</div>
        </>
      ) : null}

      {snap.family.length ? (
        <>
          <h4 className="sechead">Family members ({snap.family.length})</h4>
          <div className="chips">{snap.family.map((f) => <span key={f.id} className="tag plain">{f.name} · {f.relation}</span>)}</div>
        </>
      ) : null}

      <h4 className="sechead">Recent ledger</h4>
      {snap.ledger.length ? (
        <div className="card scroll">
          <table>
            <tbody>
              <tr><th>When</th><th>Type</th><th>Reason</th><th>Amount</th></tr>
              {snap.ledger.slice(-10).reverse().map((l) => (
                <tr key={l.id}>
                  <td className="tiny">{when(l.at)}</td>
                  <td>{l.type === 'credits' ? 'Credits' : 'Money'}</td>
                  <td className="small">{l.reason}</td>
                  <td>{l.dir === 'debit' ? '−' : '+'}{l.type === 'credits' ? l.amount : money(l.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="small muted">No activity yet.</p>}
    </>
  );
}
