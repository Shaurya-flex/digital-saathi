import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Become a digital agent — work tasks from home, paid per task',
  description: 'When the AI cannot finish a task safely — train bookings, government forms, appointment calls, documents — it goes to a verified digital agent. Work from anywhere in your own languages and keep 80% of every task.',
  alternates: { canonical: '/become-agent' },
  openGraph: { title: 'Become a Digital Saathi digital agent', description: 'Work from home on bookings, forms and documents. Paid per task, 20% platform fee.', url: '/become-agent' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
