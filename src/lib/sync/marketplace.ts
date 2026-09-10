'use client';

/* The live, shared marketplace catalogue — real service partners and
   digital agents that real customers actually see. Distinct from the local
   demo/seed arrays: this is read from Supabase so every customer's browser
   sees the SAME approved supply, not just whatever happened to be seeded
   into their own device.

   Approving an application (owner-only, RLS-enforced — docs/SUPABASE.md §7)
   is what turns a phone-verified applicant into something customers can
   actually book. Nothing here lets a non-owner write a row. */

import { supabase } from '../auth/supabase';
import { uid } from '../seed';
import type { Agent, Provider } from '../types';
import type { ApplicationRow } from './requests';

const PROVIDERS = 'saathi_providers';
const AGENTS = 'saathi_agents';

export async function fetchLiveProviders(): Promise<Provider[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb.from(PROVIDERS).select('data').eq('status', 'Verified').limit(500);
  if (error || !data) return [];
  return data.map((r: { data: Provider }) => r.data);
}

export async function fetchLiveAgents(): Promise<Agent[]> {
  const sb = supabase();
  if (!sb) return [];
  const { data, error } = await sb.from(AGENTS).select('data').eq('status', 'Active').limit(500);
  if (error || !data) return [];
  return data.map((r: { data: Agent }) => r.data);
}

/** Owner-only: turn an approved provider application into a live,
    bookable listing. Returns the created provider, or null on failure. */
export async function approveProviderApplication(app: ApplicationRow): Promise<Provider | null> {
  const sb = supabase();
  if (!sb) return null;
  const d = app.data || {};
  const provider: Provider = {
    id: uid('lp'),
    name: app.name, owner: app.name, phone: app.phone,
    city: app.city || 'Delhi NCR', locality: String(d.locality || app.city || ''),
    cat: String(d.service || 'General service'),
    exp: Number(d.experience_years) || 0,
    lang: String(d.languages || 'Hindi').split(',').map((s) => s.trim()).filter(Boolean),
    bio: '', rating: 0, jobs: 0,
    radius: Number(d.radius_km) || 6, eta: 45,
    base: Number(d.base_price) || 249, hourly: 0,
    status: 'Verified',
    aadhaar: true, pan: false, skill_cert: false, address_proof: true, police: false,
    badges: ['Identity verified'], resp: 15, completion: 1,
    x: 20 + Math.random() * 60, y: 20 + Math.random() * 60, open: true,
    reviews_count: 0, rating_hist: {}, cancelled: 0, disputes: 0,
    joined: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
  };
  const { error: e1 } = await sb.from(PROVIDERS).insert({ id: provider.id, status: provider.status, city: provider.city, cat: provider.cat, data: provider });
  if (e1) return null;
  const { error: e2 } = await sb.from('saathi_applications').update({ status: 'verified' }).eq('id', app.id);
  if (e2) return null;
  return provider;
}

/** Owner-only: turn an approved digital-agent application into a live,
    claimable queue member. Returns the created agent, or null on failure. */
export async function approveAgentApplication(app: ApplicationRow): Promise<Agent | null> {
  const sb = supabase();
  if (!sb) return null;
  const d = app.data || {};
  const skills = String(d.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  const agent: Agent = {
    id: uid('la'),
    name: app.name, phone: app.phone, city: app.city || 'Remote',
    lang: String(d.langs || 'Hindi, English').split(',').map((s) => s.trim()).filter(Boolean),
    online: false, skills: skills.length ? skills : ['General tasks'],
    rating: 0, done: 0, cancel: 0, dispute: 0, sla: 'New', resp_min: 0,
    earnings: 0, pending: 0, wk_earnings: 0,
    verified: true, aadhaar: true, pan: false, skill_test: 'passed', bg_check: 'passed',
    level: 'New', status: 'Active',
    joined: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
  };
  const { error: e1 } = await sb.from(AGENTS).insert({ id: agent.id, status: agent.status, city: agent.city, data: agent });
  if (e1) return null;
  const { error: e2 } = await sb.from('saathi_applications').update({ status: 'verified' }).eq('id', app.id);
  if (e2) return null;
  return agent;
}

/** Owner-only: counts for the Admin → Overview dashboard. */
export async function fetchMarketplaceCounts(): Promise<{ providers: number; agents: number } | null> {
  const sb = supabase();
  if (!sb) return null;
  const [p, a] = await Promise.all([
    sb.from(PROVIDERS).select('id', { count: 'exact', head: true }).eq('status', 'Verified'),
    sb.from(AGENTS).select('id', { count: 'exact', head: true }).eq('status', 'Active'),
  ]);
  if (p.error || a.error) return null;
  return { providers: p.count || 0, agents: a.count || 0 };
}
