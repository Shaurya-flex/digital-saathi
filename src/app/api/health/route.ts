import { NextResponse } from 'next/server';
import { Pool } from 'pg';

/* Public health check — booleans only, never values. Answers the questions
   an operator asks first: is sign-in configured, does the database connect,
   has the schema been installed, do AI and payments have keys. Safe to
   expose: it reveals no more than the login page and the demo flags already
   do, and it is what lets setup be verified from outside a browser session. */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const has = (k: string) => Boolean((process.env[k] || '').trim());

export async function GET() {
  let database: 'not configured' | 'connected' | 'unreachable' = 'not configured';
  let installed = false;
  if (has('DATABASE_URL')) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 1, connectionTimeoutMillis: 8000 });
    try {
      const r = await pool.query("select to_regclass('public.saathi_profiles') as t");
      database = 'connected';
      installed = Boolean(r.rows[0]?.t);
    } catch {
      database = 'unreachable';
    } finally {
      await pool.end().catch(() => undefined);
    }
  }
  return NextResponse.json({
    ok: true,
    supabase: has('NEXT_PUBLIC_SUPABASE_URL') && has('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    database,
    installed,
    ai: has('ANTHROPIC_API_KEY'),
    razorpay: has('RAZORPAY_KEY_ID') && has('RAZORPAY_KEY_SECRET'),
    paymentsLive: (process.env.NEXT_PUBLIC_PAYMENTS_LIVE || '') === '1',
  });
}
