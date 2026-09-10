'use client';

/* Cloud backup: mirrors the signed-in user's Saathi data to Supabase so it
   survives a cleared browser and follows them across devices.

   Table (see docs/SUPABASE.md for SQL + row-level security):
     saathi_backups(user_id uuid primary key, db jsonb, updated_at timestamptz)

   Strategy: local-first. Every store commit schedules a debounced upsert of
   the whole DBShape. On sign-in, if the cloud copy is newer than what this
   device has seen, it replaces the local store before the UI settles. */

import { localIdForUuid } from '../auth/realUser';
import { supabase } from '../auth/supabase';
import { getDB, replaceDB, subscribe, toast } from '../store';
import type { DBShape } from '../types';

const TABLE = 'saathi_backups';
const PROFILES = 'saathi_profiles';
let stop: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let pushing = false;

async function push(supaUserId: string) {
  const sb = supabase();
  if (!sb || pushing) return;
  pushing = true;
  try {
    const db = getDB();
    const now = new Date().toISOString();
    await sb.from(TABLE).upsert({ user_id: supaUserId, db, updated_at: now });
    // Lightweight, listable index for Admin → Users — see docs/SUPABASE.md §6.
    const u = db.users.find((x) => x.id === localIdForUuid(supaUserId));
    if (u) {
      await sb.from(PROFILES).upsert({
        user_id: supaUserId, name: u.name, email: u.email || '', phone: u.phone || '',
        city: u.city || '', lang: u.lang || '', role: u.role,
        plan: u.plan || '', credits: u.credits || 0, wallet: u.wallet || 0,
        easy: !!u.easy, updated_at: now,
      });
    }
  } catch { /* offline is fine — next commit retries */ }
  pushing = false;
}

/** Pull the cloud copy; returns true when it replaced the local store. */
export async function restoreBackup(supaUserId: string): Promise<boolean> {
  const sb = supabase();
  if (!sb) return false;
  try {
    const { data } = await sb.from(TABLE).select('db, updated_at').eq('user_id', supaUserId).maybeSingle();
    if (!data?.db) return false;
    const cloud = data.db as DBShape;
    const local = getDB();
    // Restore when this device has no real data yet, or the cloud copy is newer.
    if (local.mode !== 'real' || (data.updated_at && data.updated_at > local.seededAt)) {
      cloud.seededAt = data.updated_at || cloud.seededAt;
      replaceDB(cloud);
      toast('Your Saathi data is restored from backup.', 'ok');
      return true;
    }
  } catch { /* table missing or offline — keep local */ }
  return false;
}

/** Start mirroring store commits to the cloud (idempotent). */
export function startBackup(supaUserId: string) {
  if (stop) return;
  stop = subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => push(supaUserId), 4000);
  });
}

export function stopBackup() {
  if (timer) clearTimeout(timer);
  timer = null;
  stop?.();
  stop = null;
}
