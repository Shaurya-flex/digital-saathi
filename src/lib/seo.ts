/* Search / answer-engine facts in one place: site identity, the canonical
   description, the FAQ (rendered on the homepage AND emitted as FAQPage
   structured data), and JSON-LD builders. Keep answers literal and
   self-contained — answer engines quote them verbatim. Prices come from
   src/lib/offers.ts so the structured data can never drift from the page. */

import type { Article } from './articles';
import { OFFERS, SITE_FAQ, VERTICALS, type Offer, type Tx, type Vertical } from './offers';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://digital-saathi-for-you.vercel.app').replace(/\/+$/, '');
export const SITE_NAME = 'Digital Saathi';
export const SITE_TITLE = 'Digital Saathi — Google & WhatsApp setup, study material, research and AI workflows';
export const SITE_TAGLINE = 'Your business, expertise or knowledge — turned into a digital system that brings customers.';
export const SITE_DESCRIPTION =
  'Digital Saathi turns offline businesses, professional expertise and complex knowledge into digital systems that attract ' +
  'customers, save time and keep working. Google Business Profile and WhatsApp Business setup for local businesses from ₹1,999, ' +
  'study material and past-paper analysis for coaching institutes from ₹2,999 a chapter, and competitor research, content ' +
  'systems and AI workflow automation for creators, consultants and startups. Start with a free Digital Audit; prices are ' +
  'shown upfront and every deliverable is checked by a person.';
export const SITE_KEYWORDS = [
  'Digital Saathi', 'free digital audit', 'Google Business Profile setup India', 'Google Maps listing for business',
  'WhatsApp Business setup', 'WhatsApp catalogue setup', 'local business digitization India', 'coaching centre marketing',
  'self-study library marketing', 'salon Google Maps listing', 'gym Google Maps listing', 'small business website India',
  'study material for coaching institutes', 'PYQ analysis', 'worksheets and quizzes for teachers', 'white-label study material',
  'YouTube channel audit', 'competitor research India', 'content engine for creators', 'AI workflow automation India',
];
export const CONTACT_EMAIL = 'onlinedesk120@gmail.com';
export const LAUNCH_DATE = '2026-09-05';

/** English question/answer pairs, as emitted in FAQPage data. */
export const FAQ: Array<[string, string]> = SITE_FAQ.map(([q, a]) => [q.en, a.en]);

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
    description: SITE_DESCRIPTION,
    areaServed: { '@type': 'Country', name: 'India' },
    knowsAbout: [
      'Google Business Profile', 'WhatsApp Business', 'Local search', 'Study material design', 'Past-paper analysis',
      'Competitor research', 'Content strategy', 'Workflow automation',
    ],
    contactPoint: [{
      '@type': 'ContactPoint', email: CONTACT_EMAIL, contactType: 'sales',
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

const offerPage = (o: Offer) => (o.vertical === 'all' ? `${SITE_URL}/pricing` : `${SITE_URL}/services/${o.vertical}`);

function offerJsonLd(o: Offer) {
  const spec = o.price === 0 ? { price: '0', priceCurrency: 'INR' } : {
    priceSpecification: {
      '@type': o.monthly ? 'UnitPriceSpecification' : 'PriceSpecification',
      priceCurrency: 'INR',
      ...(o.exact ? { price: o.price } : { minPrice: o.price }),
      ...(o.monthly ? { unitCode: 'MON', unitText: 'month' } : {}),
    },
  };
  return {
    '@type': 'Offer',
    name: o.name.en,
    description: o.summary.en,
    url: `${offerPage(o)}#${o.id}`,
    ...spec,
    itemOffered: { '@type': 'Service', name: o.name.en, description: o.summary.en },
    seller: { '@id': ORG_ID },
  };
}

/** The whole catalogue, for the homepage. */
export function serviceJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': SITE_URL + '/#services',
    name: 'Digital Saathi business services',
    serviceType: VERTICALS.map((v) => v.name.en),
    provider: { '@id': ORG_ID },
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    areaServed: { '@type': 'Country', name: 'India' },
    availableLanguage: ['English', 'Hindi'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Digital Saathi packages',
      itemListElement: [
        ...VERTICALS.map((v) => ({
          '@type': 'OfferCatalog', name: v.name.en,
          itemListElement: OFFERS.filter((o) => o.vertical === v.id).map(offerJsonLd),
        })),
        { '@type': 'OfferCatalog', name: 'For every client', itemListElement: OFFERS.filter((o) => o.vertical === 'all').map(offerJsonLd) },
      ],
    },
  };
}

/** One service line, for its own page. */
export function verticalJsonLd(v: Vertical) {
  const url = `${SITE_URL}/services/${v.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': url + '#service',
    name: v.name.en,
    description: v.promise.en,
    audience: { '@type': 'Audience', audienceType: v.audience.en },
    provider: { '@id': ORG_ID },
    url,
    areaServed: { '@type': 'Country', name: 'India' },
    offers: OFFERS.filter((o) => o.vertical === v.id).map(offerJsonLd),
  };
}

export function faqJsonLd(items: Array<[Tx, Tx]> = SITE_FAQ) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({
      '@type': 'Question', name: q.en,
      acceptedAnswer: { '@type': 'Answer', text: a.en },
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
