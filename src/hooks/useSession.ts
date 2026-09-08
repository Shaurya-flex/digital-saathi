'use client';

import { useDB } from './useDB';
import type { User } from '@/lib/types';

export function useSession(): { user: User | null; ready: boolean } {
  const { db, ready } = useDB();
  const user = db ? db.users.find((u) => u.id === db.session) || null : null;
  return { user, ready };
}
