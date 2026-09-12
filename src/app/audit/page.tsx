'use client';

import { Footer } from '@/components/layout/Footer';
import { AuditForm } from '@/components/marketing/AuditForm';
import { useSiteLang } from '@/hooks/useSiteLang';
import { offerById, tx, whatsappHref } from '@/lib/offers';
import { CONTACT_EMAIL } from '@/lib/seo';

export default function AuditPage() {
  const { lang, t } = useSiteLang();
  const audit = offerById('free-audit')!;
  const wa = whatsappHref(t('Hello Digital Saathi, I would like a free Digital Audit.', 'Namaste Digital Saathi, mujhe free Digital Audit chahiye.'));
  return (
    <>
      <main id="main">
        <section className="hero2" style={{ paddingBottom: '3rem' }}>
          <div className="wrap auditgrid">
            <div>
              <p className="eyebrow">Free Digital Audit</p>
              <h1>{t('See what to fix first — free.', 'Pehle dekhiye kya theek karna hai — free.')}</h1>
              <p className="lede">{tx(audit.summary, lang)}</p>
              <h3 className="mt">{t('What you get', 'Aapko kya milega')}</h3>
              <ul className="ticklist">{audit.deliverables.map((d) => <li key={d.en}>{tx(d, lang)}</li>)}</ul>
              <h3 className="mt">{t('What happens next', 'Aage kya hota hai')}</h3>
              <ol style={{ paddingLeft: '1.2rem', color: 'var(--ink-2)' }}>
                <li>{t('You fill this in. It takes a few minutes.', 'Aap yeh form bharte hain. Kuch hi minute lagte hain.')}</li>
                <li>{t('We look at what people can see today, plus anything you send us.', 'Hum dekhte hain aaj log kya dekh sakte hain, aur jo aap bhejein.')}</li>
                <li>{t('You get your scorecard. We aim to send it within 2 working days.', 'Aapko scorecard milta hai. Koshish rahegi ki 2 working days mein.')}</li>
                <li>{t('If you want our help, you get a written scope and price. No obligation.', 'Madad chahiye to likhit scope aur price milega. Koi zabardasti nahi.')}</li>
              </ol>
              <p className="small muted">
                {t('Prefer to write?', 'Likhna pasand hai?')} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                {wa ? <> · <a href={wa} target="_blank" rel="noreferrer">WhatsApp</a></> : null}
              </p>
            </div>
            <AuditForm lang={lang} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
