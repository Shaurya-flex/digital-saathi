'use client';

import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { ARTICLES } from '@/lib/articles';
import { speakNow } from '@/lib/store';

export default function Learn() {
  return (
    <>
      <main id="main" className="wrap" style={{ padding: '2rem 0 3rem' }}>
        <h1>Learn</h1>
        <p className="muted">Short, practical explainers. Read them, listen to them, or ask Saathi to walk you through.</p>
        <div className="grid g2 mt">
          {ARTICLES.map((a) => (
            <div key={a.id} className="card">
              <span className="tag plain">{a.cat}</span>
              <h3 style={{ margin: '.5rem 0' }}>{a.title}</h3>
              <p className="small muted">{a.body.slice(0, 130)}…</p>
              <div className="row">
                <Link className="btn ghost sm" href={`/learn/${a.id}`}>Read</Link>
                <button className="btn ghost sm" onClick={() => speakNow(a.body, 1)}>Listen</button>
                <Link className="btn ghost sm" href="/app/ask">Ask Saathi</Link>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
