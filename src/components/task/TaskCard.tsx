'use client';

/* The main state-machine card: title + status, four-lane route strip,
   phase body, and a link to the full task page. */

import Link from 'next/link';
import { StatusTag } from '@/components/ui/Tag';
import { taskName } from '@/lib/store';
import { T } from '@/lib/i18n/useT';
import { RouteStrip } from './RouteStrip';
import { PhaseBody } from './PhaseBody';
import type { Task } from '@/lib/types';

export function TaskCard({ task, full, onMic }: { task: Task; full?: boolean; onMic?: () => void }) {
  const ph = task.data.phase || 'ready';
  const cls = ph === 'done' ? 'done' : ph === 'failed' ? 'risk-high' : 'risk-' + task.risk_level;
  return (
    <div className={'taskcard ' + cls} id={'card_' + task.task_id}>
      <div className="between">
        <div>
          <strong>{taskName(task)}</strong>
          <div className="small muted">{task.description}</div>
        </div>
        <StatusTag status={task.status} />
      </div>
      <RouteStrip task={task} />
      <div className="mt"><PhaseBody task={task} onMic={onMic} /></div>
      {full ? null : (
        <Link className="linkish small" href={`/app/task?id=${task.task_id}`}>{T('openTask')}</Link>
      )}
    </div>
  );
}
