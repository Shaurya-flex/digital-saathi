import { ImageResponse } from 'next/og';

/* The preview card for WhatsApp, Google, X and LinkedIn shares. Generated at
   build time from brand tokens — no design file to keep in sync. */

export const alt = 'Digital Saathi — your business, expertise or knowledge, turned into a digital system that brings customers.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: 72, background: '#F7F5F0', color: '#191b27', fontFamily: 'sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{
            width: 88, height: 88, borderRadius: 26, background: '#232C6B', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 700,
            boxShadow: 'inset 0 -14px 0 rgba(232,163,61,.85)',
          }}>DS</div>
          <div style={{ fontSize: 46, fontWeight: 700 }}>Digital Saathi</div>
        </div>
        <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.06, maxWidth: 1060, letterSpacing: -1 }}>
          Your business, expertise or knowledge — turned into a digital system that brings customers.
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 30, color: '#5a5f72', maxWidth: 820 }}>
            Free Digital Audit · Google &amp; WhatsApp setup · Study material · Research &amp; AI workflows
          </div>
          <div style={{ height: 16, width: 220, borderRadius: 8, background: '#E8A33D' }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
