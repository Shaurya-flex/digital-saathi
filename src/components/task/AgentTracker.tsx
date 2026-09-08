'use client';

/* Live agent tracker: 4 stages, claim-first queue. Nothing is charged
   until the agent completes. */

import { getDB } from '@/lib/store';
import { TRACKS, trackIndex } from '@/lib/engine/tracker';
import { cancelTask } from '@/lib/engine/actions';
import { say, T } from '@/lib/i18n/useT';
import type { Task } from '@/lib/types';

export function AgentTracker({ task }: { task: Task }) {
  const db = getDB();
  const list = TRACKS.agent;
  const i = trackIndex(task);
  const a = db.agents.find((x) => x.id === task.assigned_agent);
  return (
    <div className="tracker">
      <div className="whorow">
        <span className="avatar hum">{a ? a.name.slice(0, 1) : '🧑'}</span>
        <span>
          <strong>{a ? a.name : say('Waiting for an agent', 'एजेंट का इंतज़ार', 'Agent ka intezaar')}</strong>
          <span className="small muted">
            {a
              ? `${a.rating}★ · ${a.done} ${say('tasks done', 'काम पूरे', 'kaam poore')} · ${a.sla}`
              : say('Usually under 5 minutes', 'आमतौर पर 5 मिनट में', 'Aam taur par 5 minute mein')}
          </span>
        </span>
      </div>
      <ul className="steps">
        {list.map((s, n) => (
          <li key={s.k} className={n < i ? 'ok' : n === i ? 'now' : ''}>
            <span className="mark">{n < i ? '✓' : n === i ? '●' : '○'}</span>
            {say(s.en, s.hi, s.hin)}
          </li>
        ))}
      </ul>
      <p className="small muted">
        {say('Nothing is charged until the agent finishes.', 'एजेंट के पूरा करने तक कोई शुल्क नहीं।', 'Agent ke poora karne tak koi charge nahi.')}
      </p>
      <button className="linkish small" onClick={() => cancelTask(task)}>{T('cancel')}</button>
    </div>
  );
}
