import type { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/articles';
import { LAUNCH_DATE, SITE_URL } from '@/lib/seo';

/* Public pages only. Private areas (/app, /admin, /provider, /agent) and
   API routes are excluded here and disallowed in robots.ts. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/network`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/partner`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/become-agent`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/learn`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(LAUNCH_DATE), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(LAUNCH_DATE), changeFrequency: 'yearly', priority: 0.2 },
  ];
  ARTICLES.forEach((a) => pages.push({
    url: `${SITE_URL}/learn/${a.id}`, lastModified: new Date(LAUNCH_DATE), changeFrequency: 'monthly', priority: 0.6,
  }));
  return pages;
}
