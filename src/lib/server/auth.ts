import { createClient } from '@supabase/supabase-js';
import { isOwnerEmail } from '@/lib/owner';

/* Server-side identity for our own API routes. The browser sends its
   Supabase access token as a Bearer header; we validate it against Supabase
   (anon key — no service role needed) and get back who is calling. Keys
   for paid services (Anthropic, database) stay in server env and are only
   ever used behind a successful check here. */

export interface Caller { id: string; email: string; owner: boolean }

export async function callerFromRequest(req: Request): Promise<Caller | null> {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  if (!token || !/^https?:\/\/.+/.test(url) || !key) return null;
  try {
    const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data.user) return null;
    const email = (data.user.email || '').toLowerCase();
    return { id: data.user.id, email, owner: isOwnerEmail(email) };
  } catch {
    return null;
  }
}
