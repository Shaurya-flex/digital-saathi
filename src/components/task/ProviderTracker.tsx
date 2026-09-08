'use client';

/* Live provider tracker: who is coming, 5 stages, and the "work is done"
   confirmation that debits the wallet and opens the review modal. */

import { getDB, money } from '@/lib/store';
import { TRACKS, trackIndex } from '@/lib/engine/tracker';
import { cancelTask, workDone } from '@/lib/engine/actions';
import { say, T } from '@/lib/i18n/useT';
import { openDispute, openReview } from './modals';
import type { Task } from '@/lib/types';

export function ProviderTracker({ task }: { task: Task }) {
  const db = getDB();
  const p = db.providers.find((x) => x.id === task.data.pick);
  const list = TRACKS.provider;
  const i = trackIndex(task);
  const atEnd = i >= list.length - 1;
  const confirm = () => {
    const out = workDone(task);
    if (out === 'review') setTimeout(() => openReview(task.task_id, p?.id), 500);
  };
  return (
    <div className="tracker">
      <div className="whorow">
        <span className="avatar">{(p?.name || '?').slice(0, 1)}</span>
        <span>
          <strong>{p?.name || ''}</strong>
          <span className="small muted">{p?.cat || ''} · {p?.rating || ''}★ · {p?.locality || ''}</span>
        </span>
        <a className="btn ghost sm" href="tel:0000000000" onClick={(e) => e.preventDefault()}>📞 {say('Call', 'फ़ोन', 'Phone')}</a>
      </div>
      <ul className="steps">
        {list.map((s, n) => (
          <li key={s.k} className={n < i ? 'ok' : n === i ? 'now' : ''}>
            <span className="mark">{n < i ? '✓' : n === i ? '●' : '○'}</span>
            {say(s.en, s.hi, s.hin)}
          </li>
        ))}
      </ul>
      {atEnd ? (
        <div className="confirmwork">
          <p className="small" style={{ margin: '.2rem 0 .5rem' }}>
            {say('Tell me when the work is finished.', 'काम पूरा हो जाए तो बताइए।', 'Kaam poora ho jaye to bataiye.')}
          </p>
          <div className="arow">
            <button className="btn go big" onClick={confirm}>✓ {say('Work is done', 'काम हो गया', 'Kaam ho gaya')}</button>
            <button className="btn ghost big" onClick={() => openDispute(task.task_id)}>{T('problem')}</button>
          </div>
        </div>
      ) : (
        <p className="small muted">
          {say('You will pay after the work, through the app.', 'काम के बाद ऐप से भुगतान होगा।', 'Kaam ke baad app se payment hoga.')} {money(p?.base || 0)}+
        </p>
      )}
      <button className="linkish small" onClick={() => cancelTask(task)}>{T('cancel')}</button>
    </div>
  );
}
