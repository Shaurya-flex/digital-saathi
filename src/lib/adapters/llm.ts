import type { ModelTier, SaathiConfig } from '../types';

/* LLM adapter — model routing by task tier.
   Rule 8 of the product: the router never sends a simple question to the
   expensive model. In production the tier maps to a model id from env
   (SAATHI_LLM_LIGHT … SAATHI_LLM_COMPUTER) and complete() calls the
   Anthropic API server-side. */

export type LlmKind =
  | 'ask' | 'translate' | 'doc_summary' | 'form_help' | 'draft'
  | 'deep_research' | 'workflow' | 'image' | 'speech' | 'computer';

export interface LlmAdapter {
  name: string;
  env: string;
  live: boolean;
  route(kind: LlmKind, cfg: SaathiConfig): ModelTier;
  complete(kind: LlmKind, prompt: string): Promise<string>;
}

export const llm: LlmAdapter = {
  name: 'LLM provider',
  env: 'SAATHI_LLM_LIGHT…COMPUTER + ANTHROPIC_API_KEY',
  live: false,
  route(kind, cfg) {
    const m = cfg.models;
    if (['ask', 'translate'].includes(kind)) return m[0];
    if (['doc_summary', 'form_help', 'draft'].includes(kind)) return m[1];
    if (['deep_research', 'workflow'].includes(kind)) return m[2];
    if (kind === 'image') return m[3];
    if (kind === 'speech') return m[4];
    if (kind === 'computer') return m[5];
    return m[1];
  },
  async complete(kind, prompt) {
    // Mock: log and return a canned line. Swap the body for a server-side
    // Anthropic call routed by this.route(kind, cfg).
    console.info('[adapter:llm] mock complete', { kind, prompt: prompt.slice(0, 80) });
    return 'DEMO — LLM integration required';
  },
};
