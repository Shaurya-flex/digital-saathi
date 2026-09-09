'use client';

/* The operator's "digital desk": every real service request and every
   partner/agent application is recorded server-side in Supabase, so the
   owner sees incoming work in Admin → Requests inbox and can deliver it.
   Without this, the local-first store keeps each user's tasks in their own
   browser and nothing would ever reach the operator.

   Tables + row-level security: docs/SUPABASE.md. Users can only read/write
   their own request rows; only owner accounts can read everything. All
   calls are fire-and-forget — an offline user still gets the local flow. */

import { supabase } from '../auth/supabase';
import { getDB } from '../store';
import type { Task } from '../types';

const REQUESTS = 'saathi_requests';
const APPLICATIONS = 'saathi_applications';

/** Which statuses are worth mirroring to the operator. */
const SYNC_STATUSES = new Set([
  'Understanding', 'Waiting for information', 'Awaiting confirmation', 'Executing',
  'Escalated to human', 'Assigned to local provider', 'In progress',
  'Completed', 'Failed', 'Cancelled', 'Refund requested', 'Refunded',
]);

function eligible(): boolean {
  const db = getDB();
  return db.mode === 'real' && !!db.session && !!supabase();
}

/** Record a newly created task on the operator's desk. */
export function recordRequest(t: Task) {
  if (!eligible()) return;
  const sb = supabase()!;
  void (async () => {
    try {
      const { data } = await sb.auth.getSession();
      const su = data.session?.user;
      if (!su) return;
      const db = getDB();
      const u = db.users.find((x) => x.id === db.session);
      await sb.from(REQUESTS).insert({
        user_id: su.id,
        task_id: t.task_id,
        name: u?.name || '',
        email: su.email || '',
        phone: u?.phone || '',
        city: u?.city || '',
        lang: u?.lang || '',
        intent: t.intent,
        category: t.category,
        description: t.description,
        status: t.status,
      });
    } catch { /* offline / table missing — local flow continues */ }
  })();
}

/** Mirror a status change (and final result) to the operator's desk. */
export function syncRequestStatus(t: Task) {
  if (!eligible() || !SYNC_STATUSES.has(t.status)) return;
  const sb = supabase()!;
  void (async () => {
    try {
      const { data } = await sb.auth.getSession();
      const su = data.session?.user;
      if (!su) return;
      await sb.from(REQUESTS)
        .update({ status: t.status, result: t.result || null, updated_at: new Date().toISOString() })
        .eq('task_id', t.task_id)
        .eq('user_id', su.id);
    } catch { /* ignore */ }
  })();
}

export interface ApplicationInput {
  kind: 'provider' | 'agent';
  name: string;
  phone: string;
  city?: string;
  data?: Record<string, unknown>;
}

/** Record a partner/agent application. Returns true when it reached the
    server (anonymous submissions are allowed — no sign-in barrier for
    professionals applying from a shared phone). */
export async function submitApplication(a: ApplicationInput): Promise<boolean> {
  const sb = supabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from(APPLICATIONS).insert({
      kind: a.kind, name: a.name, phone: a.phone, city: a.city || '', data: a.data || {},
    });
    return !error;
  } catch {
    return false;
  }
}

/* ---------- owner-side reads (RLS lets only owner accounts see all) ---------- */

export interface RequestRow {
  id: string; task_id: string; name: string; email: string; phone: string;
  city: string; lang: string; intent: string; category: string; description: string;
  status: string; result: string | null; created_at: string; updated_at: string;
}
export interface ApplicationRow {
  id: string; kind: 'provider' | 'agent'; name: string; phone: string; city: string;
  data: Record<string, unknown>; status: string; created_at: string;
}

export async function fetchAllRequests(): Promise<RequestRow[] | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.from(REQUESTS).select('*').order('created_at', { ascending: false }).limit(200);
  return error ? null : (data as RequestRow[]);
}

export async function fetchAllApplications(): Promise<ApplicationRow[] | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.from(APPLICATIONS).select('*').order('created_at', { ascending: false }).limit(200);
  return error ? null : (data as ApplicationRow[]);
}

export async function setRequestStatusAsOwner(id: string, status: string): Promise<boolean> {
  const sb = supabase();
  if (!sb) return false;
  const { error } = await sb.from(REQUESTS).update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  return !error;
}

export async function setApplicationStatusAsOwner(id: string, status: string): Promise<boolean> {
  const sb = supabase();
  if (!sb) return false;
  const { error } = await sb.from(APPLICATIONS).update({ status }).eq('id', id);
  return !error;
}
