'use client';

/* Device location for doorstep services. Asked only when the user taps
   "Use my location" — never on load. The fix is cached in the store so the
   nearby list works across pages without re-prompting. */

import { useState } from 'react';
import { getDB, mutate, toast } from '@/lib/store';
import type { GeoPoint, Provider } from '@/lib/types';

export function useGeo() {
  const [busy, setBusy] = useState(false);
  const geo = getDB().ui.geo || null;

  const request = () => {
    if (!('geolocation' in navigator)) {
      toast('This browser cannot share location. Type your locality instead.', 'warn');
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        mutate((db) => {
          db.ui.geo = { lat: pos.coords.latitude, lng: pos.coords.longitude, at: new Date().toISOString() };
        });
        toast('Location set. Showing partners near you.', 'ok');
      },
      () => {
        setBusy(false);
        toast('Location was not shared. You can still search by locality.', 'warn');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  const clear = () => mutate((db) => { db.ui.geo = undefined; });

  return { geo, request, clear, busy };
}

/** Great-circle distance in km. */
export function kmBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2
    + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/** Providers sorted by distance from a point; only those with coordinates. */
export function nearbyProviders(geo: GeoPoint, providers: Provider[]): Array<{ p: Provider; km: number }> {
  return providers
    .filter((p) => p.lat != null && p.lng != null && p.status === 'Verified')
    .map((p) => ({ p, km: kmBetween(geo, { lat: p.lat!, lng: p.lng! }) }))
    .sort((a, b) => a.km - b.km);
}
