'use client';

import { useEffect, useRef } from 'react';
import { useDB } from '@/hooks/useDB';
import { Toaster } from '@/components/ui/Toast';
import { ModalHost } from '@/components/task/modals';
import { ensureTicker } from '@/lib/engine/tracker';
import { ensureRealUser } from '@/lib/auth/realUser';
import { onAuthChange } from '@/lib/auth/supabase';
import { logout } from '@/lib/auth/session';
import { restoreBackup, startBackup, stopBackup } from '@/lib/sync/backup';
import { fetchLiveAgents, fetchLiveProviders } from '@/lib/sync/marketplace';
import { getDB, mutate, notify } from '@/lib/store';

/* Mounted once in the root layout: keeps Easy Mode's <html data-easy> in
   sync, restarts the live-tracker ticker when tracked tasks exist, binds
   the Supabase session to the store, and surfaces due reminders. */
export function AppBoot() {
  const { db, version, ready } = useDB();
  const marketplaceLoaded = useRef(false);

  // Real customers see the live, shared catalogue (docs/SUPABASE.md §7) —
  // not a per-browser demo seed. Loaded once per session; a fresh approval
  // shows up on the next sign-in or reload.
  useEffect(() => {
    if (!ready || !db || db.mode !== 'real' || marketplaceLoaded.current) return;
    marketplaceLoaded.current = true;
    void (async () => {
      const [providers, agents] = await Promise.all([fetchLiveProviders(), fetchLiveAgents()]);
      if (providers.length || agents.length) {
        mutate((d) => { d.providers = providers; d.agents = agents; });
      }
    })();
  }, [ready, db]);

  useEffect(() => {
    const u = db?.users.find((x) => x.id === db.session);
    document.documentElement.dataset.easy = u?.easy ? '1' : '0';
    if (db?.tasks.some((t) => t.data.track && t.data.phase === 'tracking')) ensureTicker();
  }, [db, version]);

  // Supabase session ⇄ store session. Fires immediately with the current
  // session (page refresh, OAuth return) and again on sign-in/out.
  useEffect(() => {
    return onAuthChange(async (su) => {
      if (su) {
        await restoreBackup(su.id);
        ensureRealUser(su);
        startBackup(su.id);
      } else {
        stopBackup();
        if (getDB().mode === 'real') logout();
      }
    });
  }, []);

  // Due reminders → one in-app alert per day each.
  useEffect(() => {
    if (!ready || !db || !db.session) return;
    const today = new Date().toISOString().slice(0, 10);
    const due = db.reminders.filter((r) =>
      r.userId === db.session && r.nextDue.slice(0, 10) <= today && r.lastNotified !== today);
    if (!due.length) return;
    mutate(() => {
      due.forEach((r) => {
        r.lastNotified = today;
        notify(r.userId, 'Reminder: ' + r.title,
          (r.amount ? `About ₹${r.amount}. ` : '') + 'Open Alerts to do it in one tap.', 'warn');
      });
    });
  }, [ready, db, version]);

  return (
    <>
      <Toaster />
      <ModalHost />
    </>
  );
}
