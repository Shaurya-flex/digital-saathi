import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import '@/styles/customer.css';
import '@/styles/supply.css';
import '@/styles/marketing.css';
import { Header } from '@/components/layout/Header';
import { AppBoot } from '@/components/layout/AppBoot';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  organizationJsonLd, websiteJsonLd, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TITLE, SITE_URL,
} from '@/lib/seo';

/* Site-wide search metadata. Every public page inherits this and overrides
   title/description/canonical in its own layout; private areas (/app,
   /admin, /provider, /agent, /login) set noindex in theirs. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: '%s · Digital Saathi' },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', locale: 'en_IN', url: '/', siteName: SITE_NAME,
    title: SITE_TITLE, description: SITE_DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: SITE_TITLE, description: SITE_DESCRIPTION },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  other: { 'geo.region': 'IN', 'geo.placename': 'India' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#232C6B' };

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
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
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
