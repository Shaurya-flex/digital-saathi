import { NextResponse } from 'next/server';
import { callerFromRequest } from '@/lib/server/auth';
import { complete, LlmError, pickProvider, type Tier } from '@/lib/server/llm';
import { needsTranslation, sarvamConfigured, translateForLang } from '@/lib/server/sarvam';

/* The real AI behind Saathi. Server-side only: provider keys live in Vercel
   env and are used here after the caller's Supabase token checks out (see
   src/lib/server/llm.ts for provider selection and tiering). Answers in
   en/hi/hinglish come straight from the model; the nine other Indian
   languages are answered in English and translated by Sarvam when its key
   is present. Every call returns usage and an INR cost estimate. */

export const runtime = 'nodejs';
export const maxDuration = 60;

type Kind = 'ask' | 'doc_summary' | 'draft' | 'govt' | 'research';

const TIER: Record<Kind, Tier> = {
  ask: 'light', doc_summary: 'standard', draft: 'standard', govt: 'standard', research: 'reasoning',
};

const SYSTEM = `You are Saathi, the assistant inside Digital Saathi — an Indian digital-services concierge used by everyday people, many of them elderly or new to smartphones.

Rules you never break:
1. Never claim to have done something you cannot do. You do not pay bills, recharge phones, book tickets, submit forms, send messages or upload documents. Say clearly what you CAN do (explain, prepare, draft, list the steps) and what the person must do themselves — or offer a Digital Saathi human agent.
2. Money and safety: never suggest entering a UPI PIN to receive money. Never ask for Aadhaar, PAN, card, OTP or password numbers. If something in the request sounds like a scam, say so plainly.
3. Government work is guidance only. Name the official portal or office, the documents needed, the fee and the next step, and say you are not a government office.
4. Reply in the language requested, in plain everyday words. Short paragraphs or numbered steps. No jargon, no emoji, no markdown tables.
5. If you are not sure, say so and suggest asking a Digital Saathi human agent.
6. Keep answers under about 250 words unless the task genuinely needs more.`;

const TASK: Record<Kind, string> = {
  ask: 'Answer the person’s question or request below as helpfully as you can within your rules.',
  doc_summary: 'Explain the document below in simple words: what it is, the key amounts, dates and deadlines, what the person must do and by when, and anything that looks risky or unusual. If only a description was given rather than the text, explain what such a document usually contains and what to check.',
  draft: 'Write the message, email or letter the person needs, ready to copy. Polite, clear and short. Start with a subject line if it is an email. Do not send it — end by reminding them to read it before sending.',
  govt: 'Explain the government process the person is asking about: the official portal or office, the documents needed, fees, timeline, and the exact next step. Guidance only.',
  research: 'Compare the options the person is asking about on what matters (price range, reliability, running cost, after-sales service). Give a clear recommendation and what to check before buying. Say that prices change daily and that you have not bought anything.',
};

const LANG_NAME: Record<string, string> = {
  en: 'English',
  hi: 'Hindi, written in Devanagari script',
  hinglish: 'Hinglish — Hindi in Latin script, with everyday English words where natural',
};

export async function POST(req: Request) {
  const caller = await callerFromRequest(req);
  if (!caller) {
    return NextResponse.json({ error: 'Please log in to use Saathi AI.' }, { status: 401 });
  }
  const provider = pickProvider();
  if (!provider) {
    return NextResponse.json({ error: 'AI is not configured on this deployment.' }, { status: 503 });
  }

  let body: { kind?: string; input?: string; lang?: string; easy?: boolean; name?: string; city?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
  const kind = body.kind as Kind;
  const input = String(body.input || '').trim();
  if (!(kind in TIER) || !input || input.length > 8000) {
    return NextResponse.json({ error: 'Unsupported request.' }, { status: 400 });
  }

  const lang = body.lang || 'en';
  const translate = needsTranslation(lang) && sarvamConfigured();
  const langName = translate ? LANG_NAME.en : (LANG_NAME[lang] || LANG_NAME.en);
  const who = [body.name, body.city].filter(Boolean).join(', ');
  const prompt =
    `${TASK[kind]}\n\nReply in ${langName}.` +
    (body.easy ? ' The reader is elderly: very short sentences, one idea per line, no technical words.' : '') +
    (who ? `\nThe person: ${who}.` : '') +
    `\n\n---\n${input}`;

  let r;
  try {
    r = await complete({ system: SYSTEM, prompt, tier: TIER[kind], provider });
  } catch (err) {
    const status = err instanceof LlmError ? err.status : 502;
    const message = err instanceof Error ? err.message : 'AI is unreachable right now.';
    return NextResponse.json({ error: message }, { status });
  }
  if (r.refused) {
    return NextResponse.json({ error: 'Saathi cannot help with this request. A human agent can look at it.' }, { status: 422 });
  }
  if (!r.text) {
    return NextResponse.json({ error: 'Saathi had nothing to say — try rephrasing.' }, { status: 502 });
  }

  let text = r.text;
  let translated = false;
  if (translate) {
    const t = await translateForLang(text, lang);
    if (t) { text = t; translated = true; }
  }

  return NextResponse.json({
    text, provider: r.provider, model: r.model, tier: TIER[kind],
    inputTokens: r.inputTokens, outputTokens: r.outputTokens, costPaise: r.costPaise, translated,
  });
}
