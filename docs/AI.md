# Saathi AI — providers, speech and keys

Everything here runs **server-side only**. Keys live in Vercel → Project → Settings →
Environment Variables (mark them *Sensitive*). The browser only ever calls our own
routes with the user's Supabase session token; no provider key reaches the client.
Demo-mode accounts never call a provider.

## 1. Language model (Saathi AI answers, drafts, summaries, govt help, research)

Route: `POST /api/ai/complete` → `src/app/api/ai/complete/route.ts` → `src/lib/server/llm.ts`.

| Variable | Purpose | Default |
| --- | --- | --- |
| `SAATHI_AI_PROVIDER` | `anthropic`, `openrouter`, `sarvam` or `auto` | `auto` = first key found, in that order |
| `ANTHROPIC_API_KEY` | Claude via the official SDK | – |
| `SAATHI_LLM_LIGHT` / `_STANDARD` / `_REASONING` | Claude model per tier | haiku-4-5 / sonnet-5 / sonnet-5 |
| `OPENROUTER_API_KEY` | Any model on OpenRouter (OpenAI-compatible) | – |
| `OPENROUTER_MODEL_LIGHT` / `_STANDARD` / `_REASONING` | OpenRouter model id per tier | `openrouter/auto` |
| `SARVAM_API_KEY` | Sarvam AI (also unlocks speech, below) | – |
| `SARVAM_CHAT_MODEL` | Sarvam chat model | `sarvam-m` |

Tiers follow the product rule: *light* for a simple question, *standard* for drafts and
summaries, *reasoning* for government procedures and research. Every call returns the
provider, model, token counts and an INR cost estimate, which the task engine writes
into the task's audit trail. OpenRouter reports its exact USD cost per call.

Suggested OpenRouter picks once you want to pin models instead of `openrouter/auto`:
a cheap fast model for `LIGHT`, a mid model for `STANDARD`, a strong one for `REASONING`.
Set them in Vercel and redeploy; no code change needed.

## 2. Indian-language speech and translation (Sarvam AI)

SDK: `sarvamai@1.1.8-alpha.5` (pinned). Wrapper: `src/lib/server/sarvam.ts`.

| Route | What it does | Model |
| --- | --- | --- |
| `POST /api/tts` `{ text, lang }` | Natural read-aloud, base64 WAV | `bulbul:v2`, speaker `SARVAM_TTS_SPEAKER` (default `anushka`) |
| `POST /api/stt` multipart `audio` + `lang` | Transcribe a short clip (≤ 6 MB, ≤ 20 s from the app) | Saaras, `language_code` from the user's app language or `unknown` |
| inside `/api/ai/complete` | English model answer → user's language | translate, `modern-colloquial` |

App language → Sarvam code: en→en-IN, hi/hinglish→hi-IN, bn, mr, te, ta, gu, kn, ml, pa,
or→od-IN. The model answers directly in English/Hindi/Hinglish; the other nine languages
are translated by Sarvam after the model answers.

Client side (`src/lib/ai/speech.ts`): `speakNow()` in the store tries Sarvam first and
falls back to the browser's own voice; the voice sheet records with `MediaRecorder` and
sends the clip to `/api/stt` when the browser has no `SpeechRecognition` (Firefox,
many in-app browsers). Both require a signed-in real account. A 503 (no Sarvam key) is
remembered for the page session so nothing waits on it twice.

## 3. Verifying without seeing a key

```bash
curl -s https://digital-saathi-for-you.vercel.app/api/health
```

`ai` is true when any provider key is present, `aiProviders` lists which, `speech` is
true when `SARVAM_API_KEY` is present. Admin → Integrations shows the same, plus which
provider and models are active. Vercel only applies new environment variables to the
**next** deployment, so add the key, then redeploy (or push a commit).

## 4. Cost guardrails already in place

* Input capped at 8,000 characters per call; output at 1,200 tokens (light 400).
* One call per user action; no background loops.
* Scripted fallbacks remain when a provider is down, so the product never blanks.
* Anthropic system prompts are cached (`cache_control: ephemeral`).
