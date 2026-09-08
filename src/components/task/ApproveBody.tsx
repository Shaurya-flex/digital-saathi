'use client';

/* The approval gate: amount at 2rem, two 60px confirm/cancel buttons,
   read-aloud. Nothing that costs money happens without this. */

import { cancelTask, confirmTask } from '@/lib/engine/actions';
import { money, speakNow } from '@/lib/store';
import { say, T } from '@/lib/i18n/useT';
import type { Task } from '@/lib/types';

export function ApproveBody({ task }: { task: Task }) {
  const o = (task.data.options || []).find((x) => x.id === task.data.pick);
  const amount = task.user_price;
  return (
    <div className="approve">
      <div className="alabel">{T('approve')}</div>
      <p className="asum">{task.data.approveText || o?.title || ''}</p>
      {amount ? <div className="amt">{T('youPay')} <b>{money(amount)}</b></div> : null}
      <p className="small muted">
        {say('I will not do this until you say yes. Credits used: ',
             'आपके “हाँ” के बिना मैं यह नहीं करूँगा। क्रेडिट लगेंगे: ',
             'Aapke haan ke bina main ye nahi karunga. Credits lagenge: ')}
        {task.credits_required}
      </p>
      <div className="arow">
        <button className="btn go big" onClick={() => confirmTask(task)}>✓ {T('yesDo')}</button>
        <button className="btn ghost big" onClick={() => cancelTask(task)}>✕ {T('noStop')}</button>
      </div>
      <button className="speakbtn"
        onClick={() => speakNow((task.data.approveText || '') + (amount ? '. ' + T('youPay') + ' ' + money(amount) : ''))}>
        🔊 {T('readAloud')}
      </button>
    </div>
  );
}
