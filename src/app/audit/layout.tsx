import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Free Digital Audit — see what to fix first',
  description: 'Request a free Digital Audit from Digital Saathi: a scorecard of how customers, students or followers find you today — Google Maps, WhatsApp, website, reviews, social profiles or study material — with your top three fixes and starting prices. No obligation.',
  alternates: { canonical: '/audit' },
  openGraph: { title: 'Free Digital Audit — Digital Saathi', description: 'A scorecard and your top three fixes, free.', url: '/audit' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
