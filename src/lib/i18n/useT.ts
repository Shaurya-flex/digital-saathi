'use client';

import { L } from './strings';
import { me } from '../store';

/** 0 = English, 1 = Hindi, 2 = Hinglish. Other languages fall back to English
    (a note in the UI explains why) so nothing about money is mistranslated. */
export function langIdx(): 0 | 1 | 2 {
  const u = me();
  return u && u.lang === 'hi' ? 1 : u && u.lang === 'hinglish' ? 2 : 0;
}

/** Look a key up in the reviewed string table. */
export function T(k: string): string {
  const v = L[k];
  if (!v) return k;
  return v[langIdx()] || v[0];
}

/** Inline tri-lingual string: say('en text', 'hi text', 'hinglish text'). */
export function say(en: string, hi: string, hin: string): string {
  const i = langIdx();
  return i === 1 ? hi : i === 2 ? hin : en;
}
