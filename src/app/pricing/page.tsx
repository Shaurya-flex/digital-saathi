'use client';

/* Pricing: every package on the service ladder, grouped by level, plus the
   payment terms. (The Saathi app's credit plans live inside the app.) */

import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { CtaBand } from '@/components/marketing/CtaBand';
import { Ladder } from '@/components/marketing/Ladder';
import { OfferCard } from '@/components/marketing/OfferCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { useSiteLang } from '@/hooks/useSiteLang';
import { OFFERS, PROMISES, TIERS, tx, verticalById } from '@/lib/offers';
import { serviceJsonLd } from '@/lib/seo';

export default function PricingPage() {
  const { lang, t } = useSiteLang();
  return (
    <>
      <main id="main">
        <JsonLd data={serviceJsonLd()} />
        <section className="hero2">
          <div className="wrap">
            <p className="eyebrow">Pricing</p>
            <h1>{t('Prices first. Then we talk about your budget.', 'Pehle price. Phir aapke budget ki baat.')}</h1>
            <p className="lede">
              {t('Launch prices in INR. Every package comes with a written scope, so you know exactly what the price covers.',
                'Launch prices, INR mein. Har package ka likhit scope hota hai, taaki pata rahe price mein kya-kya shaamil hai.')}
            </p>
            <p className="small muted">
              {t('Using the Saathi app? Its plans are inside the app, under Wallet & Credits.', 'Saathi app use karte hain? Uske plans app ke andar, Wallet & Credits mein hain.')}
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <h2 className="sec">{t('All levels at a glance', 'Saare levels ek nazar mein')}</h2>
            <Ladder lang={lang} />
          </div>
        </section>

        {TIERS.map((tier) => {
          const offers = OFFERS.filter((o) => o.tier === tier.id);
          return (
            <section key={tier.id} className="section" id={`tier-${tier.id}`}>
              <div className="wrap">
                <div className="between">
                  <h2 className="sec" style={{ margin: 0 }}>{tx(tier.name, lang)}</h2>
                  <span className="tag">{tx(tier.range, lang)}</span>
                </div>
                <p className="secintro mt">{tx(tier.what, lang)}</p>
                <div className="grid g3">
                  {offers.map((o) => (
                    <OfferCard key={o.id} offer={o} lang={lang}
                      context={o.vertical === 'all' ? t('Any service line', 'Kisi bhi service line ke liye') : tx(verticalById(o.vertical)!.short, lang)} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        <section className="section">
          <div className="wrap grid g2">
            <div className="listbox">
              <h3>{t('How payment works', 'Payment kaise hota hai')}</h3>
              <ul className="ticklist">
                <li>{t('Half to start, once the scope is agreed in writing; half on delivery', 'Likhit scope tay hone par aadha shuru mein; aadha delivery par')}</li>
                <li>{t('Monthly plans are paid at the start of each month and end with 30 days’ notice', 'Monthly plans har mahine ki shuruaat mein; 30 din pehle bata kar band')}</li>
                <li>{t('UPI, card or netbanking, through Razorpay', 'Razorpay se UPI, card ya netbanking')}</li>
                <li>{t('GST is added where it applies', 'GST jahan lagu ho, joda jaata hai')}</li>
                <li>{t('Outside costs — domain, printing, ad spend, tool subscriptions — are paid at cost, in your name', 'Bahar ke kharche — domain, printing, ads, tools — jitna kharcha utna, aapke naam par')}</li>
              </ul>
            </div>
            <div className="listbox">
              <h3>{t('Included in every price', 'Har price mein shaamil')}</h3>
              <ul className="ticklist">{PROMISES.map((p) => <li key={p.en}>{tx(p, lang)}</li>)}</ul>
              <p className="small muted mt">
                {t('Full terms:', 'Poori sharten:')} <Link href="/terms#services">Terms &amp; Conditions</Link>
              </p>
            </div>
          </div>
        </section>

        <section className="section" style={{ borderTop: 0, paddingTop: 0 }}>
          <div className="wrap"><CtaBand lang={lang} /></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
