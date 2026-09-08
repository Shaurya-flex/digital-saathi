'use client';

/* My Tasks: all tasks (plus linked family members' tasks) with status,
   credits, amount and time. */

import Link from 'next/link';
import { CustomerShell } from '@/components/layout/Shell';
import { StatusTag } from '@/components/ui/Tag';
import { useDB } from '@/hooks/useDB';
import { me, money, when } from '@/lib/store';
import type { Task } from '@/lib/types';

function Rows({ list }: { list: Task[] }) {
  if (!list.length) {
    return <tr><td colSpan={5} className="muted small">Nothing here yet. Ask Saathi for something.</td></tr>;
  }
  return (
    <>
      {list.map((t) => (
        <tr key={t.task_id}>
          <td>
            <Link href={`/app/task?id=${t.task_id}`}>{t.data.title || t.intent}</Link>
            <div className="tiny muted">{t.description.slice(0, 60)}</div>
          </td>
          <td><StatusTag status={t.status} /></td>
          <td className="small">{t.credits_required}</td>
          <td className="small">{t.user_price ? money(t.user_price) : '—'}</td>
          <td className="tiny muted">{when(t.created_at)}</td>
        </tr>
      ))}
    </>
  );
}

export default function TasksPage() {
  const { db, ready } = useDB();
  const u = ready ? me() : null;
  const body = !u || !db ? null : (() => {
    const mine = db.tasks.filter((t) => t.user_id === u.id);
    const fam = db.family.filter((f) => f.ownerId === u.id && f.linkedUserId).map((f) => f.linkedUserId);
    const famTasks = db.tasks.filter((t) => fam.includes(t.user_id));
    return (
      <>
        <div className="between"><h2 style={{ margin: 0 }}>My tasks</h2><Link className="btn sm" href="/app/ask">New request</Link></div>
        <div className="card mt scroll">
          <table>
            <tbody>
              <tr><th>Task</th><th>Status</th><th>Credits</th><th>Amount</th><th>Created</th></tr>
              <Rows list={mine} />
            </tbody>
          </table>
        </div>
        {famTasks.length ? (
          <>
            <h3 className="mt2">Family tasks</h3>
            <div className="card scroll">
              <table>
                <tbody>
                  <tr><th>Task</th><th>Status</th><th>Credits</th><th>Amount</th><th>Created</th></tr>
                  <Rows list={famTasks} />
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </>
    );
  })();
  return <CustomerShell active="tasks">{body}</CustomerShell>;
}
