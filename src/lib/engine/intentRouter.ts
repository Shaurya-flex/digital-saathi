import type { Risk } from '../types';

/* text → intent (id, category, risk, credit key). Regexes cover Hindi,
   Hinglish and English phrasing — ported unchanged from the prototype. */

export interface Intent {
  id: string;
  cat: string;
  risk: Risk;
  credits: string;
  match?: RegExp;
  title: string;
}

export const INTENTS: Intent[] = [
  { id: 'recharge', cat: 'telecom', risk: 'high', credits: 'recharge', match: /recharge|रिचार्ज|top ?up|balance dalw|talktime/i, title: 'Mobile recharge' },
  { id: 'bill', cat: 'bills', risk: 'high', credits: 'bill', match: /bill|बिल|electricity|bijli|बिजली|water|gas|postpaid/i, title: 'Bill payment' },
  { id: 'train', cat: 'travel', risk: 'medium', credits: 'travel_search', match: /train|ट्रेन|rail|ticket|flight|bus|seat/i, title: 'Travel search' },
  { id: 'local', cat: 'physical', risk: 'medium', credits: 'booking', match: /electrician|plumber|carpenter|ac |a\.c|fan|कूलर|nal|मिस्त्री|technician|repair|cleaning|salon|mechanic|laptop|इलेक्ट्रीशियन|kharab|खराब/i, title: 'Local service' },
  { id: 'govt', cat: 'govt', risk: 'low', credits: 'research', match: /passport|pan |aadhaar|आधार|voter|licence|license|epfo|digilocker|scheme|yojana|योजना|scholarship|certificate/i, title: 'Government service guidance' },
  { id: 'doc', cat: 'docs', risk: 'low', credits: 'doc_summary', match: /pdf|document|dastavez|समझाओ|samjha|summar|explain|translate|अनुवाद/i, title: 'Document help' },
  { id: 'appt', cat: 'appts', risk: 'medium', credits: 'booking', match: /appointment|doctor|डॉक्टर|dentist|clinic|schedule|slot|milna hai/i, title: 'Appointment' },
  { id: 'email', cat: 'comms', risk: 'low', credits: 'translate', match: /email|mail|reply|likh do|draft|message|whatsapp|complaint/i, title: 'Writing help' },
  { id: 'shop', cat: 'shop', risk: 'low', credits: 'research', match: /buy|khareed|price|compare|gift|shopping|kitne ka/i, title: 'Shopping research' },
  { id: 'remind', cat: 'admin', risk: 'low', credits: 'ask', match: /remind|yaad|renew|expire|expiry|due date/i, title: 'Reminder' },
];

export function detectIntent(text: string): Intent {
  const hit = INTENTS.find((i) => i.match && i.match.test(text));
  return hit || { id: 'unknown', cat: 'admin', risk: 'low', credits: 'ask', title: 'General request' };
}

export const intentHi = (id: string) =>
  ({ recharge: 'रिचार्ज', bill: 'बिल भुगतान', train: 'ट्रेन', local: 'मिस्त्री / सेवा', doc: 'कागज़ समझाना',
     govt: 'सरकारी सेवा', appt: 'अपॉइंटमेंट', email: 'लिखने में मदद', shop: 'खरीदारी', remind: 'याद दिलाना', unknown: 'यह काम' } as Record<string, string>)[id] || id;

export const intentHin = (id: string) =>
  ({ recharge: 'Recharge', bill: 'Bill payment', train: 'Train', local: 'Mistri / service', doc: 'Kagaz samjhana',
     govt: 'Sarkari seva', appt: 'Appointment', email: 'Likhne mein madad', shop: 'Kharidari', remind: 'Yaad dilana', unknown: 'Ye kaam' } as Record<string, string>)[id] || id;
