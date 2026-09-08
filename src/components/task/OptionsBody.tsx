'use client';

/* Options with prices; the top provider match is labelled "Best match". */

import { useState } from 'react';
import { cancelTask, handleAsk, pickOption, toApprove } from '@/lib/engine/actions';
import { money } from '@/lib/store';
import { say, T } from '@/lib/i18n/useT';
import { ModifyModal } from './modals';
import type { Task } from '@/lib/types';

export function OptionsBody({ task }: { task: Task }) {
  const d = task.data;
  const [modify, setModify] = useState(false);
  if (!d.options || !d.options.length) return <p className="small muted">{T('thinking')}</p>;
  return (
    <>
      <p className="small">{d.lead || ''}</p>
      {d.options.map((o) => (
        <button key={o.id} className={'optbtn' + (d.pick === o.id ? ' sel' : '')} onClick={() => pickOption(task, o.id)}>
          <span className="oleft"><strong>{o.title}</strong><span className="small muted">{o.sub}</span></span>
          <span className="oright">
            {o.price != null ? <strong>{money(o.price)}</strong> : null}
            <span className="pickmark">{d.pick === o.id ? '✓' : ''}</span>
          </span>
        </button>
      ))}
      {d.pick ? (
        <button className="btn go wide mt" onClick={() => toApprove(task)}>{say('Continue', 'आगे बढ़िए', 'Aage badhiye')}</button>
      ) : null}
      <div className="row mt" style={{ gap: '.4rem' }}>
        <button className="linkish small" onClick={() => setModify(true)}>{T('change')}</button>
        <button className="linkish small" onClick={() => cancelTask(task)}>{T('cancel')}</button>
      </div>
      {modify ? <ModifyModal taskId={task.task_id} onClose={() => setModify(false)} onModify={(v) => handleAsk(v)} /> : null}
    </>
  );
}
