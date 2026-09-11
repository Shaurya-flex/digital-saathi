import { ImageResponse } from 'next/og';

/* The preview card for WhatsApp, Google, X and LinkedIn shares. Generated at
   build time from brand tokens — no design file to keep in sync. */

export const alt = 'Digital Saathi — Just speak. We’ll handle your digital and daily tasks.';
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
        <div style={{ fontSize: 74, fontWeight: 700, lineHeight: 1.05, maxWidth: 1040, letterSpacing: -1 }}>
          Just speak. We’ll handle your digital and daily tasks.
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 30, color: '#5a5f72', maxWidth: 820 }}>
            Bills · Recharges · Documents · Government paperwork · Doorstep services · Hindi · Hinglish · English
          </div>
          <div style={{ height: 16, width: 220, borderRadius: 8, background: '#E8A33D' }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
