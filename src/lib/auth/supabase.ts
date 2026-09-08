'use client';

/* Supabase is the real-user backend: Google sign-in (OAuth), a Postgres row
   per user, and a JSON backup of each user's Saathi data. Works from a fully
   static deploy — everything runs client-side with the anon key + RLS.
   When the env keys are absent every helper degrades gracefully so the app
   still runs in demo mode. Setup steps: docs/SUPABASE.md. */

import { createClient, type SupabaseClient, type User as SupaUser } from '@supabase/supabase-js';

let client: SupabaseClient | null | undefined;

export function supabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  // A misconfigured value (placeholder text, missing protocol) must degrade
  // to demo mode, never crash prerendering or the browser.
  try {
    client = /^https?:\/\/.+/.test(url) && key ? createClient(url, key) : null;
  } catch {
    client = null;
  }
  return client;
}

export const authConfigured = () => !!supabase();

export async function signInWithGoogle(): Promise<string | null> {
  const sb = supabase();
  if (!sb) return 'Google sign-in is not configured yet (set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY).';
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/login' },
  });
  return error ? error.message : null;
}

export async function supaSignOut() {
  await supabase()?.auth.signOut();
}

export async function currentSupaUser(): Promise<SupaUser | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.user || null;
}

export function onAuthChange(cb: (u: SupaUser | null) => void): () => void {
  const sb = supabase();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((_e, session) => cb(session?.user || null));
  return () => data.subscription.unsubscribe();
}

export type { SupaUser };
