'use client';

/* Admin → Leads: every free-audit request from the public site, newest
   first (owner accounts only, enforced by row-level security). Reply on
   WhatsApp in one tap in the lead's own language, move the status, export
   a CSV, or copy a lead into the Revenue Desk tracker. */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { authConfigured } from '@/lib/auth/supabase';
import {
  ASSETS, BUDGETS, CONTACT_PREFS, DEADLINES, LANGUAGES, NEEDS, ROLES, offerById, optionLabel,
} from '@/lib/offers';
import { LEAD_STATUSES, fetchLeads, setLeadStatus, type LeadRow } from '@/lib/sync/leads';
import { toast, when } from '@/lib/store';

const STATUS_LABEL: Record<string, string> = {
  new: 'New', contacted: 'Contacted', 'audit-sent': 'Audit sent', proposal: 'Proposal sent',
  won: 'Won', lost: 'Lost', 'not-fit': 'Not a fit',
};
const STATUS_TAG: Record<string, string> = { new: 'warm', won: 'go', lost: 'stop', 'not-fit': 'plain' };
const CLOSED = ['won', 'lost', 'not-fit'];

function waHref(l: LeadRow) {
  const first = l.name.split(' ')[0];
  const hindi = l.language === 'hi' || l.language === 'hinglish';
  const text = hindi
    ? `Namaste ${first} ji, Digital Saathi se. ${l.business ? l.business + ' ke liye ' : ''}free Digital Audit request ke liye dhanyavaad. Hum audit shuru kar rahe hain — kya scorecard isi number par bhej dein?`
    : `Hello ${first}, this is Digital Saathi. Thank you for requesting a free Digital Audit${l.business ? ' for ' + l.business : ''}. We're starting on it — is this the best number to send your scorecard to?`;
  return `https://wa.me/91${l.phone}?text=${encodeURIComponent(text)}`;
}

function toCsv(rows: LeadRow[]) {
  const cols: Array<[string, (l: LeadRow) => string]> = [
    ['created_at', (l) => l.created_at], ['status', (l) => l.status], ['name', (l) => l.name],
    ['business', (l) => l.business], ['phone', (l) => l.phone], ['email', (l) => l.email], ['city', (l) => l.city],
    ['role', (l) => optionLabel(ROLES, l.role)], ['need', (l) => optionLabel(NEEDS, l.vertical)],
    ['industry', (l) => l.industry], ['package', (l) => offerById(l.offer)?.name.en || ''],
    ['budget', (l) => optionLabel(BUDGETS, l.budget)], ['deadline', (l) => optionLabel(DEADLINES, l.deadline)],
    ['language', (l) => optionLabel(LANGUAGES, l.language)], ['contact_pref', (l) => optionLabel(CONTACT_PREFS, l.contact_pref)],
    ['assets', (l) => (l.assets || []).map((a) => optionLabel(ASSETS, a)).join('; ')],
    ['problem', (l) => l.problem], ['objective', (l) => l.objective], ['source', (l) => l.source],
  ];
  const esc = (v: string) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  return [cols.map((c) => c[0]).join(','), ...rows.map((l) => cols.map(([, f]) => esc(f(l))).join(','))].join('\n');
}

export function LeadsInbox() {
  const [leads, setLeads] = useState<LeadRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');

  const refresh = useCallback(async () => {
    setLoading(true);
    setLeads(await fetchLeads());
    setLoading(false);
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (leads || []).forEach((l) => { c[l.status] = (c[l.status] || 0) + 1; });
    return c;
  }, [leads]);

  if (!authConfigured()) {
    return <div className="card muted">Connect Supabase to receive leads here (docs/SUPABASE.md).</div>;
  }

  const weekAgo = Date.now() - 7 * 864e5;
  const lastWeek = (leads || []).filter((l) => new Date(l.created_at).getTime() >= weekAgo).length;
  const shown = (leads || []).filter((l) =>
    filter === 'all' ? true : filter === 'open' ? !CLOSED.includes(l.status) : l.status === filter);

  const exportCsv = () => {
    if (!leads?.length) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([toCsv(leads)], { type: 'text/csv;charset=utf-8' }));
    a.download = `digital-saathi-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const copyForDesk = async (l: LeadRow) => {
    const payload = {
      name: l.name, business: l.business, phone: l.phone, email: l.email, city: l.city, role: l.role,
      vertical: l.vertical, industry: l.industry, problem: l.problem, objective: l.objective, budget: l.budget,
      deadline: l.deadline, language: l.language, assets: l.assets, offer: l.offer, source: 'website', createdAt: l.created_at,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload));
      toast('Copied. Paste it into Revenue Desk → Add lead.', 'ok');
    } catch {
      toast('Copy was blocked by the browser.', 'warn');
    }
  };

  const filters: Array<[string, string]> = [['open', 'Open'], ['all', 'All'], ...LEAD_STATUSES.map((s): [string, string] => [s, STATUS_LABEL[s]])];

  return (
    <>
      <div className="between">
        <h2 style={{ margin: 0 }}>Leads</h2>
        <div className="row">
          <button className="btn ghost sm" onClick={exportCsv} disabled={!leads?.length}>Export CSV</button>
          <button className="btn ghost sm" onClick={() => void refresh()} disabled={loading}>{loading ? 'Loading…' : '↻ Refresh'}</button>
        </div>
      </div>
      <p className="muted small">
        Free-audit requests from the website, newest first. Everyone here asked to be contacted. Reply on WhatsApp,
        move the status, and log the deal in the Revenue Desk.
      </p>
      <div className="grid g4 mb">
        <div className="stat"><span className="small muted">New, not contacted</span><b>{counts.new || 0}</b></div>
        <div className="stat"><span className="small muted">Last 7 days</span><b>{lastWeek}</b></div>
        <div className="stat"><span className="small muted">Proposals out</span><b>{counts.proposal || 0}</b></div>
        <div className="stat"><span className="small muted">Won</span><b>{counts.won || 0}</b></div>
      </div>
      <div className="filtrow">
        {filters.map(([k, label]) => (
          <button key={k} className={'btn ghost sm' + (filter === k ? ' on' : '')} onClick={() => setFilter(k)}>
            {label}{counts[k] ? ` · ${counts[k]}` : ''}
          </button>
        ))}
      </div>
      {leads === null ? (
        <div className="card muted">
          Could not load leads. Run database setup in Integrations first (it needs DATABASE_URL), and sign in with an owner account.
        </div>
      ) : shown.length ? shown.map((l) => (
        <div key={l.id} className="card mb">
          <div className="between" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <strong>{l.name}</strong>{l.business ? <> · {l.business}</> : null}{' '}
              <span className={'tag ' + (STATUS_TAG[l.status] || '')}>{STATUS_LABEL[l.status] || l.status}</span>
              <div className="leadmeta">
                <span>📍 {l.city}</span>
                {l.vertical ? <span>{optionLabel(NEEDS, l.vertical)}</span> : null}
                {l.offer ? <span>Package: {offerById(l.offer)?.name.en || l.offer}</span> : null}
                {l.budget ? <span>Budget: {optionLabel(BUDGETS, l.budget)}</span> : null}
                {l.deadline ? <span>When: {optionLabel(DEADLINES, l.deadline)}</span> : null}
                {l.language ? <span>Language: {optionLabel(LANGUAGES, l.language)}</span> : null}
                {l.role || l.industry ? <span>{[optionLabel(ROLES, l.role), l.industry].filter(Boolean).join(' · ')}</span> : null}
                <span>{when(l.created_at)}</span>
              </div>
              {l.assets?.length ? <div>{l.assets.map((a) => <span key={a} className="chipsm">{optionLabel(ASSETS, a)}</span>)}</div> : null}
              <p className="leadtext"><strong>Problem:</strong> {l.problem}</p>
              {l.objective ? <p className="leadtext"><strong>A good result:</strong> {l.objective}</p> : null}
              <div className="row small mt" style={{ gap: '.9rem' }}>
                <a className="linkish" href={waHref(l)} target="_blank" rel="noreferrer">📱 WhatsApp{l.contact_pref === 'whatsapp' ? ' (preferred)' : ''}</a>
                <a className="linkish" href={'tel:+91' + l.phone}>📞 +91 {l.phone}{l.contact_pref === 'call' ? ' (preferred)' : ''}</a>
                {l.email ? (
                  <a className="linkish" href={'mailto:' + l.email + '?subject=' + encodeURIComponent('Your free Digital Audit')}>
                    ✉️ {l.email}{l.contact_pref === 'email' ? ' (preferred)' : ''}
                  </a>
                ) : null}
                <button className="linkish" onClick={() => void copyForDesk(l)}>Copy for Revenue Desk</button>
              </div>
            </div>
            <select style={{ minHeight: 36, maxWidth: '11rem' }} value={l.status} aria-label={`Status for ${l.name}`}
              onChange={async (e) => {
                const ok = await setLeadStatus(l.id, e.target.value);
                toast(ok ? 'Updated.' : 'Update failed.', ok ? 'ok' : 'warn');
                if (ok) void refresh();
              }}>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </div>
        </div>
      )) : (
        <div className="card muted">
          {leads.length ? 'Nothing in this view.' : 'No leads yet. Requests from the free-audit form on the website appear here.'}
        </div>
      )}
    </>
  );
}
