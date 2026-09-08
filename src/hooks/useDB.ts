'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { getDB, getVersion, subscribe } from '@/lib/store';
import type { DBShape } from '@/lib/types';

/* Subscribe a component to the demo store. `db` is null during server render
   and the first client paint (so static export and hydration stay identical);
   render a skeleton until `ready`. */
export function useDB(): { db: DBShape | null; ready: boolean; version: number } {
  const version = useSyncExternalStore(subscribe, getVersion, () => -1);
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  return { db: ready ? getDB() : null, ready, version };
}
