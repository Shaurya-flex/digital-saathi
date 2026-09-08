'use client';

import Link from 'next/link';
import { money } from '@/lib/store';
import type { Provider } from '@/lib/types';

export function ProviderCard({ p, onBook }: { p: Provider; onBook?: (p: Provider) => void }) {
  return (
    <div className="card">
      <div className="between">
        <div>
          <strong>{p.name}</strong>
          <div className="small muted">{p.cat} · {p.locality}</div>
        </div>
        <span className={'tag ' + (p.status === 'Verified' ? 'go' : 'warm')}>
          {p.status === 'Verified' ? 'Verified' : 'In verification'}
        </span>
      </div>
      <div className="row mt small muted">
        <span>{p.rating}★</span><span>·</span><span>{p.jobs} jobs</span><span>·</span>
        <span>{p.completion ? Math.round(p.completion * 100) + '% done' : '—'}</span><span>·</span><span>~{p.eta} min</span>
      </div>
      <div className="chips mt">{p.badges.map((b) => <span key={b} className="tag plain">{b}</span>)}</div>
      <div className="between mt">
        <strong>from {money(p.base)}</strong>
        {onBook
          ? <button className="btn sm" onClick={() => onBook(p)}>Book</button>
          : <Link className="btn ghost sm" href="/login">Book</Link>}
      </div>
      <p className="tiny muted" style={{ margin: '.5rem 0 0' }}>Free cancellation before travel starts.</p>
    </div>
  );
}
