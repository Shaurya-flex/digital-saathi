import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Log in or create your account',
  description: 'Log in to Digital Saathi with Google, email and password, or a one-tap email link. Free to start with 50 credits.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: true },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
