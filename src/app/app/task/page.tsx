'use client';

/* Task detail: full card, you-pay/credits/started stats, plain-language
   "what happened" trail, actions, and the collapsed technical audit log.
   Addressed as /app/task?id=… so the static export needs no dynamic route. */

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CustomerShell } from '@/components/layout/Shell';
import { TaskCard } from '@/components/task/TaskCard';
import { openDispute, openReview } from '@/components/task/modals';
import { useTask } from '@/hooks/useTask';
import { escalateTask, handleAsk } from '@/lib/engine/actions';
import { say, T } from '@/lib/i18n/useT';
import { money, when } from '@/lib/store';

function TaskDetail() {
  const params = useSearchParams();
  const id = params.get('id');
  const { task: t, ready } = useTask(id);
  const router = useRouter();

  if (!ready) return <CustomerShell active="tasks"><div /></CustomerShell>;
  if (!t) return <CustomerShell active="tasks"><div className="card">Task not found.</div></CustomerShell>;
  const done = t.data.phase === 'done';

  return (
    <CustomerShell active="tasks">
      <Link className="linkish" href="/app/tasks">← {T('back')}</Link>
      <div className="panel taskdetail">
        <TaskCard task={t} full />
        <div className="detailgrid">
          {t.user_price ? (
            <div><span className="small muted">{T('youPay')}</span><b>{money(t.user_price)}</b></div>
          ) : null}
          <div><span className="small muted">{say('Credits', 'क्रेडिट', 'Credits')}</span><b>{t.credits_required}</b></div>
          <div><span className="small muted">{say('Started', 'शुरू हुआ', 'Shuru hua')}</span><b className="s">{when(t.created_at)}</b></div>
        </div>
        <h3 className="mt2">{T('whatHappened')}</h3>
        <ul className="steps plain">
          {(t.data.trail || []).length ? (t.data.trail || []).map((s, i) => (
            <li key={i} className={s.state}><span className="mark">{s.state === 'ok' ? '✓' : '●'}</span>{s.label}</li>
          )) : (
            <li className="ok"><span className="mark">✓</span>{say('Request received', 'अनुरोध मिला', 'Request mila')}</li>
          )}
        </ul>
        <div className="row mt">
          <button className="btn ghost" onClick={() => { handleAsk(t.description); router.push('/app/ask'); }}>↻ {T('repeat')}</button>
          {done ? <button className="btn ghost" onClick={() => openReview(t.task_id)}>{T('rate')}</button> : null}
          <button className="btn ghost" onClick={() => openDispute(t.task_id)}>{T('problem')}</button>
          <button className="btn warm" onClick={() => escalateTask(t)}>🧑 {T('humanShort')}</button>
        </div>
        <details className="mt2">
          <summary className="small muted">{say('Technical record', 'तकनीकी रिकॉर्ड', 'Technical record')}</summary>
          <div className="scroll mt">
            <table>
              <tbody>
                <tr><th>When</th><th>By</th><th>Action</th><th>Detail</th></tr>
                {t.audit_log.map((l, i) => (
                  <tr key={i}>
                    <td className="tiny">{when(l.at)}</td>
                    <td className="tiny">{l.by}</td>
                    <td className="small">{l.action}</td>
                    <td className="tiny muted">{l.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </CustomerShell>
  );
}

export default function TaskPage() {
  return <Suspense fallback={null}><TaskDetail /></Suspense>;
}
