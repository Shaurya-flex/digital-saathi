import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { callerFromRequest } from '@/lib/server/auth';

/* The real AI behind Saathi. Server-side only: the Anthropic key lives in
   Vercel env and is used here after the caller's Supabase token checks out.
   Model routing follows the product's tier rule (never the premium model
   for a simple question): light -> Haiku, standard -> Sonnet, reasoning ->
   whatever SAATHI_LLM_REASONING names (defaults to Sonnet until a task
   genuinely needs more). Every call returns token usage and an INR cost
   estimate so the task's audit trail and the admin can see AI spend. */

export const runtime = 'nodejs';
export const maxDuration = 60;

type Kind = 'ask' | 'doc_summary' | 'draft' | 'govt' | 'research';
type Tier = 'light' | 'standard' | 'reasoning';

const TIER: Record<Kind, Tier> = {
  ask: 'light', doc_summary: 'standard', draft: 'standard', govt: 'standard', research: 'reasoning',
};
const DEFAULT_MODEL: Record<Tier, string> = {
  light: 'claude-haiku-4-5',
  standard: 'claude-sonnet-5',
  reasoning: 'claude-sonnet-5',
};
function modelFor(tier: Tier): string {
  const env = process.env['SAATHI_LLM_' + tier.toUpperCase()];
  return (env && env.trim()) || DEFAULT_MODEL[tier];
}

// USD per million tokens [input, output]; INR is an estimate for the ledger.
const PRICE: Record<string, [number, number]> = {
  'claude-haiku-4-5': [1, 5], 'claude-sonnet-5': [2, 10], 'claude-sonnet-4-6': [3, 15],
  'claude-opus-5': [5, 25], 'claude-opus-4-8': [5, 25], 'claude-fable-5-1': [10, 50],
};
const INR_PER_USD = 84;

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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
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

  const tier = TIER[kind];
  const model = modelFor(tier);
  const langName = LANG_NAME[body.lang || 'en'] || LANG_NAME.en;
  const who = [body.name, body.city].filter(Boolean).join(', ');
  const prompt =
    `${TASK[kind]}\n\nReply in ${langName}.` +
    (body.easy ? ' The reader is elderly: very short sentences, one idea per line, no technical words.' : '') +
    (who ? `\nThe person: ${who}.` : '') +
    `\n\n---\n${input}`;

  const client = new Anthropic({ apiKey });
  const params: Anthropic.MessageCreateParamsNonStreaming = {
    model,
    max_tokens: 1200,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  };
  // Haiku 4.5 does not accept output_config.effort; the newer tiers do, and
  // low effort is the right setting for short concierge answers.
  if (tier !== 'light') params.output_config = { effort: 'low' };

  let res: Anthropic.Message;
  try {
    res = await client.messages.create(params);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: 'Saathi is busy right now. Please try again in a minute.' }, { status: 429 });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'AI key rejected — check ANTHROPIC_API_KEY.' }, { status: 502 });
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `AI error ${err.status}.` }, { status: 502 });
    }
    return NextResponse.json({ error: 'AI is unreachable right now.' }, { status: 502 });
  }

  if (res.stop_reason === 'refusal') {
    return NextResponse.json({ error: 'Saathi cannot help with this request. A human agent can look at it.' }, { status: 422 });
  }
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
  if (!text) {
    return NextResponse.json({ error: 'Saathi had nothing to say — try rephrasing.' }, { status: 502 });
  }

  const inputTokens = res.usage.input_tokens + (res.usage.cache_read_input_tokens || 0) + (res.usage.cache_creation_input_tokens || 0);
  const outputTokens = res.usage.output_tokens;
  const [pin, pout] = PRICE[res.model] || PRICE[model] || [2, 10];
  const usd = (inputTokens / 1e6) * pin + (outputTokens / 1e6) * pout;
  const costPaise = Math.max(1, Math.round(usd * INR_PER_USD * 100));

  return NextResponse.json({ text, model: res.model, tier, inputTokens, outputTokens, costPaise });
}
