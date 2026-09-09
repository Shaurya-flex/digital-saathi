'use client';

/* Admin portal — 12 pages: overview, users, tasks, providers, agents,
   payments, credits, services, disputes, analytics, integrations, audit.
   Ported 1:1 from the validated prototype (admin is English-only there). */

import Link from 'next/link';
import { RequestsInbox } from './RequestsInbox';
import { AdminShell } from '@/components/layout/Shell';
import { DemoFlag } from '@/components/ui/DemoFlag';
import { StatusTag } from '@/components/ui/Tag';
import { useDB } from '@/hooks/useDB';
import { ADAPTERS } from '@/lib/adapters';
import { DIGITAL_CATS, PHYSICAL_CATS } from '@/lib/config';
import { STATUSES, setStatus } from '@/lib/engine/taskEngine';
import { addCredits, cfg, money, mutate, notify, taskById, taskName, toast, when } from '@/lib/store';
import type { DBShape, Dispute } from '@/lib/types';

function refundDispute(db: DBShape, d: Dispute) {
  mutate(() => {
    d.status = 'Refunded';
    const tt = d.taskId ? taskById(d.taskId) : null;
    if (tt) {
      setStatus(tt, 'Refunded', 'Full refund issued');
      const cu = db.users.find((x) => x.id === d.userId);
      if (cu && tt.user_price) cu.wallet = (cu.wallet || 0) + tt.user_price;
    }
    notify(d.userId, 'Refund issued', 'Your refund has been processed.', 'info');
  });
  toast('Refunded.', 'ok');
}

export function AdminPortal({ page }: { page: string }) {
  const { db, ready } = useDB();
  if (!ready || !db) return <AdminShell active={page}><div /></AdminShell>;

  const T = db.tasks;
  const U = db.users.filter((u) => u.role === 'customer');
  const done = T.filter((t) => t.status === 'Completed').length;
  const escd = T.filter((t) => t.status === 'Escalated to human').length;
  const creditsSold = db.ledger.filter((l) => l.dir === 'credit').reduce((s, l) => s + l.amount, 0);
  const creditsUsed = db.ledger.filter((l) => l.dir === 'debit').reduce((s, l) => s + l.amount, 0);
  const mrr = U.reduce((s, u) => s + (cfg().plans.find((p) => p.id === u.plan)?.price || 0), 0);

  let body: React.ReactNode = null;

  if (page === 'requests') {
    body = <RequestsInbox />;
  } else if (page === 'users') {
    body = (
      <>
        <h2>Users</h2>
        <div className="card scroll">
          <table>
            <tbody>
              <tr><th>Name</th><th>Role</th><th>City</th><th>Plan</th><th>Credits</th><th></th></tr>
              {db.users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.role}</td><td>{u.city}</td>
                  <td>{u.plan ? cfg().plans.find((p) => p.id === u.plan)?.name || '—' : '—'}</td>
                  <td>{u.credits ?? '—'}</td>
                  <td>
                    {u.role === 'customer' ? (
                      <button className="btn ghost sm" onClick={() => {
                        mutate(() => addCredits(u.id, 200, 'Admin grant'));
                        toast('200 credits granted.', 'ok');
                      }}>Grant 200 credits</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  } else if (page === 'tasks') {
    body = (
      <>
        <h2>Tasks</h2>
        <div className="card scroll">
          <table>
            <tbody>
              <tr><th>Task</th><th>User</th><th>Status</th><th>Risk</th><th>Credits</th><th>Value</th></tr>
              {T.map((t) => (
                <tr key={t.task_id}>
                  <td><Link href={`/app/task/${t.task_id}`}>{taskName(t)}</Link></td>
                  <td className="small">{db.users.find((u) => u.id === t.user_id)?.name || t.user_id}</td>
                  <td><StatusTag status={t.status} /></td>
                  <td className="small">{t.risk_level}</td>
                  <td>{t.credits_required}</td>
                  <td>{t.user_price ? money(t.user_price) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  } else if (page === 'providers') {
    body = (
      <>
        <h2>Providers</h2>
        <div className="card scroll">
          <table>
            <tbody>
              <tr><th>Name</th><th>Service</th><th>Area</th><th>Rating</th><th>Status</th><th></th></tr>
              {db.providers.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td><td>{p.cat}</td><td>{p.locality}</td><td>{p.rating}★</td>
                  <td><span className={'tag ' + (p.status === 'Verified' ? 'go' : p.status === 'Suspended' ? 'stop' : 'warm')}>{p.status}</span></td>
                  <td className="row" style={{ gap: '.3rem' }}>
                    {p.status !== 'Verified' ? (
                      <button className="btn go sm" onClick={() => {
                        mutate(() => { p.status = 'Verified'; });
                        toast('Provider verified.', 'ok');
                      }}>Verify</button>
                    ) : null}
                    <button className="btn ghost sm" onClick={() => {
                      mutate(() => { p.status = p.status === 'Suspended' ? 'Verified' : 'Suspended'; });
                    }}>{p.status === 'Suspended' ? 'Reinstate' : 'Suspend'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  } else if (page === 'agents') {
    body = (
      <>
        <h2>Digital agents</h2>
        <div className="card scroll">
          <table>
            <tbody>
              <tr><th>Name</th><th>Skills</th><th>Rating</th><th>Done</th><th>Disputes</th><th>Status</th></tr>
              {db.agents.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td><td className="small">{a.skills.join(', ')}</td><td>{a.rating}★</td>
                  <td>{a.done}</td><td>{Math.round((a.dispute || 0) * 100)}%</td>
                  <td><span className={'tag ' + (a.online ? 'go' : 'plain')}>{a.online ? 'Online' : 'Offline'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  } else if (page === 'payments') {
    const rows = db.ledger.slice(-10).reverse();
    body = (
      <>
        <h2>Payments</h2>
        <div className="card">
          <div className="between">
            <div>
              <strong>Gateway</strong>
              <p className="small muted" style={{ margin: '.2rem 0 0' }}>
                Razorpay order creation, webhook signature verification and refunds all run server-side. No key is ever in the browser.
              </p>
            </div>
            <DemoFlag>Not connected</DemoFlag>
          </div>
        </div>
        <div className="card mt scroll">
          <table>
            <tbody>
              <tr><th>When</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th></tr>
              {rows.length ? rows.map((l) => (
                <tr key={l.id}>
                  <td className="tiny">{when(l.at)}</td>
                  <td className="small">{db.users.find((u) => u.id === l.userId)?.name || ''}</td>
                  <td>{l.type}</td>
                  <td>{l.type === 'credits' ? l.amount + ' cr' : money(l.amount)}</td>
                  <td><span className="tag go">Simulated</span></td>
                </tr>
              )) : <tr><td colSpan={5} className="muted small">Nothing yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </>
    );
  } else if (page === 'credits') {
    body = (
      <>
        <h2>Credits and pricing</h2>
        <p className="muted small">Change what each task costs. Applies immediately across the product.</p>
        <div className="card">
          <div className="grid g3">
            {Object.entries(cfg().pricing).map(([k, v]) => (
              <div key={k}>
                <label className="f">{k.replace(/_/g, ' ')}</label>
                <input type="number" defaultValue={v} onBlur={(e) => {
                  mutate(() => { cfg().pricing[k] = +e.target.value || 0; });
                  toast('Price updated.');
                }} />
              </div>
            ))}
          </div>
        </div>
        <div className="grid g2 mt">
          <div className="card">
            <label className="f">Provider commission (%)</label>
            <input type="number" defaultValue={Math.round(cfg().commission.provider * 100)} onBlur={(e) => {
              mutate(() => { cfg().commission.provider = (+e.target.value || 0) / 100; });
              toast('Commission updated.');
            }} />
            <label className="f">Agent commission (%)</label>
            <input type="number" defaultValue={Math.round(cfg().commission.agent * 100)} onBlur={(e) => {
              mutate(() => { cfg().commission.agent = (+e.target.value || 0) / 100; });
              toast('Commission updated.');
            }} />
          </div>
          <div className="card">
            <label className="f">Auto-approve payments under (₹)</label>
            <input type="number" defaultValue={cfg().autoApproveUnder} onBlur={(e) => {
              mutate(() => { cfg().autoApproveUnder = +e.target.value || 0; });
            }} />
            <label className="f">Promotional credits to all customers</label>
            <button className="btn ghost mt" onClick={() => {
              mutate((d) => d.users.filter((x) => x.role === 'customer').forEach((x) => addCredits(x.id, 100, 'Promotion')));
              toast('100 credits to every customer.', 'ok');
            }}>Grant 100 credits to everyone</button>
          </div>
        </div>
      </>
    );
  } else if (page === 'services') {
    const catCol = (title: string, cats: typeof DIGITAL_CATS) => (
      <div className="card">
        <h3>{title}</h3>
        {cats.map((c) => (
          <div key={c.id} className="between small" style={{ padding: '.3rem 0', borderBottom: '1px solid var(--line)' }}>
            <span>{c.name}</span><span className="tag plain">{c.items.length}</span>
          </div>
        ))}
      </div>
    );
    body = (
      <>
        <h2>Service catalogue</h2>
        <div className="grid g2">
          {catCol('Digital', DIGITAL_CATS)}
          {catCol('Physical', PHYSICAL_CATS)}
        </div>
      </>
    );
  } else if (page === 'disputes') {
    body = (
      <>
        <h2>Disputes and refunds</h2>
        {db.disputes.length ? db.disputes.map((d) => (
          <div key={d.id} className="card mb">
            <div className="between">
              <div>
                <strong>{d.type}</strong>
                <div className="small muted">{db.users.find((u) => u.id === d.userId)?.name || ''} · {when(d.at)}</div>
                <p className="small" style={{ margin: '.3rem 0 0' }}>{d.text}</p>
              </div>
              <span className={'tag ' + (d.status === 'Open' ? 'stop' : 'go')}>{d.status}</span>
            </div>
            {d.status === 'Open' ? (
              <div className="row mt">
                <button className="btn go sm" onClick={() => refundDispute(db, d)}>Full refund</button>
                <button className="btn ghost sm" onClick={() => {
                  mutate(() => { d.status = 'Partially refunded'; });
                  toast('Partial refund issued.', 'ok');
                }}>Partial refund</button>
                <button className="btn ghost sm" onClick={() => {
                  mutate(() => { d.status = 'Closed'; });
                }}>Close without refund</button>
              </div>
            ) : null}
          </div>
        )) : <div className="card muted">No disputes.</div>}
      </>
    );
  } else if (page === 'analytics') {
    const ev: Record<string, number> = {};
    db.events.forEach((e) => { ev[e.name] = (ev[e.name] || 0) + 1; });
    const funnel: Array<[string, number]> = [
      ['Visitors', 180],
      ['Signed up', U.length * 12],
      ['First task', T.length * 4],
      ['Second task', Math.round(T.length * 2.4)],
      ['Subscribed', db.users.filter((u) => u.role === 'customer' && u.plan !== 'free').length * 7],
      ['Booked a professional', db.bookings.length * 5],
    ];
    const max = funnel[0][1];
    body = (
      <>
        <h2>Analytics</h2>
        <div className="card">
          <h3>Funnel</h3>
          {funnel.map(([l, v]) => (
            <div key={l} className="between small" style={{ padding: '.3rem 0' }}>
              <span style={{ width: '11rem' }}>{l}</span>
              <span style={{ flex: 1, height: 14, background: '#eee', borderRadius: 7, overflow: 'hidden', marginRight: '.6rem' }}>
                <span style={{ display: 'block', height: 14, width: Math.round(v / max * 100) + '%', background: 'var(--marigold)' }} />
              </span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        <div className="card mt">
          <h3>Events recorded this session</h3>
          {Object.keys(ev).length ? Object.entries(ev).map(([k, v]) => (
            <div key={k} className="between small" style={{ padding: '.2rem 0' }}><span>{k}</span><strong>{v}</strong></div>
          )) : <p className="small muted">Use the app to generate events.</p>}
        </div>
      </>
    );
  } else if (page === 'integrations') {
    body = (
      <>
        <h2>Integrations</h2>
        <p className="muted small">Every outside service sits behind an adapter. Replace the adapter, and nothing else in the app changes.</p>
        <div className="card scroll">
          <table>
            <tbody>
              <tr><th>Service</th><th>Environment variable</th><th>Status</th></tr>
              {Object.entries(ADAPTERS).map(([k, a]) => (
                <tr key={k}>
                  <td>{a.name}</td>
                  <td className="tiny"><code>{a.env}</code></td>
                  <td>
                    {a.live === true ? <span className="tag go">Live</span>
                      : a.live === 'browser' ? <span className="tag warm">Browser API</span>
                      : <span className="tag stop">Mock</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="mt2">Model routing</h3>
        <div className="card scroll">
          <table>
            <tbody>
              <tr><th>Tier</th><th>Used for</th><th>Model</th><th>Cost / call</th></tr>
              {cfg().models.map((m) => (
                <tr key={m.tier}>
                  <td>{m.tier}</td><td className="small">{m.use}</td>
                  <td className="tiny"><code>{m.model}</code></td><td>₹{m.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted">Cheap tasks never touch the expensive model. The router picks the tier from the task type.</p>
      </>
    );
  } else if (page === 'audit') {
    const logs = T.flatMap((t) => t.audit_log.map((l) => ({ ...l, t })))
      .sort((a, b) => b.at.localeCompare(a.at)).slice(0, 40);
    body = (
      <>
        <h2>Audit logs</h2>
        <div className="card scroll">
          <table>
            <tbody>
              <tr><th>When</th><th>Task</th><th>By</th><th>Action</th><th>Detail</th></tr>
              {logs.map((l, i) => (
                <tr key={i}>
                  <td className="tiny">{when(l.at)}</td>
                  <td className="tiny">{taskName(l.t)}</td>
                  <td className="tiny">{l.by}</td>
                  <td className="small">{l.action}</td>
                  <td className="tiny muted">{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  } else {
    // overview
    const stats: Array<[string, React.ReactNode]> = [
      ['Customers', U.length], ['Tasks', T.length], ['Completed', done], ['Escalated to human', escd],
      ['Subscription revenue / month', money(mrr)], ['Credits granted', creditsSold], ['Credits consumed', creditsUsed],
      ['Open disputes', db.disputes.filter((d) => d.status === 'Open').length],
    ];
    const activeStatuses = STATUSES.filter((s) => T.some((t) => t.status === s));
    body = (
      <>
        <h2>Overview</h2>
        <div className="grid g4">
          {stats.map(([l, v]) => (
            <div key={l} className="stat"><span className="small muted">{l}</span><b>{v}</b></div>
          ))}
        </div>
        <div className="grid g2 mt2">
          <div className="card">
            <h3>Margin snapshot</h3>
            <table>
              <tbody>
                <tr><th>Line</th><th>Amount</th></tr>
                <tr><td>Subscription revenue</td><td>{money(mrr)}</td></tr>
                <tr><td>Credit pack sales</td><td>{money(1246)}</td></tr>
                <tr><td>Marketplace commission</td><td>{money(892)}</td></tr>
                <tr><td>AI model cost</td><td>−{money(310)}</td></tr>
                <tr><td>Human agent cost</td><td>−{money(760)}</td></tr>
                <tr><td><strong>Gross margin</strong></td><td><strong>{money(mrr + 1246 + 892 - 310 - 760)}</strong></td></tr>
              </tbody>
            </table>
            <p className="tiny muted">Illustrative figures on prototype data.</p>
          </div>
          <div className="card">
            <h3>Where tasks end up</h3>
            {activeStatuses.map((s) => {
              const n = T.filter((t) => t.status === s).length;
              return (
                <div key={s} className="between small" style={{ padding: '.25rem 0' }}>
                  <span>{s}</span>
                  <span style={{ flex: 1, margin: '0 .6rem', height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: 8, width: Math.round(n / T.length * 100) + '%', background: 'var(--indigo)' }} />
                  </span>
                  <strong>{n}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  return <AdminShell active={page}>{body}</AdminShell>;
}
