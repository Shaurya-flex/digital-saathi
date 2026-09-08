'use client';

/* Family: up to 5 members with granular permissions, approval queue, and
   the upcoming bills/renewals/appointments panel. */

import { useState } from 'react';
import { CustomerShell } from '@/components/layout/Shell';
import { Modal } from '@/components/ui/Modal';
import { useDB } from '@/hooks/useDB';
import { me, mutate, toast, track, uid } from '@/lib/store';
import type { FamilyPerms } from '@/lib/types';

const permLabel = (k: string) =>
  ({ view: 'View tasks', create: 'Create tasks', notify: 'Get alerts', approve: 'Approve payments',
     docs: 'Manage documents', history: 'View history' } as Record<string, string>)[k] || k;

const PERM_KEYS: Array<keyof FamilyPerms> = ['view', 'create', 'notify', 'approve', 'docs', 'history'];

export default function FamilyPage() {
  const { db, ready } = useDB();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Father');
  const [phone, setPhone] = useState('');
  const [perms, setPerms] = useState<FamilyPerms>({ view: true, create: false, notify: true, approve: false, docs: false, history: false });
  const u = ready ? me() : null;

  const body = !u || !db ? null : (() => {
    const fam = db.family.filter((f) => f.ownerId === u.id);
    const pending = db.notifications.filter((n) => n.userId === u.id && n.kind === 'warn' && !n.read);
    return (
      <>
        <div className="between">
          <h2 style={{ margin: 0 }}>Family</h2>
          <button className="btn sm" onClick={() => setAdding(true)}>Add a member</button>
        </div>
        <p className="muted small">One person can run the family’s digital work. Everyone else only sees what you allow.</p>
        <div className="grid g2 mt">
          {fam.length ? fam.map((f) => (
            <div key={f.id} className="card">
              <div className="between">
                <div>
                  <strong>{f.name}</strong>
                  <div className="small muted">{f.relation} · {f.phone}</div>
                </div>
                {f.linkedUserId ? <span className="tag go">Account linked</span> : <span className="tag plain">Invite pending</span>}
              </div>
              <div className="chips mt">
                {Object.entries(f.perms).filter(([, v]) => v).map(([k]) => <span key={k} className="tag plain">{permLabel(k)}</span>)}
              </div>
              <div className="row mt">
                <button className="btn ghost sm" onClick={() => toast('Open the member card to change each permission.')}>Change permissions</button>
                <button className="linkish small" onClick={() => { mutate((d) => { d.family = d.family.filter((x) => x.id !== f.id); }); toast('Removed.'); }}>Remove</button>
              </div>
            </div>
          )) : (
            <div className="card muted">
              No family members yet. Add Papa, Mummy or your spouse and manage their bills and renewals from here.
            </div>
          )}
        </div>
        <h3 className="mt2">Needs your approval</h3>
        {pending.length ? pending.map((n) => (
          <div key={n.id} className="card mb">
            <div className="between">
              <div><strong>{n.title}</strong><div className="small muted">{n.body}</div></div>
              <div className="row">
                <button className="btn go sm" onClick={() => { mutate(() => { n.read = true; }); toast('Approved.', 'ok'); }}>Approve</button>
                <button className="btn ghost sm" onClick={() => { mutate(() => { n.read = true; }); toast('Rejected.'); }}>Reject</button>
              </div>
            </div>
          </div>
        )) : <div className="card muted small">Nothing waiting.</div>}
        <h3 className="mt2">Coming up</h3>
        <div className="grid g3">
          <div className="card"><span className="tag warm">Renewal</span><p className="small" style={{ margin: '.5rem 0 0' }}>Health policy renews 14 Nov 2026</p></div>
          <div className="card"><span className="tag">Bill</span><p className="small" style={{ margin: '.5rem 0 0' }}>Electricity due 12 Sep, about ₹1,284</p></div>
          <div className="card"><span className="tag go">Appointment</span><p className="small" style={{ margin: '.5rem 0 0' }}>Papa — physician, tomorrow 11:15 AM</p></div>
        </div>
        {adding ? (
          <Modal onClose={() => setAdding(false)}>
            <h3>Add a family member</h3>
            <label className="f">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Papa" />
            <label className="f">Relation</label>
            <select value={relation} onChange={(e) => setRelation(e.target.value)}>
              {['Father', 'Mother', 'Spouse', 'Child', 'Grandparent'].map((r) => <option key={r}>{r}</option>)}
            </select>
            <label className="f">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98•••• ••210" />
            <label className="f">They can</label>
            <div className="grid g2">
              {PERM_KEYS.map((k) => (
                <label key={k} className="row small">
                  <input type="checkbox" checked={perms[k]} style={{ width: 'auto', minHeight: 'auto' }}
                    onChange={(e) => setPerms({ ...perms, [k]: e.target.checked })} /> {permLabel(k)}
                </label>
              ))}
            </div>
            <div className="row mt">
              <button className="btn" onClick={() => {
                mutate((d) => {
                  d.family.push({ id: uid('fm'), ownerId: u.id, name: name || 'Family member', relation, phone: phone || '—', perms });
                });
                track('family_addition');
                setAdding(false);
                toast('Added. They will get an invite.', 'ok');
              }}>Add member</button>
              <button className="btn ghost" onClick={() => setAdding(false)}>Close</button>
            </div>
          </Modal>
        ) : null}
      </>
    );
  })();
  return <CustomerShell active="family">{body}</CustomerShell>;
}
