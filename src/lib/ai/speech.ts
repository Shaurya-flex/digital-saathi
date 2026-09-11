'use client';

/* Browser side of the speech layer. Natural Indian-language voices and
   Indic speech recognition come from our own /api/tts and /api/stt (Sarvam,
   server-side key); both return null on any failure so the caller can use
   the browser's built-in speech APIs instead. */

import { accessToken } from '../auth/supabase';
import { aiAvailable } from './client';

let current: HTMLAudioElement | null = null;

// A deployment without a Sarvam key answers 503 once; remember that for the
// rest of the page session so Easy Mode's read-aloud never waits on a
// round trip it cannot win.
let ttsUnavailable = false;

/** Play `text` in a natural voice. Resolves true only if audio started. */
export async function sarvamSpeak(text: string, lang: string): Promise<boolean> {
  if (ttsUnavailable || !aiAvailable()) return false;
  try {
    const token = await accessToken();
    if (!token) return false;
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ text: text.slice(0, 1000), lang }),
    });
    if (res.status === 503) ttsUnavailable = true;
    if (!res.ok) return false;
    const j = (await res.json()) as { audio?: string; mime?: string };
    if (!j.audio) return false;
    if (current) { current.pause(); current = null; }
    current = new Audio(`data:${j.mime || 'audio/wav'};base64,${j.audio}`);
    await current.play();
    return true;
  } catch {
    return false;
  }
}

export function stopSarvamSpeech() {
  if (current) { current.pause(); current = null; }
}

/** Transcribe a recorded clip; null if unavailable or nothing understood. */
export async function transcribeAudio(blob: Blob, lang: string): Promise<string | null> {
  if (!aiAvailable()) return null;
  try {
    const token = await accessToken();
    if (!token) return null;
    const form = new FormData();
    form.append('audio', blob, 'clip.' + ((blob.type.split('/')[1] || 'webm').replace(/;.*$/, '')));
    form.append('lang', lang);
    const res = await fetch('/api/stt', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form });
    if (!res.ok) return null;
    const j = (await res.json()) as { transcript?: string };
    return j.transcript?.trim() || null;
  } catch {
    return null;
  }
}
