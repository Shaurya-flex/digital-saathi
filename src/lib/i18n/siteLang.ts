'use client';

/* The public site's own English/Hinglish switch — separate from the
   signed-in customer app's full 12-language system (src/lib/i18n/useT.ts).
   English is the default for every visitor; flipping this toggle re-renders
   the marketing pages in Hinglish. Kept in localStorage, mirrored into a
   signed-in customer's own `lang` field so the two stay coherent. */

export type SiteLang = 'en' | 'hinglish';
const KEY = 'saathi_site_lang';

let lang: SiteLang = 'en';
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'hinglish' || saved === 'en') lang = saved;
  } catch { /* localStorage unavailable — default stands */ }
}

export function getSiteLang(): SiteLang {
  hydrate();
  return lang;
}

export function setSiteLang(l: SiteLang) {
  lang = l;
  try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  listeners.forEach((fn) => fn());
}

export function subscribeSiteLang(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
