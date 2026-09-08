'use client';

/* Renders the right body for each of the nine task phases. */

import { ClarifyBody } from './ClarifyBody';
import { OptionsBody } from './OptionsBody';
import { ApproveBody } from './ApproveBody';
import { WorkingBody } from './WorkingBody';
import { DoneBody } from './DoneBody';
import { FailedBody } from './FailedBody';
import { ProviderTracker } from './ProviderTracker';
import { AgentTracker } from './AgentTracker';
import { say, T } from '@/lib/i18n/useT';
import type { Task } from '@/lib/types';

function Thinking({ label }: { label: string }) {
  return (
    <div className="thinking">
      <span className="dots"><i /><i /><i /></span> {label}
    </div>
  );
}

export function PhaseBody({ task, onMic }: { task: Task; onMic?: () => void }) {
  switch (task.data.phase) {
    case 'thinking': return <Thinking label={T('thinking')} />;
    case 'routing': return <Thinking label={say('Deciding who should do this…', 'तय कर रहा हूँ कि यह काम कौन करे…', 'Tay kar raha hoon ki ye kaam kaun kare…')} />;
    case 'tracking':
      return task.data.track?.kind === 'provider' ? <ProviderTracker task={task} /> : <AgentTracker task={task} />;
    case 'clarify': return <ClarifyBody task={task} />;
    case 'ready': return <OptionsBody task={task} />;
    case 'approve': return <ApproveBody task={task} />;
    case 'working': return <WorkingBody task={task} />;
    case 'done': return <DoneBody task={task} />;
    case 'failed': return <FailedBody task={task} onMic={onMic} />;
    case 'cancelled': return <p className="small muted" style={{ margin: 0 }}>{T('cancelled')}. {T('nothingTaken')}.</p>;
    default: return <p className="small muted" style={{ margin: 0 }}>{T('thinking')}</p>;
  }
}
