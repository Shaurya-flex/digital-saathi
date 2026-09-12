import type { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/articles';
import { VERTICALS } from '@/lib/offers';
import { LAUNCH_DATE, SITE_URL } from '@/lib/seo';

/* Public pages only. Private areas (/app, /admin, /provider, /agent) and
   API routes are excluded here and disallowed in robots.ts. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly' | 'yearly', lastModified = now) =>
    ({ url: `${SITE_URL}${path}`, lastModified, changeFrequency, priority });
  const pages: MetadataRoute.Sitemap = [
    page('/', 1, 'weekly'),
    page('/audit', 0.9, 'monthly'),
    page('/services', 0.9, 'monthly'),
    ...VERTICALS.map((v) => page(`/services/${v.id}`, 0.9, 'monthly')),
    page('/pricing', 0.9, 'monthly'),
    page('/learn', 0.6, 'weekly'),
    page('/network', 0.4, 'monthly'),
    page('/partner', 0.4, 'monthly'),
    page('/become-agent', 0.4, 'monthly'),
    page('/login', 0.2, 'yearly'),
    page('/terms', 0.2, 'yearly'),
    page('/privacy', 0.2, 'yearly'),
  ];
  ARTICLES.forEach((a) => pages.push(page(`/learn/${a.id}`, 0.5, 'monthly', new Date(LAUNCH_DATE))));
  return pages;
}
