'use client';

/* Provider booking cards with status, message/cancel/rate actions. */

import { CustomerShell } from '@/components/layout/Shell';
import { openReview } from '@/components/task/modals';
import { useDB } from '@/hooks/useDB';
import { me, money, mutate, toast } from '@/lib/store';

export default function BookingsPage() {
  const { db, ready } = useDB();
  const u = ready ? me() : null;
  const body = !u || !db ? null : (() => {
    const bs = db.bookings.filter((b) => b.userId === u.id ||
      db.family.some((f) => f.ownerId === u.id && f.linkedUserId === b.userId));
    return (
      <>
        <h2>Bookings</h2>
        {bs.length ? bs.map((b) => {
          const p = db.providers.find((x) => x.id === b.providerId);
          return (
            <div key={b.id} className="card mb">
              <div className="between">
                <div>
                  <strong>{p?.name || b.cat}</strong>
                  <div className="small muted">{b.cat} · {b.when}</div>
                  <div className="tiny muted">{b.address}</div>
                </div>
                <div className="row" style={{ gap: '.4rem' }}>
                  <span className={'tag ' + (b.status === 'Accepted' ? 'go' : 'warm')}>{b.status}</span>
                  <strong>{money(b.price)}</strong>
                </div>
              </div>
              <div className="row mt" style={{ gap: '.4rem' }}>
                <button className="btn ghost sm" onClick={() => toast('Messaging opens in the Bookings thread.')}>Message</button>
                {b.status !== 'Completed' ? (
                  <button className="btn ghost sm" onClick={() => {
                    mutate(() => { b.status = 'Cancelled'; });
                    toast('Booking cancelled. No charge.');
                  }}>Cancel</button>
                ) : (
                  <button className="btn sm" onClick={() => openReview(null, b.providerId)}>Rate</button>
                )}
              </div>
            </div>
          );
        }) : <div className="card muted">No bookings yet. Ask for a repair, a cleaning or a salon visit.</div>}
      </>
    );
  })();
  return <CustomerShell active="bookings">{body}</CustomerShell>;
}
