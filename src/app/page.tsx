'use client';

/* Landing page — ported 1:1 from the validated prototype, including the
   live hero demo (intent detection on canned chips). */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { useDB } from '@/hooks/useDB';
import { useSiteLang } from '@/hooks/useSiteLang';
import { DIGITAL_CATS, LANGS } from '@/lib/config';
import { detectIntent } from '@/lib/engine/intentRouter';
import { METRO_CITIES, demoAllowed } from '@/lib/owner';
import { cfg, money, track } from '@/lib/store';

const DEMO_CHIPS: Array<{ en: string; hinglish: string }> = [
  { en: 'Recharge my Jio number', hinglish: 'Mera Jio recharge kar do' },
  { en: 'Pay my electricity bill', hinglish: 'Electricity bill bharna hai' },
  { en: 'Find a train from Delhi to Mumbai', hinglish: 'Delhi se Mumbai train dhoondo' },
  { en: 'Explain this PDF in simple terms', hinglish: 'Ye PDF mujhe simple Hindi mein samjhao' },
  { en: 'My fan is broken, send an electrician', hinglish: 'Mere ghar ka fan kharab hai, electrician bhejo' },
  { en: 'I need a doctor’s appointment tomorrow', hinglish: 'Kal doctor ka appointment chahiye' },
  { en: 'Draft a reply to this email', hinglish: 'Ye email ka reply likh do' },
  { en: 'What documents do I need for a passport?', hinglish: 'Passport ke liye kya documents chahiye?' },
];

const HERO_LINES: Record<string, { en: [string, string]; hinglish: [string, string] }> = {
  recharge: {
    en: ['Got the Jio number. Finding the best plans…', '3 plans found. ₹719 lasts the longest — 70 days, 2GB/day.'],
    hinglish: ['Jio number samajh gaya. Best plans dhoondh raha hoon…', '3 plans mile. ₹719 sabse lamba chalega — 70 din, 2GB/day.'],
  },
  bill: {
    en: ['Fetching the BSES Rajdhani bill for August…', '₹1,284 is due by 12 September. I will ask before paying.'],
    hinglish: ['BSES Rajdhani ka August bill nikaal raha hoon…', '₹1,284 due hai, 12 September tak. Pay karne se pehle main poochhunga.'],
  },
  train: {
    en: ['Looking up Delhi to Mumbai trains…', '3 trains found. Booking needs a verified agent — I cannot complete an IRCTC booking alone.'],
    hinglish: ['Delhi se Mumbai trains dekh raha hoon…', '3 trains mili. Booking ke liye ek verified agent lagega — IRCTC mujhse akele nahi hota.'],
  },
  local: {
    en: ['Finding electricians in your area…', 'Suresh Electricals — 4.8★, about 25 minutes away, from ₹249.'],
    hinglish: ['Aapke area ke electricians dhoondh raha hoon…', 'Suresh Electricals — 4.8★, 25 minute mein, ₹249 se shuru.'],
  },
  doc: {
    en: ['Reading the PDF…', 'This is an 11-month rent agreement. ₹18,000/month, 2-month deposit, 1-month notice.'],
    hinglish: ['PDF padh raha hoon…', 'Ye 11 mahine ka rent agreement hai. ₹18,000 mahina, 2 mahine deposit, 1 mahine ka notice.'],
  },
  govt: {
    en: ['Preparing your passport document checklist…', 'Aadhaar, birth proof, address proof and a self-declaration. Full checklist below.'],
    hinglish: ['Passport documents ki list bana raha hoon…', 'Aadhaar, birth proof, address proof aur ek self-declaration. Poori checklist neeche hai.'],
  },
  appt: {
    en: ['Checking tomorrow’s doctor slots…', 'Two slots are free — 11:15 AM and 5:40 PM.'],
    hinglish: ['Kal ke doctor slots dekh raha hoon…', 'Do slot khaali hain — 11:15 AM aur 5:40 PM.'],
  },
  email: {
    en: ['Reading the email and drafting a reply…', 'Draft is ready. Please read it before you send.'],
    hinglish: ['Email padh ke reply likh raha hoon…', 'Draft taiyaar hai. Bhejne se pehle aap padh lijiye.'],
  },
  unknown: {
    en: ['Working it out…', 'This needs a person to handle it safely — a verified agent can take it from here.'],
    hinglish: ['Samajh raha hoon…', 'Ye kaam AI se seedha nahi hota. Ek verified agent isse poora kar dega.'],
  },
};

const FAQ: Array<[string, string]> = [
  ['Is this a chatbot?', 'No. A chatbot answers. Saathi carries out the task, and hands it to a person when it cannot.'],
  ['What if the AI gets it wrong?', 'Anything with money, identity or a booking needs your explicit approval first. You can also set your own rules, like auto-approving recharges under ₹500.'],
  ['Are you connected to the government?', 'No. For PAN, passport, EPFO and similar work we explain the process and help with forms and documents. We never present an unofficial route as an official one.'],
  ['Who are the local professionals?', 'Independent electricians, plumbers, technicians and salons who apply, get verified and are rated by customers after every job.'],
  ['What happens to my documents?', 'They stay in your vault. You choose what is shared with an agent, per task, and you can delete anything at any time.'],
  ['Is this working software?', 'Yes — sign in with Google and your account, tasks and reminders are real and backed up. Live payment, recharge and booking rails are being connected operator by operator; anything still simulated is clearly labelled in the app.'],
];

export default function Landing() {
  const { db, ready } = useDB();
  const { lang, t } = useSiteLang();
  const [heroQ, setHeroQ] = useState<string | null>(null);
  const [heroDone, setHeroDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const heroDemo = (q: string) => {
    setHeroQ(q);
    setHeroDone(false);
    track('voice_request', { q });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setHeroDone(true), 900);
  };

  const it = heroQ ? detectIntent(heroQ) : null;
  const linesPair = it ? HERO_LINES[it.id] || HERO_LINES.unknown : null;
  const lines = linesPair ? (lang === 'hinglish' ? linesPair.hinglish : linesPair.en) : null;
  const c = cfg();

  return (
    <>
      <main id="main">
        <section className="hero">
          <div className="wrap grid herogrid">
            <div>
              <p className="kicker">AI concierge · human backup · local service network</p>
              <h1>{t('Just speak. We’ll handle your digital and daily tasks.', 'Aap bas boliye. Digital aur daily kaam hum sambhalenge.')}</h1>
              <p className="lede">
                Recharge, bills, bookings, forms, documents, appointments, shopping and local services —
                spoken or typed, in your language, through one place you can trust.
              </p>
              <div className="row mt">
                <Link className="btn big" href="/login">Try Digital Saathi</Link>
                <a className="btn ghost big" href="#what">See what I can do</a>
              </div>
              <div className="herostats">
                <div><b>12</b><span>Indian languages</span></div>
                <div><b>{METRO_CITIES.length}</b><span>metro cities at launch</span></div>
                <div><b>₹0</b><span>to start — 50 free credits</span></div>
                <div><b>100%</b><span>approval before any payment</span></div>
              </div>
              <p className="small muted mt">Sign in with Google. Your data is backed up automatically and stays yours.</p>
            </div>
            <div className="console">
              <div className="head">
                <strong>Ask Saathi</strong>
                <span className="demoflag" style={{ background: '#fff', borderColor: '#e8c68a' }}>Live demo</span>
              </div>
              <div className="body">
                <div className="row" style={{ gap: '1rem', alignItems: 'center' }}>
                  <button className="mic" aria-label="Speak your request" onClick={() => heroDemo(t(DEMO_CHIPS[0].en, DEMO_CHIPS[0].hinglish))}>🎙️</button>
                  <div>
                    <strong>{t('What do you need?', 'Boliye, kya kaam hai?')}</strong>
                    <p className="small muted" style={{ margin: '.2rem 0 0' }}>Tap the mic, or pick a request below.</p>
                  </div>
                </div>
                {heroQ && lines && it ? (
                  <div className="mt">
                    <div className="thread">
                      <div className="bubble me">{heroQ}</div>
                      {!heroDone ? (
                        <div className="bubble ai">
                          <span className="wave"><i /><i /><i /><i /><i /></span> {lines[0]}
                        </div>
                      ) : (
                        <>
                          <div className="bubble ai">{lines[1]}</div>
                          <div className={'taskcard risk-' + it.risk}>
                            <div className="between">
                              <strong>{it.title}</strong>
                              <span className={'tag ' + (it.risk === 'high' ? 'stop' : it.risk === 'medium' ? 'warm' : 'go')}>{it.risk} risk</span>
                            </div>
                            <p className="small muted" style={{ margin: '.4rem 0' }}>
                              {it.risk === 'low' ? 'No approval needed.' : 'Saathi will ask you before anything is paid or booked.'}
                            </p>
                            <Link className="btn sm" href="/login">Continue in the app</Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
                <div className="chips mt">
                  {DEMO_CHIPS.map((cq) => (
                    <button key={cq.en} className="chip" onClick={() => heroDemo(t(cq.en, cq.hinglish))}>{t(cq.en, cq.hinglish)}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="what">
          <div className="wrap">
            <h2>How it works</h2>
            <div className="grid g4 mt">
              {[
                ['You speak or type', 'In Hindi, English, Hinglish or 9 more languages. A photo of a bill works too.'],
                ['Saathi works out the task', 'It names the task, the cost and the risk level before doing anything.'],
                ['You approve', 'Nothing that costs money or touches your documents happens without a yes from you.'],
                ['It gets done, or a human takes over', 'If the AI cannot finish it safely, a verified agent or a local professional picks it up.'],
              ].map(([t, d2], i) => (
                <div key={t} className="card">
                  <div className="tag">Step {i + 1}</div>
                  <h3 className="mt">{t}</h3>
                  <p className="small muted" style={{ margin: 0 }}>{d2}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="between"><h2 style={{ margin: 0 }}>Digital tasks</h2><Link href="/login" className="linkish">Open the full list</Link></div>
            <div className="grid g3 mt">
              {DIGITAL_CATS.slice(0, 9).map((cat) => (
                <div key={cat.id} className="card">
                  <h3>{cat.name}</h3>
                  <p className="small muted" style={{ margin: 0 }}>{cat.items.slice(0, 5).join(' · ')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <h2>Launching across India&rsquo;s metros</h2>
            <p className="muted">
              Doorstep services from verified professionals — visible price, distance and arrival time before you book,
              and a rating after every job. Rolling out city by city, starting with:
            </p>
            <div className="chips mt">
              {METRO_CITIES.map((c2) => <span key={c2} className="chip" style={{ cursor: 'default' }}>📍 {c2}</span>)}
            </div>
            <p className="small muted mt">
              Every partner is identity-verified before their first job; home services also require police verification.
              A professional in one of these cities? <Link className="linkish" href="/partner">Apply as a partner</Link>.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap grid g2">
            <div>
              <h2>Look after your parents from anywhere</h2>
              <p className="muted">
                Add family members, see their bills and renewals in one dashboard, and approve their payments from your
                phone. Built for the son in Bengaluru and the father in Kanpur.
              </p>
              <ul className="muted">
                <li>Shared task list and reminders</li>
                <li>Approval requests come to you</li>
                <li>Shared document vault</li>
                <li>Elderly-friendly Easy Mode on their side</li>
              </ul>
              <Link className="btn ghost" href="/login">See the family dashboard</Link>
            </div>
            <div>
              <h2>When AI should not decide, a person does</h2>
              <p className="muted">Some things need judgement, a phone call or a captcha. Saathi says so plainly instead of guessing.</p>
              <div className="taskcard">
                <strong>Train booking — Delhi to Mumbai</strong>
                <p className="small" style={{ margin: '.5rem 0' }}>
                  I can’t complete an IRCTC booking safely on my own. A verified Digital Saathi agent can finish it.
                </p>
                <div className="row small muted"><span>About 18 minutes</span><span>·</span><span>Service fee ₹49</span><span>·</span><span>60 credits</span></div>
                <div className="row mt">
                  <button className="btn sm" onClick={() => heroDemo(t('Find a train from Delhi to Mumbai', 'Delhi se Mumbai train dhoondo'))}>Connect me</button>
                  <button className="btn ghost sm">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="wrap">
            <h2>Plans</h2>
            <p className="muted">Credits are Digital Saathi usage units, not any AI provider’s tokens. Unused credits do not carry over.</p>
            <div className="grid g3 mt">
              {c.plans.map((p) => (
                <div key={p.id} className={'price' + (p.id === 'family' ? ' pick' : '')}>
                  {p.id === 'family' ? <span className="tag warm">Most chosen</span> : null}
                  <h3 style={{ marginTop: '.4rem' }}>{p.name}</h3>
                  <div className="amt">
                    {p.price ? money(p.price) : 'Free'}
                    <span className="small muted" style={{ fontFamily: 'Mukta' }}>{p.price ? '/month' : ''}</span>
                  </div>
                  <div className="small muted">
                    {p.credits.toLocaleString('en-IN')} credits{p.seats > 1 ? ' · up to ' + p.seats + ' people' : ''}
                  </div>
                  <ul>{p.perks.map((x) => <li key={x}>{x}</li>)}</ul>
                  <Link className={'btn' + (p.id === 'family' ? '' : ' ghost')} style={{ marginTop: 'auto' }} href="/login">
                    Choose {p.name}
                  </Link>
                </div>
              ))}
            </div>
            <p className="small muted mt">
              Top-up packs: {c.packs.map((k) => money(k.p) + ' for ' + k.c + ' credits').join(' · ')}. Local service
              jobs are billed as the professional’s price plus a platform fee.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="wrap grid g2">
            <div>
              <h2>Safety and trust</h2>
              <ul className="muted">
                <li>Nothing that costs money happens without your confirmation</li>
                <li>Every task keeps an audit trail you can read</li>
                <li>Saathi never claims a task is done when it isn’t</li>
                <li>Identity documents are never uploaded anywhere automatically</li>
                <li>Service partners are verified before they can accept jobs</li>
                <li>We are not affiliated with any government department. Government tasks are guidance and assistance only.</li>
              </ul>
            </div>
            <div>
              <h2>Languages</h2>
              <div className="chips">{LANGS.map((l) => <span key={l[0]} className="chip" style={{ cursor: 'default' }}>{l[1]}</span>)}</div>
              <h3 className="mt2">For businesses</h3>
              <p className="muted small">
                Shops and clinics can put a Saathi assistant on customer support, appointments, WhatsApp replies,
                invoice reminders and catalogue work. Starter, Growth, Business and Enterprise plans.
              </p>
              <Link className="linkish" href="/login">See business mode</Link>
            </div>
          </div>
        </section>

        <section className="section faq">
          <div className="narrow">
            <h2>Questions people ask</h2>
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p className="muted" style={{ margin: '.6rem 0 0' }}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="wrap grid g2">
            <div className="card pad">
              <h3>Become a service partner</h3>
              <p className="small muted">
                Electricians, plumbers, technicians, salons and cleaners. Get jobs near you, set your own hours, keep
                your rating.
              </p>
              <p className="small">
                Customer pays ₹500 → platform fee {Math.round(c.commission.provider * 100)}% →{' '}
                <strong>you keep {money(500 * (1 - c.commission.provider))}</strong>. No hidden cut.
              </p>
              <Link className="btn" href="/partner">Apply as a partner</Link>
            </div>
            <div className="card pad">
              <h3>Become a digital agent</h3>
              <p className="small muted">
                Work from home on bookings, forms, documents and research that the AI escalates. Paid per task.
              </p>
              <p className="small">
                Task priced at ₹120 → platform fee {Math.round(c.commission.agent * 100)}% →{' '}
                <strong>you keep {money(120 * (1 - c.commission.agent))}</strong>.
              </p>
              <Link className="btn" href="/become-agent">Apply as an agent</Link>
            </div>
          </div>
        </section>

        <section className="section center">
          <div className="narrow">
            <h2>{t('Everything, in one place.', 'Ek hi jagah. Saara kaam.')}</h2>
            <p className="muted">
              Create your free account with Google — 50 welcome credits, automatic backup, reminders that never
              let a bill slip.
            </p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <Link className="btn big" href="/login">Create your free account</Link>
              {demoAllowed() ? <Link className="btn ghost" href="/login?demo=1">Explore the sandbox</Link> : null}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
