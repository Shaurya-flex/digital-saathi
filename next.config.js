/** @type {import('next').NextConfig} */
// SAATHI_STATIC_EXPORT=1 builds a fully static site (GitHub Pages) — note
// that security headers and the payment API routes only exist on a server
// deployment (Vercel), which is the production path.
const isStatic = process.env.SAATHI_STATIC_EXPORT === '1';

// Locked-down defaults: no framing (clickjacking), no MIME sniffing, HTTPS
// pinned, camera/mic/etc. denied, and a CSP that only allows the origins the
// app actually uses (Supabase auth+data, Razorpay checkout, Google fonts).
// Next dev mode needs eval for HMR/source maps; production stays strict.
const devEval = process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : '';

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(self), payment=(self "https://checkout.razorpay.com"), usb=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'" + devEval + ' https://checkout.razorpay.com',
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      'font-src https://fonts.gstatic.com',
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com",
      'frame-src https://api.razorpay.com https://checkout.razorpay.com',
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.razorpay.com",
    ].join('; '),
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isStatic
    ? {
        output: 'export',
        images: { unoptimized: true },
        basePath: process.env.SAATHI_BASE_PATH || '',
        trailingSlash: true,
      }
    : {
        async headers() {
          return [{ source: '/(.*)', headers: securityHeaders }];
        },
      }),
};

module.exports = nextConfig;
