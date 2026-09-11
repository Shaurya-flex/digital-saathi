import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: { default: 'Learn — UPI, recharges, bills, scams and government paperwork explained simply', template: '%s · Digital Saathi' },
  description: 'Short, practical explainers in plain language: how UPI works, choosing a recharge without overpaying, six scams that target elderly users, paying electricity bills, what an AI agent can and cannot do, and what to keep ready for any government application.',
  alternates: { canonical: '/learn' },
  openGraph: { title: 'Learn with Digital Saathi', description: 'Plain-language explainers on digital India — read them, listen to them, or ask Saathi.', url: '/learn' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
