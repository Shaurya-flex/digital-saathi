import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Pricing — plans from ₹99 a month, 50 free credits to start',
  description: 'Digital Saathi plans: Free (50 credits), Smart ₹99, Pro ₹199, Family ₹299 for up to 5 people, Premium Plus ₹499. Credits pay for Saathi’s work; real costs like bills and service fees are always shown before you approve.',
  alternates: { canonical: '/pricing' },
  openGraph: { title: 'Digital Saathi pricing', description: 'Plans from ₹99 a month. Free to start with 50 credits.', url: '/pricing' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
