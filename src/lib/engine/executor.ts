import { getDB, me, money, notify, taskName, track, uid, now, chargeCredits, askAloud, commit } from '../store';
import { say, T } from '../i18n/useT';
import { setStatus, step } from './taskEngine';
import { startTrack, ensureTicker } from './tracker';
import type { Task, WorkStep } from '../types';

/* Intents whose execution below is a simulation of a rail we have not
   connected yet. In real mode they must never touch a real wallet. */
const SIMULATED_RAILS = new Set(['recharge', 'bill', 'appt']);

/* Execution state machine per intent. Steps play out visibly (progress bar +
   step list in the user's language); money and credits only move after the
   work succeeds. Ported unchanged from the validated prototype. */

export const WORK_STEPS: Record<string, WorkStep[]> = {
  recharge: [
    { en: 'Checking the number', hi: 'नंबर जाँच रहा हूँ', hin: 'Number jaanch raha hoon' },
    { en: 'Sending the payment', hi: 'भुगतान भेज रहा हूँ', hin: 'Payment bhej raha hoon' },
    { en: 'Confirming with the operator', hi: 'कंपनी से पुष्टि ले रहा हूँ', hin: 'Company se confirm kar raha hoon' },
  ],
  bill: [
    { en: 'Opening your bill account', hi: 'आपका बिल खाता खोल रहा हूँ', hin: 'Aapka bill account khol raha hoon' },
    { en: 'Sending the payment', hi: 'भुगतान भेज रहा हूँ', hin: 'Payment bhej raha hoon' },
    { en: 'Getting the receipt', hi: 'रसीद ले रहा हूँ', hin: 'Receipt le raha hoon' },
  ],
  local: [
    { en: 'Sending your request', hi: 'आपका अनुरोध भेज रहा हूँ', hin: 'Aapka request bhej raha hoon' },
    { en: 'Waiting for the worker to accept', hi: 'कारीगर की हाँ का इंतज़ार', hin: 'Kaarigar ki haan ka intezaar' },
  ],
  appt: [
    { en: 'Requesting the slot', hi: 'समय माँग रहा हूँ', hin: 'Time maang raha hoon' },
    { en: 'Confirming with the clinic', hi: 'क्लीनिक से पुष्टि', hin: 'Clinic se confirm' },
  ],
  doc: [
    { en: 'Reading the paper', hi: 'कागज़ पढ़ रहा हूँ', hin: 'Kagaz padh raha hoon' },
    { en: 'Putting it in simple words', hi: 'आसान भाषा में लिख रहा हूँ', hin: 'Aasan bhasha mein likh raha hoon' },
  ],
};

export function runWork(t: Task, steps: WorkStep[], done: () => void) {
  t.data.work = { steps, i: 0, startedAt: Date.now() };
  t.data.phase = 'working';
  setStatus(t, 'Executing', 'Running the steps');
  commit();
  const tick = () => {
    const w = t.data.work;
    if (!w || t.data.phase !== 'working') return;
    w.i++;
    commit();
    if (w.i < steps.length) setTimeout(tick, 1000);
    else setTimeout(done, 900);
  };
  setTimeout(tick, 1000);
}

export function execute(t: Task) {
  const u = me();
  if (!u) return;
  const d = t.data;
  if (getDB().mode === 'real' && SIMULATED_RAILS.has(t.intent)) {
    // The request is already on the operator's desk (recordRequest at
    // creation). Say so honestly; charge nothing until a person delivers.
    d.phase = 'done';
    d.work = null;
    d.result = say(
      'Got it. The Digital Saathi team will complete this for you and confirm here and on WhatsApp. Nothing has been charged yet.',
      'समझ गया। डिजिटल साथी टीम यह आपके लिए पूरा करेगी और यहाँ और व्हाट्सऐप पर पुष्टि करेगी। अभी कोई पैसा नहीं कटा है।',
      'Samajh gaya. Digital Saathi team ye aapke liye poora karegi aur yahan aur WhatsApp par confirm karegi. Abhi koi paisa nahi kata hai.',
    );
    step(t, say('Sent to the Digital Saathi team', 'डिजिटल साथी टीम को भेजा', 'Digital Saathi team ko bheja'), 'ok');
    setStatus(t, 'Escalated to human', 'Real mode: no live rail for this yet — routed to the operator desk, nothing charged');
    notify(u.id, say('We have your request', 'आपका अनुरोध मिल गया', 'Aapka request mil gaya'), taskName(t), 'info');
    commit();
    askAloud(d.result);
    return;
  }
  if (t.user_price && (u.wallet || 0) < t.user_price) {
    d.phase = 'failed';
    d.needMoney = true;
    d.work = null;
    d.failEn = `Your wallet has ${money(u.wallet)} but this needs ${money(t.user_price)}. Add money and I will carry on.`;
    d.failHi = `आपके बटुए में ${money(u.wallet)} हैं, और चाहिए ${money(t.user_price)}। पैसे डालिए, फिर मैं आगे बढ़ा दूँगा।`;
    d.failHin = `Aapke wallet mein ${money(u.wallet)} hain, aur chahiye ${money(t.user_price)}. Paise daaliye, phir main aage badha dunga.`;
    setStatus(t, 'Failed', 'Insufficient wallet balance — nothing charged');
    commit();
    askAloud(d.failHi!);
    return;
  }
  d.attempt = (d.attempt || 0) + 1;
  const steps = WORK_STEPS[t.intent] || [{ en: 'Working', hi: 'काम चल रहा है', hin: 'Kaam chal raha hai' }];
  runWork(t, steps, () => {
    const db = getDB();
    // Scripted failure once on the first bill attempt, so the failure state is
    // testable. Real failures come from the adapter's error response.
    if (t.intent === 'bill' && d.attempt === 1) {
      d.phase = 'failed';
      d.work = null;
      d.failEn = 'The electricity board’s system did not respond. This happens on their side, not yours.';
      d.failHi = 'बिजली बोर्ड का सिस्टम जवाब नहीं दे रहा। यह उनकी तरफ़ की दिक्कत है, आपकी नहीं।';
      d.failHin = 'Bijli board ka system jawab nahi de raha. Ye unki taraf ki dikkat hai, aapki nahi.';
      setStatus(t, 'Failed', 'Adapter timeout — nothing charged');
      track('task_failed', { intent: t.intent });
      commit();
      askAloud(d.failHi);
      return;
    }
    if (!chargeCredits(t, t.credits_required, taskName(t))) {
      d.phase = 'ready';
      commit();
      return;
    }
    if (t.user_price) {
      u.wallet = (u.wallet || 0) - t.user_price;
      db.ledger.push({ id: uid('lg'), userId: u.id, type: 'money', dir: 'debit', amount: t.user_price, reason: taskName(t), taskId: t.task_id, at: now() });
      track('payment_completed', { amount: t.user_price });
    }
    if (t.intent === 'local') {
      const p = db.providers.find((x) => x.id === d.pick);
      if (p) {
        db.bookings.unshift({
          id: uid('b'), taskId: t.task_id, userId: u.id, providerId: p.id, cat: p.cat,
          when: say('Today, next available', 'आज, अगला खाली समय', 'Aaj, agla khaali time'),
          status: 'Requested', price: p.base, address: (u.memory && u.memory.home) || u.city,
        });
        setStatus(t, 'Assigned to local provider', 'Booking created — provider executing');
        track('provider_booking', { p: p.id });
        startTrack(t, 'provider');
        commit();
        ensureTicker();
        askAloud(say('Request sent. I will show you when they accept.', 'अनुरोध भेज दिया। हाँ कहते ही आपको दिखा दूँगा।', 'Request bhej diya. Haan kehte hi aapko dikha dunga.'));
      }
      return;
    } else if (t.intent === 'recharge') {
      const o = (d.options || []).find((x) => x.id === d.pick);
      d.result = say(`${money(o?.price)} recharge done on ${d.number}. ${o?.sub}.`,
        `${d.number} पर ${money(o?.price)} का रिचार्ज हो गया। ${o?.sub}।`,
        `${d.number} par ${money(o?.price)} ka recharge ho gaya. ${o?.sub}.`);
      setStatus(t, 'Completed', 'Recharge simulated');
      t.completed_at = now();
    } else if (t.intent === 'bill') {
      const bill = d.bill!;
      d.result = say(`${money(bill.amount)} paid to ${bill.biller} for ${bill.period}. Receipt saved in your documents.`,
        `${bill.biller} को ${bill.amount} रुपये जमा कर दिए (${bill.period})। रसीद आपके कागज़ों में रख दी।`,
        `${bill.biller} ko ${money(bill.amount)} jama kar diye (${bill.period}). Receipt aapke documents mein rakh di.`);
      setStatus(t, 'Completed', 'Bill paid — simulated');
      t.completed_at = now();
    } else if (t.intent === 'appt') {
      d.result = say(`Slot requested for ${d.pick}. The clinic confirms by SMS.`,
        `${d.pick} का समय माँग लिया है। क्लीनिक एसएमएस से पुष्टि करेगा।`,
        `${d.pick} ka time maang liya hai. Clinic SMS se confirm karega.`);
      setStatus(t, 'Completed', 'Appointment requested');
      t.completed_at = now();
    } else if (t.intent === 'doc') {
      const doc = db.documents.find((x) => x.id === d.pick);
      d.result = doc?.summary || '';
      setStatus(t, 'Completed', 'Document explained');
      t.completed_at = now();
    }
    d.phase = 'done';
    d.work = null;
    track('task_completed', { intent: t.intent });
    notify(u.id, say('Task done', 'काम हो गया', 'Kaam ho gaya'), taskName(t), 'info');
    commit();
    askAloud(T('done') + '. ' + (d.result || ''));
  });
}
