import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import '@/styles/customer.css';
import '@/styles/supply.css';
import { Header } from '@/components/layout/Header';
import { AppBoot } from '@/components/layout/AppBoot';

export const metadata: Metadata = {
  title: 'Digital Saathi — Aap bas boliye, kaam hum sambhalenge',
  description:
    'Digital Saathi is an AI concierge for India. Speak or type what you need — recharge, bills, bookings, forms, documents, appointments and local services.',
  robots: { index: false },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Mukta:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23232C6B'/%3E%3Crect y='44' width='64' height='20' rx='10' fill='%23E8A33D' opacity='.85'/%3E%3Ctext x='32' y='40' font-size='28' text-anchor='middle' fill='%23fff' font-family='sans-serif'%3E%E0%A4%A1%E0%A4%BF%3C/text%3E%3C/svg%3E" />
      </head>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <Header />
        {children}
        <AppBoot />
      </body>
    </html>
  );
}
