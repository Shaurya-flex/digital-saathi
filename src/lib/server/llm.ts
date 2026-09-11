import Anthropic from '@anthropic-ai/sdk';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

/* One place that talks to a language model. Three providers, chosen by
   SAATHI_AI_PROVIDER (anthropic | openrouter | sarvam) or, on 'auto', the
   first one that has a key — so Saathi AI is live with whichever key the
   operator adds. Tiering follows the product rule (never the premium model
   for a simple question). Every result carries token usage and an INR cost
   estimate for the task audit trail. Server-side only. */

export type Tier = 'light' | 'standard' | 'reasoning';
export type Provider = 'anthropic' | 'openrouter' | 'sarvam';

export interface LlmResult {
  text: string;
  provider: Provider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costPaise: number;
  refused?: boolean;
}

export class LlmError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

const has = (k: string) => Boolean((process.env[k] || '').trim());
const env = (k: string, fallback: string) => (process.env[k] || '').trim() || fallback;

export function configuredProviders(): Provider[] {
  const out: Provider[] = [];
  if (has('ANTHROPIC_API_KEY')) out.push('anthropic');
  if (has('OPENROUTER_API_KEY')) out.push('openrouter');
  if (has('SARVAM_API_KEY')) out.push('sarvam');
  return out;
}

export function pickProvider(): Provider | null {
  const pref = env('SAATHI_AI_PROVIDER', 'auto').toLowerCase();
  const avail = configuredProviders();
  if (pref !== 'auto' && avail.includes(pref as Provider)) return pref as Provider;
  return avail[0] || null;
}

const INR_PER_USD = 84;

// Anthropic: USD per million tokens [input, output].
const ANTHROPIC_PRICE: Record<string, [number, number]> = {
  'claude-haiku-4-5': [1, 5], 'claude-sonnet-5': [2, 10], 'claude-sonnet-4-6': [3, 15],
  'claude-opus-5': [5, 25], 'claude-opus-4-8': [5, 25], 'claude-fable-5-1': [10, 50],
};
const ANTHROPIC_MODEL: Record<Tier, string> = {
  light: 'claude-haiku-4-5', standard: 'claude-sonnet-5', reasoning: 'claude-sonnet-5',
};

export function modelFor(provider: Provider, tier: Tier): string {
  if (provider === 'anthropic') return env('SAATHI_LLM_' + tier.toUpperCase(), ANTHROPIC_MODEL[tier]);
  if (provider === 'openrouter') return env('OPENROUTER_MODEL_' + tier.toUpperCase(), 'openrouter/auto');
  return env('SARVAM_CHAT_MODEL', 'sarvam-m');
}

export interface CompleteOptions {
  system: string;
  prompt: string;
  tier: Tier;
  maxTokens?: number;
  provider?: Provider;
}

export async function complete(o: CompleteOptions): Promise<LlmResult> {
  const provider = o.provider || pickProvider();
  if (!provider) throw new LlmError('AI is not configured on this deployment.', 503);
  const model = modelFor(provider, o.tier);
  const maxTokens = o.maxTokens ?? 1200;
  if (provider === 'anthropic') return anthropic(o, model, maxTokens);
  if (provider === 'openrouter') {
    return openAiCompatible({
      provider, model, maxTokens, system: o.system, prompt: o.prompt,
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'HTTP-Referer': SITE_URL, 'X-Title': SITE_NAME,
      },
      extra: { usage: { include: true } },
    });
  }
  return openAiCompatible({
    provider, model, maxTokens, system: o.system, prompt: o.prompt,
    url: 'https://api.sarvam.ai/v1/chat/completions',
    headers: { 'api-subscription-key': process.env.SARVAM_API_KEY || '' },
  });
}

async function anthropic(o: CompleteOptions, model: string, maxTokens: number): Promise<LlmResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const params: Anthropic.MessageCreateParamsNonStreaming = {
    model,
    max_tokens: maxTokens,
    system: [{ type: 'text', text: o.system, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: o.prompt }],
  };
  // Haiku 4.5 does not accept output_config.effort; the newer tiers do, and
  // low effort is the right setting for short concierge answers.
  if (o.tier !== 'light') params.output_config = { effort: 'low' };
  let res: Anthropic.Message;
  try {
    res = await client.messages.create(params);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) throw new LlmError('Saathi is busy right now. Please try again in a minute.', 429);
    if (err instanceof Anthropic.AuthenticationError) throw new LlmError('AI key rejected — check ANTHROPIC_API_KEY.', 502);
    if (err instanceof Anthropic.APIError) throw new LlmError(`AI error ${err.status}.`, 502);
    throw new LlmError('AI is unreachable right now.', 502);
  }
  if (res.stop_reason === 'refusal') {
    return { text: '', provider: 'anthropic', model: res.model, inputTokens: 0, outputTokens: 0, costPaise: 0, refused: true };
  }
  const text = res.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n').trim();
  const inputTokens = res.usage.input_tokens + (res.usage.cache_read_input_tokens || 0) + (res.usage.cache_creation_input_tokens || 0);
  const outputTokens = res.usage.output_tokens;
  const [pin, pout] = ANTHROPIC_PRICE[res.model] || ANTHROPIC_PRICE[model] || [2, 10];
  const usd = (inputTokens / 1e6) * pin + (outputTokens / 1e6) * pout;
  return { text, provider: 'anthropic', model: res.model, inputTokens, outputTokens, costPaise: Math.max(1, Math.round(usd * INR_PER_USD * 100)) };
}

interface CompatArgs {
  provider: Provider; model: string; maxTokens: number; system: string; prompt: string;
  url: string; headers: Record<string, string>; extra?: Record<string, unknown>;
}

/* OpenRouter and Sarvam both speak the OpenAI chat-completions shape. */
async function openAiCompatible(a: CompatArgs): Promise<LlmResult> {
  let res: Response;
  try {
    res = await fetch(a.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...a.headers },
      body: JSON.stringify({
        model: a.model,
        messages: [{ role: 'system', content: a.system }, { role: 'user', content: a.prompt }],
        max_tokens: a.maxTokens,
        temperature: 0.4,
        ...(a.extra || {}),
      }),
    });
  } catch {
    throw new LlmError('AI is unreachable right now.', 502);
  }
  if (res.status === 429) throw new LlmError('Saathi is busy right now. Please try again in a minute.', 429);
  if (res.status === 401 || res.status === 403) throw new LlmError(`AI key rejected — check the ${a.provider} key.`, 502);
  if (!res.ok) throw new LlmError(`AI error ${res.status}.`, 502);
  const j = await res.json() as {
    model?: string;
    choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> }; finish_reason?: string }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; cost?: number };
  };
  const raw = j.choices?.[0]?.message?.content;
  const text = (typeof raw === 'string' ? raw : (raw || []).map((p) => p.text || '').join('\n')).trim();
  const inputTokens = j.usage?.prompt_tokens || 0;
  const outputTokens = j.usage?.completion_tokens || 0;
  // OpenRouter reports the exact USD cost when asked; Sarvam's per-token
  // price is negligible at this scale — estimate at Haiku rates.
  const usd = typeof j.usage?.cost === 'number' ? j.usage.cost : (inputTokens / 1e6) * 1 + (outputTokens / 1e6) * 5;
  return {
    text, provider: a.provider, model: j.model || a.model, inputTokens, outputTokens,
    costPaise: Math.max(1, Math.round(usd * INR_PER_USD * 100)),
    refused: j.choices?.[0]?.finish_reason === 'content_filter',
  };
}
