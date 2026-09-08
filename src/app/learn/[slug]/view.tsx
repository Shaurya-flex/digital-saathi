'use client';

import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { ARTICLES } from '@/lib/articles';
import { speakNow } from '@/lib/store';

export function ArticleView({ slug }: { slug: string }) {
  const a = ARTICLES.find((x) => x.id === slug);
  if (!a) {
    return (
      <main id="main" className="narrow" style={{ padding: '2rem 0 3rem' }}>
        <p>Article not found. <Link href="/learn">Back to Learn</Link></p>
      </main>
    );
  }
  return (
    <>
      <main id="main" className="narrow" style={{ padding: '2rem 0 3rem' }}>
        <Link className="linkish" href="/learn">Back to Learn</Link>
        <div><span className="tag plain mt">{a.cat}</span></div>
        <h1>{a.title}</h1>
        <p style={{ fontSize: '1.05rem' }}>{a.body}</p>
        <div className="row mt">
          <button className="btn ghost" onClick={() => speakNow(a.body, 1)}>Listen to this</button>
          <Link className="btn" href="/app/ask">Try it with Saathi</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
