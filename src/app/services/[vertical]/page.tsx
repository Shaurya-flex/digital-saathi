import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VERTICALS, flagshipFor, offersFor, priceLabel, verticalById } from '@/lib/offers';
import { VerticalPage } from './VerticalPage';

export const dynamicParams = false;

export function generateStaticParams() {
  return VERTICALS.map((v) => ({ vertical: v.id }));
}

const TITLES: Record<string, string> = {
  'local-business': 'Google Business Profile & WhatsApp setup for local businesses',
  education: 'Study material, PYQ analysis and content for coaching institutes',
  'research-content-automation': 'Competitor research, content systems and AI workflow automation',
};

export function generateMetadata({ params }: { params: { vertical: string } }): Metadata {
  const v = verticalById(params.vertical);
  if (!v) return {};
  const cheapest = offersFor(v.id).reduce((a, b) => (b.price < a.price ? b : a));
  const description = `${v.promise.en} Packages ${priceLabel(cheapest, 'en')}, starting with the ${flagshipFor(v.id).name.en}. Free Digital Audit first; prices shown upfront.`;
  return {
    title: TITLES[v.id],
    description,
    alternates: { canonical: `/services/${v.id}` },
    openGraph: { title: `${v.name.en} — Digital Saathi`, description, url: `/services/${v.id}` },
  };
}

export default function Page({ params }: { params: { vertical: string } }) {
  const v = verticalById(params.vertical);
  if (!v) notFound();
  return <VerticalPage id={v.id} />;
}
