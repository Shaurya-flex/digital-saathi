/** @type {import('next').NextConfig} */
// SAATHI_STATIC_EXPORT=1 builds a fully static site (GitHub Pages).
// On Vercel, leave it unset so future API routes (payments, webhooks) work.
const isStatic = process.env.SAATHI_STATIC_EXPORT === '1';

const nextConfig = {
  reactStrictMode: true,
  ...(isStatic
    ? {
        output: 'export',
        images: { unoptimized: true },
        basePath: process.env.SAATHI_BASE_PATH || '',
        trailingSlash: true,
      }
    : {}),
};

module.exports = nextConfig;
