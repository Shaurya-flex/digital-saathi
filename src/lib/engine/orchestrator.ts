import { commit, now } from '../store';
import { say } from '../i18n/useT';
import { logTask, setStatus, step } from './taskEngine';
import { planTask } from './planTask';
import type { Executor, Task } from '../types';

/* Orchestration: WHO does this task? Four executors. Every task is routed to
   exactly one at a time, the choice is shown to the customer with a reason
   and a confidence score, and a hand-off from one executor to another is
   recorded rather than hidden. */

export const EXECUTORS: Record<Executor, { icon: string; en: string; hi: string; hin: string }> = {
  ai:       { icon: '🤖', en: 'Saathi AI', hi: 'साथी AI', hin: 'Saathi AI' },
  api:      { icon: '🔌', en: 'Service link', hi: 'सेवा से जुड़ाव', hin: 'Service link' },
  agent:    { icon: '🧑', en: 'Saathi agent', hi: 'साथी एजेंट', hin: 'Saathi agent' },
  provider: { icon: '🔧', en: 'Local professional', hi: 'स्थानीय कारीगर', hin: 'Local kaarigar' },
};

export const execName = (k: Executor | string) => {
  const e = EXECUTORS[k as Executor];
  return e ? say(e.en, e.hi, e.hin) : String(k);
};

export const ROUTES: Record<string, { ex: Executor; conf: number; en: string; hi: string; hin: string }> = {
  recharge: { ex: 'api', conf: 0.94, en: 'A recharge goes straight to the operator’s system. No person needed.', hi: 'रिचार्ज सीधे कंपनी के सिस्टम में जाता है। किसी व्यक्ति की ज़रूरत नहीं।', hin: 'Recharge seedha company ke system mein jaata hai. Kisi insaan ki zaroorat nahi.' },
  bill:     { ex: 'api', conf: 0.92, en: 'Your bill account can be read and paid through the billing network.', hi: 'आपका बिल खाता बिलिंग नेटवर्क से पढ़ा और भरा जा सकता है।', hin: 'Aapka bill account billing network se padha aur bhara ja sakta hai.' },
  local:    { ex: 'provider', conf: 0.97, en: 'Someone has to come to your home. This needs a verified local professional.', hi: 'किसी को आपके घर आना होगा। इसके लिए जाँचा-परखा कारीगर चाहिए।', hin: 'Kisi ko aapke ghar aana hoga. Iske liye verified kaarigar chahiye.' },
  train:    { ex: 'api', conf: 0.71, en: 'I can search trains myself. The booking itself will need a person.', hi: 'ट्रेन मैं खुद ढूँढ सकता हूँ। बुकिंग के लिए व्यक्ति चाहिए होगा।', hin: 'Train main khud dhoondh sakta hoon. Booking ke liye insaan chahiye hoga.' },
  appt:     { ex: 'api', conf: 0.8, en: 'The clinic’s slots can be requested directly.', hi: 'क्लीनिक का समय सीधे माँगा जा सकता है।', hin: 'Clinic ka time seedhe maanga ja sakta hai.' },
  doc:      { ex: 'ai', conf: 0.95, en: 'Reading and explaining a paper is my own work.', hi: 'कागज़ पढ़ना और समझाना मेरा अपना काम है।', hin: 'Kagaz padhna aur samjhana mera apna kaam hai.' },
  govt:     { ex: 'ai', conf: 0.88, en: 'I can explain the process and prepare your checklist myself.', hi: 'प्रक्रिया समझाना और सूची बनाना मैं खुद कर सकता हूँ।', hin: 'Process samjhana aur list banana main khud kar sakta hoon.' },
  email:    { ex: 'ai', conf: 0.93, en: 'Writing a draft is my own work. Sending stays with you.', hi: 'मसौदा लिखना मेरा काम है। भेजना आपके हाथ में है।', hin: 'Draft likhna mera kaam hai. Bhejna aapke haath mein hai.' },
  shop:     { ex: 'ai', conf: 0.9, en: 'Comparing options is my own work.', hi: 'विकल्प मिलाना मेरा अपना काम है।', hin: 'Option milana mera apna kaam hai.' },
  remind:   { ex: 'ai', conf: 0.99, en: 'A reminder lives inside Saathi.', hi: 'याद दिलाना साथी के अंदर ही होता है।', hin: 'Yaad dilana Saathi ke andar hi hota hai.' },
  unknown:  { ex: 'ai', conf: 0.31, en: 'I will look at this myself first, but I am not very confident.', hi: 'पहले मैं खुद देखता हूँ, पर मुझे पूरा भरोसा नहीं है।', hin: 'Pehle main khud dekhta hoon, par mujhe poora bharosa nahi hai.' },
};

export function routeTask(t: Task) {
  const r = ROUTES[t.intent] || ROUTES.unknown;
  t.routing = {
    executor: r.ex,
    confidence: r.conf,
    reason: say(r.en, r.hi, r.hin),
    history: [{ to: r.ex, why: 'Initial routing', at: now() }],
  };
  t.data.phase = 'routing';
  setStatus(t, 'Understanding', `Routed to ${r.ex} (confidence ${r.conf})`);
  step(t, say('Decided who should do this: ', 'यह काम कौन करेगा, तय किया: ', 'Ye kaam kaun karega, tay kiya: ') + execName(r.ex), 'ok');
  commit();
  setTimeout(() => planTask(t), 1400);
}

export function handoff(t: Task, to: Executor, whyEn: string, whyHi: string, whyHin: string) {
  if (!t.routing) t.routing = { executor: to, confidence: 0, reason: '', history: [] };
  const from = t.routing.executor;
  t.routing.from = from;
  t.routing.executor = to;
  t.routing.reason = say(whyEn, whyHi, whyHin);
  t.routing.history.push({ from, to, why: whyEn, at: now() });
  logTask(t, 'Handed over', `From ${from} to ${to}: ${whyEn}`);
  step(t, say('Handed over to ', 'सौंपा गया: ', 'Sompa gaya: ') + execName(to), 'ok');
}
