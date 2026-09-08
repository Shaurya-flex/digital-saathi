'use client';

/* Alerts + recurring reminders. Reminders attack the single most common
   recurring chore — forgotten recharges, bills and renewals: Saathi nudges
   you when one is due and "Do it now" runs the task in one tap. Completed
   recharge/bill tasks are auto-suggested as monthly reminders. */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerShell } from '@/components/layout/Shell';
import { DemoFlag } from '@/components/ui/DemoFlag';
import { Modal } from '@/components/ui/Modal';
import { useDB } from '@/hooks/useDB';
import { handleAsk } from '@/lib/engine/actions';
import { me, money, mutate, toast, uid, when } from '@/lib/store';
import type { Reminder } from '@/lib/types';

const EVERY: Array<Reminder['every']> = ['weekly', 'monthly', 'quarterly', 'yearly'];

function advance(nextDue: string, every: Reminder['every']): string {
  const d = new Date(nextDue);
  if (every === 'weekly') d.setDate(d.getDate() + 7);
  else if (every === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (every === 'quarterly') d.setMonth(d.getMonth() + 3);
  else d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

export default function AlertsPage() {
  const { db, ready } = useDB();
  const router = useRouter();
  const u = ready ? me() : null;
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [every, setEvery] = useState<Reminder['every']>('monthly');
  const [due, setDue] = useState('');

  const body = !u || !db ? null : (() => {
    const ns = db.notifications.filter((n) => n.userId === u.id);
    const rs = db.reminders.filter((r) => r.userId === u.id);
    const today = new Date().toISOString().slice(0, 10);

    // Suggest reminders from completed recharge/bill tasks not yet covered.
    const suggestions = db.tasks
      .filter((t) => t.user_id === u.id && t.status === 'Completed' && ['recharge', 'bill'].includes(t.intent))
      .filter((t) => !rs.some((r) => r.kind === t.intent))
      .slice(0, 2);

    const runNow = (r: Reminder) => {
      mutate(() => { r.nextDue = advance(r.nextDue, r.every); });
      handleAsk(r.ask || r.title);
      router.push('/app/ask');
    };

    return (
      <>
        <div className="between">
          <h2 style={{ margin: 0 }}>Alerts &amp; reminders</h2>
          <button className="btn ghost sm" onClick={() => mutate(() => ns.forEach((n) => { n.read = true; }))}>Mark all read</button>
        </div>

        <h3 className="sechead">Recurring reminders</h3>
        {rs.length ? rs.map((r) => {
          const dueNow = r.nextDue.slice(0, 10) <= today;
          return (
            <div key={r.id} className="card mb" style={dueNow ? { borderColor: 'var(--marigold)', borderWidth: 2 } : undefined}>
              <div className="between">
                <div>
                  <strong>{r.title}</strong> {dueNow ? <span className="tag warm">Due</span> : null}
                  <p className="small muted" style={{ margin: '.2rem 0 0' }}>
                    {r.every} · next {new Date(r.nextDue).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {r.amount ? ' · about ' + money(r.amount) : ''}
                  </p>
                </div>
                <div className="row" style={{ gap: '.3rem' }}>
                  <button className="btn go sm" onClick={() => runNow(r)}>Do it now</button>
                  <button className="btn ghost sm" onClick={() => mutate((d) => { d.reminders = d.reminders.filter((x) => x.id !== r.id); })}>Remove</button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="card muted mb">
            No reminders yet. Add one and Saathi will nudge you — and do the task in one tap.
          </div>
        )}
        {suggestions.map((t) => (
          <div key={t.task_id} className="card mb" style={{ borderStyle: 'dashed' }}>
            <div className="between">
              <div>
                <strong>Make this monthly?</strong>
                <p className="small muted" style={{ margin: '.2rem 0 0' }}>“{t.description}” — done once, repeats every month.</p>
              </div>
              <button className="btn sm" onClick={() => {
                mutate((d) => d.reminders.push({
                  id: uid('rm'), userId: u.id, title: t.data.title || t.description,
                  kind: t.intent as Reminder['kind'], every: 'monthly',
                  nextDue: advance(new Date().toISOString(), 'monthly'),
                  amount: t.user_price || undefined, ask: t.description,
                }));
                toast('Reminder added.', 'ok');
              }}>Remind me</button>
            </div>
          </div>
        ))}
        <button className="btn ghost sm mb" onClick={() => setAdding(true)}>+ Add a reminder</button>

        <h3 className="sechead">Alerts</h3>
        {ns.length ? ns.map((n) => (
          <div key={n.id} className="card mb" style={n.read ? { opacity: 0.6 } : undefined}>
            <div className="between"><strong>{n.title}</strong><span className="tiny muted">{when(n.at)}</span></div>
            <p className="small muted" style={{ margin: '.3rem 0 0' }}>{n.body}</p>
          </div>
        )) : <div className="card muted">No alerts.</div>}

        <div className="card mt">
          <div className="between">
            <div>
              <strong>Where alerts go</strong>
              <p className="small muted" style={{ margin: '.2rem 0 0' }}>In-app now. Email, SMS, WhatsApp and push are wired as adapters.</p>
            </div>
            <DemoFlag />
          </div>
        </div>

        {adding ? (
          <Modal onClose={() => setAdding(false)}>
            <h3>Add a reminder</h3>
            <label className="f">What should Saathi remind you about?</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Recharge Mummy's Jio number" autoFocus />
            <label className="f">How often?</label>
            <select value={every} onChange={(e) => setEvery(e.target.value as Reminder['every'])}>
              {EVERY.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <label className="f">First due date</label>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} min={today} />
            <div className="row mt">
              <button className="btn" onClick={() => {
                if (!title.trim() || !due) { toast('Give it a name and a date.', 'warn'); return; }
                mutate((d) => d.reminders.push({
                  id: uid('rm'), userId: u.id, title: title.trim(), kind: 'custom',
                  every, nextDue: new Date(due).toISOString(), ask: title.trim(),
                }));
                setAdding(false); setTitle(''); setDue('');
                toast('Reminder added.', 'ok');
              }}>Add</button>
              <button className="btn ghost" onClick={() => setAdding(false)}>Close</button>
            </div>
          </Modal>
        ) : null}
      </>
    );
  })();
  return <CustomerShell active="alerts">{body}</CustomerShell>;
}
