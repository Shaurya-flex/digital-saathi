'use client';

/* Progress bar + step list in the user's language. */

import { nudgeTask } from '@/lib/engine/actions';
import { say, T } from '@/lib/i18n/useT';
import type { Task } from '@/lib/types';

export function WorkingBody({ task }: { task: Task }) {
  const w = task.data.work || { steps: [], i: 0 };
  const pct = Math.round((w.i / Math.max(1, w.steps.length)) * 100);
  return (
    <div className="workbox">
      <div className="between"><strong>{T('working')}</strong><span className="small muted">{pct}%</span></div>
      <div className="bar"><span style={{ width: pct + '%' }} /></div>
      <ul className="steps">
        {w.steps.map((s, i) => (
          <li key={i} className={i < w.i ? 'ok' : i === w.i ? 'now' : ''}>
            <span className="mark">{i < w.i ? '✓' : i === w.i ? '●' : '○'}</span>
            {say(s.en, s.hi, s.hin)}
          </li>
        ))}
      </ul>
      <p className="small muted">{T('pleaseWait')}</p>
      <button className="linkish tiny" onClick={() => nudgeTask(task)}>
        {say('Stuck? Tap here', 'अटक गया? यहाँ दबाइए', 'Atak gaya? Yahan dabaiye')}
      </button>
    </div>
  );
}
