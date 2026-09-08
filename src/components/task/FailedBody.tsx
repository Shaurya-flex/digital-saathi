'use client';

/* Red failure card: plain reason, "no money was taken", retry / add-money /
   say-again, and the always-available handover to a person. */

import Link from 'next/link';
import { escalateTask, retryTask, cancelTask } from '@/lib/engine/actions';
import { say, T } from '@/lib/i18n/useT';
import type { Task } from '@/lib/types';

export function FailedBody({ task, onMic }: { task: Task; onMic?: () => void }) {
  const d = task.data;
  return (
    <div className="statebox bad">
      <div className="bigstate">✕ {T('failed')}</div>
      <p className="sline">{say(d.failEn || '', d.failHi || '', d.failHin || '')}</p>
      <p className="small">
        <strong>{T('nothingTaken')}.</strong>{' '}
        {say('Your credits were not used either.', 'आपके क्रेडिट भी नहीं लगे।', 'Aapke credits bhi nahi lage.')}
      </p>
      <div className="arow">
        {d.needMoney ? (
          <>
            <Link className="btn big" href="/app/wallet">{say('Add money', 'पैसे डालिए', 'Paise daaliye')}</Link>
            {d.pendingDone ? (
              <button className="btn go big" onClick={() => retryTask(task)}>✓ {say('I have added it', 'डाल दिए', 'Daal diye')}</button>
            ) : null}
          </>
        ) : d.softFail ? (
          <button className="btn big" onClick={onMic}>🎙️ {T('sayAgain')}</button>
        ) : (
          <button className="btn big" onClick={() => retryTask(task)}>↻ {T('tryAgain')}</button>
        )}
        <button className="btn warm big" onClick={() => escalateTask(task)}>🧑 {T('human')}</button>
      </div>
      <button className="linkish small" onClick={() => cancelTask(task)}>{T('cancel')}</button>
    </div>
  );
}
