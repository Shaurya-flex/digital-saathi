import { type Lang, type Tx, tx } from '@/lib/offers';

export function FaqList({ items, lang }: { items: Array<[Tx, Tx]>; lang: Lang }) {
  return (
    <div className="faq">
      {items.map(([q, a]) => (
        <details key={q.en}>
          <summary>{tx(q, lang)}</summary>
          <p className="muted" style={{ margin: '.6rem 0 0' }}>{tx(a, lang)}</p>
        </details>
      ))}
    </div>
  );
}
