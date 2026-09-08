'use client';

/* Notification feed. Adapters for email/SMS/WhatsApp/push are wired but
   mock — the demo delivers in-app. */

import { CustomerShell } from '@/components/layout/Shell';
import { DemoFlag } from '@/components/ui/DemoFlag';
import { useDB } from '@/hooks/useDB';
import { me, mutate, when } from '@/lib/store';

export default function AlertsPage() {
  const { db, ready } = useDB();
  const u = ready ? me() : null;
  const body = !u || !db ? null : (() => {
    const ns = db.notifications.filter((n) => n.userId === u.id);
    return (
      <>
        <div className="between">
          <h2 style={{ margin: 0 }}>Alerts</h2>
          <button className="btn ghost sm" onClick={() => mutate(() => ns.forEach((n) => { n.read = true; }))}>Mark all read</button>
        </div>
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
      </>
    );
  })();
  return <CustomerShell active="alerts">{body}</CustomerShell>;
}
