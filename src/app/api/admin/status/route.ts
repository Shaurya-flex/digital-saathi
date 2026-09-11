import { NextResponse } from 'next/server';
import { OWNER_EMAILS } from '@/lib/owner';
import { callerFromRequest } from '@/lib/server/auth';

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
    razorpay: has('RAZORPAY_KEY_ID') && has('RAZORPAY_KEY_SECRET'),
    paymentsLive: (process.env.NEXT_PUBLIC_PAYMENTS_LIVE || '') === '1',
    models: {
      light: process.env.SAATHI_LLM_LIGHT || 'claude-haiku-4-5',
      standard: process.env.SAATHI_LLM_STANDARD || 'claude-sonnet-5',
      reasoning: process.env.SAATHI_LLM_REASONING || 'claude-sonnet-5',
    },
    owners: OWNER_EMAILS.length,
  });
}
