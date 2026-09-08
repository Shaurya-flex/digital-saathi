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
