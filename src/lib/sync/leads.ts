'use client';

/* Owner-side reads and status updates for free-audit leads. Row-level
   security lets only owner accounts see or change them (the insert-only
   policy for the public form lives in /api/admin/migrate). */

import { supabase } from '../auth/supabase';

export const LEAD_STATUSES = ['new', 'contacted', 'audit-sent', 'proposal', 'won', 'lost', 'not-fit'] as const;

export interface LeadRow {
  id: string; name: string; phone: string; email: string; business: string; city: string;
  role: string; vertical: string; industry: string; problem: string; objective: string;
  assets: string[]; deadline: string; budget: string; language: string; contact_pref: string;
  offer: string; source: string; status: string; notes: string; consent: boolean;
  created_at: string; updated_at: string;
}

export async function fetchLeads(): Promise<LeadRow[] | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.from('saathi_leads').select('*').order('created_at', { ascending: false }).limit(500);
  return error ? null : (data as LeadRow[]);
}

export async function setLeadStatus(id: string, status: string): Promise<boolean> {
  const sb = supabase();
  if (!sb) return false;
  const { error } = await sb.from('saathi_leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  return !error;
}
