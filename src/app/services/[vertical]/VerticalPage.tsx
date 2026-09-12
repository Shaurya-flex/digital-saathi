'use client';

/* One service line: the problems it fixes, every package with its price,
   how the client will know it worked, our rules for the work, and FAQ. */

import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { CtaBand } from '@/components/marketing/CtaBand';
import { FaqList } from '@/components/marketing/FaqList';
import { OfferCard } from '@/components/marketing/OfferCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { useSiteLang } from '@/hooks/useSiteLang';
import { type VerticalId, offersFor, tx, verticalById } from '@/lib/offers';
import { breadcrumbJsonLd, faqJsonLd, verticalJsonLd } from '@/lib/seo';

export function VerticalPage({ id }: { id: VerticalId }) {
  const { lang, t } = useSiteLang();
  const v = verticalById(id)!;
  return (
    <>
      <main id="main">
        <JsonLd data={verticalJsonLd(v)} />
        <JsonLd data={faqJsonLd(v.faq)} />
        <JsonLd data={breadcrumbJsonLd([['Home', '/'], ['Services', '/services'], [v.name.en, `/services/${v.id}`]])} />

        <section className="hero2">
          <div className="wrap">
            <p className="eyebrow"><Link href="/services">Services</Link> · {tx(v.short, lang)}</p>
            <h1>{tx(v.name, lang)}</h1>
            <p className="lede">{tx(v.promise, lang)}</p>
            <p className="small muted" style={{ maxWidth: '64ch' }}><strong>{t('For:', 'Kinke liye:')}</strong> {tx(v.audience, lang)}</p>
            <div className="row mt">
              <Link className="btn warm big" style={{ flex: 'none' }} href={`/audit?need=${v.id}`}>{t('Get a free Digital Audit', 'Free Digital Audit maangiye')}</Link>
              <a className="btn ghost big" style={{ flex: 'none' }} href="#packages">{t('See packages', 'Packages dekhiye')}</a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <h2 className="sec">{t('Sound familiar?', 'Kya yeh jaana-pehchana lagta hai?')}</h2>
            <ul className="problems mt">{v.problems.map((p) => <li key={p.en}>{tx(p, lang)}</li>)}</ul>
          </div>
        </section>

        <section className="section" id="packages">
          <div className="wrap">
            <h2 className="sec">Packages</h2>
            <p className="secintro">
              {t('Launch prices in INR, GST extra where it applies. Half to start once the scope is agreed in writing, half on delivery.',
                'Launch prices, INR mein, GST jahan lagu ho alag. Likhit scope tay hone par aadha shuru mein, aadha delivery par.')}
            </p>
            <div className="grid g3">{offersFor(v.id).map((o) => <OfferCard key={o.id} offer={o} lang={lang} />)}</div>
          </div>
        </section>

        <section className="section">
          <div className="wrap grid g2">
            <div className="listbox">
              <h3>{t('How you’ll know it worked', 'Kaise pata chalega ki kaam hua')}</h3>
              <ul className="ticklist">{v.proof.map((p) => <li key={p.en}>{tx(p, lang)}</li>)}</ul>
            </div>
            <div className="listbox">
              <h3>{t('Our rules for this work', 'Is kaam ke hamare niyam')}</h3>
              <ul className="ticklist">{v.guardrails.map((p) => <li key={p.en}>{tx(p, lang)}</li>)}</ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="narrow">
            <h2 className="sec">{t('Questions about this service', 'Is service ke baare mein sawaal')}</h2>
            <FaqList items={v.faq} lang={lang} />
          </div>
        </section>

        <section className="section" style={{ borderTop: 0, paddingTop: 0 }}>
          <div className="wrap"><CtaBand lang={lang} need={v.id} /></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
