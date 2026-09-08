'use client';

/* Profile: name, language, Easy Mode, and the memory panel with per-item
   delete plus the master "turn memory off". Identity numbers never live here. */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CustomerShell } from '@/components/layout/Shell';
import { Modal } from '@/components/ui/Modal';
import { useDB } from '@/hooks/useDB';
import { logout } from '@/lib/auth/session';
import { LANGS } from '@/lib/config';
import { me, mutate, resetAll, toast } from '@/lib/store';
import type { Lang } from '@/lib/types';

const memLabel = (k: string) =>
  ({ operator: 'Mobile operator', home: 'Home address', work: 'Work address',
     budget: 'Budget preference', travel: 'Travel preference' } as Record<string, string>)[k] || k;

export default function ProfilePage() {
  const { ready } = useDB();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [mk, setMk] = useState('');
  const [mv, setMv] = useState('');
  const u = ready ? me() : null;

  const body = !u ? null : (() => {
    const mem = Object.entries(u.memory || {});
    return (
      <>
        <h2>Profile</h2>
        <div className="card">
          <div className="grid g2">
            <div>
              <label className="f">Name</label>
              <input type="text" defaultValue={u.name} onBlur={(e) => mutate(() => { u.name = e.target.value || u.name; })} />
              <label className="f">Phone</label><input type="text" defaultValue={u.phone || ''} disabled />
              <label className="f">City</label><input type="text" defaultValue={u.city} disabled />
            </div>
            <div>
              <label className="f">Language</label>
              <select value={u.lang} onChange={(e) => { mutate(() => { u.lang = e.target.value as Lang; }); toast('Language set.'); }}>
                {LANGS.map((l) => <option key={l[0]} value={l[0]}>{l[1]}</option>)}
              </select>
              <label className="f">Easy Mode</label>
              <button className={'btn ' + (u.easy ? 'go' : 'ghost')} onClick={() => {
                const next = !u.easy;
                mutate(() => { u.easy = next; });
                toast(next ? 'Easy Mode on.' : 'Easy Mode off.');
              }}>
                {u.easy ? 'On — bigger text and buttons' : 'Off'}
              </button>
              <p className="tiny muted">Easy Mode enlarges everything, simplifies wording and reads replies aloud.</p>
            </div>
          </div>
        </div>

        <h3 className="mt2">What Saathi remembers</h3>
        <div className="card">
          {mem.length ? mem.map(([k, v]) => (
            <div key={k} className="between" style={{ padding: '.4rem 0', borderBottom: '1px solid var(--line)' }}>
              <div><strong className="small">{memLabel(k)}</strong><div className="small muted">{v}</div></div>
              <button className="linkish small" onClick={() => { mutate(() => { delete u.memory![k]; }); toast('Forgotten.'); }}>Delete</button>
            </div>
          )) : <p className="small muted">Nothing saved.</p>}
          <div className="row mt">
            <button className="btn ghost sm" onClick={() => setAdding(true)}>Add something</button>
            <button className="linkish small" onClick={() => {
              if (window.confirm('Delete everything Saathi remembers about you?')) {
                mutate(() => { u.memory = {}; });
                toast('Memory cleared.');
              }
            }}>Turn memory off and delete everything</button>
          </div>
          <p className="tiny muted mt">Saved so you don’t repeat yourself. Identity numbers are never stored here.</p>
        </div>

        <h3 className="mt2">Account</h3>
        <div className="row">
          <button className="btn ghost" onClick={() => { logout(); router.push('/login'); }}>Switch demo account</button>
          <button className="btn ghost" onClick={() => {
            if (window.confirm('Wipe all demo data in this browser?')) { resetAll(); toast('Demo data reset.', 'ok'); router.push('/'); }
          }}>Reset all demo data</button>
        </div>

        {adding ? (
          <Modal onClose={() => setAdding(false)}>
            <h3>Add something to remember</h3>
            <label className="f">What is it?</label>
            <input type="text" value={mk} onChange={(e) => setMk(e.target.value)} placeholder="Preferred provider" />
            <label className="f">Value</label>
            <input type="text" value={mv} onChange={(e) => setMv(e.target.value)} placeholder="Suresh Electricals" />
            <p className="tiny muted">Do not put Aadhaar, PAN or card numbers here.</p>
            <div className="row mt">
              <button className="btn" onClick={() => {
                mutate(() => { u.memory = u.memory || {}; u.memory[mk || 'note'] = mv; });
                setAdding(false); setMk(''); setMv('');
                toast('Saved for future tasks.', 'ok');
              }}>Save</button>
              <button className="btn ghost" onClick={() => setAdding(false)}>Close</button>
            </div>
          </Modal>
        ) : null}
      </>
    );
  })();
  return <CustomerShell active="profile">{body}</CustomerShell>;
}
