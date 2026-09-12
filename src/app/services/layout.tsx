import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Services — local business digitization, education content, research and automation',
  description: 'Three service lines from Digital Saathi: Google Business Profile and WhatsApp setup for local businesses, study material and past-paper analysis for educators, and competitor research, content systems and AI workflows for creators, consultants and startups. Prices shown upfront.',
  alternates: { canonical: '/services' },
  openGraph: { title: 'Digital Saathi services', description: 'Local business digitization, education content, research and automation — with prices upfront.', url: '/services' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
