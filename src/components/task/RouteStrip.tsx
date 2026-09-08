'use client';

/* The four-lane executor display: active lane pulses, previous lane is
   crossed out on a handover, reason + confidence shown underneath. */

import { EXECUTORS, execName } from '@/lib/engine/orchestrator';
import { say } from '@/lib/i18n/useT';
import type { Executor, Task } from '@/lib/types';

export function RouteStrip({ task }: { task: Task }) {
  const r = task.routing;
  if (!r) return null;
  const cur = r.executor, prev = r.from;
  return (
    <>
      <div className="lanes" aria-label={say('Who is doing this task', 'यह काम कौन कर रहा है', 'Ye kaam kaun kar raha hai')}>
        {(Object.keys(EXECUTORS) as Executor[]).map((k) => (
          <div key={k} className={'lane' + (k === cur ? ' on' : '') + (k === prev ? ' was' : '')}>
            <span className="licon" aria-hidden="true">{EXECUTORS[k].icon}</span>
            <span className="lname">{execName(k)}</span>
            {k === cur ? <span className="ldot" /> : null}
            {k === prev ? <span className="lwas">{say('handed over', 'सौंपा', 'sompa')}</span> : null}
          </div>
        ))}
      </div>
      <p className="lreason">
        <strong>{execName(cur)}</strong> — {r.reason || ''}
        {r.confidence != null ? (
          <span className="conf">{say('confidence', 'भरोसा', 'bharosa')} {Math.round(r.confidence * 100)}%</span>
        ) : null}
      </p>
    </>
  );
}
