'use client';

import { useEffect } from 'react';
import { useDB } from '@/hooks/useDB';
import { Toaster } from '@/components/ui/Toast';
import { ModalHost } from '@/components/task/modals';
import { ensureTicker } from '@/lib/engine/tracker';

/* Mounted once in the root layout: keeps Easy Mode's <html data-easy> in
   sync and restarts the live-tracker ticker when tracked tasks exist. */
export function AppBoot() {
  const { db, version } = useDB();
  useEffect(() => {
    const u = db?.users.find((x) => x.id === db.session);
    document.documentElement.dataset.easy = u?.easy ? '1' : '0';
    if (db?.tasks.some((t) => t.data.track && t.data.phase === 'tracking')) ensureTicker();
  }, [db, version]);
  return (
    <>
      <Toaster />
      <ModalHost />
    </>
  );
}
