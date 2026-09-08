import { ReactNode } from 'react';
import type { TaskStatus } from '@/lib/types';

export function Tag({ kind, children }: { kind?: 'warm' | 'go' | 'stop' | 'plain' | 'warn'; children: ReactNode }) {
  return <span className={'tag ' + (kind || '')}>{children}</span>;
}

export function StatusTag({ status }: { status: TaskStatus | string }) {
  const go = ['Completed', 'Refunded'];
  const stop = ['Failed', 'Cancelled'];
  const warm = ['Awaiting confirmation', 'Refund requested', 'Escalated to human', 'Waiting for information'];
  const kind = go.includes(status) ? 'go' : stop.includes(status) ? 'stop' : warm.includes(status) ? 'warm' : undefined;
  return <Tag kind={kind}>{status}</Tag>;
}
