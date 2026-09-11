import { aiComplete, type AiKind } from '../ai/client';
import { getDB, me, commit } from '../store';
import { say } from '../i18n/useT';
import { finishNow, logTask, setStatus } from './taskEngine';
import type { Task } from '../types';

/* Runs a real AI step on a task: shows the working state, calls the
   server route, then completes the task with the answer and writes the
   model, tokens and INR cost into the audit trail. If anything fails the
   caller's fallback runs — the scripted behaviour the product had before,
   so the user is never stuck on an AI outage. */

const STEPS = [
  { en: 'Reading your request', hi: 'आपका अनुरोध पढ़ रहा हूँ', hin: 'Aapka request padh raha hoon' },
  { en: 'Writing the answer', hi: 'जवाब लिख रहा हूँ', hin: 'Jawab likh raha hoon' },
];

export function runAI(t: Task, kind: AiKind, input: string, fallback: () => void) {
  const db = getDB();
  const u = db.users.find((x) => x.id === t.user_id) || me();
  t.data.work = { steps: STEPS, i: 0, startedAt: Date.now() };
  t.data.phase = 'working';
  setStatus(t, 'Executing', 'Saathi AI · ' + kind);
  commit();
  const bump = setTimeout(() => {
    if (t.data.phase === 'working' && t.data.work) { t.data.work.i = 1; commit(); }
  }, 1200);

  void (async () => {
    const r = await aiComplete(kind, input, {
      lang: u?.lang, easy: u?.easy, name: u?.name, city: u?.city,
    });
    clearTimeout(bump);
    if (t.data.phase !== 'working') return; // cancelled meanwhile
    if (!r) {
      t.data.work = null;
      logTask(t, 'AI unavailable', 'Fell back to the scripted answer');
      fallback();
      return;
    }
    t.data.work = null;
    t.data.aiCostPaise = (t.data.aiCostPaise || 0) + r.costPaise;
    logTask(t, 'Saathi AI answered',
      `${r.model} · ${r.inputTokens} in / ${r.outputTokens} out · ≈₹${(r.costPaise / 100).toFixed(2)}`);
    finishNow(t, r.text);
  })();
}

/** Plain-language reason shown when a category is AI-only and the answer
    came from a person-free path — reused by fallbacks. */
export const aiFallbackNote = () =>
  say('Saathi AI was not reachable, so here is the standard guidance.',
      'साथी AI उपलब्ध नहीं था, इसलिए यह सामान्य मार्गदर्शन है।',
      'Saathi AI available nahi tha, isliye ye standard guidance hai.');
