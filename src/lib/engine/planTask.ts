import { getDB, me, money, notify, commit, askAloud } from '../store';
import { say } from '../i18n/useT';
import { recharge, bills, travel } from '../adapters';
import { finishNow, setStatus, step } from './taskEngine';
import { runAI } from './ai';
import { aiAvailable } from '../ai/client';
import type { ClarifyQuestion, Task } from '../types';

/* Planning: clarification questions (one at a time, big tap targets) and
   option building per intent. Ported unchanged from the validated prototype. */

export function clarText(t: Task): string {
  const q = t.data.qs?.[t.data.qi || 0];
  return q ? say(q.en, q.hi, q.hin) : '';
}

export function planTask(t: Task) {
  const db = getDB();
  const u = db.users.find((x) => x.id === t.user_id) || me();
  const d = t.data;
  d.answers = {};
  const mem = u?.memory || {};

  if (t.intent === 'recharge') {
    d.qs = [
      { id: 'whose', en: 'Whose number should I recharge?', hi: 'किसका नंबर रिचार्ज करना है?', hin: 'Kiska number recharge karna hai?',
        options: [
          { l: say('Mine — ' + (u?.phone || ''), 'मेरा — ' + (u?.phone || ''), 'Mera — ' + (u?.phone || '')), v: 'self' },
          { l: say('Someone else’s', 'किसी और का', 'Kisi aur ka'), v: 'other' },
        ] },
      { id: 'op', en: 'Which company?', hi: 'कौन सी कंपनी?', hin: 'Kaun si company?',
        options: ['Jio', 'Airtel', 'Vi', 'BSNL'].map((o) => ({ l: o, v: o })) },
    ];
    if (mem.operator) {
      d.qs[1].options!.unshift({ l: say('Same as always — ' + mem.operator, 'हमेशा वाली — ' + mem.operator, 'Hamesha wali — ' + mem.operator), v: mem.operator });
    }
  } else if (t.intent === 'bill') {
    d.qs = [
      { id: 'kind', en: 'Which bill?', hi: 'कौन सा बिल?', hin: 'Kaun sa bill?',
        options: [
          { l: say('Electricity', 'बिजली', 'Bijli'), v: 'electricity' },
          { l: say('Water', 'पानी', 'Paani'), v: 'water' },
          { l: say('Gas', 'गैस', 'Gas'), v: 'gas' },
          { l: say('Broadband', 'ब्रॉडबैंड', 'Broadband'), v: 'broadband' },
        ] },
    ];
  } else if (t.intent === 'local') {
    d.qs = [
      { id: 'when', en: 'When do you need them?', hi: 'कब चाहिए?', hin: 'Kab chahiye?',
        options: [
          { l: say('Now', 'अभी', 'Abhi'), v: 'now' },
          { l: say('This evening', 'आज शाम', 'Aaj shaam'), v: 'evening' },
          { l: say('Tomorrow', 'कल', 'Kal'), v: 'tomorrow' },
        ] },
    ];
  } else if (t.intent === 'train' || t.intent === 'appt') {
    d.qs = [
      { id: 'day', en: 'Which day?', hi: 'किस दिन?', hin: 'Kis din?',
        options: [
          { l: say('Today', 'आज', 'Aaj'), v: 'today' },
          { l: say('Tomorrow', 'कल', 'Kal'), v: 'tomorrow' },
          { l: say('Day after', 'परसों', 'Parson'), v: 'day-after' },
        ] },
    ];
  } else if (t.intent === 'doc' && aiAvailable()) {
    // Real AI can read whatever the person pastes — no vault upload needed.
    d.qs = [{ id: 'doctext', type: 'text', ph: 'Paste the text here…',
      en: 'Paste the text of the paper here, or tell me what it says',
      hi: 'कागज़ का टेक्स्ट यहाँ चिपकाइए, या बताइए उसमें क्या लिखा है',
      hin: 'Kagaz ka text yahan paste kijiye, ya bataiye usme kya likha hai' }];
  } else {
    d.qs = [];
  }
  d.qi = 0;
  if (d.qs.length) {
    d.phase = 'clarify';
    setStatus(t, 'Waiting for information', 'Asking a clarification question');
    step(t, 'Asked a clarification question');
    askAloud(clarText(t));
    commit();
  } else {
    buildOptions(t);
  }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export function matchProviders(need: string) {
  const db = getDB();
  return db.providers
    .filter((p) => p.status === 'Verified')
    .map((p, i) => ({
      id: p.id, name: p.name, cat: p.cat, rating: p.rating, jobs: p.jobs, base: p.base,
      eta: p.eta, km: (1.2 + i * 1.6).toFixed(1),
      // scoring: category match (40) + rating/5×30 + completion×15 + speed bonus + availability bonus
      score: Math.round(
        (p.cat === need ? 40 : 0) + (p.rating / 5) * 30 + p.completion * 15 +
        (30 - Math.min(p.resp, 30)) * 0.4 + (p.open ? 8 : 0),
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export function buildOptions(t: Task) {
  const db = getDB();
  const u = db.users.find((x) => x.id === t.user_id) || me();
  const d = t.data;
  const a = d.answers || {};
  const mem = u?.memory || {};
  d.phase = 'ready';
  setStatus(t, 'Awaiting confirmation', 'Options prepared');
  step(t, 'Prepared the options', 'ok');

  if (t.intent === 'recharge') {
    const op = a.op || mem.operator || 'Jio';
    const num = a.whose === 'other' ? (a.number || '—') : (u?.phone || '—');
    d.number = num; d.operator = op;
    d.lead = say(`${op} · ${num}. Four plans fit how you use it.`, `${op} · ${num}. चार प्लान आपके हिसाब से ठीक हैं।`, `${op} · ${num}. Chaar plan aapke hisaab se theek hain.`);
    d.options = recharge.getPlans(op).map((p) => ({
      id: p.code, price: p.price, title: money(p.price),
      sub: say(`${p.days} days · ${p.data}`, `${p.days} दिन · ${p.data}`, `${p.days} din · ${p.data}`),
    }));
  } else if (t.intent === 'bill') {
    const bill = bills.fetch(a.kind || 'electricity');
    d.bill = bill;
    d.lead = say(`${bill.biller}, account ${bill.ca}, for ${bill.period}.`, `${bill.biller}, खाता ${bill.ca}, ${bill.period} का बिल।`, `${bill.biller}, account ${bill.ca}, ${bill.period} ka bill.`);
    d.options = [{ id: 'full', price: bill.amount, title: money(bill.amount), sub: say('Due ' + bill.due, bill.due + ' तक जमा करना है', 'Due ' + bill.due) }];
    d.pick = 'full';
    t.user_price = bill.amount;
  } else if (t.intent === 'train') {
    const m = t.description.match(/([A-Za-z]+)\s*(?:se|to|from)\s*([A-Za-z]+)/i);
    const from = m ? cap(m[1]) : 'Delhi';
    const to = m ? cap(m[2]) : 'Mumbai';
    d.from = from; d.to = to;
    d.lead = say(`${from} to ${to}, ${a.day || 'tomorrow'}.`, `${from} से ${to}, ${a.day === 'today' ? 'आज' : 'कल'}।`, `${from} se ${to}, ${a.day || 'kal'}.`);
    d.options = travel.trains(from, to).map((x) => ({
      id: x.no, price: x.fare, title: x.no + ' ' + x.name,
      sub: `${x.dep} → ${x.arr} · ${x.cls} · ${x.avail}`,
    }));
    d.needsHuman = true;
  } else if (t.intent === 'local') {
    const need = /ac\b|a\.c|cool/i.test(t.description) ? 'AC technician'
      : /plumb|nal|tap/i.test(t.description) ? 'Plumber'
      : /laptop|computer/i.test(t.description) ? 'Laptop repair'
      : /clean/i.test(t.description) ? 'Deep cleaning'
      : /salon|hair|beauty/i.test(t.description) ? 'Salon'
      : 'Electrician';
    d.need = need;
    d.matches = matchProviders(need);
    if (!d.matches.length) {
      return finishNow(t, say(
        `Verified ${need.toLowerCase()}s are onboarding in your city right now. You will get an alert the moment one is available — no charge for this request.`,
        `आपके शहर में जाँचे-परखे कारीगर जुड़ रहे हैं। जैसे ही कोई उपलब्ध होगा, आपको सूचना मिलेगी। इस अनुरोध का कोई शुल्क नहीं।`,
        `Aapke sheher mein verified kaarigar jud rahe hain. Jaise hi koi available hoga, aapko alert milega. Is request ka koi charge nahi.`,
      ));
    }
    d.lead = say(`${d.matches.length} verified ${need.toLowerCase()}s near you.`, `आपके पास ${d.matches.length} जाँचे-परखे कारीगर मिले।`, `Aapke paas ${d.matches.length} verified kaarigar mile.`);
    d.options = d.matches.map((m2, i) => ({
      id: m2.id, price: m2.base,
      title: m2.name + (i === 0 ? ' · ' + say('Best match', 'सबसे सही', 'Sabse sahi') : ''),
      sub: say(`${m2.cat} · ${m2.rating}★ · ${m2.km} km · about ${m2.eta} min`, `${m2.cat} · ${m2.rating}★ · ${m2.km} किमी · लगभग ${m2.eta} मिनट`, `${m2.cat} · ${m2.rating}★ · ${m2.km} km · ${m2.eta} min`),
    }));
  } else if (t.intent === 'appt') {
    d.lead = say('Free slots with Dr. Meera Joshi.', 'डॉ. मीरा जोशी के खाली समय।', 'Dr. Meera Joshi ke khaali time.');
    d.options = ['11:15 AM', '5:40 PM', '7:00 PM'].map((s) => ({ id: s, title: s, sub: say('General physician', 'जनरल फिजिशियन', 'General physician'), price: null }));
  } else if (t.intent === 'doc') {
    if (a.doctext) {
      runAI(t, 'doc_summary', a.doctext, () => finishNow(t, say(
        'I could not read the paper right now. Try again in a minute, or ask a Digital Saathi agent.',
        'अभी कागज़ नहीं पढ़ पाया। एक मिनट बाद फिर कोशिश कीजिए, या साथी एजेंट से पूछिए।',
        'Abhi kagaz nahi padh paya. Ek minute baad phir try kijiye, ya Saathi agent se poochhiye.')));
      return;
    }
    const docs = db.documents.filter((x) => x.userId === t.user_id);
    d.lead = say('Which paper should I read?', 'कौन सा कागज़ पढ़ूँ?', 'Kaun sa kagaz padhun?');
    d.options = docs.map((x) => ({ id: x.id, title: x.name, sub: x.cat, price: null }));
    if (!docs.length) {
      return finishNow(t, say('Your vault is empty. Add a paper first, then ask me again.', 'आपकी तिजोरी खाली है। पहले कागज़ जोड़िए, फिर पूछिए।', 'Aapki vault khaali hai. Pehle kagaz jodiye, phir poochhiye.'));
    }
  } else if (t.intent === 'govt') {
    const govtCanned = /passport/i.test(t.description)
      ? say('For a passport you need: Aadhaar, date-of-birth proof, address proof from the last three months, and photos. Apply on Passport Seva, pay the fee, then attend the appointment with the originals. I am not a government office — I prepare your checklist and help fill the form, you submit it.',
            'पासपोर्ट के लिए चाहिए: आधार, जन्म तिथि का प्रमाण, तीन महीने के अंदर का पता प्रमाण, और फोटो। पासपोर्ट सेवा पर आवेदन कीजिए, फीस भरिए, फिर मूल कागज़ों के साथ अपॉइंटमेंट पर जाइए। मैं सरकारी दफ़्तर नहीं हूँ — मैं सूची बनाता हूँ और फॉर्म भरने में मदद करता हूँ, जमा आप करेंगे।',
            'Passport ke liye chahiye: Aadhaar, janm tithi ka proof, teen mahine ke andar ka address proof, aur photo. Passport Seva par apply kijiye, fees bhariye, phir original kagaz ke saath appointment par jaiye. Main sarkari daftar nahi hoon — main list banata hoon aur form bharne mein madad karta hoon, jama aap karenge.')
      : say('Here is the process, the papers you need, and where to apply. I can prepare the checklist and help fill the form. The submission stays with you.',
            'यह रही प्रक्रिया, ज़रूरी कागज़ और आवेदन की जगह। सूची और फॉर्म में मैं मदद करूँगा। जमा आप ही करेंगे।',
            'Ye rahi process, zaroori kagaz aur apply ki jagah. List aur form mein main madad karunga. Jama aap hi karenge.');
    if (aiAvailable()) { runAI(t, 'govt', t.description, () => finishNow(t, govtCanned)); return; }
    return finishNow(t, govtCanned);
  } else if (t.intent === 'email') {
    const emailCanned = say('Draft ready. Read it before you send — I have not sent anything.',
      'मसौदा तैयार है। भेजने से पहले पढ़ लीजिए — मैंने कुछ नहीं भेजा है।',
      'Draft taiyaar hai. Bhejne se pehle padh lijiye — maine kuch nahi bheja hai.');
    if (aiAvailable()) { runAI(t, 'draft', t.description, () => finishNow(t, emailCanned)); return; }
    return finishNow(t, emailCanned);
  } else if (t.intent === 'shop') {
    const shopCanned = say('Three options compared on warranty, service and running cost. Prices move daily and I have not bought anything.',
      'तीन विकल्प — वारंटी, सर्विस और खर्च के हिसाब से। दाम रोज़ बदलते हैं, और मैंने कुछ खरीदा नहीं है।',
      'Teen option — warranty, service aur kharch ke hisaab se. Daam roz badalte hain, aur maine kuch khareeda nahi hai.');
    if (aiAvailable()) { runAI(t, 'research', t.description, () => finishNow(t, shopCanned)); return; }
    return finishNow(t, shopCanned);
  } else if (t.intent === 'remind') {
    notify(t.user_id, say('Reminder set', 'याद दिलाऊँगा', 'Yaad dilaunga'), t.description, 'info');
    return finishNow(t, say('I will remind you three days before, and again on the day.',
      'तीन दिन पहले और उसी दिन फिर याद दिलाऊँगा।', 'Teen din pehle aur usi din phir yaad dilaunga.'));
  } else {
    // unknown: with real AI, answer it; otherwise fail softly and offer a person
    if (aiAvailable()) { runAI(t, 'ask', t.description, () => { softFail(t); commit(); }); return; }
    softFail(t);
  }
  commit();
}

/** Low confidence and no AI: fail softly and offer a person instead of guessing. */
function softFail(t: Task) {
  const d = t.data;
    d.options = [];
    d.needsHuman = true;
    d.phase = 'failed';
    d.softFail = true;
    d.failEn = 'I am not sure I understood that well enough to do it safely. Say it again in other words, or let a person handle it.';
    d.failHi = 'मैं ठीक से समझ नहीं पाया, इसलिए अंदाज़े से नहीं करूँगा। दूसरे शब्दों में दोबारा बोलिए, या किसी व्यक्ति को दे दीजिए।';
    d.failHin = 'Main theek se samajh nahi paya, isliye andaaze se nahi karunga. Dusre shabdon mein dobara boliye, ya kisi insaan ko de dijiye.';
    setStatus(t, 'Failed', 'Low confidence — offered a human');
}

export type ClarifyQ = ClarifyQuestion;
