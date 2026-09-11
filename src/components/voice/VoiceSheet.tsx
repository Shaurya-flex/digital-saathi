'use client';

/* Full-screen listening sheet: pulsing halo, live transcript, and the
   "Aapne kaha: X" confirmation step before any action is taken.
   Three ways to hear the user, in order of preference:
   1. the browser's own SpeechRecognition (instant, most Chrome/Android);
   2. record a short clip and transcribe it server-side with Sarvam — for
      browsers without SpeechRecognition (Firefox, many in-app browsers),
      when the deployment has a Sarvam key and the user is signed in;
   3. typing. */

import { useEffect, useRef, useState } from 'react';
import { useVoice } from './useVoice';
import { T, langIdx } from '@/lib/i18n/useT';
import { me, speakNow } from '@/lib/store';
import { aiAvailable } from '@/lib/ai/client';
import { transcribeAudio } from '@/lib/ai/speech';

const MAX_CLIP_MS = 20000;

export function VoiceSheet({ onSubmit, onClose }: {
  onSubmit: (text: string) => void;
  onClose: () => void;
}) {
  const lang = langIdx() ? 'hi-IN' : 'en-IN';
  const appLang = me()?.lang || 'en';
  const { state, text, supported, start, stop, setState } = useVoice(lang);
  const [typed, setTyped] = useState('');
  const [typing, setTyping] = useState(false);

  // Recorder path (no SpeechRecognition, Sarvam available).
  const canRecord = !supported && aiAvailable() && typeof window !== 'undefined'
    && 'MediaRecorder' in window && Boolean(navigator.mediaDevices?.getUserMedia);
  const [rec, setRec] = useState<'idle' | 'recording' | 'sending' | 'heard' | 'error'>('idle');
  const [recText, setRecText] = useState('');
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (supported) start();
    return () => { if (timer.current) clearTimeout(timer.current); recorder.current?.stream.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state === 'heard' || rec === 'heard') {
      const u = me();
      if (u && u.easy) speakNow(T('heard') + ': ' + (rec === 'heard' ? recText : text));
    }
  }, [state, rec, text, recText]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      r.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      r.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRec('sending');
        const blob = new Blob(chunks.current, { type: r.mimeType || 'audio/webm' });
        const txt = await transcribeAudio(blob, appLang);
        if (txt) { setRecText(txt); setRec('heard'); } else setRec('error');
      };
      r.start();
      recorder.current = r;
      setRec('recording');
      timer.current = setTimeout(() => { if (r.state === 'recording') r.stop(); }, MAX_CLIP_MS);
    } catch {
      setRec('error');
    }
  };
  const stopRecording = () => {
    if (timer.current) clearTimeout(timer.current);
    if (recorder.current?.state === 'recording') recorder.current.stop();
  };

  const showTyping = typing || (!supported && !canRecord) || state === 'unsupported';
  const listening = state === 'listening' || rec === 'recording';
  const quiet = !listening;

  const submitTyped = () => {
    const v = typed.trim();
    onClose();
    if (v) onSubmit(v);
  };
  const close = () => { stop(); stopRecording(); onClose(); };
  const switchToTyping = () => { stop(); stopRecording(); setTyping(true); setState('idle'); setRec('idle'); };

  const heardText = rec === 'heard' ? recText : text;
  const stateLabel = showTyping ? T('typeInstead')
    : state === 'listening' || rec === 'recording' ? T('listening')
    : state === 'heard' || rec === 'heard' ? T('heard')
    : rec === 'sending' ? T('thinking')
    : state === 'error' || rec === 'error' ? T('sayAgain')
    : canRecord ? T('tapSpeak')
    : T('listening');

  return (
    <div className="overlay voicesheet" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="vpanel">
        <div className={'vhalo' + (quiet ? ' quiet' : '')}><span aria-hidden="true">🎙️</span></div>
        <p className="vstate">{stateLabel}</p>
        <p className="vtext">{heardText}</p>
        <div className="vactions">
          {showTyping ? (
            <>
              <input
                type="text" placeholder={T('orType')} value={typed} autoFocus
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitTyped(); }}
              />
              <button className="btn" onClick={submitTyped}>{T('send')}</button>
              <button className="btn ghost" onClick={close}>{T('cancel')}</button>
            </>
          ) : state === 'heard' || rec === 'heard' ? (
            <>
              <button className="btn go" onClick={() => { onClose(); onSubmit(heardText); }}>✓ {T('yesThis')}</button>
              <button className="btn ghost" onClick={() => { if (supported) start(); else { setRec('idle'); void startRecording(); } }}>{T('sayAgain')}</button>
              <button className="btn ghost" onClick={switchToTyping}>{T('typeInstead')}</button>
            </>
          ) : state === 'error' || rec === 'error' ? (
            <>
              <button className="btn" onClick={() => { if (supported) start(); else { setRec('idle'); void startRecording(); } }}>{T('sayAgain')}</button>
              <button className="btn ghost" onClick={switchToTyping}>{T('typeInstead')}</button>
            </>
          ) : canRecord && rec === 'idle' ? (
            <>
              <button className="btn go" onClick={() => void startRecording()}>🎙️ {T('tapSpeak')}</button>
              <button className="btn ghost" onClick={switchToTyping}>{T('typeInstead')}</button>
            </>
          ) : rec === 'recording' ? (
            <button className="btn" onClick={stopRecording}>■ {T('stop')}</button>
          ) : rec === 'sending' ? (
            <button className="btn ghost" disabled>{T('thinking')}</button>
          ) : (
            <button className="btn ghost" onClick={close}>{T('stop')}</button>
          )}
        </div>
      </div>
    </div>
  );
}
