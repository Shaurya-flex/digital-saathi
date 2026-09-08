'use client';

/* Full-screen listening sheet: pulsing halo, live transcript, and the
   "Aapne kaha: X" confirmation step before any action is taken. Falls back
   to typing when the browser has no speech recognition. */

import { useEffect, useState } from 'react';
import { useVoice } from './useVoice';
import { T, langIdx } from '@/lib/i18n/useT';
import { me, speakNow } from '@/lib/store';

export function VoiceSheet({ onSubmit, onClose }: {
  onSubmit: (text: string) => void;
  onClose: () => void;
}) {
  const lang = langIdx() ? 'hi-IN' : 'en-IN';
  const { state, text, supported, start, stop, setState } = useVoice(lang);
  const [typed, setTyped] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (supported) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state === 'heard') {
      const u = me();
      if (u && u.easy) speakNow(T('heard') + ': ' + text);
    }
  }, [state, text]);

  const showTyping = typing || !supported || state === 'unsupported';
  const quiet = state !== 'listening';

  const submitTyped = () => {
    const v = typed.trim();
    onClose();
    if (v) onSubmit(v);
  };

  return (
    <div className="overlay voicesheet" onClick={(e) => { if (e.target === e.currentTarget) { stop(); onClose(); } }}>
      <div className="vpanel">
        <div className={'vhalo' + (quiet ? ' quiet' : '')}><span aria-hidden="true">🎙️</span></div>
        <p className="vstate">
          {showTyping ? T('typeInstead')
            : state === 'listening' ? T('listening')
            : state === 'heard' ? T('heard')
            : state === 'error' ? T('sayAgain')
            : T('listening')}
        </p>
        <p className="vtext">{text}</p>
        <div className="vactions">
          {showTyping ? (
            <>
              <input
                type="text" placeholder={T('orType')} value={typed} autoFocus
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitTyped(); }}
              />
              <button className="btn" onClick={submitTyped}>{T('send')}</button>
              <button className="btn ghost" onClick={() => { stop(); onClose(); }}>{T('cancel')}</button>
            </>
          ) : state === 'heard' ? (
            <>
              <button className="btn go" onClick={() => { onClose(); onSubmit(text); }}>✓ {T('yesThis')}</button>
              <button className="btn ghost" onClick={() => start()}>{T('sayAgain')}</button>
              <button className="btn ghost" onClick={() => { stop(); setTyping(true); setState('idle'); }}>{T('typeInstead')}</button>
            </>
          ) : state === 'error' ? (
            <>
              <button className="btn" onClick={() => start()}>{T('sayAgain')}</button>
              <button className="btn ghost" onClick={() => { stop(); setTyping(true); setState('idle'); }}>{T('typeInstead')}</button>
            </>
          ) : (
            <button className="btn ghost" onClick={() => { stop(); onClose(); }}>{T('stop')}</button>
          )}
        </div>
      </div>
    </div>
  );
}
