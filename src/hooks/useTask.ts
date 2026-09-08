'use client';

import { useDB } from './useDB';
import type { Task } from '@/lib/types';

export function useTask(id: string | null): { task: Task | null; ready: boolean } {
  const { db, ready } = useDB();
  const task = id && db ? db.tasks.find((t) => t.task_id === id) || null : null;
  return { task, ready };
}
