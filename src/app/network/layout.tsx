import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Partner with Digital Saathi — customers, service partners and digital agents',
  description: 'One network, three sides: customers who need digital and daily tasks done, verified local service partners (electricians, plumbers, salons) who keep 85% of every job, and digital agents who work tasks online and keep 80%. Commission shown before every job.',
  alternates: { canonical: '/network' },
  openGraph: { title: 'Partner with Digital Saathi', description: 'Earn as a verified service partner or a digital agent — transparent commission, weekly payouts.', url: '/network' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
