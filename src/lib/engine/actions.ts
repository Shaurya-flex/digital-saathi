import { getDB, me, cfg, money, notify, taskName, track, toast, uid, now, chargeCredits, askAloud, commit } from '../store';
import { say, T } from '../i18n/useT';
import { detectIntent, intentHi, intentHin } from './intentRouter';
import { createTask, logTask, pushMsg, setStatus, step } from './taskEngine';
import { routeTask, handoff } from './orchestrator';
import { buildOptions, clarText } from './planTask';
import { execute } from './executor';
import { startTrack, ensureTicker } from './tracker';
import type { Task } from '../types';

/* Customer-facing task actions. Components call these; every consequential
   move lands in the audit log and nothing that costs money happens without
   the explicit confirm() below. */

export function handleAsk(text: string): Task | null {
  const u = me();
  if (!u) return null;
  text = String(text || '').trim();
  if (!text) return null;
  pushMsg('user', text);
  const it = detectIntent(text);
  const P = cfg().pricing;
  const t = createTask({
    description: text, intent: it.id, category: it.cat, subcategory: it.title,
    risk_level: it.risk, credits_required: P[it.credits] || 1,
    data: { title: say(it.title, intentHi(it.id), intentHin(it.id)), phase: 'thinking' },
  });
  step(t, 'Heard the request', 'ok');
  pushMsg('ai', '', t.task_id);
  commit();
  setTimeout(() => routeTask(t), 1000);
  return t;
}

export function answerClarify(t: Task, value: string) {
  const d = t.data;
  if (!d.qs) return;
  const q = d.qs[d.qi || 0];
  d.answers = d.answers || {};
  d.answers[q.id] = value;
  logTask(t, 'Answered a question', q.id + ' = ' + value);
  if (value === 'other' && q.id === 'whose') {
    d.qs.splice((d.qi || 0) + 1, 0, {
      id: 'number', type: 'text', mode: 'tel', ph: '98xxxxxxxx',
      en: 'Which number?', hi: 'कौन सा नंबर?', hin: 'Kaun sa number?',
    });
  }
  d.qi = (d.qi || 0) + 1;
  if (d.qi >= d.qs.length) {
    d.phase = 'thinking';
    commit();
    setTimeout(() => buildOptions(t), 700);
  } else {
    commit();
    askAloud(clarText(t));
  }
}

export function pickOption(t: Task, id: string) {
  t.data.pick = id;
  const o = (t.data.options || []).find((x) => x.id === id);
  if (o && o.price != null) t.user_price = o.price;
  logTask(t, 'Option chosen', o?.title || id);
  commit();
}

export function toApprove(t: Task) {
  const o = (t.data.options || []).find((x) => x.id === t.data.pick);
  if (t.data.needsHuman) {
    // A login and a captcha should never be handled on the user's behalf.
    t.data.phase = 'failed';
    t.data.failEn = 'Booking a train needs a login and a captcha that I should not handle for you.';
    t.data.failHi = 'ट्रेन बुक करने के लिए लॉगिन और कैप्चा चाहिए, जो मुझे आपकी जगह नहीं करना चाहिए।';
    t.data.failHin = 'Train book karne ke liye login aur captcha chahiye, jo mujhe aapki jagah nahi karna chahiye.';
    setStatus(t, 'Failed', 'Needs a human — outside safe automation');
    commit();
    askAloud(t.data.failHi!);
    return;
  }
  if (t.risk_level === 'low' || t.intent === 'doc') { execute(t); return; }
  const auto = t.intent === 'recharge' && (o?.price || 0) <= cfg().autoApproveUnder;
  t.data.approveText = `${o?.title || ''} — ${o?.sub || ''}`;
  if (auto) {
    logTask(t, 'Auto-approved', 'Under the ₹' + cfg().autoApproveUnder + ' rule you set');
    execute(t);
    return;
  }
  t.data.phase = 'approve';
  t.confirmation_status = 'pending';
  setStatus(t, 'Awaiting confirmation', 'Waiting for the user to approve');
  commit();
  askAloud(T('approve') + ' ' + (t.user_price ? T('youPay') + ' ' + t.user_price + ' rupaye' : ''));
}

export function confirmTask(t: Task) {
  t.confirmation_status = 'approved';
  logTask(t, 'User approved', t.user_price ? money(t.user_price) : 'action approved');
  execute(t);
}

export function cancelTask(t: Task) {
  t.data.phase = 'cancelled';
  t.data.work = null;
  setStatus(t, 'Cancelled', 'Cancelled by the user');
  commit();
  toast(T('cancelled') + '. ' + T('nothingTaken'));
}

export function retryTask(t: Task) {
  if (t.data.pendingDone) {
    t.data.pendingDone = false;
    t.data.needMoney = false;
    workDone(t);
    return;
  }
  t.data.phase = 'thinking';
  setStatus(t, 'Executing', 'User asked to retry');
  commit();
  setTimeout(() => execute(t), 600);
}

export function nudgeTask(t: Task) {
  const w = t.data.work;
  if (w && Date.now() - w.startedAt > 4000) {
    w.i = w.steps.length;
    commit();
  } else {
    toast(say('Still working.', 'अभी काम चल रहा है।', 'Abhi kaam chal raha hai.'));
  }
}

export function escalateTask(t: Task) {
  const u = me();
  if (!u) return;
  if (!chargeCredits(t, cfg().pricing.human_agent, 'Human agent')) { commit(); return; }
  t.data.work = null;
  handoff(t, 'agent',
    t.data.needsHuman ? 'Booking needs a login and a captcha' : 'AI could not complete it safely',
    t.data.needsHuman ? 'बुकिंग के लिए लॉगिन और कैप्चा चाहिए' : 'AI यह सुरक्षित तरीके से पूरा नहीं कर सका',
    t.data.needsHuman ? 'Booking ke liye login aur captcha chahiye' : 'AI ye surakshit tarike se poora nahi kar saka');
  setStatus(t, 'Escalated to human', 'Sent to the agent queue');
  startTrack(t, 'agent');
  ensureTicker();
  track('human_escalation', { intent: t.intent });
  notify(u.id, say('A person has your task', 'एक व्यक्ति आपका काम कर रहा है', 'Ek insaan aapka kaam kar raha hai'), taskName(t), 'info');
  commit();
  toast(say('Sent to a verified agent.', 'जाँचे-परखे एजेंट को भेज दिया।', 'Verified agent ko bhej diya.'), 'ok');
}

/** Customer confirms the provider's work is finished → wallet debited → review. */
export function workDone(t: Task): 'review' | 'short' | void {
  const db = getDB();
  const u = me();
  if (!u) return;
  const p = db.providers.find((x) => x.id === t.data.pick);
  const price = p?.base || 0;
  if (price > (u.wallet || 0)) {
    t.data.phase = 'failed';
    t.data.needMoney = true;
    t.data.pendingDone = true;
    t.data.failEn = `The work is finished but your wallet has ${money(u.wallet)} and the bill is ${money(price)}. Add money and confirm again.`;
    t.data.failHi = `काम पूरा हो गया, पर आपके बटुए में ${money(u.wallet)} हैं और बिल ${money(price)} का है। पैसे डालकर फिर पुष्टि कीजिए।`;
    t.data.failHin = `Kaam poora ho gaya, par aapke wallet mein ${money(u.wallet)} hain aur bill ${money(price)} ka hai. Paise daal kar phir confirm kijiye.`;
    setStatus(t, 'Waiting for information', 'Wallet short — payment pending');
    commit();
    return 'short';
  }
  const b = db.bookings.find((x) => x.taskId === t.task_id);
  if (b) b.status = 'Completed';
  t.data.phase = 'done';
  t.data.track = null;
  t.data.result = say(`${p?.name} finished the work. ${money(price)} was charged to your wallet.`,
    `${p?.name} ने काम पूरा किया। आपके बटुए से ${money(price)} कटे।`,
    `${p?.name} ne kaam poora kiya. Aapke wallet se ${money(price)} kate.`);
  u.wallet = (u.wallet || 0) - price;
  db.ledger.push({ id: uid('lg'), userId: u.id, type: 'money', dir: 'debit', amount: price, reason: taskName(t), taskId: t.task_id, at: now() });
  setStatus(t, 'Completed', 'Customer confirmed the work');
  t.completed_at = now();
  track('provider_completed_job');
  commit();
  return 'review';
}

/** Sticky "talk to a person" bar: escalate the newest open task, or create one. */
export function humanNow() {
  const db = getDB();
  const u = me();
  if (!u) return;
  const open = db.tasks.filter((x) => x.user_id === u.id && !['Completed', 'Cancelled', 'Refunded'].includes(x.status));
  if (open.length) { escalateTask(open[0]); return; }
  handleAsk(say('I need to talk to a person', 'मुझे किसी व्यक्ति से बात करनी है', 'Mujhe kisi insaan se baat karni hai'));
}
