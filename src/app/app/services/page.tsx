'use client';

/* Services: universal search (tasks, providers, documents, services),
   service category grid, illustrative map with pins, provider cards. */

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerShell } from '@/components/layout/Shell';
import { ProviderCard } from '@/components/supply/ProviderCard';
import { Modal } from '@/components/ui/Modal';
import { useDB } from '@/hooks/useDB';
import { nearbyProviders, useGeo } from '@/hooks/useGeo';
import { DIGITAL_CATS } from '@/lib/config';
import { handleAsk } from '@/lib/engine/actions';
import { me, money } from '@/lib/store';
import type { Provider } from '@/lib/types';

export default function ServicesPage() {
  const { db, ready } = useDB();
  const [q, setQ] = useState('');
  const [pin, setPin] = useState<Provider | null>(null);
  const router = useRouter();
  const u = ready ? me() : null;
  const { geo, request, clear, busy } = useGeo();

  const ask = (text: string) => { handleAsk(text); router.push('/app/ask'); };

  const body = !u || !db ? null : (() => {
    const s = q.trim().toLowerCase();
    const results: React.ReactNode[] = [];
    if (s) {
      db.tasks.filter((t) => t.user_id === u.id && (t.description + t.intent).toLowerCase().includes(s)).slice(0, 4)
        .forEach((t) => results.push(<Link key={'t' + t.task_id} href={`/app/task?id=${t.task_id}`}>Task — {t.data.title || t.intent}</Link>));
      db.providers.filter((p) => (p.name + p.cat + p.locality).toLowerCase().includes(s)).slice(0, 4)
        .forEach((p) => results.push(<span key={'p' + p.id}>Provider — {p.name} ({p.cat})</span>));
      db.documents.filter((d) => d.userId === u.id && d.name.toLowerCase().includes(s)).slice(0, 3)
        .forEach((d) => results.push(<span key={'d' + d.id}>Document — {d.name}</span>));
      DIGITAL_CATS.flatMap((c) => c.items).filter((i) => i.toLowerCase().includes(s)).slice(0, 5)
        .forEach((i) => results.push(
          <span key={'s' + i}>Service — <button className="linkish" onClick={() => ask(i)}>{i}</button></span>,
        ));
    }
    return (
      <>
        <h2>Services</h2>
        <input type="text" placeholder="Search any service, provider or task" value={q} onChange={(e) => setQ(e.target.value)} />
        {s ? (
          <div className="card mt">
            <strong>Results for “{q}”</strong>
            {results.length ? <ul className="small">{results.map((r, i) => <li key={i}>{r}</li>)}</ul> : <p className="small muted">Nothing matched.</p>}
          </div>
        ) : null}
        <h3 className="mt2">Digital tasks</h3>
        <div className="grid g3">
          {DIGITAL_CATS.map((c) => (
            <div key={c.id} className="card">
              <h3>{c.name}</h3>
              <div className="chips">
                {c.items.map((i) => <button key={i} className="chip" onClick={() => ask(i)}>{i}</button>)}
              </div>
            </div>
          ))}
        </div>
        <h3 className="mt2">Local services</h3>
        <div className="row mb">
          <button className="btn sm" onClick={request} disabled={busy}>
            {busy ? 'Locating…' : geo ? '📍 Update my location' : '📍 Use my location'}
          </button>
          {geo ? <button className="btn ghost sm" onClick={clear}>Clear location</button> : null}
          {!geo ? <span className="small muted">Share your location to see who can reach your doorstep fastest.</span> : null}
        </div>
        {geo ? (
          <>
            <h3 className="sechead">Near you — doorstep visits</h3>
            <div className="grid g3 mb">
              {nearbyProviders(geo, db.providers).filter(({ km }) => km <= 30).slice(0, 6).map(({ p, km }) => (
                <div key={p.id}>
                  <div className="between small" style={{ padding: '0 .2rem .25rem' }}>
                    <span className="tag go">~{km < 1 ? '1' : Math.round(km)} km away</span>
                    {km <= p.radius ? <span className="tiny muted">visits your doorstep</span> : <span className="tiny muted">outside their radius</span>}
                  </div>
                  <ProviderCard p={p} onBook={(pp) => ask('Need a ' + pp.cat.toLowerCase() + ' at home')} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mapbox mb">
            <span className="pin me" style={{ left: '40%', top: '52%' }}>You</span>
            {db.providers.map((p) => (
              <button key={p.id}
                className={'pin' + (p.status === 'Verified' && p.rating > 4.7 ? ' best' : '')}
                style={{ left: p.x + '%', top: p.y + '%' }}
                onClick={() => setPin(p)}>
                {p.cat} {p.rating}★
              </button>
            ))}
          </div>
        )}
        <h3 className="sechead">All partners</h3>
        <div className="grid g3">
          {db.providers.map((p) => (
            <ProviderCard key={p.id} p={p} onBook={(pp) => ask('Need a ' + pp.cat.toLowerCase() + ' at home')} />
          ))}
        </div>
        {pin ? (
          <Modal onClose={() => setPin(null)}>
            <h3>{pin.name}</h3>
            <p className="small muted">{pin.cat} · {pin.locality} · {pin.rating}★ · about {pin.eta} min</p>
            <p>Starting price {money(pin.base)}. {pin.jobs} jobs completed.</p>
            <div className="row">
              <button className="btn" onClick={() => { setPin(null); ask('Need a ' + pin.cat.toLowerCase() + ' at home'); }}>Book this partner</button>
              <button className="btn ghost" onClick={() => setPin(null)}>Close</button>
            </div>
          </Modal>
        ) : null}
      </>
    );
  })();
  return <CustomerShell active="services">{body}</CustomerShell>;
}
