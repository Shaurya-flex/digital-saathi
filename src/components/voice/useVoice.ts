'use client';

/* Web Speech API hook (the browser half of the stt adapter). States drive
   the voice sheet: listening → heard → confirm-before-acting. When the
   browser has no SpeechRecognition, the sheet falls back to typing. */

import { useCallback, useEffect, useRef, useState } from 'react';

type SR = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void;
};

export type VoiceState = 'idle' | 'listening' | 'heard' | 'error' | 'unsupported';

export function useVoice(lang: string) {
  const recRef = useRef<SR | null>(null);
  const [state, setState] = useState<VoiceState>('idle');
  const [text, setText] = useState('');

  const supported = typeof window !== 'undefined' &&
    Boolean((window as unknown as Record<string, unknown>).SpeechRecognition ||
            (window as unknown as Record<string, unknown>).webkitSpeechRecognition);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* already stopped */ }
    recRef.current = null;
  }, []);

  const start = useCallback(() => {
    const w = window as unknown as Record<string, unknown>;
    const Ctor = (w.SpeechRecognition || w.webkitSpeechRecognition) as (new () => SR) | undefined;
    if (!Ctor) { setState('unsupported'); return; }
    stop();
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    setText('');
    setState('listening');
    rec.onresult = (e) => {
      const results = Array.from(e.results as ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>);
      const txt = results.map((r) => r[0].transcript).join('');
      setText(txt);
      const last = results[results.length - 1];
      if (last && last.isFinal) { stop(); setState('heard'); }
    };
    rec.onerror = () => { setState('error'); };
    try { rec.start(); } catch { setState('error'); }
  }, [lang, stop]);

  useEffect(() => stop, [stop]);

  return { state, text, supported, start, stop, setState, setText };
}
