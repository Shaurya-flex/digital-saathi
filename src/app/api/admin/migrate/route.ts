import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { OWNER_EMAILS } from '@/lib/owner';
import { callerFromRequest } from '@/lib/server/auth';

/* One-click database setup for the owner. Creates every table the app
   reads (backups, profiles, requests, applications, live providers and
   agents) and (re)creates the row-level-security policies, generating the
   owner-email list from NEXT_PUBLIC_OWNER_EMAILS so the database and the
   app can never disagree about who is an admin. Idempotent: run it again
   after changing the owner list. Needs DATABASE_URL (Supabase → Project
   Settings → Database → Connection string, the pooler URI) in server env;
   the connection string never reaches the browser. */

export const runtime = 'nodejs';
export const maxDuration = 60;

function ownersSql(): string {
  const list = OWNER_EMAILS.map((e) => `'${e.replace(/'/g, "''")}'`).join(',');
  return `(auth.jwt() ->> 'email') in (${list || "''"})`;
}

interface Policy { table: string; name: string; body: string }

function policyStatements(p: Policy): string[] {
  return [
    `drop policy if exists "${p.name}" on public.${p.table}`,
    `create policy "${p.name}" on public.${p.table} ${p.body}`,
  ];
}

function statements(): string[] {
  const OWN = ownersSql();
  const out: string[] = [
    // §3 backups
    `create table if not exists public.saathi_backups (
      user_id uuid primary key references auth.users (id) on delete cascade,
      db jsonb not null,
      updated_at timestamptz not null default now())`,
    `alter table public.saathi_backups enable row level security`,
    // §5 requests + applications
    `create table if not exists public.saathi_requests (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references auth.users (id) on delete cascade,
      task_id text not null,
      name text default '', email text default '', phone text default '',
      city text default '', lang text default '',
      intent text default '', category text default '', description text default '',
      status text not null default 'Understanding',
      result text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (user_id, task_id))`,
    `alter table public.saathi_requests enable row level security`,
    `create table if not exists public.saathi_applications (
      id uuid primary key default gen_random_uuid(),
      kind text not null check (kind in ('provider','agent')),
      name text not null check (char_length(name) between 2 and 80),
      phone text not null check (char_length(phone) between 10 and 16),
      city text default '',
      data jsonb default '{}'::jsonb,
      status text not null default 'new',
      created_at timestamptz not null default now())`,
    `alter table public.saathi_applications enable row level security`,
    // §6 profiles
    `create table if not exists public.saathi_profiles (
      user_id uuid primary key references auth.users (id) on delete cascade,
      name text default '', email text default '', phone text default '',
      city text default '', lang text default '', role text default 'customer',
      plan text default '', credits integer default 0, wallet integer default 0,
      easy boolean default false,
      updated_at timestamptz not null default now())`,
    `alter table public.saathi_profiles enable row level security`,
    // §7 live marketplace
    `create table if not exists public.saathi_providers (
      id text primary key,
      status text not null default 'Verified',
      city text default '', cat text default '',
      data jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now())`,
    `alter table public.saathi_providers enable row level security`,
    `create table if not exists public.saathi_agents (
      id text primary key,
      status text not null default 'Active',
      city text default '',
      data jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now())`,
    `alter table public.saathi_agents enable row level security`,
  ];

  const policies: Policy[] = [
    { table: 'saathi_backups', name: 'Users read their own backup', body: 'for select using (auth.uid() = user_id)' },
    { table: 'saathi_backups', name: 'Users write their own backup', body: 'for insert with check (auth.uid() = user_id)' },
    { table: 'saathi_backups', name: 'Users update their own backup', body: 'for update using (auth.uid() = user_id)' },
    { table: 'saathi_backups', name: 'backup_owner_select', body: `for select using (${OWN})` },

    { table: 'saathi_requests', name: 'req_insert_own', body: 'for insert with check (auth.uid() = user_id)' },
    { table: 'saathi_requests', name: 'req_select_own', body: 'for select using (auth.uid() = user_id)' },
    { table: 'saathi_requests', name: 'req_update_own', body: 'for update using (auth.uid() = user_id)' },
    { table: 'saathi_requests', name: 'req_owner_select', body: `for select using (${OWN})` },
    { table: 'saathi_requests', name: 'req_owner_update', body: `for update using (${OWN})` },

    { table: 'saathi_applications', name: 'app_insert_any', body: 'for insert to anon, authenticated with check (true)' },
    { table: 'saathi_applications', name: 'app_owner_select', body: `for select using (${OWN})` },
    { table: 'saathi_applications', name: 'app_owner_update', body: `for update using (${OWN})` },

    { table: 'saathi_profiles', name: 'profile_write_own', body: 'for insert with check (auth.uid() = user_id)' },
    { table: 'saathi_profiles', name: 'profile_update_own', body: 'for update using (auth.uid() = user_id)' },
    { table: 'saathi_profiles', name: 'profile_select_own', body: 'for select using (auth.uid() = user_id)' },
    { table: 'saathi_profiles', name: 'profile_owner_select', body: `for select using (${OWN})` },

    { table: 'saathi_providers', name: 'providers_public_read', body: 'for select to anon, authenticated using (true)' },
    { table: 'saathi_providers', name: 'providers_owner_write', body: `for all using (${OWN})` },
    { table: 'saathi_agents', name: 'agents_public_read', body: 'for select to anon, authenticated using (true)' },
    { table: 'saathi_agents', name: 'agents_owner_write', body: `for all using (${OWN})` },
  ];
  policies.forEach((p) => out.push(...policyStatements(p)));
  return out;
}

export async function POST(req: Request) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return NextResponse.json({ error: 'DATABASE_URL is not set on this deployment.' }, { status: 503 });
  }
  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 1, connectionTimeoutMillis: 10000 });
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    await pool.end().catch(() => undefined);
    const msg = e instanceof Error ? e.message : 'Could not connect to the database.';
    return NextResponse.json({ error: 'Database unreachable: ' + msg }, { status: 502 });
  }
  // First-run bootstrap: until the schema exists there is nothing an owner
  // policy could protect, and the statements are a fixed, idempotent schema
  // — so the very first install may run without a login (the classic
  // install-page pattern). After that, only an owner account can re-run it.
  const installed = Boolean((await client.query("select to_regclass('public.saathi_profiles') as t")).rows[0]?.t);
  if (installed) {
    const caller = await callerFromRequest(req);
    if (!caller || !caller.owner) {
      client.release();
      await pool.end();
      return NextResponse.json({ error: 'Owner account required.' }, { status: 401 });
    }
  }
  const list = statements();
  let done = 0;
  try {
    await client.query('begin');
    for (const sql of list) {
      await client.query(sql);
      done++;
    }
    await client.query('commit');
  } catch (e) {
    await client.query('rollback').catch(() => undefined);
    client.release();
    await pool.end();
    const msg = e instanceof Error ? e.message : 'Migration failed.';
    return NextResponse.json({ error: msg, done, total: list.length }, { status: 500 });
  }
  client.release();
  await pool.end();
  return NextResponse.json({ ok: true, done, total: list.length, owners: OWNER_EMAILS.length });
}
