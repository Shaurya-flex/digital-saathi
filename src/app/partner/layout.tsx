import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Become a service partner — electricians, plumbers, AC technicians, salons',
  description: 'Get home-service jobs near you with the price agreed before you leave. You keep 85% of every job, paid weekly, no joining fee. Identity and police verification before your first job. Apply in 2 minutes.',
  alternates: { canonical: '/partner' },
  openGraph: { title: 'Become a Digital Saathi service partner', description: 'Jobs near you, transparent 15% platform fee, weekly payouts.', url: '/partner' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
