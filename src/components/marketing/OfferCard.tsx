import Link from 'next/link';
import { type Lang, type Offer, TIERS, priceLabel, tx } from '@/lib/offers';

/* One package: tier, price, what you get, timeline, what is not included.
   The price always appears before the call to action. */
export function OfferCard({ offer, lang, cta = true, context }: { offer: Offer; lang: Lang; cta?: boolean; context?: string }) {
  const hi = lang === 'hinglish';
  const tier = TIERS.find((t) => t.id === offer.tier)!;
  const need = offer.vertical === 'all' ? '' : `&need=${offer.vertical}`;
  return (
    <article className={'offer' + (offer.flagship ? ' flag' : '')} id={offer.id}>
      {context ? <span className="small muted" style={{ marginBottom: '.15rem' }}>{context}</span> : null}
      <span className="tiername">
        {tx(tier.name, lang)}
        {offer.flagship && offer.tier !== 'free' ? (hi ? ' · yahan se shuru kijiye' : ' · start here') : ''}
      </span>
      <h3>{tx(offer.name, lang)}</h3>
      <div className="offerprice">{priceLabel(offer, lang)}</div>
      <p className="osum">{tx(offer.summary, lang)}</p>
      <ul>{offer.deliverables.map((d) => <li key={d.en}>{tx(d, lang)}</li>)}</ul>
      <div className="meta">
        <p><strong>{hi ? 'Samay:' : 'Timeline:'}</strong> {tx(offer.timeline, lang)}</p>
        {offer.notIncluded?.length ? (
          <p><strong>{hi ? 'Shaamil nahi:' : 'Not included:'}</strong> {offer.notIncluded.map((n) => tx(n, lang)).join('; ')}</p>
        ) : null}
      </div>
      {cta ? (
        <div className="obtns">
          <Link className={'btn sm' + (offer.flagship ? '' : ' ghost')} href={`/audit?offer=${offer.id}${need}`}>
            {offer.tier === 'free'
              ? (hi ? 'Free audit maangiye' : 'Request the free audit')
              : (hi ? 'Is package ke baare mein poochhiye' : 'Ask about this package')}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
