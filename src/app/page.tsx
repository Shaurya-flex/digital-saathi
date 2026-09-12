'use client';

/* Home — the front door for Digital Saathi's business services. It leads
   with the free Digital Audit (the sample scorecard shows exactly what you
   get), then who we work with, how a project runs, what we always and never
   do, the price ladder and the FAQ. Every figure on this page is a price or
   a count of our own deliverables — never a claimed result. */

import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { AuditExample } from '@/components/marketing/AuditExample';
import { CtaBand } from '@/components/marketing/CtaBand';
import { FaqList } from '@/components/marketing/FaqList';
import { Ladder } from '@/components/marketing/Ladder';
import { JsonLd } from '@/components/seo/JsonLd';
import { useSiteLang } from '@/hooks/useSiteLang';
import {
  HOW_WE_WORK, NEVER, PROMISES, SITE_FAQ, VERTICALS, flagshipFor, offersFor, priceLabel, tx,
} from '@/lib/offers';
import { faqJsonLd, serviceJsonLd } from '@/lib/seo';

export default function Home() {
  const { lang, t } = useSiteLang();

  return (
    <>
      <main id="main">
        <JsonLd data={serviceJsonLd()} />
        <JsonLd data={faqJsonLd()} />

        <section className="hero2">
          <div className="wrap grid herogrid">
            <div>
              <p className="eyebrow">Digital Saathi · {t('Business services', 'Business services')}</p>
              <h1>{t('Your business, expertise or knowledge — turned into a digital system that brings customers.',
                'Aapka business, expertise ya knowledge — ek aisa digital system jo customers laaye.')}</h1>
              <p className="lede">
                {t('Google and WhatsApp for local businesses, study material for educators, and research and AI workflows for creators and consultants. Scoped in writing, priced upfront, checked by a person before delivery.',
                  'Local business ke liye Google aur WhatsApp, educators ke liye study material, aur creators aur consultants ke liye research aur AI workflows. Likhit scope, pehle se price, delivery se pehle insaan ka check.')}
              </p>
              <div className="row mt">
                <Link className="btn warm big" style={{ flex: 'none' }} href="/audit">{t('Get a free Digital Audit', 'Free Digital Audit maangiye')}</Link>
                <Link className="btn ghost big" style={{ flex: 'none' }} href="/pricing">{t('See prices', 'Prices dekhiye')}</Link>
              </div>
              <ul className="trustrow">
                <li>{t('The audit is free, with no obligation', 'Audit free hai, koi zabardasti nahi')}</li>
                <li>{t('Prices before we ask your budget', 'Budget se pehle price')}</li>
                <li>{t('Accounts stay in your name', 'Accounts aapke naam par')}</li>
                <li>{t('No fake reviews, ever', 'Fake reviews kabhi nahi')}</li>
              </ul>
            </div>
            <AuditExample lang={lang} />
          </div>
        </section>

        <section className="section" id="services">
          <div className="wrap">
            <h2 className="sec">{t('Who we work with', 'Hum kinke saath kaam karte hain')}</h2>
            <p className="secintro">{t('Three kinds of clients, one way of working. Pick the one that sounds like you.',
              'Teen tarah ke clients, kaam ka ek hi tarika. Jo aap jaisa lage, woh chuniye.')}</p>
            <div className="grid g3">
              {VERTICALS.map((v) => {
                const cheapest = offersFor(v.id).reduce((a, b) => (b.price < a.price ? b : a));
                return (
                  <article key={v.id} className="vcard">
                    <h3>{tx(v.short, lang)}</h3>
                    <p className="who">{tx(v.audience, lang)}</p>
                    <p style={{ margin: '.2rem 0 0' }}>{tx(v.promise, lang)}</p>
                    <p className="from">{priceLabel(cheapest, lang)}</p>
                    <p className="small muted" style={{ margin: 0 }}>
                      {t('Starting package', 'Shuruaati package')}: <strong>{tx(flagshipFor(v.id).name, lang)}</strong>
                    </p>
                    <div className="more">
                      <Link className="btn sm" href={`/services/${v.id}`}>{t('See packages', 'Packages dekhiye')}</Link>
                      <Link className="btn ghost sm" href={`/audit?need=${v.id}`}>{t('Free audit', 'Free audit')}</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <h2 className="sec">{t('How a project runs', 'Project kaise chalta hai')}</h2>
            <p className="secintro">{t('The same six steps for a ₹1,999 fix and a ₹50,000 project.',
              '₹1,999 ke fix aur ₹50,000 ke project, dono mein yahi chhe steps.')}</p>
            <ol className="stepsgrid">
              {HOW_WE_WORK.map(([h, d]) => <li key={h.en}><h3>{tx(h, lang)}</h3><p>{tx(d, lang)}</p></li>)}
            </ol>
          </div>
        </section>

        <section className="section">
          <div className="wrap grid g2">
            <div className="listbox">
              <h3>{t('Every project, every time', 'Har project mein, hamesha')}</h3>
              <ul className="ticklist">{PROMISES.map((p) => <li key={p.en}>{tx(p, lang)}</li>)}</ul>
            </div>
            <div className="listbox">
              <h3>{t('What we won’t do', 'Hum kya nahi karenge')}</h3>
              <ul className="crosslist">{NEVER.map((p) => <li key={p.en}>{tx(p, lang)}</li>)}</ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="between">
              <h2 className="sec" style={{ margin: 0 }}>{t('Prices, from free to premium', 'Prices: free se premium tak')}</h2>
              <Link className="linkish" href="/pricing">{t('Full price list', 'Poori price list')}</Link>
            </div>
            <p className="secintro mt">{t('Launch prices in INR, GST extra where it applies. Half to start once the scope is agreed, half on delivery.',
              'Launch prices, INR mein, GST jahan lagu ho alag. Scope tay hone par aadha shuru mein, aadha delivery par.')}</p>
            <Ladder lang={lang} />
          </div>
        </section>

        <section className="section">
          <div className="narrow">
            <h2 className="sec">{t('Common questions', 'Aam sawaal')}</h2>
            <FaqList items={SITE_FAQ} lang={lang} />
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
