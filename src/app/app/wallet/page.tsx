'use client';

/* Wallet & credits — kept conceptually and visually apart (product rule 7).
   Wallet top-up, credit packs, plan switch, approval rules, recent ledger.
   Every rupee or credit added here is added ONLY after Razorpay verifies
   the payment server-side (src/app/api/razorpay/verify) — never before. */

import { useState } from 'react';
import { CustomerShell } from '@/components/layout/Shell';
import { DemoFlag } from '@/components/ui/DemoFlag';
import { useDB } from '@/hooks/useDB';
import { payFor, paymentsLive } from '@/lib/payments/razorpay';
import { addCredits, cfg, me, money, mutate, now, toast, track, uid, when } from '@/lib/store';

const WALLET_PRESETS = [200, 500, 1000, 2000];

export default function WalletPage() {
  const { db, ready } = useDB();
  const u = ready ? me() : null;
  const [paying, setPaying] = useState(false);
  const [customAmt, setCustomAmt] = useState('');

  const topUpWallet = async (amountInr: number) => {
    if (!u || !db || !amountInr || amountInr < 10) { toast('Enter at least ₹10.', 'warn'); return; }
    if (!paymentsLive()) {
      mutate(() => {
        u.wallet = (u.wallet || 0) + amountInr;
        db.ledger.push({ id: uid('lg'), userId: u.id, type: 'money', dir: 'credit', reason: 'Wallet top-up (simulated)', amount: amountInr, at: now() });
      });
      toast(money(amountInr) + ' added. Payment was simulated.', 'ok');
      return;
    }
    setPaying(true);
    const r = await payFor({ kind: 'wallet', id: String(amountInr) }, { name: u.name, email: u.email });
    setPaying(false);
    if (r.ok) {
      mutate(() => {
        u.wallet = (u.wallet || 0) + amountInr;
        db.ledger.push({ id: uid('lg'), userId: u.id, type: 'money', dir: 'credit', reason: `Wallet top-up · paid (${r.paymentId})`, amount: amountInr, at: now() });
      });
      track('wallet_topup', { amountInr, paymentId: r.paymentId });
      toast(money(amountInr) + ' added to your wallet. Payment received — thank you!', 'ok');
    } else {
      toast(r.error || 'Payment did not complete. Nothing was added.', 'warn');
    }
  };

  const body = !u || !db ? null : (() => {
    const led = db.ledger.filter((l) => l.userId === u.id).slice(-12).reverse();
    const c = cfg();
    const plan = c.plans.find((p) => p.id === u.plan);
    return (
      <>
        <h2>Wallet and credits</h2>
        <div className="grid g3">
          <div className="stat">
            <span className="small muted">Credits left</span>
            <b>{(u.credits || 0).toLocaleString('en-IN')}</b>
            <span className="tiny muted">Platform usage units, not money</span>
          </div>
          <div className="stat">
            <span className="small muted">Money in wallet</span>
            <b>{money(u.wallet)}</b>
            <span className="tiny muted">Used to pay bills and professionals</span>
          </div>
          <div className="stat">
            <span className="small muted">Plan</span>
            <b style={{ fontSize: '1.3rem', paddingTop: '.3rem' }}>{plan?.name}</b>
            <span className="tiny muted">{plan?.credits} credits a month</span>
          </div>
        </div>
        <div className="card mt" style={{ background: 'var(--marigold-soft)', borderColor: '#e8c68a' }}>
          <strong>Credits and money are kept apart</strong>
          <p className="small" style={{ margin: '.3rem 0 0' }}>
            Credits pay for Saathi’s work — research, drafting, form filling, agent help. Money pays your bills and the
            professionals. One is never converted into the other.
          </p>
        </div>

        <h3 className="mt2">Add money to your wallet</h3>
        <p className="muted small">This is real money for bills, recharges and service partners — not credits.</p>
        <div className="grid g4">
          {WALLET_PRESETS.map((amt) => (
            <button key={amt} className="btn ghost mt" disabled={paying} onClick={() => void topUpWallet(amt)}>{money(amt)}</button>
          ))}
        </div>
        <div className="row mt" style={{ maxWidth: 360 }}>
          <input type="number" min={10} max={50000} placeholder="Custom amount (₹)" value={customAmt}
            onChange={(e) => setCustomAmt(e.target.value)} />
          <button className="btn sm" disabled={paying || !customAmt} onClick={() => { void topUpWallet(Math.round(Number(customAmt))); setCustomAmt(''); }}>Add</button>
        </div>
        {paymentsLive()
          ? <p className="tiny muted mt">UPI, cards, netbanking and wallets via Razorpay. Verified server-side before your wallet updates.</p>
          : <p className="tiny mt"><DemoFlag>Payments simulated — Razorpay keys not configured yet</DemoFlag></p>}

        <h3 className="mt2">Top up credits</h3>
        <div className="grid g4">
          {c.packs.map((k) => (
            <div key={k.c} className="card center">
              <b style={{ fontFamily: '"Baloo 2"', fontSize: '1.5rem' }}>{k.c}</b>
              <div className="small muted">credits</div>
              <button className="btn sm mt" disabled={paying} onClick={async () => {
                if (paymentsLive()) {
                  setPaying(true);
                  const r = await payFor({ kind: 'pack', id: String(k.c) }, { name: u.name, email: u.email });
                  setPaying(false);
                  if (r.ok) {
                    mutate(() => { addCredits(u.id, k.c, `Credit pack ${money(k.p)} · paid (${r.paymentId})`); track('credits_purchased', { n: k.c, p: k.p, paymentId: r.paymentId }); });
                    toast(k.c + ' credits added. Payment received — thank you!', 'ok');
                  } else {
                    toast(r.error || 'Payment did not complete.', 'warn');
                  }
                } else {
                  mutate(() => { addCredits(u.id, k.c, 'Credit pack ' + money(k.p)); track('credits_purchased', { n: k.c, p: k.p }); });
                  toast(k.c + ' credits added. Payment was simulated.', 'ok');
                }
              }}>{money(k.p)}</button>
            </div>
          ))}
        </div>
        {paymentsLive()
          ? <p className="tiny muted">UPI, cards, netbanking and wallets via Razorpay. Every payment is verified server-side before credits are added.</p>
          : <p className="tiny"><DemoFlag>Payments simulated — Razorpay keys not configured yet</DemoFlag></p>}

        <h3 className="mt2">Change plan</h3>
        <div className="grid g3">
          {c.plans.map((p) => (
            <div key={p.id} className={'price' + (u.plan === p.id ? ' pick' : '')}>
              <h3 style={{ margin: 0 }}>{p.name}</h3>
              <div className="amt">{p.price ? money(p.price) : 'Free'}</div>
              <div className="small muted">{p.credits.toLocaleString('en-IN')} credits{p.seats > 1 ? ' · ' + p.seats + ' people' : ''}</div>
              <button
                className={'btn' + (u.plan === p.id ? ' ghost' : '') + ' sm mt'}
                style={{ marginTop: 'auto' }} disabled={u.plan === p.id || paying}
                onClick={async () => {
                  if (paymentsLive() && p.price > 0) {
                    setPaying(true);
                    const r = await payFor({ kind: 'plan', id: p.id }, { name: u.name, email: u.email });
                    setPaying(false);
                    if (r.ok) {
                      mutate(() => { u.plan = p.id; addCredits(u.id, p.credits, `Plan ${p.name} · paid (${r.paymentId})`); track('subscription_started', { plan: p.id, paymentId: r.paymentId }); });
                      toast('Welcome to ' + p.name + '! Payment received.', 'ok');
                    } else {
                      toast(r.error || 'Payment did not complete.', 'warn');
                    }
                  } else {
                    mutate(() => { u.plan = p.id; addCredits(u.id, p.credits, 'Plan ' + p.name); track('subscription_started', { plan: p.id }); });
                    toast('Now on ' + p.name + (paymentsLive() ? '.' : '. Payment simulated.'), 'ok');
                  }
                }}
              >
                {u.plan === p.id ? 'Current plan' : 'Switch to ' + p.name}
              </button>
            </div>
          ))}
        </div>

        <h3 className="mt2">Approval rules</h3>
        <div className="card">
          <label className="row"><input type="checkbox" defaultChecked style={{ width: 'auto', minHeight: 'auto' }} /> Auto-approve recharges under {money(c.autoApproveUnder)}</label>
          <label className="row"><input type="checkbox" checked disabled readOnly style={{ width: 'auto', minHeight: 'auto' }} /> Always ask before any payment above that</label>
          <label className="row"><input type="checkbox" checked disabled readOnly style={{ width: 'auto', minHeight: 'auto' }} /> Never upload identity documents automatically</label>
          <label className="row"><input type="checkbox" checked disabled readOnly style={{ width: 'auto', minHeight: 'auto' }} /> Never buy anything without confirmation</label>
        </div>

        <h3 className="mt2">Recent activity</h3>
        <div className="card scroll">
          <table>
            <tbody>
              <tr><th>When</th><th>Type</th><th>What for</th><th>Amount</th></tr>
              {led.length ? led.map((l) => (
                <tr key={l.id}>
                  <td className="tiny">{when(l.at)}</td>
                  <td>{l.type === 'credits' ? 'Credits' : 'Money'}</td>
                  <td className="small">{l.reason}</td>
                  <td>{l.dir === 'debit' ? '−' : '+'}{l.type === 'credits' ? l.amount : money(l.amount)}</td>
                </tr>
              )) : <tr><td colSpan={4} className="muted small">No activity yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </>
    );
  })();
  return <CustomerShell active="wallet">{body}</CustomerShell>;
}
