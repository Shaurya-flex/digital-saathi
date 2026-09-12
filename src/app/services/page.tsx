'use client';

/* Services hub: the three service lines, each with its packages and prices
   in one compact table, so a visitor finds their row in seconds. */

import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { CtaBand } from '@/components/marketing/CtaBand';
import { useSiteLang } from '@/hooks/useSiteLang';
import { TIERS, VERTICALS, offersFor, priceLabel, tx } from '@/lib/offers';

export default function ServicesHub() {
  const { lang, t } = useSiteLang();
  return (
    <>
      <main id="main">
        <section className="hero2">
          <div className="wrap">
            <p className="eyebrow">Services</p>
            <h1>{t('Three service lines. One way of working.', 'Teen service lines. Kaam ka ek hi tarika.')}</h1>
            <p className="lede">
              {t('Each line has a small first step, a starter package, a full project and a monthly plan. You see the price here before anyone asks about your budget.',
                'Har line mein ek chhota pehla kadam, starter package, poora project aur monthly plan hai. Budget ki baat se pehle price yahin dikh jaata hai.')}
            </p>
          </div>
        </section>

        {VERTICALS.map((v) => (
          <section key={v.id} className="section" id={v.id}>
            <div className="wrap grid g2" style={{ alignItems: 'start' }}>
              <div>
                <h2 className="sec">{tx(v.name, lang)}</h2>
                <p style={{ fontSize: '1.08rem' }}>{tx(v.promise, lang)}</p>
                <p className="small muted">{tx(v.audience, lang)}</p>
                <div className="row mt">
                  <Link className="btn" href={`/services/${v.id}`}>{t('Packages and details', 'Packages aur details')}</Link>
                  <Link className="btn ghost" href={`/audit?need=${v.id}`}>{t('Free audit', 'Free audit')}</Link>
                </div>
              </div>
              <div className="card scroll" style={{ padding: '.3rem .9rem' }}>
                <table>
                  <tbody>
                    <tr><th>{t('Package', 'Package')}</th><th>{t('Level', 'Level')}</th><th style={{ textAlign: 'right' }}>{t('Price', 'Price')}</th></tr>
                    {offersFor(v.id).map((o) => (
                      <tr key={o.id}>
                        <td><Link href={`/services/${v.id}#${o.id}`}>{tx(o.name, lang)}</Link></td>
                        <td className="small muted">{tx(TIERS.find((x) => x.id === o.tier)!.name, lang)}</td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{priceLabel(o, lang)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}

        <section className="section">
          <div className="wrap"><CtaBand lang={lang} /></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
