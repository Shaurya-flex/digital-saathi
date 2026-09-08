'use client';

import { useDB } from './useDB';
import type { Notification } from '@/lib/types';

export function useNotifications(): { list: Notification[]; unread: number } {
  const { db } = useDB();
  if (!db || !db.session) return { list: [], unread: 0 };
  const list = db.notifications.filter((n) => n.userId === db.session);
  return { list, unread: list.filter((n) => !n.read).length };
}
