'use client';

/* Browser side of the AI layer. Talks only to our own /api/ai/complete
   route with the user's Supabase token — the Anthropic key never leaves the
   server. Any failure returns null so the task engine can fall back to its
   scripted behaviour instead of leaving the user hanging. */

import { accessToken, supabase } from '../auth/supabase';
import { getDB } from '../store';

export type AiKind = 'ask' | 'doc_summary' | 'draft' | 'govt' | 'research';

export interface AiResult {
  text: string;
  model: string;
  tier: string;
  inputTokens: number;
  outputTokens: number;
  costPaise: number;
}

/** Real accounts on a Supabase-backed deployment. Demo mode never calls out. */
export function aiAvailable(): boolean {
  return getDB().mode === 'real' && !!supabase();
}

export async function aiComplete(
  kind: AiKind,
  input: string,
  ctx: { lang?: string; easy?: boolean; name?: string; city?: string },
): Promise<AiResult | null> {
  try {
    const token = await accessToken();
    if (!token) return null;
    const res = await fetch('/api/ai/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ kind, input, ...ctx }),
    });
    if (!res.ok) return null;
    return (await res.json()) as AiResult;
  } catch {
    return null;
  }
}
