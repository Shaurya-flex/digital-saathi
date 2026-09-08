'use client';

/* One clarification question at a time, big tap targets, text input only
   where unavoidable (e.g. someone else's phone number). */

import { useState } from 'react';
import { answerClarify, cancelTask } from '@/lib/engine/actions';
import { say, T } from '@/lib/i18n/useT';
import type { Task } from '@/lib/types';

export function ClarifyBody({ task }: { task: Task }) {
  const q = task.data.qs?.[task.data.qi || 0];
  const [val, setVal] = useState('');
  if (!q) return null;
  return (
    <div className="clarify">
      <div className="qlabel">{T('oneThing')}</div>
      <p className="qtext">{say(q.en, q.hi, q.hin)}</p>
      {q.type === 'text' ? (
        <div className="typerow">
          <input type="text" placeholder={q.ph || ''} inputMode={(q.mode as 'tel') || 'text'}
            value={val} onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && val.trim()) answerClarify(task, val.trim()); }} />
          <button className="btn" onClick={() => { if (val.trim()) answerClarify(task, val.trim()); }}>{T('send')}</button>
        </div>
      ) : (
        <div className="qopts">
          {(q.options || []).map((o) => (
            <button key={o.v} className="qopt" onClick={() => answerClarify(task, o.v)}>{o.l}</button>
          ))}
        </div>
      )}
      <button className="linkish small" onClick={() => cancelTask(task)}>{T('cancel')}</button>
    </div>
  );
}
