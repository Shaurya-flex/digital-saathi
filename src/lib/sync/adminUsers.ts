'use client';

/* Owner-only reads over real, signed-up users — enforced by Row Level
   Security (docs/SUPABASE.md §6), not just by hiding the button. A non-owner
   session gets an empty/failed read from Supabase regardless of what the UI
   shows. Used by Admin → Users to list who has signed up and to open a
   read-only preview of one account exactly as that person sees it. */

import { localIdForUuid } from '../auth/realUser';
import { supabase } from '../auth/supabase';
import type { Booking, DBShape, Doc, FamilyMember, LedgerEntry, Notification, Review, Task, User } from '../types';

export interface ProfileRow {
  user_id: string; name: string; email: string; phone: string; city: string;
  lang: string; role: string; plan: string; credits: number; wallet: number;
  easy: boolean; updated_at: string;
}

export async function fetchAllProfiles(): Promise<ProfileRow[] | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.from('saathi_profiles').select('*').order('updated_at', { ascending: false }).limit(500);
  return error ? null : (data as ProfileRow[]);
}

/** One user's own slice of their backup — never the whole shared local
    store that happened to be cached on their device. */
export interface UserSnapshot {
  user: User | null;
  tasks: Task[];
  bookings: Booking[];
  documents: Doc[];
  notifications: Notification[];
  reviews: Review[];
  ledger: LedgerEntry[];
  family: FamilyMember[];
  backedUpAt: string;
}

export async function fetchUserSnapshot(authUserId: string): Promise<UserSnapshot | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.from('saathi_backups').select('db, updated_at').eq('user_id', authUserId).maybeSingle();
  if (error || !data?.db) return null;
  const db = data.db as DBShape;
  const localId = localIdForUuid(authUserId);
  return {
    user: db.users.find((u) => u.id === localId) || null,
    tasks: db.tasks.filter((t) => t.user_id === localId),
    bookings: db.bookings.filter((b) => b.userId === localId),
    documents: db.documents.filter((d) => d.userId === localId),
    notifications: db.notifications.filter((n) => n.userId === localId),
    reviews: db.reviews.filter((r) => r.userId === localId),
    ledger: db.ledger.filter((l) => l.userId === localId),
    family: db.family.filter((f) => f.ownerId === localId),
    backedUpAt: data.updated_at || '',
  };
}
