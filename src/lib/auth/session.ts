'use client';

/* Demo auth: pick-an-account login, session id stored with the demo DB.
   Production swaps this for NextAuth (phone + OTP via MSG91/Fast2SMS,
   JWT sessions, role claims) — the call sites only use this interface. */

import { getDB, me, commit, track } from '../store';
import type { Role, User } from '../types';

export function currentUser(): User | null {
  return me();
}

export function login(userId: string): Role | null {
  const db = getDB();
  const u = db.users.find((x) => x.id === userId);
  if (!u) return null;
  db.session = userId;
  track('login');
  commit();
  return u.role;
}

export function logout() {
  getDB().session = null;
  commit();
}

/** Where each role lands after sign-in. */
export function homeFor(role: Role): string {
  return role === 'customer' ? '/app/ask'
    : role === 'agent' ? '/agent/dash'
    : role === 'provider' ? '/provider/dash'
    : '/admin/leads';
}
