'use client';

import { useEffect, useState } from 'react';
import { onToast, type ToastMsg } from '@/lib/store';

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  useEffect(() => onToast((t) => {
    setToasts((all) => [...all, t]);
    setTimeout(() => setToasts((all) => all.filter((x) => x.id !== t.id)), 3800);
  }), []);
  return (
    <div id="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={'toast ' + (t.kind || '')}>{t.msg}</div>
      ))}
    </div>
  );
}
