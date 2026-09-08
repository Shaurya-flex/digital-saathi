'use client';

/* Provider job card with the customer-pays / platform-fee / you-keep split
   and the accept → on-the-way → finished action flow. */

import { cfg, getDB, money } from '@/lib/store';
import { say } from '@/lib/i18n/useT';
import type { Booking, Provider } from '@/lib/types';

export function JobCard({ b, actions, onAccept, onDecline, onStart, onDone }: {
  b: Booking; p?: Provider; actions?: boolean;
  onAccept?: (b: Booking) => void; onDecline?: (b: Booking) => void;
  onStart?: (b: Booking) => void; onDone?: (b: Booking) => void;
}) {
  const db = getDB();
  const u = db.users.find((x) => x.id === b.userId) || { name: 'Customer', city: '' };
  const earn = Math.round(b.price * (1 - cfg().commission.provider));
  const t = db.tasks.find((x) => x.task_id === b.taskId);
  return (
    <div className="card mb jobcard">
      <div className="between">
        <div>
          <strong>{b.cat}</strong>{' '}
          <span className={'tag ' + (b.status === 'Requested' ? 'warm' : b.status === 'Completed' ? 'go' : 'plain')}>{b.status}</span>
          <div className="small muted">{u.name} · {b.address}</div>
          <div className="small">{b.when}</div>
          {t?.description ? <div className="small muted">“{t.description}”</div> : null}
        </div>
        <div style={{ textAlign: 'right', minWidth: 90 }}>
          <div className="small muted">{say('Customer', 'ग्राहक', 'Grahak')}</div>
          <strong>{money(b.price)}</strong>
          <div className="tiny muted">{say('Platform', 'प्लेटफ़ॉर्म', 'Platform')} −{money(b.price - earn)}</div>
          <div className="small" style={{ color: 'var(--leaf)' }}><strong>{say('You', 'आपको', 'Aapko')} {money(earn)}</strong></div>
        </div>
      </div>
      {actions && b.status === 'Requested' ? (
        <div className="arow mt">
          <button className="btn go big" onClick={() => onAccept?.(b)}>{say('Accept', 'स्वीकार', 'Sweekar')}</button>
          <button className="btn ghost big" onClick={() => onDecline?.(b)}>{say('Decline', 'मना', 'Mana')}</button>
        </div>
      ) : null}
      {b.status === 'Accepted' ? (
        <div className="arow mt">
          <button className="btn big" onClick={() => onStart?.(b)}>🚗 {say("I'm on the way", 'निकल रहा हूँ', 'Nikal raha hoon')}</button>
        </div>
      ) : null}
      {b.status === 'In progress' ? (
        <div className="arow mt">
          <button className="btn go big" onClick={() => onDone?.(b)}>✓ {say('Work finished', 'काम पूरा', 'Kaam poora')}</button>
        </div>
      ) : null}
    </div>
  );
}
