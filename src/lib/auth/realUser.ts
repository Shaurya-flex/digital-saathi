'use client';

/* Bridges Supabase auth to the local-first store. On the first Google
   sign-in on a device the fabricated demo database is replaced with the
   clean real-mode seed, then a real customer account is created from the
   Google profile. The store stays the single source of truth the UI reads;
   src/lib/sync/backup.ts mirrors it to Supabase. */

import { isOwnerEmail } from '../owner';
import { REAL_SEED } from '../seed';
import { getDB, addCredits, commit, replaceDB, track } from '../store';
import type { User } from '../types';
import type { SupaUser } from './supabase';

export const realUserId = (su: SupaUser) => 'g_' + su.id.replace(/-/g, '').slice(0, 12);

/** Make sure a store account exists for this Google user and sign it in. */
export function ensureRealUser(su: SupaUser): User {
  let db = getDB();
  if (db.mode !== 'real') {
    // First real sign-in on this device: drop all fabricated demo data.
    replaceDB(REAL_SEED());
    db = getDB();
  }
  const id = realUserId(su);
  let u = db.users.find((x) => x.id === id);
  if (!u) {
    const meta = (su.user_metadata || {}) as Record<string, string>;
    u = {
      id,
      name: meta.full_name || meta.name || su.email?.split('@')[0] || 'Saathi user',
      role: isOwnerEmail(su.email) ? 'admin' : 'customer',
      email: su.email || undefined,
      phone: su.phone || undefined,
      city: '',
      lang: 'hinglish',
      plan: 'free',
      credits: 0,
      wallet: 0,
      easy: false,
      avatar: (meta.full_name || su.email || 'S U').split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase(),
      memory: {},
    };
    db.users.push(u);
    addCredits(id, 50, 'Welcome — Free plan credits');
    track('signup_google');
  } else if (isOwnerEmail(su.email) && u.role !== 'admin') {
    // Owner list changed after this account was created — promote.
    u.role = 'admin';
  }
  db.session = id;
  commit();
  return u;
}
