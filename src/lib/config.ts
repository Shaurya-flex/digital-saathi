import type { SaathiConfig } from './types';

/* Admin-editable configuration. The values live in the store (and later in
   the pricing_rules / plan_configs tables); this is the seed. Changing a
   value from Admin → Credits & pricing propagates everywhere instantly. */
export const DEFAULT_CONFIG: SaathiConfig = {
  currency: '₹',
  pricing: {
    ask: 1, translate: 1, doc_summary: 3, research: 5, deep_research: 20,
    form_help: 10, recharge: 2, bill: 2, travel_search: 5, booking: 8,
    human_agent: 60, workflow: 30,
  },
  plans: [
    { id: 'free', name: 'Free', price: 0, credits: 50, seats: 1,
      perks: ['Basic AI answers', 'Explain a short document', 'Simple search', 'A few reminders'] },
    { id: 'smart', name: 'Smart', price: 99, credits: 1000, seats: 1,
      perks: ['Voice assistant', 'All 12 languages', 'Recharge and bill help', 'Document and form help', 'Web research', 'Basic human agent support'] },
    { id: 'pro', name: 'Pro', price: 199, credits: 3000, seats: 1,
      perks: ['Deep research', 'Long documents', 'Multi-step workflows', 'Priority human help', 'Personal memory', 'Higher limits'] },
    { id: 'family', name: 'Family', price: 299, credits: 6000, seats: 5,
      perks: ['Up to 5 members', 'Shared family dashboard', 'Parents’ accounts', 'Recurring bill reminders', 'Shared document vault', 'Priority support'] },
    { id: 'premium', name: 'Premium Plus', price: 499, credits: 15000, seats: 3,
      perks: ['Highest limits', 'Priority execution', 'Premium human assistance', 'Business task support', 'Best provider matching'] },
  ],
  packs: [{ c: 150, p: 29 }, { c: 600, p: 99 }, { c: 1800, p: 249 }, { c: 4000, p: 499 }, { c: 9000, p: 999 }],
  commission: { provider: 0.15, agent: 0.20 },
  autoApproveUnder: 500,
  models: [
    { tier: 'light', use: 'Chit-chat, translation, short answers', model: 'saathi-lite (mock)', cost: 0.02 },
    { tier: 'standard', use: 'Summaries, drafting, form help', model: 'saathi-std (mock)', cost: 0.09 },
    { tier: 'reasoning', use: 'Deep research, multi-step plans', model: 'saathi-max (mock)', cost: 0.42 },
    { tier: 'vision', use: 'Photos of bills, documents', model: 'saathi-vision (mock)', cost: 0.15 },
    { tier: 'speech', use: 'Speech to text and back', model: 'saathi-voice (mock)', cost: 0.01 },
    { tier: 'computer', use: 'Filling portals on a browser', model: 'saathi-operator (mock)', cost: 0.80 },
  ],
};

export const LANGS: Array<[string, string]> = [
  ['en', 'English'], ['hi', 'हिन्दी'], ['hinglish', 'Hinglish'], ['bn', 'বাংলা'],
  ['mr', 'मराठी'], ['te', 'తెలుగు'], ['ta', 'தமிழ்'], ['gu', 'ગુજરાતી'],
  ['kn', 'ಕನ್ನಡ'], ['ml', 'മലയാളം'], ['pa', 'ਪੰਜਾਬੀ'], ['or', 'ଓଡ଼ିଆ'],
];

export interface ServiceCat { id: string; name: string; items: string[] }

export const DIGITAL_CATS: ServiceCat[] = [
  { id: 'telecom', name: 'Telecom', items: ['Mobile recharge', 'Data plans', 'DTH recharge', 'Broadband renewal', 'FASTag recharge'] },
  { id: 'bills', name: 'Bills', items: ['Electricity', 'Water', 'Gas', 'Broadband', 'Postpaid', 'Insurance renewal', 'Recurring bill tracking'] },
  { id: 'travel', name: 'Travel', items: ['Train search', 'Train booking', 'Flight search', 'Bus booking', 'Hotels', 'Itinerary', 'Cab', 'Cancellation help'] },
  { id: 'govt', name: 'Government services', items: ['PAN guidance', 'Passport guidance', 'Voter services', 'Driving licence', 'Vehicle services', 'Certificates', 'Scheme discovery', 'Scholarships', 'DigiLocker', 'EPFO', 'Tax documents'] },
  { id: 'docs', name: 'Documents', items: ['Explain a PDF', 'Summarise', 'Translate', 'Pull out dates', 'Make a checklist', 'Compare two documents', 'Which documents do I need', 'Draft a reply', 'Draft an application'] },
  { id: 'comms', name: 'Communication', items: ['Draft email', 'Summarise email', 'Translate email', 'Reply suggestions', 'WhatsApp message', 'Appointment message', 'Complaint letter'] },
  { id: 'appts', name: 'Appointments', items: ['Doctor', 'Salon', 'Repair', 'Service centre', 'Government appointment', 'Tutor', 'Coaching', 'Consultation'] },
  { id: 'shop', name: 'Shopping', items: ['Compare products', 'Find a product', 'Price comparison', 'Gift ideas', 'Grocery planning', 'Local shops'] },
  { id: 'edu', name: 'Education', items: ['Scholarships', 'School and college forms', 'Course research', 'Admission checklist', 'Deadline tracking', 'Study plan'] },
  { id: 'admin', name: 'Personal admin', items: ['Reminders', 'Renewals', 'Subscriptions', 'Family tasks', 'Document vault', 'Important dates', 'Recurring tasks'] },
  { id: 'jobs', name: 'Jobs and career', items: ['Resume help', 'Job search', 'Application checklist', 'Cover letter', 'Interview scheduling', 'Document prep'] },
];

export const PHYSICAL_CATS: ServiceCat[] = [
  { id: 'home', name: 'Home', items: ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC technician', 'Fridge technician', 'Washing machine technician', 'RO technician', 'Appliance repair', 'Pest control', 'Cleaning', 'Deep cleaning', 'Handyman', 'Locksmith', 'Movers'] },
  { id: 'personal', name: 'Personal', items: ['Salon', 'Beauty at home', 'Home tutor', 'Elder assistance', 'Fitness trainer', 'Photographer'] },
  { id: 'vehicle', name: 'Vehicle', items: ['Mechanic', 'Tyre service', 'Battery service', 'Car wash', 'Roadside assistance'] },
  { id: 'tech', name: 'Technology', items: ['Laptop repair', 'Phone repair', 'Wi-Fi setup', 'Smart TV setup', 'CCTV setup', 'Printer support'] },
  { id: 'business', name: 'Business', items: ['Computer operator', 'Accountant', 'GST help', 'Data entry', 'Local courier', 'Inventory help', 'Digital catalogue', 'Photography', 'Social media help'] },
];
