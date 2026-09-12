'use client';

/* The free Digital Audit request, in four short steps. Starting prices are
   shown before the budget question. On submit the request goes to
   /api/leads; if it can't be stored, the visitor gets a one-tap WhatsApp or
   email hand-off with everything already filled in, so no lead is lost. */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ASSETS, BUDGETS, CONTACT_PREFS, DEADLINES, INDUSTRY_SUGGESTIONS, LANGUAGES, NEEDS, ROLES, TIERS,
  type Lang, type Option, offerById, optionLabel, tx, whatsappHref,
} from '@/lib/offers';
import { CONTACT_EMAIL } from '@/lib/seo';

type V = {
  need: string; offer: string; role: string; industry: string; business: string; city: string;
  problem: string; objective: string; assets: string[]; deadline: string; budget: string; language: string;
  name: string; phone: string; email: string; contactPref: string; consent: boolean; hp: string;
};
type StrKey = { [K in keyof V]: V[K] extends string ? K : never }[keyof V];

const EMPTY: V = {
  need: '', offer: '', role: '', industry: '', business: '', city: '', problem: '', objective: '', assets: [],
  deadline: '', budget: '', language: '', name: '', phone: '', email: '', contactPref: 'whatsapp', consent: false, hp: '',
};

function validPhone(p: string) {
  let d = p.replace(/[^\d]/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d);
}

function summary(v: V): string {
  return [
    'Free Digital Audit request',
    `Name: ${v.name}`,
    v.business && `Business: ${v.business}`,
    `City: ${v.city}`,
    v.need && `Need: ${optionLabel(NEEDS, v.need)}`,
    v.offer && `Package: ${offerById(v.offer)?.name.en || v.offer}`,
    (v.role || v.industry) && `Role: ${[optionLabel(ROLES, v.role), v.industry].filter(Boolean).join(' · ')}`,
    `Problem: ${v.problem}`,
    v.objective && `A good result: ${v.objective}`,
    v.assets.length ? `Already has: ${v.assets.map((a) => optionLabel(ASSETS, a)).join(', ')}` : '',
    v.deadline && `When: ${optionLabel(DEADLINES, v.deadline)}`,
    v.budget && `Budget: ${optionLabel(BUDGETS, v.budget)}`,
    v.language && `Language: ${optionLabel(LANGUAGES, v.language)}`,
    `Phone: ${v.phone}`,
    v.email && `Email: ${v.email}`,
  ].filter(Boolean).join('\n');
}

export function AuditForm({ lang }: { lang: Lang }) {
  const hi = lang === 'hinglish';
  const t = (en: string, h: string) => (hi ? h : en);
  const [v, setV] = useState<V>(EMPTY);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState('');
  const [status, setStatus] = useState<'form' | 'sending' | 'stored' | 'handoff'>('form');
  const started = useRef(Date.now());
  const source = useRef('');
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const need = q.get('need') || '';
    const offer = q.get('offer') || '';
    setV((x) => ({ ...x, need: NEEDS.some((n) => n.id === need) ? need : x.need, offer: offerById(offer) ? offer : x.offer }));
    const bits = [q.get('utm_source') ? 'utm:' + q.get('utm_source') : '', q.get('src') ? 'src:' + q.get('src') : ''];
    try {
      const ref = document.referrer ? new URL(document.referrer).host : '';
      if (ref && ref !== window.location.host) bits.push('ref:' + ref);
    } catch { /* unreadable referrer */ }
    source.current = bits.filter(Boolean).join(' ').slice(0, 200);
  }, []);

  const set = <K extends keyof V>(k: K, val: V[K]) => setV((x) => ({ ...x, [k]: val }));
  const toggleAsset = (id: string) => setV((x) => {
    if (id === 'none') return { ...x, assets: x.assets.includes('none') ? [] : ['none'] };
    const rest = x.assets.filter((a) => a !== 'none');
    return { ...x, assets: rest.includes(id) ? rest.filter((a) => a !== id) : [...rest, id] };
  });

  const problemIn = (s: number): string => {
    if (s === 0) {
      if (!v.need) return t('Choose what you need help with.', 'Chuniye ki kis cheez mein madad chahiye.');
      if (v.city.trim().length < 2) return t('Enter your city or town.', 'Apna shahar ya kasba likhiye.');
    }
    if (s === 1 && v.problem.trim().length < 5) return t('Tell us in a line what isn’t working.', 'Ek line mein bataiye kya kaam nahi kar raha.');
    if (s === 3) {
      if (v.name.trim().length < 2) return t('Enter your name.', 'Apna naam likhiye.');
      if (!validPhone(v.phone)) return t('Enter a 10-digit Indian mobile number.', '10 digit ka Indian mobile number likhiye.');
      if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return t('Check the email address, or leave it empty.', 'Email sahi likhiye, ya khaali chhod dijiye.');
      if (!v.consent) return t('Tick the box so we can contact you about this request.', 'Box tick kijiye, taaki hum is request ke baare mein sampark kar sakein.');
    }
    return '';
  };

  const scrollTop = () => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const go = (to: number) => {
    const e = to > step ? problemIn(step) : '';
    setErr(e);
    if (e) return;
    setStep(to);
    scrollTop();
  };

  const submit = async () => {
    const e = problemIn(3);
    setErr(e);
    if (e) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, elapsedMs: Date.now() - started.current, source: source.current }),
      });
      const j = await res.json().catch(() => ({} as { stored?: boolean; fields?: string[] }));
      if (res.status === 400) {
        setStatus('form');
        setErr(t('Some details need a fix: ', 'Kuch details theek kijiye: ') + (j.fields || []).join(', '));
        return;
      }
      setStatus(res.ok && j.stored ? 'stored' : 'handoff');
    } catch {
      setStatus('handoff');
    }
    scrollTop();
  };

  if (status === 'stored' || status === 'handoff') {
    const text = summary(v);
    const wa = whatsappHref(text);
    const mail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Free Digital Audit request — ' + (v.business || v.name))}&body=${encodeURIComponent(text)}`;
    const stored = status === 'stored';
    const first = v.name.trim().split(' ')[0];
    const via = optionLabel(CONTACT_PREFS, v.contactPref, lang);
    return (
      <div className="formcard donebox" ref={top}>
        <p className="bigstate">{stored ? t('Request received.', 'Request mil gayi.') : t('One more tap to send it.', 'Bhejne ke liye bas ek tap.')}</p>
        <p>
          {stored
            ? t(`Thank you, ${first}. We aim to send your scorecard within 2 working days, by ${via}.`,
              `Dhanyavaad, ${first}. Koshish rahegi ki 2 working days mein scorecard ${via} par bhej dein.`)
            : t('We couldn’t save your request on our side just now. Send it to us directly — everything you typed is already filled in.',
              'Abhi hum aapki request apni taraf save nahi kar paaye. Seedha humein bhej dijiye — aapki likhi saari baatein pehle se bhari hain.')}
        </p>
        <div className="row mt">
          {wa ? (
            <a className="btn go" href={wa} target="_blank" rel="noreferrer">
              {stored ? t('Send photos or links on WhatsApp', 'WhatsApp par photos ya links bhejiye') : t('Send on WhatsApp', 'WhatsApp par bhejiye')}
            </a>
          ) : null}
          {stored ? <Link className="btn ghost" href="/pricing">{t('See all prices', 'Saare prices dekhiye')}</Link>
            : <a className={'btn' + (wa ? ' ghost' : '')} href={mail}>{t('Send by email', 'Email se bhejiye')}</a>}
        </div>
        <p className="small muted mt">
          {t('Your details are used only for this request.', 'Aapki details sirf is request ke liye use hoti hain.')}{' '}
          <Link href="/privacy#enquiries">Privacy Policy</Link>
        </p>
      </div>
    );
  }

  const radios = (name: StrKey, list: Option[], groupLabel: string) => (
    <div className="optgrid" role="radiogroup" aria-label={groupLabel}>
      {list.map((o) => (
        <label key={o.id} className="optcheck">
          <input type="radio" name={name} value={o.id} checked={v[name] === o.id} onChange={() => set(name, o.id)} />
          <span>{tx(o.label, lang)}</span>
        </label>
      ))}
    </div>
  );

  const titles = hi
    ? ['Aapke baare mein', 'Aapko kya chahiye', 'Samay aur budget', 'Aap tak kaise pahunchein']
    : ['About you', 'What you need', 'Timing and budget', 'How to reach you'];

  return (
    <div className="formcard" ref={top}>
      <div className="stepper" aria-hidden="true">{titles.map((x, i) => <span key={x} className={i <= step ? 'on' : ''} />)}</div>
      <p className="small muted" style={{ margin: '0 0 .2rem' }}>{t(`Step ${step + 1} of 4`, `Step ${step + 1} / 4`)}</p>
      <h2 style={{ marginTop: 0 }}>{titles[step]}</h2>
      <form noValidate onSubmit={(e) => { e.preventDefault(); if (step < 3) go(step + 1); else void submit(); }}>
        <div className="hpfield" aria-hidden="true">
          <label>Company website<input tabIndex={-1} autoComplete="off" value={v.hp} onChange={(e) => set('hp', e.target.value)} /></label>
        </div>

        {step === 0 ? (
          <>
            <label className="f">{t('What do you need help with?', 'Kis cheez mein madad chahiye?')}</label>
            {radios('need', NEEDS, t('What do you need help with?', 'Kis cheez mein madad chahiye?'))}
            {v.offer && offerById(v.offer) ? (
              <p className="fieldhint">
                {t('Package you looked at:', 'Aapne yeh package dekha:')} <strong>{tx(offerById(v.offer)!.name, lang)}</strong>{' '}
                <button type="button" className="linkish" onClick={() => set('offer', '')}>{t('remove', 'hataiye')}</button>
              </p>
            ) : null}
            <div className="grid g2">
              <div>
                <label className="f" htmlFor="a-role">{t('You are', 'Aap hain')}</label>
                <select id="a-role" value={v.role} onChange={(e) => set('role', e.target.value)}>
                  <option value="">{t('Choose…', 'Chuniye…')}</option>
                  {ROLES.map((r) => <option key={r.id} value={r.id}>{tx(r.label, lang)}</option>)}
                </select>
              </div>
              <div>
                <label className="f" htmlFor="a-industry">{t('Type of business or field', 'Business ya field')}</label>
                <input id="a-industry" type="text" list="a-industries" value={v.industry} maxLength={60}
                  placeholder={t('e.g. coaching centre', 'jaise coaching centre')} onChange={(e) => set('industry', e.target.value)} />
                <datalist id="a-industries">{INDUSTRY_SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>
              </div>
              <div>
                <label className="f" htmlFor="a-business">{t('Business, institute or channel name (optional)', 'Business, institute ya channel ka naam (optional)')}</label>
                <input id="a-business" type="text" value={v.business} maxLength={120} onChange={(e) => set('business', e.target.value)} />
              </div>
              <div>
                <label className="f" htmlFor="a-city">{t('City or town', 'Shahar ya kasba')}</label>
                <input id="a-city" type="text" value={v.city} maxLength={80} autoComplete="address-level2" onChange={(e) => set('city', e.target.value)} />
              </div>
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <label className="f" htmlFor="a-problem">{t('What isn’t working today?', 'Aaj kya kaam nahi kar raha?')}</label>
            <textarea id="a-problem" value={v.problem} maxLength={1500} onChange={(e) => set('problem', e.target.value)}
              placeholder={t('e.g. New students can’t find us on Google Maps, and enquiries get lost on WhatsApp.',
                'jaise: Naye students humein Google Maps par nahi dhoondh paate, aur enquiries WhatsApp par kho jaati hain.')} />
            <label className="f" htmlFor="a-objective">{t('What would a good result look like in 3 months? (optional)', '3 mahine mein achha result kaisa dikhega? (optional)')}</label>
            <textarea id="a-objective" value={v.objective} maxLength={800} onChange={(e) => set('objective', e.target.value)} />
            <label className="f">{t('What do you already have?', 'Aapke paas pehle se kya hai?')}</label>
            <div className="optgrid">
              {ASSETS.map((a) => (
                <label key={a.id} className="optcheck">
                  <input type="checkbox" value={a.id} checked={v.assets.includes(a.id)} onChange={() => toggleAsset(a.id)} />
                  <span>{tx(a.label, lang)}</span>
                </label>
              ))}
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="pricehint">
              <strong>{t('Our prices, before you choose a budget', 'Budget chunne se pehle, hamare prices')}</strong>
              <table><tbody>
                {TIERS.map((tr) => (
                  <tr key={tr.id}><td>{tx(tr.name, lang)}</td><td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{tx(tr.range, lang)}</td></tr>
                ))}
              </tbody></table>
              <p className="fieldhint" style={{ margin: '.4rem 0 0' }}><Link href="/pricing" target="_blank">{t('Full price list', 'Poori price list')}</Link></p>
            </div>
            <label className="f">{t('When do you want to start?', 'Kab shuru karna chahte hain?')}</label>
            {radios('deadline', DEADLINES, t('When do you want to start?', 'Kab shuru karna chahte hain?'))}
            <label className="f">Budget</label>
            {radios('budget', BUDGETS, 'Budget')}
            <label className="f">{t('Language for the audit and calls', 'Audit aur calls ki bhasha')}</label>
            {radios('language', LANGUAGES, t('Language for the audit and calls', 'Audit aur calls ki bhasha'))}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="grid g2">
              <div>
                <label className="f" htmlFor="a-name">{t('Your name', 'Aapka naam')}</label>
                <input id="a-name" type="text" value={v.name} maxLength={80} autoComplete="name" onChange={(e) => set('name', e.target.value)} />
              </div>
              <div>
                <label className="f" htmlFor="a-phone">{t('WhatsApp or mobile number', 'WhatsApp ya mobile number')}</label>
                <input id="a-phone" type="tel" inputMode="numeric" value={v.phone} maxLength={16} autoComplete="tel-national"
                  placeholder="98765 43210" onChange={(e) => set('phone', e.target.value)} />
              </div>
              <div>
                <label className="f" htmlFor="a-email">{t('Email (optional)', 'Email (optional)')}</label>
                <input id="a-email" type="email" value={v.email} maxLength={120} autoComplete="email" onChange={(e) => set('email', e.target.value)} />
              </div>
            </div>
            <label className="f">{t('Best way to reach you', 'Aap tak pahunchne ka sabse achha tarika')}</label>
            {radios('contactPref', CONTACT_PREFS, t('Best way to reach you', 'Aap tak pahunchne ka sabse achha tarika'))}
            <p className="fieldhint mt">
              {t(`We use your name, phone number, email (if given), business details and these answers only to prepare your audit and contact you about it. We keep them for up to 12 months after our last conversation unless you become a client, and delete them sooner if you ask at ${CONTACT_EMAIL}.`,
                `Aapka naam, phone number, email (agar diya), business details aur yeh jawab sirf aapka audit banane aur is baare mein sampark karne ke liye use hote hain. Aakhri baat-cheet ke baad 12 mahine tak rakhte hain (client banne par alag), aur ${CONTACT_EMAIL} par kehne par pehle hi delete kar dete hain.`)}{' '}
              <Link href="/privacy#enquiries">Privacy Policy</Link>
            </p>
            <label className="optcheck mt">
              <input type="checkbox" checked={v.consent} onChange={(e) => set('consent', e.target.checked)} />
              <span>{t('I agree that Digital Saathi may contact me about this request.', 'Main sehmat hoon ki Digital Saathi is request ke baare mein mujhse sampark kare.')}</span>
            </label>
          </>
        ) : null}

        {err ? <p className="fielderr" role="alert">{err}</p> : null}
        <div className="formnav">
          {step > 0 ? <button type="button" className="btn ghost" onClick={() => go(step - 1)}>{t('Back', 'Peeche')}</button> : <span />}
          {step < 3
            ? <button type="submit" className="btn">{t('Next', 'Aage')}</button>
            : (
              <button type="submit" className="btn warm" disabled={status === 'sending'}>
                {status === 'sending' ? t('Sending…', 'Bhej rahe hain…') : t('Request my free audit', 'Mera free audit maangiye')}
              </button>
            )}
        </div>
      </form>
    </div>
  );
}
