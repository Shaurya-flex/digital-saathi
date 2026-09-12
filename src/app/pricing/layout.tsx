import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Pricing — free Digital Audit, packages from ₹1,999, monthly plans from ₹5,000',
  description: 'Digital Saathi prices in INR: a free Digital Audit; Google Profile Quick Fix from ₹1,999; Google & WhatsApp Visibility Kit from ₹4,999; Chapter Learning Pack from ₹2,999 per chapter; Channel or Profile Audit from ₹2,999; projects from ₹15,000; monthly plans from ₹5,000; premium work from ₹50,000. Half to start, half on delivery; GST extra where it applies.',
  alternates: { canonical: '/pricing' },
  openGraph: { title: 'Digital Saathi pricing', description: 'Free audit, packages from ₹1,999, monthly plans from ₹5,000.', url: '/pricing' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
