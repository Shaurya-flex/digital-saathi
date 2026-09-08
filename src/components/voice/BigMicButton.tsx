'use client';

import { T } from '@/lib/i18n/useT';

/* The 150px mic (190px in Easy Mode — CSS handles the scale). */
export function BigMicButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="bigmic" onClick={onClick} aria-label={T('tapSpeak')}>
      <span aria-hidden="true">🎙️</span>
    </button>
  );
}
