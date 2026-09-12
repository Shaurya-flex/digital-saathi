'use client';

import Link from 'next/link';
import { useSiteLang } from '@/hooks/useSiteLang';
import { VERTICALS, tx } from '@/lib/offers';
import { CONTACT_EMAIL } from '@/lib/seo';

export function Footer() {
  const { lang, t } = useSiteLang();
  const head = { color: '#fff', fontWeight: 700 } as const;
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="brand" style={{ color: '#fff' }}><span className="mark">डि</span> Digital Saathi</div>
            <p className="small" style={{ maxWidth: '40ch', color: '#a9abbb' }}>
              {t('Your business, expertise or knowledge — turned into a digital system that brings customers.',
                'Aapka business, expertise ya knowledge — ek aisa digital system jo customers laaye.')}
            </p>
            <p className="small"><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
          </div>
          <div className="row" style={{ gap: '2rem', alignItems: 'flex-start' }}>
            <div>
              <p className="small" style={head}>Services</p>
              <p className="small">
                {VERTICALS.map((v) => <span key={v.id}><Link href={`/services/${v.id}`}>{tx(v.short, lang)}</Link><br /></span>)}
                <Link href="/pricing">Pricing</Link><br />
                <Link href="/audit">Free Digital Audit</Link>
              </p>
            </div>
            <div>
              <p className="small" style={head}>{t('More', 'Aur')}</p>
              <p className="small">
                <Link href="/learn">{t('Learn', 'Seekhiye')}</Link><br />
                <a href="https://www.youtube.com/@AIwithSaurabhKr" target="_blank" rel="noopener noreferrer">{t('Videos: AI with Saurabh', 'Videos: AI with Saurabh')}</a><br />
                <Link href="/login">{t('Saathi app (early access)', 'Saathi app (early access)')}</Link><br />
                <Link href="/network">{t('Partner network', 'Partner network')}</Link>
              </p>
            </div>
            <div>
              <p className="small" style={head}>Legal</p>
              <p className="small">
                <Link href="/terms">Terms &amp; Conditions</Link><br />
                <Link href="/privacy">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
        <p className="tiny" style={{ color: '#8f92a3', marginTop: '1.6rem' }}>
          {t('Prices in INR; GST extra where it applies. We don’t guarantee rankings, reviews or sales, and we never post fake reviews. Not affiliated with Google, Meta or any government body.',
            'Prices INR mein; GST jahan lagu ho, alag. Ranking, reviews ya sales ki guarantee nahi, aur fake reviews kabhi nahi. Google, Meta ya kisi sarkari sanstha se jude nahi hain.')}
        </p>
      </div>
    </footer>
  );
}
