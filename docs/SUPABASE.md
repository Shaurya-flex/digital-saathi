# Supabase setup — Google sign-in + cloud backup

Supabase gives Digital Saathi everything it needs for real users in one free service:
Google OAuth, a Postgres database, and per-user JSON backup — all callable straight
from the browser, so it works even on a fully static deploy.

## 1. Create the project

1. Go to [supabase.com](https://supabase.com) → New project (free tier is fine).
2. From **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Put both in `.env.local` (local dev) and in your host's environment variables
   (Vercel → Project → Settings → Environment Variables).

## 2. Enable Google sign-in

1. In [Google Cloud Console](https://console.cloud.google.com) create an OAuth 2.0
   Client ID (type: Web application).
2. Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. In Supabase → **Authentication → Providers → Google**: paste the Client ID and
   Client Secret, enable the provider.
4. In Supabase → **Authentication → URL Configuration**: set your site URL
   (e.g. `https://your-app.vercel.app`) and add `http://localhost:3000` to the
   redirect allow-list for local dev.

## 3. Create the backup table (SQL editor → run once)

```sql
create table if not exists public.saathi_backups (
  user_id uuid primary key references auth.users (id) on delete cascade,
  db jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.saathi_backups enable row level security;

create policy "Users read their own backup"
  on public.saathi_backups for select
  using (auth.uid() = user_id);

create policy "Users write their own backup"
  on public.saathi_backups for insert
  with check (auth.uid() = user_id);

create policy "Users update their own backup"
  on public.saathi_backups for update
  using (auth.uid() = user_id);
```

Row-level security means the anon key in the browser can only ever touch the
signed-in user's own row.

## 4. What the app does with it

- **Sign-in** (`src/lib/auth/supabase.ts`) — `Continue with Google` on `/login`
  runs the OAuth flow; no passwords ever touch Digital Saathi.
- **Account bootstrap** (`src/lib/auth/realUser.ts`) — first sign-in on a device
  wipes the fabricated demo data, creates a clean customer account from the
  Google profile and grants 50 welcome credits.
- **Backup** (`src/lib/sync/backup.ts`) — every change is mirrored to
  `saathi_backups` (debounced 4s). On sign-in the cloud copy is restored when
  it is newer, so users can clear their browser or switch devices safely.

No keys configured? Everything degrades gracefully: the app still runs, and
`/login?demo=1` offers the fabricated sandbox personas.

## 5. The operator's desk — requests + applications (SQL editor → run once)

```sql
-- Service requests: mirrored from each user's local task engine so the
-- operator can actually deliver. Users see only their own rows; the owner
-- accounts below see and manage everything.
create table if not exists public.saathi_requests (
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
  unique (user_id, task_id)
);
alter table public.saathi_requests enable row level security;

create policy "req_insert_own" on public.saathi_requests for insert with check (auth.uid() = user_id);
create policy "req_select_own" on public.saathi_requests for select using (auth.uid() = user_id);
create policy "req_update_own" on public.saathi_requests for update using (auth.uid() = user_id);
create policy "req_owner_select" on public.saathi_requests for select using (
  (auth.jwt() ->> 'email') in ('identicalinnovator@gmail.com','srajphotos42@gmail.com','onlinedesk120@gmail.com'));
create policy "req_owner_update" on public.saathi_requests for update using (
  (auth.jwt() ->> 'email') in ('identicalinnovator@gmail.com','srajphotos42@gmail.com','onlinedesk120@gmail.com'));

-- Partner / agent applications: anonymous inserts allowed (no sign-in
-- barrier for professionals), readable only by the owner accounts.
create table if not exists public.saathi_applications (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('provider','agent')),
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (char_length(phone) between 10 and 16),
  city text default '',
  data jsonb default '{}'::jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
alter table public.saathi_applications enable row level security;

create policy "app_insert_any" on public.saathi_applications for insert to anon, authenticated with check (true);
create policy "app_owner_select" on public.saathi_applications for select using (
  (auth.jwt() ->> 'email') in ('identicalinnovator@gmail.com','srajphotos42@gmail.com','onlinedesk120@gmail.com'));
create policy "app_owner_update" on public.saathi_applications for update using (
  (auth.jwt() ->> 'email') in ('identicalinnovator@gmail.com','srajphotos42@gmail.com','onlinedesk120@gmail.com'));
```

Admin → **Requests inbox** reads these tables; user-side writes happen
automatically from the task engine and the application forms.

## 6. Admin — view real users (SQL editor → run once)

Lets the three owner accounts list every signed-up user and open a **read-only**
preview of their account exactly as they see it (their tasks, wallet, documents,
bookings) — for support and product improvement. This never lets an owner sign
in as the user, take an action on their behalf, or reach anyone else's data —
Row Level Security enforces that at the database level, not just in the UI.

```sql
-- Lightweight, listable index — one row per real user, upserted alongside
-- every backup push. Keeps the Admin → Users list fast without pulling
-- every user's full backup blob just to render a table.
create table if not exists public.saathi_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text default '', email text default '', phone text default '',
  city text default '', lang text default '', role text default 'customer',
  plan text default '', credits integer default 0, wallet integer default 0,
  easy boolean default false,
  updated_at timestamptz not null default now()
);
alter table public.saathi_profiles enable row level security;

create policy "profile_write_own" on public.saathi_profiles for insert with check (auth.uid() = user_id);
create policy "profile_update_own" on public.saathi_profiles for update using (auth.uid() = user_id);
create policy "profile_select_own" on public.saathi_profiles for select using (auth.uid() = user_id);
create policy "profile_owner_select" on public.saathi_profiles for select using (
  (auth.jwt() ->> 'email') in ('identicalinnovator@gmail.com','srajphotos42@gmail.com','onlinedesk120@gmail.com'));

-- The owner accounts may also read (never write) any user's full backup, so
-- the "View" action can show that one user's tasks/documents/bookings.
create policy "backup_owner_select" on public.saathi_backups for select using (
  (auth.jwt() ->> 'email') in ('identicalinnovator@gmail.com','srajphotos42@gmail.com','onlinedesk120@gmail.com'));
```

If you change the owner email list (`NEXT_PUBLIC_OWNER_EMAILS` in Vercel), update
the email arrays in this file's policies and in section 5 to match — the app-side
list and the database-side list are separate and both must agree.

## 0. The easy way — one click from the admin desk

Everything in sections 3, 5, 6 and 7 below can be created (and safely re-created)
by the owner from **Admin → Integrations → Run database setup**. It needs one
server-side variable in Vercel:

- `DATABASE_URL` — Supabase → Project Settings → Database → Connection string →
  URI. Pick the **pooler** address (Session or Transaction pooler), not the
  direct one, because Vercel functions reach Supabase over IPv4.

The setup route (`src/app/api/admin/migrate/route.ts`) generates the
owner-email policies from `NEXT_PUBLIC_OWNER_EMAILS`, so the database and the
app can never disagree about who is an admin — re-run it whenever that list
changes. The SQL below is the same thing, for anyone who prefers the editor.

## 7. The live marketplace — real providers and agents (SQL editor → run once)

Everything a customer sees in Services (or gets matched to for a home-visit task)
comes from these two tables once they exist. Before this, `saathi_applications`
only recorded who applied — nothing made them bookable. Admin → Requests inbox
→ **Approve** now inserts here directly.

```sql
create table if not exists public.saathi_providers (
  id text primary key,
  status text not null default 'Verified',
  city text default '', cat text default '',
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.saathi_providers enable row level security;
create policy "providers_public_read" on public.saathi_providers for select to anon, authenticated using (true);
create policy "providers_owner_write" on public.saathi_providers for all using (
  (auth.jwt() ->> 'email') in ('identicalinnovator@gmail.com','srajphotos42@gmail.com','onlinedesk120@gmail.com'));

create table if not exists public.saathi_agents (
  id text primary key,
  status text not null default 'Active',
  city text default '',
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.saathi_agents enable row level security;
create policy "agents_public_read" on public.saathi_agents for select to anon, authenticated using (true);
create policy "agents_owner_write" on public.saathi_agents for all using (
  (auth.jwt() ->> 'email') in ('identicalinnovator@gmail.com','srajphotos42@gmail.com','onlinedesk120@gmail.com'));
```

Real customer sessions load these two tables once at sign-in (`AppBoot.tsx`) and
use them exactly where the local demo seed used to — Services, local-task
matching, provider cards. A new approval shows up for a customer on their next
sign-in or app reload; there is no live push yet.

## 8. Free-audit leads from the public site

`Admin → Integrations → Run database setup` also creates `saathi_leads`: every request from the
free Digital Audit form (`/audit`), sent through `/api/leads`.

- **Who can write:** anyone, through the public anon key — but only as a fresh lead
  (`status = 'new'`, empty notes). Column checks cap every field's length; consent must be true.
- **Who can read or update:** owner accounts only (`NEXT_PUBLIC_OWNER_EMAILS`), in **Admin → Leads**.
- **No IP address is stored.** `/api/leads` rate-limits in memory and drops bot submissions
  (hidden field, or a form finished in under 2.5 seconds).
- **If the table does not exist yet**, the form still works: the visitor gets one-tap WhatsApp
  (when `NEXT_PUBLIC_WHATSAPP_NUMBER` is set) or email with everything they typed.
- Retention promised on the form and in the Privacy Policy: up to 12 months after the last
  conversation unless the lead becomes a client; delete sooner on request.
