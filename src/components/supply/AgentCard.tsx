'use client';

import type { Agent } from '@/lib/types';

export function AgentCard({ a }: { a: Agent }) {
  return (
    <div className="card">
      <div className="between">
        <div>
          <strong>{a.name}</strong>
          <div className="small muted">{a.cat} · {a.city}</div>
        </div>
        <span className={'tag ' + (a.online ? 'go' : 'plain')}>{a.online ? 'Online' : 'Offline'}</span>
      </div>
      <div className="row mt small muted">
        <span>{a.rating}★</span><span>·</span><span>{a.done} tasks</span><span>·</span><span>{a.sla}</span>
      </div>
      <div className="chips mt">{a.skills.slice(0, 4).map((s) => <span key={s} className="tag plain">{s}</span>)}</div>
    </div>
  );
}
