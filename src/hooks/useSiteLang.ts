'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { getSiteLang, subscribeSiteLang, type SiteLang } from '@/lib/i18n/siteLang';

/** The public site's En/Hinglish toggle, plus a ready-made `t(en, hinglish)`
    picker so a page can write `t('Pricing', 'Pricing')` inline. Server
    render and the first client paint always show English, avoiding a
    hydration mismatch; the real (possibly saved) value applies right after. */
export function useSiteLang(): { lang: SiteLang; ready: boolean; t: (en: string, hinglish: string) => string } {
  const stored = useSyncExternalStore(subscribeSiteLang, getSiteLang, () => 'en' as SiteLang);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const lang = ready ? stored : 'en';
  return { lang, ready, t: (en, hinglish) => (lang === 'hinglish' ? hinglish : en) };
}
