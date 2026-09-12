import Link from 'next/link';
import type { Lang } from '@/lib/offers';

export function CtaBand({ lang, need }: { lang: Lang; need?: string }) {
  const hi = lang === 'hinglish';
  return (
    <div className="ctaband">
      <div>
        <h2>{hi ? 'Pehle dekhiye kya theek karna hai.' : 'Start by seeing what to fix.'}</h2>
        <p>
          {hi
            ? 'Free Digital Audit: aapka scorecard aur top teen fixes. Price pehle dikhega, koi zabardasti nahi.'
            : 'A free Digital Audit gives you a scorecard and your top three fixes. Prices come first, with no obligation.'}
        </p>
      </div>
      <Link className="btn warm big" style={{ flex: 'none' }} href={'/audit' + (need ? `?need=${need}` : '')}>
        {hi ? 'Free audit maangiye' : 'Get a free Digital Audit'}
      </Link>
    </div>
  );
}
