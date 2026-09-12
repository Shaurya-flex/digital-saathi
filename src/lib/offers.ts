/* Digital Saathi's service catalogue — the single source of truth for the
   public site (home, services, pricing, the free-audit form), the search
   structured data and the admin lead inbox. Prices are launch prices in
   INR, "from" the figure shown, GST extra where it applies. Change a price
   or a deliverable here and every page follows.

   Rules this file must keep: no claimed results, clients, ratings,
   certifications, partnerships or affiliations; a few clear packages rather
   than a long menu; prices shown before anyone is asked for a budget. */

export type Tx = { en: string; hi: string };
export type Lang = 'en' | 'hinglish';
export const tx = (v: Tx, lang: Lang) => (lang === 'hinglish' ? v.hi : v.en);

export type VerticalId = 'local-business' | 'education' | 'research-content-automation';
export type TierId = 'free' | 'micro' | 'starter' | 'project' | 'retainer' | 'premium';

export interface Tier { id: TierId; name: Tx; range: Tx; what: Tx }

export interface Offer {
  id: string;
  vertical: VerticalId | 'all';
  tier: TierId;
  name: Tx;
  /** INR. 0 = free. A "from" price unless `exact`. */
  price: number;
  exact?: boolean;
  monthly?: boolean;
  per?: Tx;
  byProposal?: boolean;
  /** The package each vertical leads with. */
  flagship?: boolean;
  summary: Tx;
  deliverables: Tx[];
  timeline: Tx;
  notIncluded?: Tx[];
}

export interface Vertical {
  id: VerticalId;
  name: Tx;
  short: Tx;
  promise: Tx;
  audience: Tx;
  problems: Tx[];
  /** How we show the work worked — without inventing numbers. */
  proof: Tx[];
  /** What we will not do in this vertical. */
  guardrails: Tx[];
  faq: Array<[Tx, Tx]>;
}

const same = (s: string): Tx => ({ en: s, hi: s });
const MONTHLY_TERMS: Tx = { en: 'Monthly, cancel with 30 days’ notice', hi: 'Monthly, 30 din pehle bata kar band kar sakte hain' };

export const TIERS: Tier[] = [
  { id: 'free', name: same('Free'), range: same('₹0'),
    what: { en: 'A Digital Audit with your top three fixes.', hi: 'Digital Audit, aapke top teen fixes ke saath.' } },
  { id: 'micro', name: { en: 'Small first step', hi: 'Chhota pehla kadam' }, range: { en: 'Under ₹3,000', hi: '₹3,000 se kam' },
    what: { en: 'A quick fix or a paid consultation.', hi: 'Ek quick fix ya paid consultation.' } },
  { id: 'starter', name: same('Starter'), range: same('₹3,000 – ₹10,000'),
    what: { en: 'One clear package, delivered in about a week.', hi: 'Ek saaf package, lagbhag ek hafte mein.' } },
  { id: 'project', name: same('Project'), range: same('₹15,000 – ₹50,000'),
    what: { en: 'A complete system: a website, a study system or an automation.', hi: 'Poora system: website, study system ya automation.' } },
  { id: 'retainer', name: same('Monthly'), range: { en: '₹5,000 – ₹30,000 a month', hi: '₹5,000 – ₹30,000 mahina' },
    what: { en: 'We keep it running and improving every month.', hi: 'Har mahine hum ise chalate aur behtar karte hain.' } },
  { id: 'premium', name: same('Premium'), range: same('₹50,000 – ₹2,00,000+'),
    what: { en: 'Research, transformation, licensing or implementation, scoped with you.', hi: 'Research, transformation, licensing ya implementation, aapke saath scope karke.' } },
];

export const OFFERS: Offer[] = [
  {
    id: 'free-audit', vertical: 'all', tier: 'free', price: 0, flagship: true,
    name: same('Free Digital Audit'),
    summary: {
      en: 'A plain scorecard of how customers, students or followers find you today, and the three fixes that matter most.',
      hi: 'Aaj customers, students ya followers aap tak kaise pahunchte hain, uska seedha scorecard, aur teen sabse zaroori fixes.',
    },
    deliverables: [
      { en: 'A check of what people see first: Google Maps, WhatsApp, website, reviews and social profiles — or your study material or channel',
        hi: 'Log sabse pehle kya dekhte hain uska check: Google Maps, WhatsApp, website, reviews aur social profiles — ya aapka study material ya channel' },
      { en: 'A scorecard with your top three fixes, in order', hi: 'Scorecard, top teen fixes order mein' },
      { en: 'Starting prices if you want us to do the work — no obligation', hi: 'Kaam humse karwana ho to starting price — koi zabardasti nahi' },
    ],
    timeline: { en: 'We aim to send it within 2 working days', hi: 'Koshish rahegi ki 2 working days mein bhej dein' },
  },
  {
    id: 'consultation', vertical: 'all', tier: 'micro', price: 999, exact: true,
    name: same('Strategy consultation'),
    summary: {
      en: '45 minutes on a video call to work through one problem, with written next steps.',
      hi: 'Video call par 45 minute, ek problem par kaam, likhe hue next steps ke saath.',
    },
    deliverables: [
      { en: 'A 45-minute video call', hi: '45 minute ki video call' },
      { en: 'Written next steps within a day', hi: 'Ek din ke andar likhe hue next steps' },
      { en: 'The fee is adjusted against any project you book within 30 days', hi: '30 din mein project book karein to fees adjust ho jaayegi' },
    ],
    timeline: { en: 'Usually within the same week', hi: 'Aam taur par usi hafte' },
  },

  // ---- Local business digitization
  {
    id: 'lb-quick-fix', vertical: 'local-business', tier: 'micro', price: 1999,
    name: same('Google Profile Quick Fix'),
    summary: {
      en: 'Fix what customers see first when they search for you on Google Maps.',
      hi: 'Google Maps par aapko search karne par customers sabse pehle jo dekhte hain, use theek karna.',
    },
    deliverables: [
      { en: 'Claim or recover your Business Profile — you stay the owner, and we guide you through Google’s verification',
        hi: 'Business Profile claim ya recover karna — owner aap hi rahenge, Google verification mein hum guide karenge' },
      { en: 'Correct name, category, hours, phone number and map pin', hi: 'Sahi naam, category, timing, phone number aur map pin' },
      { en: 'Up to 10 of your photos and 5 products or services added', hi: 'Aapki 10 tak photos aur 5 products ya services add' },
      { en: 'One Google post that shows you’re open for business', hi: 'Ek Google post jo dikhaye ki business chalu hai' },
    ],
    timeline: { en: '2–3 working days after we get access', hi: 'Access milne ke 2–3 working days baad' },
    notIncluded: [{ en: 'WhatsApp setup, website, printing', hi: 'WhatsApp setup, website, printing' }],
  },
  {
    id: 'lb-visibility-kit', vertical: 'local-business', tier: 'starter', price: 4999, flagship: true,
    name: same('Google & WhatsApp Visibility Kit'),
    summary: {
      en: 'Be found on Google Maps, answer enquiries properly on WhatsApp, and start collecting real reviews.',
      hi: 'Google Maps par dikhiye, WhatsApp par enquiries ka sahi jawab dijiye, aur asli reviews aana shuru ho.',
    },
    deliverables: [
      { en: 'Everything in the Quick Fix, done in full: all services, products, business details and up to 25 photos',
        hi: 'Quick Fix ka sab kuch, poori tarah: saari services, products, business details aur 25 tak photos' },
      { en: 'WhatsApp Business profile, a catalogue of up to 20 items, greeting and away messages, quick replies and enquiry labels',
        hi: 'WhatsApp Business profile, 20 items tak catalogue, greeting aur away message, quick replies aur enquiry labels' },
      { en: 'A print-ready QR standee: one code for reviews, one to start a WhatsApp chat',
        hi: 'Print-ready QR standee: ek code reviews ke liye, ek WhatsApp chat ke liye' },
      { en: 'Review-request messages you send to every customer — no gifts for reviews, no leaving out unhappy customers, no reviews from owners or staff',
        hi: 'Review maangne ke messages jo aap har customer ko bhejein — review ke badle gift nahi, naraz customers ko chhodna nahi, owner ya staff se review nahi' },
      { en: 'Four branded post designs for Google, WhatsApp status and Instagram',
        hi: 'Google, WhatsApp status aur Instagram ke liye chaar branded post designs' },
      { en: 'A 30-day check using Google’s own performance numbers', hi: '30 din baad Google ke apne performance numbers se check' },
    ],
    timeline: { en: '5–7 working days after we get access', hi: 'Access milne ke 5–7 working days baad' },
    notIncluded: [
      { en: 'Printing and ad spend', hi: 'Printing aur ads ka kharcha' },
      { en: 'Reviews written, bought or posted by us — never', hi: 'Humse likhe, khareede ya post kiye reviews — kabhi nahi' },
    ],
  },
  {
    id: 'lb-storefront', vertical: 'local-business', tier: 'project', price: 18000,
    name: same('Digital Storefront'),
    summary: {
      en: 'A fast mobile website, with Google and WhatsApp set up to send it enquiries.',
      hi: 'Tez mobile website, aur Google-WhatsApp aise set ki enquiries seedhe aayein.',
    },
    deliverables: [
      { en: 'Everything in the Visibility Kit', hi: 'Visibility Kit ka sab kuch' },
      { en: 'A mobile website of up to 5 pages — services, prices, gallery, location and contact — on your own domain',
        hi: '5 pages tak mobile website — services, prices, gallery, location aur contact — aapke apne domain par' },
      { en: 'An enquiry form and WhatsApp button that reach you directly', hi: 'Enquiry form aur WhatsApp button jo seedha aap tak pahunchein' },
      { en: 'Simple visitor analytics you can read yourself', hi: 'Simple visitor analytics jo aap khud dekh sakein' },
      { en: '30 days of fixes after launch', hi: 'Launch ke baad 30 din tak fixes' },
    ],
    timeline: { en: '2–3 weeks', hi: '2–3 hafte' },
    notIncluded: [{ en: 'Domain and hosting fees — paid at cost, in your name', hi: 'Domain aur hosting fees — jitna kharcha utna, aapke naam par' }],
  },
  {
    id: 'lb-care', vertical: 'local-business', tier: 'retainer', price: 5000, monthly: true,
    name: same('Local Growth Care'),
    summary: {
      en: 'We keep your profile, reviews and posts active every month, and show you what changed.',
      hi: 'Har mahine aapka profile, reviews aur posts active rakhte hain, aur dikhate hain kya badla.',
    },
    deliverables: [
      { en: '8 Google posts and a reply to every new review', hi: '8 Google posts aur har naye review ka jawab' },
      { en: '8 creatives for Google, WhatsApp status and Instagram', hi: 'Google, WhatsApp status aur Instagram ke liye 8 creatives' },
      { en: 'One offer message a month to customers who chose to hear from you', hi: 'Mahine mein ek offer message, sirf un customers ko jo aapse sunna chahte hain' },
      { en: 'One update to your profile or website each month', hi: 'Har mahine profile ya website mein ek update' },
      { en: 'A monthly report from Google’s and WhatsApp’s own numbers', hi: 'Google aur WhatsApp ke apne numbers se monthly report' },
    ],
    timeline: MONTHLY_TERMS,
    notIncluded: [{ en: 'Ad spend', hi: 'Ads ka kharcha' }],
  },

  // ---- Education & knowledge
  {
    id: 'ed-chapter-pack', vertical: 'education', tier: 'starter', price: 2999, per: { en: 'per chapter', hi: 'har chapter' }, flagship: true,
    name: same('Chapter Learning Pack'),
    summary: {
      en: 'One chapter turned into eight ready-to-use learning assets, in your institute’s branding.',
      hi: 'Ek chapter se aath ready-to-use learning assets, aapke institute ki branding mein.',
    },
    deliverables: [
      { en: 'Concise notes and a one-page mind map', hi: 'Chhote notes aur ek page ka mind map' },
      { en: 'Flashcards and a practice worksheet', hi: 'Flashcards aur practice worksheet' },
      { en: 'A quiz with an answer key, and fresh exam-pattern practice questions', hi: 'Answer key ke saath quiz, aur exam pattern ke naye practice questions' },
      { en: 'A visual explainer page and a lesson plan for the teacher', hi: 'Ek visual explainer page aur teacher ke liye lesson plan' },
      { en: 'Checked for accuracy by a person before delivery', hi: 'Delivery se pehle ek insaan accuracy check karta hai' },
    ],
    timeline: { en: '4–6 working days per chapter', hi: 'Har chapter 4–6 working days' },
    notIncluded: [
      same('Printing'),
      { en: 'Copies of textbook pages — we write original material', hi: 'Textbook pages ki copy — hum original material likhte hain' },
    ],
  },
  {
    id: 'ed-revision-system', vertical: 'education', tier: 'project', price: 15000,
    name: same('Subject Revision System'),
    summary: {
      en: 'A past-paper analysis and a four-week revision plan for one subject, with the material to run it.',
      hi: 'Ek subject ke purane papers ka analysis aur chaar hafte ka revision plan, saath mein poora material.',
    },
    deliverables: [
      { en: 'Past-paper (PYQ) analysis for one subject: the topics that repeat, their weightage and the question types',
        hi: 'Ek subject ka PYQ analysis: kaunse topics repeat hote hain, unka weightage aur question types' },
      { en: 'Chapter Learning Packs for 5 chapters', hi: '5 chapters ke Chapter Learning Packs' },
      { en: 'A four-week revision calendar', hi: 'Chaar hafte ka revision calendar' },
      { en: 'Four weekly tests with answer keys', hi: 'Answer key ke saath chaar weekly tests' },
    ],
    timeline: { en: '3–4 weeks', hi: '3–4 hafte' },
    notIncluded: [{ en: 'Printing and distribution', hi: 'Printing aur distribution' }],
  },
  {
    id: 'ed-content-desk', vertical: 'education', tier: 'retainer', price: 10000, monthly: true,
    name: same('Monthly Content Desk'),
    summary: {
      en: 'Fresh worksheets, tests and admission posts every month, so teachers can get on with teaching.',
      hi: 'Har mahine naye worksheets, tests aur admission posts, taaki teachers padhane par dhyan dein.',
    },
    deliverables: [
      { en: '8 worksheets or quizzes, and 4 tests with answer keys', hi: '8 worksheets ya quizzes, aur answer key ke saath 4 tests' },
      { en: '4 revision sheets', hi: '4 revision sheets' },
      { en: '8 posts for admissions and for results you choose to share', hi: 'Admissions aur aapke share kiye results ke liye 8 posts' },
      { en: 'One subject or class group, checked by a person, in your branding', hi: 'Ek subject ya class group, insaan ka check kiya hua, aapki branding mein' },
    ],
    timeline: MONTHLY_TERMS,
  },

  // ---- Research, content & automation
  {
    id: 'rc-channel-audit', vertical: 'research-content-automation', tier: 'starter', price: 2999, flagship: true,
    name: { en: 'Channel or Profile Audit', hi: 'Channel ya Profile Audit' },
    summary: {
      en: 'What is working on your YouTube, Instagram or LinkedIn, why, and what to post next.',
      hi: 'Aapke YouTube, Instagram ya LinkedIn par kya chal raha hai, kyun, aur aage kya post karein.',
    },
    deliverables: [
      { en: 'A review of your last 30 posts or videos, using your own analytics', hi: 'Aapke apne analytics se pichhle 30 posts ya videos ka review' },
      { en: 'A comparison with three comparable channels', hi: 'Teen milte-julte channels se comparison' },
      { en: 'Fixes for titles, thumbnails, hooks and bio', hi: 'Titles, thumbnails, hooks aur bio ke fixes' },
      { en: '20 content ideas with opening hooks', hi: 'Opening hooks ke saath 20 content ideas' },
      { en: 'A 30-minute walkthrough call', hi: '30 minute ki walkthrough call' },
    ],
    timeline: { en: '3–5 working days', hi: '3–5 working days' },
    notIncluded: [{ en: 'Editing or posting for you', hi: 'Aapke liye editing ya posting' }],
  },
  {
    id: 'rc-market-snapshot', vertical: 'research-content-automation', tier: 'starter', price: 9999,
    name: same('Competitor & Market Snapshot'),
    summary: {
      en: 'Five to eight competitors mapped — positioning, pricing, channels — and where the open space is.',
      hi: '5 se 8 competitors ka map — positioning, pricing, channels — aur khaali jagah kahan hai.',
    },
    deliverables: [
      { en: 'Positioning, offers, pricing and channels for 5–8 competitors', hi: '5–8 competitors ki positioning, offers, pricing aur channels' },
      { en: 'Themes from what their customers praise and complain about in public reviews', hi: 'Public reviews mein unke customers kya pasand aur kya shikayat karte hain, uske themes' },
      { en: 'The gaps you could own, with a recommended first move', hi: 'Woh gaps jo aap le sakte hain, aur pehla kadam kya ho' },
      { en: 'Every claim linked to its source', hi: 'Har baat ke saath uska source link' },
      { en: 'A 45-minute debrief call', hi: '45 minute ki debrief call' },
    ],
    timeline: { en: '5–7 working days', hi: '5–7 working days' },
  },
  {
    id: 'rc-content-engine', vertical: 'research-content-automation', tier: 'project', price: 20000,
    name: same('Content Engine Setup'),
    summary: {
      en: 'A repeatable system from research to script to repurposed posts, set up in your own tools.',
      hi: 'Research se script aur phir repurposed posts tak ek repeatable system, aapke apne tools mein.',
    },
    deliverables: [
      { en: 'A research workflow and script templates for your formats', hi: 'Research workflow aur aapke formats ke script templates' },
      { en: 'A bank of 60 ideas, sorted by format and goal', hi: '60 ideas ka bank, format aur goal ke hisaab se' },
      { en: 'A repurposing workflow: one long video into shorts, posts and a newsletter', hi: 'Repurposing workflow: ek lambi video se shorts, posts aur newsletter' },
      { en: 'AI tools set up in your accounts, with a two-week trial run together', hi: 'AI tools aapke accounts mein set, aur do hafte ka saath mein trial run' },
    ],
    timeline: { en: '2–3 weeks', hi: '2–3 hafte' },
    notIncluded: [{ en: 'Tool subscriptions — paid by you, in your name', hi: 'Tools ke subscriptions — aapke naam par, aapke kharche par' }],
  },
  {
    id: 'rc-automation', vertical: 'research-content-automation', tier: 'project', price: 15000, per: { en: 'per workflow', hi: 'har workflow' },
    name: same('AI Workflow Automation'),
    summary: {
      en: 'One repetitive process mapped and automated, with a person approving anything that touches money or clients.',
      hi: 'Ek repetitive kaam ko map karke automate karna — paise ya client se juda har step insaan approve kare.',
    },
    deliverables: [
      { en: 'Your process mapped step by step before anything is built', hi: 'Kuch banane se pehle aapka process step by step map' },
      { en: 'The workflow built on tools in your name — for example enquiry to sheet to follow-up, or proposal drafts from a form',
        hi: 'Aapke naam ke tools par workflow — jaise enquiry se sheet se follow-up, ya form se proposal draft' },
      { en: 'Written documentation and a handover video', hi: 'Likhi hui documentation aur handover video' },
      { en: '14 days of fixes after handover', hi: 'Handover ke baad 14 din tak fixes' },
    ],
    timeline: { en: '1–3 weeks, depending on the process', hi: 'Process ke hisaab se 1–3 hafte' },
    notIncluded: [{ en: 'Tool subscriptions and usage fees', hi: 'Tools ke subscriptions aur usage fees' }],
  },
  {
    id: 'rc-research-desk', vertical: 'research-content-automation', tier: 'retainer', price: 15000, monthly: true,
    name: same('Research & Script Desk'),
    summary: {
      en: 'Researched scripts and a competitor watch every month, so you never start from a blank page.',
      hi: 'Har mahine research ki hui scripts aur competitor watch, taaki khaali page se shuru na karna pade.',
    },
    deliverables: [
      { en: '8 researched scripts or detailed outlines a month', hi: 'Mahine mein 8 research ki hui scripts ya detailed outlines' },
      { en: 'A monthly competitor and trend watch, with sources', hi: 'Sources ke saath monthly competitor aur trend watch' },
      { en: 'A 30-minute planning call each month', hi: 'Har mahine 30 minute ki planning call' },
    ],
    timeline: MONTHLY_TERMS,
  },

  {
    id: 'premium', vertical: 'all', tier: 'premium', price: 50000, byProposal: true,
    name: { en: 'Transformation, research & licensing', hi: 'Transformation, research aur licensing' },
    summary: {
      en: 'Larger work scoped with you: institute-wide content systems, deep market research, white-label content licensing, course production or multi-branch setups.',
      hi: 'Bada kaam, aapke saath scope karke: poore institute ka content system, deep market research, white-label content licensing, course production ya kai branches ka setup.',
    },
    deliverables: [
      { en: 'A paid discovery session and a written proposal', hi: 'Paid discovery session aur likha hua proposal' },
      { en: 'Milestones, with a review at each one', hi: 'Milestones, har ek par review' },
      { en: 'Documentation and handover so your team can run it', hi: 'Documentation aur handover, taaki aapki team chala sake' },
    ],
    timeline: { en: 'Scoped per project', hi: 'Har project ke hisaab se' },
  },
];

export const VERTICALS: Vertical[] = [
  {
    id: 'local-business',
    name: same('Local business digitization'),
    short: { en: 'Local businesses', hi: 'Local business' },
    promise: {
      en: 'Get found on Google Maps, answer enquiries on WhatsApp and collect real reviews — set up properly, in your name.',
      hi: 'Google Maps par dikhiye, WhatsApp par enquiries ka jawab dijiye aur asli reviews paaiye — sahi tarike se, aapke naam par.',
    },
    audience: {
      en: 'Shops, self-study libraries, coaching centres, salons, gyms, cafés, restaurants, local service providers and pharmacies. Clinics, for factual listings only.',
      hi: 'Dukaan, self-study library, coaching centre, salon, gym, café, restaurant, local service providers aur medical stores. Clinic, sirf factual listing ke liye.',
    },
    problems: [
      { en: 'People search “near me” and find a competitor instead of you.', hi: 'Log “near me” search karte hain aur aapki jagah competitor milta hai.' },
      { en: 'Your Google profile shows old hours and few photos — or nobody knows who controls it.', hi: 'Google profile par purani timing aur kam photos — ya pata hi nahi ki control kiske paas hai.' },
      { en: 'Enquiries on WhatsApp get lost between personal chats.', hi: 'WhatsApp par enquiries personal chats ke beech kho jaati hain.' },
      { en: 'Happy customers never leave a review, because nobody asks them.', hi: 'Khush customers review nahi dete, kyunki koi poochhta hi nahi.' },
    ],
    proof: [
      { en: 'Before-and-after screenshots of your profile, taken on day one and at handover.', hi: 'Pehle din aur handover par profile ke before-after screenshots.' },
      { en: 'Google’s own numbers — calls, direction requests, website clicks — checked again after 30 days.', hi: 'Google ke apne numbers — calls, directions, website clicks — 30 din baad dobara check.' },
      { en: 'A handover checklist of everything we changed, so nothing is a mystery.', hi: 'Humne jo bhi badla uski handover checklist, taaki kuch bhi chhupa na rahe.' },
    ],
    guardrails: [
      { en: 'We never write, buy or reward reviews, never ask only happy customers, and never collect reviews from owners or staff.', hi: 'Hum kabhi reviews likhte, khareedte ya inaam dekar nahi maangte, sirf khush customers se nahi poochhte, aur owner ya staff se review nahi likhwaate.' },
      { en: 'Your profile stays in your name; we are added as a manager you can remove.', hi: 'Profile aapke naam par rehta hai; hum manager ke roop mein jude hote hain, jise aap hata sakte hain.' },
      { en: 'No bulk or unsolicited WhatsApp messages — only customers who chose to hear from you.', hi: 'Bulk ya bina poochhe WhatsApp messages nahi — sirf un customers ko jo aapse sunna chahte hain.' },
      { en: 'Clinics get factual details only — services, timings, fees. Pharmacies get no cure or treatment claims for medicines. Neither gets before-and-after photos or patient testimonials.', hi: 'Clinic ke liye sirf factual jaankari — services, timing, fees. Medical store ke liye dawaon par ilaaj ke daave nahi. Dono ke liye before-after photos ya patient testimonials nahi.' },
    ],
    faq: [
      [{ en: 'Do you guarantee a top position on Google Maps?', hi: 'Kya aap Google Maps par top position ki guarantee dete hain?' },
        { en: 'No. Nobody can honestly guarantee rankings — Google decides them. We fix everything in your control and show you Google’s own numbers after 30 days.',
          hi: 'Nahi. Ranking ki guarantee koi imaandari se nahi de sakta — Google tay karta hai. Jo aapke control mein hai woh sab theek karte hain, aur 30 din baad Google ke apne numbers dikhate hain.' }],
      [{ en: 'Do I have to give you my Google password?', hi: 'Kya mujhe apna Google password dena hoga?' },
        { en: 'No. You add us as a manager from your own account and can remove us at any time. Never share a password or OTP with anyone, including us.',
          hi: 'Nahi. Aap apne account se humein manager add karte hain aur kabhi bhi hata sakte hain. Password ya OTP kisi ko mat dijiye — humein bhi nahi.' }],
      [{ en: 'My business isn’t on Google at all. Can you start from zero?', hi: 'Mera business Google par hai hi nahi. Kya zero se shuru kar sakte hain?' },
        { en: 'Yes. We create the profile with you. Google chooses how to verify it — often a short, unedited video of your premises that you record yourself — and we walk you through each step. Once it is verified, you add us as a manager.',
          hi: 'Haan. Profile aapke saath banate hain. Verification ka tarika Google chunta hai — aksar aapki dukaan ki ek chhoti, bina edit ki video jo aap khud record karte hain — aur hum har step par saath rehte hain. Verify hone ke baad aap humein manager add karte hain.' }],
      [{ en: 'How do reviews come in if you don’t write them?', hi: 'Agar aap reviews nahi likhte to reviews aayenge kaise?' },
        { en: 'You get a QR code and short messages for asking every customer after a visit. Asking everyone, consistently, is what brings real reviews.',
          hi: 'Aapko ek QR code aur chhote messages milte hain, har customer se visit ke baad poochhne ke liye. Sabse, lagataar poochhna hi asli reviews laata hai.' }],
    ],
  },
  {
    id: 'education',
    name: { en: 'Education & knowledge', hi: 'Education aur knowledge' },
    short: same('Education'),
    promise: {
      en: 'Turn chapters, past papers and a teacher’s know-how into study material students actually use.',
      hi: 'Chapters, purane papers aur teacher ki samajh ko aisa study material banaiye jo students sach mein use karein.',
    },
    audience: {
      en: 'Coaching institutes, schools, teachers, educators and subject experts.',
      hi: 'Coaching institutes, schools, teachers, educators aur subject experts.',
    },
    problems: [
      { en: 'Teachers spend their evenings making worksheets instead of preparing to teach.', hi: 'Teachers ki shaam worksheets banane mein nikal jaati hai, padhane ki taiyaari mein nahi.' },
      { en: 'Students have notes, but no system for revising them.', hi: 'Students ke paas notes hain, par revision ka koi system nahi.' },
      { en: 'Past papers are collected but never analysed for what keeps coming back.', hi: 'Purane papers jama hote hain, par koi nahi dekhta ki baar-baar kya aata hai.' },
      { en: 'Material looks and reads differently from one batch to the next.', hi: 'Har batch mein material alag dikhta aur alag padhta hai.' },
    ],
    proof: [
      { en: 'A sample chapter pack before you commit to a whole subject.', hi: 'Poora subject lene se pehle ek sample chapter pack.' },
      { en: 'A named source for every past paper we analyse.', hi: 'Jo bhi purana paper analyse karein, uska source likha hua.' },
      { en: 'Your teachers’ feedback after the first week of use, recorded as they give it.', hi: 'Pehle hafte ke use ke baad aapke teachers ka feedback, jaisa woh dein waisa hi.' },
    ],
    guardrails: [
      { en: 'Original material only — we don’t copy textbook pages, figures or other publishers’ questions.', hi: 'Sirf original material — textbook pages, figures ya doosre publishers ke questions copy nahi karte.' },
      { en: 'Every answer key is checked by a person before delivery.', hi: 'Har answer key delivery se pehle insaan check karta hai.' },
      { en: 'AI helps us draft; it never has the final word on accuracy.', hi: 'AI draft mein madad karta hai; accuracy ka aakhri faisla kabhi AI ka nahi.' },
      { en: 'Your branded material is yours; we don’t resell it to another institute.', hi: 'Aapka branded material aapka hai; kisi aur institute ko nahi bechte.' },
    ],
    faq: [
      [{ en: 'Which boards and exams do you cover?', hi: 'Kaunse boards aur exams cover karte hain?' },
        { en: 'We start from the syllabus and past papers you give us. Tell us the class, board or exam in the audit form and we confirm what we can deliver well before any payment.',
          hi: 'Aap jo syllabus aur purane papers dete hain, wahan se shuru karte hain. Audit form mein class, board ya exam likhiye — payment se pehle bata denge ki kya achhe se de sakte hain.' }],
      [{ en: 'Hindi medium or English medium?', hi: 'Hindi medium ya English medium?' },
        { en: 'Tell us the medium in the form. We confirm whether we can deliver it to standard before you pay.',
          hi: 'Form mein medium likhiye. Payment se pehle confirm karenge ki usmein achha kaam de sakte hain ya nahi.' }],
      [{ en: 'Who owns the material?', hi: 'Material ka owner kaun hai?' },
        { en: 'You do, once it is paid for, with your branding on it. We keep only our general templates and methods.',
          hi: 'Payment ke baad aap, aapki branding ke saath. Hum sirf apne general templates aur tarike rakhte hain.' }],
    ],
  },
  {
    id: 'research-content-automation',
    name: { en: 'Research, content & automation', hi: 'Research, content aur automation' },
    short: { en: 'Research & automation', hi: 'Research aur automation' },
    promise: {
      en: 'Know your market, publish with a system, and hand repetitive work to AI workflows you control.',
      hi: 'Apna market samjhiye, system se publish kijiye, aur repetitive kaam aise AI workflows ko dijiye jo aapke control mein hon.',
    },
    audience: {
      en: 'Creators, consultants, professionals, startups, agencies and founders.',
      hi: 'Creators, consultants, professionals, startups, agencies aur founders.',
    },
    problems: [
      { en: 'You post regularly but can’t tell what works, or why.', hi: 'Aap regular post karte hain par samajh nahi aata kya chal raha hai, aur kyun.' },
      { en: 'Competitors seem to be everywhere, and the open space isn’t obvious.', hi: 'Competitors har jagah dikhte hain, aur khaali jagah samajh nahi aati.' },
      { en: 'Every script, proposal and follow-up starts from a blank page.', hi: 'Har script, proposal aur follow-up khaali page se shuru hota hai.' },
      { en: 'Your expertise lives in calls and in your head, not in something others can buy.', hi: 'Aapki expertise calls aur dimaag mein hai, kisi aisi cheez mein nahi jo log khareed sakein.' },
    ],
    proof: [
      { en: 'Research you can check: every claim links to its source.', hi: 'Research jo aap check kar sakein: har baat ke saath source ka link.' },
      { en: 'Your own analytics, before and after, rather than our opinion.', hi: 'Hamari raay nahi — aapke apne analytics, pehle aur baad mein.' },
      { en: 'Automations handed over with documentation and a video, running in your accounts.', hi: 'Automations documentation aur video ke saath handover, aapke accounts mein chalte hue.' },
    ],
    guardrails: [
      { en: 'No invented statistics, quotes or citations — if we can’t source it, we say so.', hi: 'Koi banaya hua data, quote ya citation nahi — source na mile to seedha bata dete hain.' },
      { en: 'A person approves any automated step that sends money or messages to your clients.', hi: 'Paise ya clients ko message bhejne wala har automated step insaan approve karta hai.' },
      { en: 'Affiliate and sponsored content carries a clear label at the start, not hidden in hashtags.', hi: 'Affiliate aur sponsored content par shuru mein hi saaf label hota hai, hashtags mein chhupa nahi.' },
      { en: 'Tools and accounts stay in your name, so you’re never locked in.', hi: 'Tools aur accounts aapke naam par rehte hain, taaki aap kabhi phanse nahi.' },
    ],
    faq: [
      [{ en: 'Do I need to know AI tools already?', hi: 'Kya mujhe pehle se AI tools aane chahiye?' },
        { en: 'No. We set things up in your accounts and hand over a short video and written steps so you can run them yourself.',
          hi: 'Nahi. Hum sab aapke accounts mein set karte hain aur chhoti video aur likhe steps dete hain, taaki aap khud chala sakein.' }],
      [{ en: 'Can you research a market outside India?', hi: 'Kya India ke bahar ke market ki research kar sakte hain?' },
        { en: 'Yes, where public sources exist. If the sources for a market are thin, we tell you before you pay.',
          hi: 'Haan, jahan public sources hon. Agar kisi market ke sources kam hon to payment se pehle bata dete hain.' }],
      [{ en: 'Will you post on my channel for me?', hi: 'Kya aap mere channel par post karenge?' },
        { en: 'Not in these packages. We build the system and the scripts; publishing stays with you unless we agree otherwise in writing.',
          hi: 'In packages mein nahi. Hum system aur scripts banate hain; publishing aapke paas rehti hai, jab tak likhit mein kuch aur tay na ho.' }],
    ],
  },
];

/* The client-facing version of the quality workflow — a real sequence. */
export const HOW_WE_WORK: Array<[Tx, Tx]> = [
  [same('Free audit'), { en: 'You tell us what isn’t working. We look at what customers, students or followers see today.', hi: 'Aap batate hain kya kaam nahi kar raha. Hum dekhte hain aaj customers, students ya followers kya dekhte hain.' }],
  [{ en: 'Scope and price in writing', hi: 'Scope aur price likhit mein' }, { en: 'Deliverables, timeline, price and what is not included — agreed before any payment.', hi: 'Deliverables, timeline, price aur kya shaamil nahi — sab payment se pehle tay.' }],
  [same('Risk check'), { en: 'Platform rules, copyright and anything regulated are checked before we build.', hi: 'Banane se pehle platform rules, copyright aur regulated cheezein check hoti hain.' }],
  [{ en: 'Build, with check-ins', hi: 'Build, check-ins ke saath' }, { en: 'Research first, then the build. You see progress at agreed points, not only at the end.', hi: 'Pehle research, phir build. Progress tay points par dikhate hain, sirf end mein nahi.' }],
  [{ en: 'A person checks it, then you review', hi: 'Insaan check karta hai, phir aap review karte hain' }, { en: 'Every deliverable is checked against the scope before it reaches you.', hi: 'Aap tak pahunchne se pehle har deliverable scope ke hisaab se check hota hai.' }],
  [{ en: 'Handover, then a 30-day look at the numbers', hi: 'Handover, phir 30 din baad numbers' }, { en: 'You get the access, the files and a checklist of what changed. Then we read the platforms’ own numbers together.', hi: 'Aapko access, files aur badlaav ki checklist milti hai. Phir platforms ke apne numbers saath mein dekhte hain.' }],
];

export const PROMISES: Tx[] = [
  { en: 'A written scope before any payment', hi: 'Payment se pehle likhit scope' },
  { en: 'Accounts kept in your name', hi: 'Accounts aapke naam par' },
  { en: 'Checked by a person before delivery', hi: 'Delivery se pehle insaan ka check' },
  { en: 'A handover checklist you can reuse', hi: 'Handover checklist jo aap dobara use kar sakein' },
  { en: 'Honest numbers, from the platforms themselves', hi: 'Sachche numbers, platforms se hi' },
];

export const NEVER: Tx[] = [
  { en: 'Buy, write or incentivise reviews', hi: 'Reviews khareedna, likhna ya inaam dekar maangna' },
  { en: 'Promise rankings, followers or sales', hi: 'Ranking, followers ya sales ka vaada' },
  { en: 'Hold your accounts or passwords', hi: 'Aapke accounts ya passwords apne paas rakhna' },
  { en: 'Message people who didn’t ask to hear from you', hi: 'Un logon ko message karna jinhone poochha hi nahi' },
  { en: 'Copy textbooks or invent sources', hi: 'Textbook copy karna ya source banana' },
  { en: 'Publish a testimonial or result without your written permission', hi: 'Likhit permission ke bina testimonial ya result publish karna' },
];

export const SITE_FAQ: Array<[Tx, Tx]> = [
  [{ en: 'What does Digital Saathi do?', hi: 'Digital Saathi kya karta hai?' },
    { en: 'Digital Saathi turns offline businesses, professional expertise and complex knowledge into digital systems that attract customers, save time and keep working: Google and WhatsApp setups for local businesses, study material and past-paper analysis for educators, and research, content systems and AI workflows for creators, consultants and startups.',
      hi: 'Digital Saathi offline business, professional expertise aur mushkil knowledge ko aise digital systems mein badalta hai jo customers laayein, samay bachayein aur chalte rahein: local business ke liye Google aur WhatsApp setup, educators ke liye study material aur PYQ analysis, aur creators, consultants aur startups ke liye research, content systems aur AI workflows.' }],
  [{ en: 'Is the Digital Audit really free?', hi: 'Kya Digital Audit sach mein free hai?' },
    { en: 'Yes. You get a scorecard and your top three fixes whether or not you hire us. If you want us to do the work, you see the price before anything starts.',
      hi: 'Haan. Scorecard aur top teen fixes milenge, chahe aap humein kaam dein ya na dein. Kaam karwana ho to shuru hone se pehle price dikhega.' }],
  [{ en: 'How much does it cost?', hi: 'Kitna kharcha hoga?' },
    { en: 'The audit is free. A Google Profile Quick Fix starts at ₹1,999, the Google & WhatsApp Visibility Kit at ₹4,999, a Chapter Learning Pack at ₹2,999 per chapter and a Channel or Profile Audit at ₹2,999. Projects start at ₹15,000 and monthly plans at ₹5,000. GST is extra where it applies.',
      hi: 'Audit free hai. Google Profile Quick Fix ₹1,999 se, Google & WhatsApp Visibility Kit ₹4,999 se, Chapter Learning Pack ₹2,999 har chapter aur Channel ya Profile Audit ₹2,999 se shuru. Projects ₹15,000 se aur monthly plans ₹5,000 se. GST jahan lagu ho, alag.' }],
  [{ en: 'How do payments work?', hi: 'Payment kaise hota hai?' },
    { en: 'Half to start, once the scope is agreed in writing, and half on delivery. Monthly plans are paid at the start of each month. You can pay by UPI, card or netbanking through Razorpay.',
      hi: 'Scope likhit mein tay hone ke baad aadha shuru mein, aadha delivery par. Monthly plans har mahine ki shuruaat mein. UPI, card ya netbanking se Razorpay ke through pay kar sakte hain.' }],
  [{ en: 'Do you guarantee results?', hi: 'Kya aap results ki guarantee dete hain?' },
    { en: 'We guarantee the work in the scope — not rankings, reviews, followers or sales, which platforms and customers decide. We show you the platforms’ own numbers so you can judge for yourself.',
      hi: 'Hum scope mein likhe kaam ki guarantee dete hain — ranking, reviews, followers ya sales ki nahi, woh platforms aur customers tay karte hain. Platforms ke apne numbers dikhate hain taaki aap khud dekh sakein.' }],
  [{ en: 'Who owns the accounts and the work?', hi: 'Accounts aur kaam ka malik kaun hoga?' },
    { en: 'You do. Accounts stay in your name with us added as a manager, and the deliverables are yours once paid for.',
      hi: 'Aap. Accounts aapke naam par rehte hain aur hum manager ki tarah jude hote hain; payment ke baad saara kaam aapka.' }],
  [{ en: 'Where do you work, and in which languages?', hi: 'Aap kahan kaam karte hain, aur kin bhashaon mein?' },
    { en: 'Across India, over WhatsApp and video calls, in English, Hindi or Hinglish.',
      hi: 'Poore India mein, WhatsApp aur video calls par — English, Hindi ya Hinglish mein.' }],
  [{ en: 'Do you use AI?', hi: 'Kya aap AI use karte hain?' },
    { en: 'Yes, for research and first drafts. A person checks every deliverable before you see it, and research claims link to their sources.',
      hi: 'Haan, research aur pehle draft ke liye. Aap tak pahunchne se pehle har deliverable insaan check karta hai, aur research ki har baat ke saath source hota hai.' }],
];

/* ---------- free-audit form options (ids are stored; labels rendered) ---------- */

export type Option = { id: string; label: Tx };

export const ROLES: Option[] = [
  { id: 'owner', label: { en: 'Owner or founder', hi: 'Owner ya founder' } },
  { id: 'manager', label: same('Manager') },
  { id: 'teacher', label: { en: 'Teacher or educator', hi: 'Teacher ya educator' } },
  { id: 'creator', label: same('Creator') },
  { id: 'consultant', label: { en: 'Consultant or professional', hi: 'Consultant ya professional' } },
  { id: 'agency', label: { en: 'Agency or marketing team', hi: 'Agency ya marketing team' } },
  { id: 'student', label: same('Student') },
  { id: 'other', label: { en: 'Something else', hi: 'Kuch aur' } },
];

export const NEEDS: Option[] = [
  { id: 'local-business', label: { en: 'Get my local business found and contacted', hi: 'Local business ko dikhana aur enquiries badhana' } },
  { id: 'education', label: { en: 'Study material or past-paper analysis', hi: 'Study material ya PYQ analysis' } },
  { id: 'research-content-automation', label: { en: 'Research, a content system or an automation', hi: 'Research, content system ya automation' } },
  { id: 'not-sure', label: { en: 'Not sure yet — tell me what fits', hi: 'Abhi pakka nahi — aap bataiye kya sahi rahega' } },
];

export const ASSETS: Option[] = [
  { id: 'gbp', label: same('Google Business Profile') },
  { id: 'website', label: same('Website') },
  { id: 'whatsapp', label: same('WhatsApp Business') },
  { id: 'instagram', label: same('Instagram') },
  { id: 'youtube', label: same('YouTube') },
  { id: 'facebook', label: same('Facebook page') },
  { id: 'linkedin', label: same('LinkedIn') },
  { id: 'catalogue', label: { en: 'Online catalogue or menu', hi: 'Online catalogue ya menu' } },
  { id: 'none', label: { en: 'None yet', hi: 'Abhi kuch nahi' } },
];

export const DEADLINES: Option[] = [
  { id: 'this-week', label: { en: 'This week', hi: 'Isi hafte' } },
  { id: 'month', label: { en: 'Within a month', hi: 'Ek mahine mein' } },
  { id: 'quarter', label: { en: 'In 1–3 months', hi: '1–3 mahine mein' } },
  { id: 'exploring', label: { en: 'Just exploring', hi: 'Abhi bas dekh rahe hain' } },
];

export const BUDGETS: Option[] = [
  { id: 'free', label: { en: 'Just the free audit for now', hi: 'Abhi sirf free audit' } },
  { id: 'micro', label: { en: 'Under ₹3,000', hi: '₹3,000 se kam' } },
  { id: 'starter', label: same('₹3,000 – ₹10,000') },
  { id: 'project', label: same('₹15,000 – ₹50,000') },
  { id: 'retainer', label: { en: '₹5,000 – ₹30,000 a month', hi: '₹5,000 – ₹30,000 mahina' } },
  { id: 'premium', label: { en: '₹50,000 or more', hi: '₹50,000 ya zyada' } },
  { id: 'unsure', label: { en: 'Not sure yet', hi: 'Abhi pakka nahi' } },
];

export const LANGUAGES: Option[] = [
  { id: 'en', label: same('English') },
  { id: 'hi', label: same('Hindi') },
  { id: 'hinglish', label: same('Hinglish') },
  { id: 'other', label: { en: 'Another language', hi: 'Koi aur bhasha' } },
];

export const CONTACT_PREFS: Option[] = [
  { id: 'whatsapp', label: same('WhatsApp') },
  { id: 'call', label: same('Phone call') },
  { id: 'email', label: same('Email') },
];

export const INDUSTRY_SUGGESTIONS = [
  'Coaching centre', 'Self-study library', 'School', 'Salon', 'Gym', 'Café', 'Restaurant', 'Retail shop',
  'Pharmacy', 'Clinic', 'Home services', 'Creator', 'Consultant', 'Startup', 'Agency',
];

/* ---------- helpers ---------- */

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export function priceLabel(o: Offer, lang: Lang): string {
  if (!o.price) return 'Free';
  const amount = inr(o.price);
  const hi = lang === 'hinglish';
  if (o.exact) return amount;
  if (o.monthly) return hi ? `${amount}/mahina se shuru` : `from ${amount} a month`;
  if (o.per) return hi ? `${amount} se shuru, ${o.per.hi}` : `from ${amount} ${o.per.en}`;
  if (o.byProposal) return hi ? `${amount} se, proposal ke hisaab se` : `from ${amount}, by proposal`;
  return hi ? `${amount} se shuru` : `from ${amount}`;
}

export const verticalById = (id: string) => VERTICALS.find((v) => v.id === id);
export const offerById = (id: string) => OFFERS.find((o) => o.id === id);
export const offersFor = (id: VerticalId) => OFFERS.filter((o) => o.vertical === id);
export const flagshipFor = (id: VerticalId) => OFFERS.find((o) => o.vertical === id && o.flagship)!;
export const offersInTier = (t: TierId) => OFFERS.filter((o) => o.tier === t);
export const optionLabel = (list: Option[], id: string, lang: Lang = 'en') =>
  (list.find((o) => o.id === id) ? tx(list.find((o) => o.id === id)!.label, lang) : id);

/** Public WhatsApp number for enquiries (NEXT_PUBLIC_WHATSAPP_NUMBER), in
    wa.me form; empty when the operator hasn't set one. */
export const WHATSAPP_NUMBER = (() => {
  const d = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/[^\d]/g, '');
  if (d.length === 10) return '91' + d;
  return d.length >= 11 ? d : '';
})();

export const whatsappHref = (text: string) =>
  WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}` : '';
