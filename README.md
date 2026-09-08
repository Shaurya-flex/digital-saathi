# Digital Saathi

**AI-powered digital + physical concierge for Indian consumers.**
*"Aap bas boliye. Digital aur daily kaam hum sambhalenge."*

Speak (or type) a request in English, हिन्दी or Hinglish — recharge a phone, pay a bill, explain a document, find a train, book an electrician — and Saathi routes it to the cheapest executor that can finish it: an AI model, an API, a verified human agent, or a local service professional.

Next.js port of the validated single-file prototype. The information architecture, copy and UX match the prototype 1:1; every outside service sits behind an adapter so real integrations can be wired in without touching the app.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000, pick a demo account on the login page. No password — the entire demo database lives in `localStorage` in your browser (reset it from the login page).

## The four portals

| Portal | Route | Who |
|---|---|---|
| Customer | `/app/*` | Ask Saathi, tasks, bookings, family, documents, wallet, services, alerts, profile |
| Provider | `/provider/*` | Local professionals — jobs, schedule, earnings, reviews, verification |
| Agent | `/agent/*` | Human agents — task queue, assigned tasks, earnings, performance |
| Admin | `/admin/*` | Operations — users, tasks, providers, agents, payments, pricing, disputes, analytics, integrations, audit |

Plus public pages: landing (`/`), `/learn` articles, `/partner`, `/become-agent`, `/login`.

## How it works

- **Demo store** — `src/lib/store.ts` keeps the whole database (`DBShape` in `src/lib/types.ts`) in one `localStorage` key with a tiny subscription layer. `src/lib/db/schema.ts` mirrors the same shapes as a Drizzle/Postgres schema; swapping the store for the real database changes no component code.
- **Task engine** — `src/lib/engine/` classifies intent, routes to an executor (`ai | api | agent | provider`), walks the task state machine (clarify → options → approve → working → done/failed), and escalates to humans when the AI cannot finish.
- **Adapters** — `src/lib/adapters/` is the only place that talks to the outside world (LLM, speech, payments, recharge, bills, travel, maps, storage, SMS/WhatsApp/email, analytics). Each runs as a labelled mock until its key is present; the Admin → Integrations page renders live status. Keys are listed in `.env.example`.
- **Languages** — every user-facing string renders in English / हिन्दी / Hinglish via `say()` (`src/lib/i18n`), driven by the signed-in user's language. Voice input/output uses the browser Web Speech API behind the `stt`/`tts` adapters.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (all portal pages prerendered) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:generate` / `db:push` / `db:seed` | Drizzle migrations + seed against `DATABASE_URL` (Neon Postgres) — only needed when moving off the demo store |

## Deploying

Vercel is preferred (API routes become available for real adapters): import the repo, set env vars from `.env.example`, deploy. For GitHub Pages, build a static export with `SAATHI_STATIC_EXPORT=1` and `SAATHI_BASE_PATH=/digital-saathi` (see `next.config.js`).
