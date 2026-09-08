/* Learn hub content. Each article: Read / Listen (TTS) / Ask Saathi. */
export interface Article { id: string; cat: string; title: string; body: string }

export const ARTICLES: Article[] = [
  { id: 'upi', cat: 'Digital India', title: 'How UPI works, in plain words',
    body: 'UPI moves money straight from your bank account to someone else’s using a phone number or an ID that looks like an email. There is no wallet in between. You approve every payment with a PIN that only you know. If an app asks you to enter your PIN to receive money, it is a scam — receiving money never needs a PIN.' },
  { id: 'recharge', cat: 'Everyday', title: 'Choosing a recharge without overpaying',
    body: 'Compare on three numbers only: how many days it lasts, how much data per day, and the price. A ₹719 plan for 70 days costs about ₹10 a day. A ₹299 plan for 28 days costs about ₹11 a day. Longer plans are usually cheaper per day, but only if you would have recharged anyway.' },
  { id: 'scam', cat: 'Online safety', title: 'Six scams that target elderly users',
    body: 'A caller says your electricity will be cut tonight unless you pay now. A message says your KYC has expired. Someone asks you to install a screen-sharing app to “help”. A refund arrives as a request to pay. A relative in trouble needs money urgently. A lottery you never entered. In all six, the pressure to act immediately is the tell. Real departments give you time and written notice.' },
  { id: 'bills', cat: 'Everyday', title: 'Paying an electricity bill without the queue',
    body: 'You need your consumer account number, printed at the top of the bill. With it, any BBPS-connected app can fetch the amount due. Always check the billing period on screen matches the bill in your hand before paying.' },
  { id: 'agents', cat: 'AI', title: 'What an AI agent can and cannot do for you',
    body: 'An AI agent can read, plan, compare and draft. It can fill a form once you have given it the facts. It cannot make a judgement about your money that you have not authorised, and it should never sign or submit something on your behalf without asking. If a product does that silently, that is a red flag, not a feature.' },
  { id: 'gov', cat: 'Government services', title: 'What to keep ready before any government application',
    body: 'Aadhaar, PAN, a proof of address dated within three months, passport photos on a white background, and a scanned signature on plain paper. Scans should be under 200 KB and readable. Keep every one of them in one folder — half of all delays are a missing document, not a rejected one.' },
];
