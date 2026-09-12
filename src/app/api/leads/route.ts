import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ASSETS, BUDGETS, CONTACT_PREFS, DEADLINES, LANGUAGES, NEEDS, OFFERS, ROLES } from '@/lib/offers';

/* Free-audit requests from the public site. Validates the request and
   stores it in saathi_leads (created by Admin → Integrations → Run database
   setup) through the public anon key and that table's insert-only policy;
   owner accounts read leads in Admin → Leads. Whenever it cannot save, it
   answers {stored:false} rather than an error, so the page hands the
   request to WhatsApp or email and nothing a prospect typed is lost.
   No IP address is stored; the rate limit lives in memory only. */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  if (hits.size > 5000) hits.clear();
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const idSet = (list: Array<{ id: string }>) => new Set(list.map((o) => o.id));
const ROLE_IDS = idSet(ROLES);
const NEED_IDS = idSet(NEEDS);
const ASSET_IDS = idSet(ASSETS);
const DEADLINE_IDS = idSet(DEADLINES);
const BUDGET_IDS = idSet(BUDGETS);
const LANGUAGE_IDS = idSet(LANGUAGES);
const CONTACT_IDS = idSet(CONTACT_PREFS);
const OFFER_IDS = idSet(OFFERS);

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const pick = (v: unknown, allowed: Set<string>) => (typeof v === 'string' && allowed.has(v) ? v : '');

function indianMobile(raw: string): string | null {
  let d = raw.replace(/[^\d]/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // A filled hidden field, or a form completed in under 2.5 seconds, is a
  // bot. Drop it quietly; a real person still gets the hand-off buttons.
  if (str(body.hp, 200) || (Number(body.elapsedMs) || 0) < 2500) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests. Please try again in a few minutes.' }, { status: 429 });
  }

  const name = str(body.name, 80);
  const phone = indianMobile(str(body.phone, 20));
  const email = str(body.email, 120);
  const city = str(body.city, 80);
  const problem = str(body.problem, 1500);
  const bad: string[] = [];
  if (name.length < 2) bad.push('name');
  if (!phone) bad.push('phone');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push('email');
  if (city.length < 2) bad.push('city');
  if (problem.length < 5) bad.push('problem');
  if (body.consent !== true) bad.push('consent');
  if (bad.length) {
    return NextResponse.json({ ok: false, error: 'Please check: ' + bad.join(', '), fields: bad }, { status: 400 });
  }

  const assets = Array.isArray(body.assets)
    ? body.assets.filter((a): a is string => typeof a === 'string' && ASSET_IDS.has(a)).slice(0, 12)
    : [];
  const row = {
    name, phone, email, city, problem, assets, consent: true,
    business: str(body.business, 120),
    role: pick(body.role, ROLE_IDS),
    vertical: pick(body.need, NEED_IDS),
    industry: str(body.industry, 60),
    objective: str(body.objective, 800),
    deadline: pick(body.deadline, DEADLINE_IDS),
    budget: pick(body.budget, BUDGET_IDS),
    language: pick(body.language, LANGUAGE_IDS),
    contact_pref: pick(body.contactPref, CONTACT_IDS),
    offer: pick(body.offer, OFFER_IDS),
    source: str(body.source, 200),
  };

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  if (!/^https?:\/\/.+/.test(url) || !key) return NextResponse.json({ ok: true, stored: false });
  try {
    const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await sb.from('saathi_leads').insert(row);
    return NextResponse.json({ ok: true, stored: !error });
  } catch {
    return NextResponse.json({ ok: true, stored: false });
  }
}
