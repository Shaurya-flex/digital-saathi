import { getDB, me, uid, now, track, chargeCredits, askAloud, commit } from '../store';
import { taskName } from '../store';
import { recordRequest, syncRequestStatus } from '../sync/requests';
import type { Risk, Task, TaskData, TaskStatus, ThreadMsg } from '../types';

export const STATUSES: TaskStatus[] = [
  'New', 'Understanding', 'Waiting for information', 'Awaiting confirmation', 'Executing',
  'Waiting for third party', 'Escalated to human', 'Assigned to local provider', 'In progress',
  'Completed', 'Failed', 'Cancelled', 'Refund requested', 'Refunded',
];

export interface CreateTaskInput {
  category: string;
  subcategory?: string;
  description: string;
  intent: string;
  priority?: string;
  estimated_cost?: number;
  platform_cost?: number;
  user_price?: number;
  credits_required?: number;
  risk_level?: Risk;
  attachments?: unknown[];
  steps?: unknown[];
  data?: TaskData;
}

export function createTask(o: CreateTaskInput): Task {
  const db = getDB();
  const u = me();
  const t: Task = {
    task_id: uid('t'),
    user_id: u ? u.id : 'guest',
    category: o.category,
    subcategory: o.subcategory || '',
    description: o.description,
    intent: o.intent,
    status: 'Understanding',
    priority: o.priority || 'Normal',
    estimated_cost: o.estimated_cost || 0,
    platform_cost: o.platform_cost || 0,
    user_price: o.user_price || 0,
    credits_required: o.credits_required || 0,
    assigned_agent: null,
    assigned_provider: null,
    risk_level: o.risk_level || 'low',
    requires_confirmation: (o.risk_level || 'low') !== 'low',
    confirmation_status: 'not required',
    created_at: now(),
    updated_at: now(),
    completed_at: null,
    result: null,
    attachments: o.attachments || [],
    audit_log: [],
    steps: o.steps || [],
    data: o.data || {},
  };
  if (t.requires_confirmation) t.confirmation_status = 'pending';
  logTask(t, 'Task created', `Intent detected: ${o.intent}. Risk level: ${t.risk_level}.`);
  db.tasks.unshift(t);
  track('task_created', { intent: o.intent });
  recordRequest(t); // mirror to the operator's desk (real mode only, fire-and-forget)
  return t;
}

/** Append-only audit log — every consequential action lands here. */
export function logTask(t: Task, action: string, detail = '') {
  t.audit_log.push({ at: now(), by: getDB().session || 'system', action, detail });
  t.updated_at = now();
}

export function setStatus(t: Task, s: TaskStatus, detail?: string) {
  t.status = s;
  logTask(t, 'Status → ' + s, detail);
  syncRequestStatus(t); // keep the operator's desk current (real mode only)
}

/** Plain-language trail shown as "What happened" on the task detail page. */
export function step(t: Task, label: string, state: 'now' | 'ok' = 'now') {
  t.data.trail = t.data.trail || [];
  t.data.trail.forEach((s) => { if (s.state === 'now') s.state = 'ok'; });
  t.data.trail.push({ label, state });
}

/* ---------- conversation thread ---------- */
export function thread(): ThreadMsg[] {
  const db = getDB();
  if (!db.session) return [];
  db.threads = db.threads || {};
  db.threads[db.session] = db.threads[db.session] || [];
  return db.threads[db.session];
}

export function pushMsg(who: 'user' | 'ai', text: string, taskId?: string) {
  thread().push({ who, text, taskId, at: now() });
}

/** Charge credits and complete a task with a plain-language result. */
export function finishNow(t: Task, resultText: string) {
  chargeCredits(t, t.credits_required, taskName(t));
  t.data.phase = 'done';
  t.data.result = resultText;
  setStatus(t, 'Completed', 'Answer delivered');
  t.completed_at = now();
  track('task_completed', { intent: t.intent });
  commit();
  askAloud(resultText);
}
