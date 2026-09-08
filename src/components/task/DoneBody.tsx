'use client';

/* Green completion card with the result, rate and report actions. */

import { money, speakNow } from '@/lib/store';
import { T } from '@/lib/i18n/useT';
import { DemoFlag } from '@/components/ui/DemoFlag';
import { openDispute, openReview } from './modals';
import type { Task } from '@/lib/types';

export function DoneBody({ task }: { task: Task }) {
  return (
    <div className="statebox ok">
      <div className="bigstate">✓ {T('done')}</div>
      <p className="sline">{task.data.result || ''}</p>
      {task.user_price ? <p className="small">{T('youPay')}: <strong>{money(task.user_price)}</strong></p> : null}
      <DemoFlag>{T('demoNote')}</DemoFlag>
      <div className="row mt" style={{ gap: '.4rem' }}>
        <button className="btn ghost sm" onClick={() => speakNow(T('done') + '. ' + (task.data.result || ''))}>🔊 {T('readAloud')}</button>
        {task.data.reviewed ? null : (
          <button className="btn ghost sm" onClick={() => openReview(task.task_id)}>{T('rate')}</button>
        )}
        <button className="btn ghost sm" onClick={() => openDispute(task.task_id)}>{T('problem')}</button>
      </div>
    </div>
  );
}
