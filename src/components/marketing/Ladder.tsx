import Link from 'next/link';
import { type Lang, OFFERS, TIERS, tx } from '@/lib/offers';

/* The service ladder: free → small first step → starter → project →
   monthly → premium, each rung listing the packages that sit on it. */
export function Ladder({ lang }: { lang: Lang }) {
  return (
    <div className="ladder">
      {TIERS.map((t) => (
        <div key={t.id} className="rung">
          <div>
            <div className="rname">{tx(t.name, lang)}</div>
            <div className="rrange">{tx(t.range, lang)}</div>
          </div>
          <div>
            <p className="rwhat">{tx(t.what, lang)}</p>
            <div className="roffers">
              {OFFERS.filter((o) => o.tier === t.id).map((o) => {
                const href = o.tier === 'free' ? '/audit'
                  : o.vertical === 'all' ? `/pricing#${o.id}` : `/services/${o.vertical}#${o.id}`;
                return <Link key={o.id} href={href}>{tx(o.name, lang)}</Link>;
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
