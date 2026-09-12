import type { Lang } from '@/lib/offers';

/* What the free audit looks like, as a clearly labelled sample. The rows
   are the real checks the audit makes; the business is not real. */

type Mark = 'ok' | 'part' | 'fix';
const ROWS: Array<[string, string, Mark]> = [
  ['Business Profile controlled by the owner', 'Business Profile owner ke control mein', 'ok'],
  ['Opening hours and phone number correct', 'Timing aur phone number sahi', 'part'],
  ['Photos of the inside, the outside and the team', 'Andar, bahar aur team ki photos', 'fix'],
  ['Services and fees listed', 'Services aur fees listed', 'fix'],
  ['Every customer asked for a review', 'Har customer se review maanga jaata hai', 'fix'],
  ['WhatsApp Business with a catalogue', 'WhatsApp Business aur catalogue', 'part'],
  ['Replies to reviews', 'Reviews ke jawab', 'ok'],
];

const FIXES: Array<[string, string]> = [
  ['Ask every customer for a review, with a QR code at the counter', 'Counter par QR code se har customer se review maangiye'],
  ['List services with fees, and add ten real photos', 'Fees ke saath services likhiye aur das asli photos daaliye'],
  ['Set up the WhatsApp catalogue and quick replies', 'WhatsApp catalogue aur quick replies set kijiye'],
];

export function AuditExample({ lang }: { lang: Lang }) {
  const hi = lang === 'hinglish';
  const points = ROWS.reduce((s, r) => s + (r[2] === 'ok' ? 1 : r[2] === 'part' ? 0.5 : 0), 0);
  const score = Math.round((points / ROWS.length) * 100);
  const label: Record<Mark, string> = hi
    ? { ok: 'Theek', part: 'Aadha', fix: 'Theek karna hai' }
    : { ok: 'Done', part: 'Partly', fix: 'Fix' };
  return (
    <figure className="scorecard" style={{ margin: 0 }}>
      <div className="schead">
        <strong>Digital Audit scorecard</strong>
        <small>{hi ? 'Namoona — asli business nahi' : 'Sample — not a real business'}</small>
      </div>
      <div className="scbody">
        <p className="small muted" style={{ margin: '0 0 .4rem' }}>
          {hi ? 'Ek coaching centre: Google Maps aur WhatsApp' : 'A coaching centre: Google Maps and WhatsApp'}
        </p>
        <div className="scoreline"><b>{score}</b><span className="muted">/ 100</span></div>
        <ul className="checks">
          {ROWS.map(([en, h, m]) => (
            <li key={en}><span>{hi ? h : en}</span><span className={'pill ' + m}>{label[m]}</span></li>
          ))}
        </ul>
        <div className="fixes">
          <strong>{hi ? 'Top teen fixes' : 'Top three fixes'}</strong>
          <ol>{FIXES.map(([en, h]) => <li key={en}>{hi ? h : en}</li>)}</ol>
        </div>
      </div>
    </figure>
  );
}
