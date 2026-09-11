/* Search / answer-engine facts in one place: site identity, the canonical
   description, the FAQ (rendered on the homepage AND emitted as FAQPage
   structured data), and JSON-LD builders. Keep the FAQ answers literal and
   self-contained — answer engines quote them verbatim. */

import type { Article } from './articles';
import { DEFAULT_CONFIG } from './config';
import { METRO_CITIES } from './owner';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://digital-saathi-for-you.vercel.app').replace(/\/+$/, '');
export const SITE_NAME = 'Digital Saathi';
export const SITE_TITLE = 'Digital Saathi — AI concierge for India: bills, recharges, documents, doorstep services';
export const SITE_TAGLINE = 'Just speak. We’ll handle your digital and daily tasks.';
export const SITE_DESCRIPTION =
  'Digital Saathi is an AI concierge for India. Speak or type in Hindi, Hinglish or English — recharges, bill payments, ' +
  'document explanations, government paperwork guidance, appointments and verified doorstep services — with a human ' +
  'agent whenever the AI should not act alone. Free to start with 50 credits. Live in Delhi NCR, Mumbai, Bengaluru, ' +
  'Hyderabad, Chennai, Kolkata, Pune and Ahmedabad.';
export const SITE_KEYWORDS = [
  'Digital Saathi', 'AI concierge India', 'digital services India', 'Hindi voice assistant', 'Hinglish assistant',
  'pay electricity bill online', 'mobile recharge assistant', 'government form help India', 'PAN card help',
  'passport documents checklist', 'explain document in Hindi', 'electrician near me', 'plumber near me',
  'home services Delhi NCR', 'home services Mumbai', 'home services Bengaluru', 'digital help for elderly parents',
  'family concierge India', 'digital agent jobs India', 'service partner jobs India',
];
export const CONTACT_EMAIL = 'onlinedesk120@gmail.com';
export const LAUNCH_DATE = '2026-09-05';

export const FAQ: Array<[string, string]> = [
  ['What is Digital Saathi?',
    'Digital Saathi is an AI-powered digital concierge for India. You speak or type what you need — in Hindi, Hinglish or English — and it does digital tasks itself (explaining documents, drafting messages, government paperwork guidance, reminders) or hands the job to a verified human agent or a local service partner when a person is needed. Nothing that costs money happens without your approval.'],
  ['Is this a chatbot?',
    'No. A chatbot answers. Saathi carries out the task, and hands it to a person when it cannot.'],
  ['What if the AI gets it wrong?',
    'Anything with money, identity or a booking needs your explicit approval first. You can also set your own rules, like auto-approving recharges under ₹500.'],
  ['Which cities is Digital Saathi available in?',
    `Digital tasks work anywhere in India. Doorstep services are rolling out city by city, starting with ${METRO_CITIES.join(', ')}, as verified partners join.`],
  ['How much does Digital Saathi cost?',
    'Signing up is free and comes with 50 credits. Plans start at ₹99 a month (Smart); the Family plan is ₹299 a month for up to five people. Real-world costs like a bill or a professional’s fee are shown before you approve them and are never mixed with credits.'],
  ['Are you connected to the government?',
    'No. For PAN, passport, EPFO and similar work we explain the process and help with forms and documents. We never present an unofficial route as an official one.'],
  ['Who are the local professionals?',
    'Independent electricians, plumbers, technicians and salons who apply, get verified and are rated by customers after every job.'],
  ['What happens to my documents?',
    'They stay in your vault. You choose what is shared with an agent, per task, and you can delete anything at any time.'],
  ['Is this working software?',
    'Yes — sign in with Google, email and password, or a one-tap email link, and your account, tasks and reminders are real and backed up. Live payment, recharge and booking rails are being connected operator by operator; anything still simulated is clearly labelled in the app.'],
];

const ORG_ID = SITE_URL + '/#organization';
const SITE_ID = SITE_URL + '/#website';

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_URL + '/opengraph-image',
    email: CONTACT_EMAIL,
    slogan: SITE_TAGLINE,
    areaServed: { '@type': 'Country', name: 'India' },
    contactPoint: [{
      '@type': 'ContactPoint', email: CONTACT_EMAIL, contactType: 'customer support',
      availableLanguage: ['English', 'Hindi'], areaServed: 'IN',
    }],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: ['en-IN', 'hi-IN'],
    publisher: { '@id': ORG_ID },
  };
}

export function serviceJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Digital Saathi — AI concierge and doorstep services',
    serviceType: 'Digital concierge, bill and recharge assistance, document help, government paperwork guidance, home services',
    provider: { '@id': ORG_ID },
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    availableLanguage: ['English', 'Hindi', 'Hinglish'],
    areaServed: [
      { '@type': 'Country', name: 'India' },
      ...METRO_CITIES.map((c) => ({ '@type': 'City', name: c, containedInPlace: { '@type': 'Country', name: 'India' } })),
    ],
    offers: DEFAULT_CONFIG.plans.map((p) => ({
      '@type': 'Offer',
      name: p.name + ' plan',
      price: String(p.price),
      priceCurrency: 'INR',
      url: SITE_URL + '/pricing',
      description: `${p.credits.toLocaleString('en-IN')} credits a month` + (p.seats > 1 ? `, up to ${p.seats} people` : ''),
    })),
  };
}

export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function articleJsonLd(a: Article) {
  const url = `${SITE_URL}/learn/${a.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.body.slice(0, 160),
    articleSection: a.cat,
    inLanguage: 'en-IN',
    datePublished: LAUNCH_DATE,
    dateModified: LAUNCH_DATE,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  };
}

export function breadcrumbJsonLd(items: Array<[string, string]>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem', position: i + 1, name, item: SITE_URL + path,
    })),
  };
}
