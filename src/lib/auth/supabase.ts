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

/** Create an account (or sign in) with name + email: Supabase emails a
    one-tap sign-in link. No password is ever created or stored. */
export async function signInWithEmail(email: string, name?: string): Promise<string | null> {
  const sb = supabase();
  if (!sb) return 'Email sign-in is not configured yet (set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY).';
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: window.location.origin + '/login',
      data: name ? { full_name: name } : undefined,
    },
  });
  return error ? error.message : null;
}

const NOT_CONFIGURED = 'Sign-in is not configured yet (set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY).';

/** Create an account with email + password. If the project requires email
    confirmation, no session is returned until the user clicks the link. */
export async function signUpWithPassword(email: string, password: string, name?: string): Promise<{ error: string | null; needsConfirm: boolean }> {
  const sb = supabase();
  if (!sb) return { error: NOT_CONFIGURED, needsConfirm: false };
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { data: name ? { full_name: name } : undefined, emailRedirectTo: window.location.origin + '/login' },
  });
  if (error) return { error: error.message, needsConfirm: false };
  return { error: null, needsConfirm: !data.session };
}

/** Log in with email + password. */
export async function signInWithPassword(email: string, password: string): Promise<string | null> {
  const sb = supabase();
  if (!sb) return NOT_CONFIGURED;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  return error ? error.message : null;
}

/** Emails a reset link that lands on /login?reset=1 with a recovery session. */
export async function requestPasswordReset(email: string): Promise<string | null> {
  const sb = supabase();
  if (!sb) return NOT_CONFIGURED;
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/login?reset=1' });
  return error ? error.message : null;
}

export async function updatePassword(password: string): Promise<string | null> {
  const sb = supabase();
  if (!sb) return NOT_CONFIGURED;
  const { error } = await sb.auth.updateUser({ password });
  return error ? error.message : null;
}

/** The signed-in user's access token, for calling our own server routes
    (AI, admin). Never stored anywhere; read fresh each call. */
export async function accessToken(): Promise<string | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token || null;
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
