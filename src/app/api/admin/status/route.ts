import { NextResponse } from 'next/server';
import { OWNER_EMAILS } from '@/lib/owner';
import { callerFromRequest } from '@/lib/server/auth';
import { modelFor, pickProvider } from '@/lib/server/llm';

/* Which live services this deployment actually has keys for — booleans
   only, never values. Owner-gated. Drives the truthful Live/Mock badges on
   Admin → Integrations. */

export const runtime = 'nodejs';

const has = (k: string) => Boolean((process.env[k] || '').trim());

export async function GET(req: Request) {
  const caller = await callerFromRequest(req);
  if (!caller || !caller.owner) {
    return NextResponse.json({ error: 'Owner account required.' }, { status: 401 });
  }
  return NextResponse.json({
    supabase: has('NEXT_PUBLIC_SUPABASE_URL') && has('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    database: has('DATABASE_URL'),
    anthropic: has('ANTHROPIC_API_KEY'),
    openrouter: has('OPENROUTER_API_KEY'),
    sarvam: has('SARVAM_API_KEY'),
    aiProvider: pickProvider(),
    razorpay: has('RAZORPAY_KEY_ID') && has('RAZORPAY_KEY_SECRET'),
    paymentsLive: (process.env.NEXT_PUBLIC_PAYMENTS_LIVE || '') === '1',
    models: (() => {
      const p = pickProvider();
      return {
        light: p ? modelFor(p, 'light') : '—',
        standard: p ? modelFor(p, 'standard') : '—',
        reasoning: p ? modelFor(p, 'reasoning') : '—',
      };
    })(),
    owners: OWNER_EMAILS.length,
  });
}
