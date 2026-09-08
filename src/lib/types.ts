/* Core domain types for Digital Saathi.
   These mirror the relational schema in src/lib/db/schema.ts; the demo store
   keeps the same shapes client-side so swapping in the real database changes
   no component code. */

export type Role = 'customer' | 'provider' | 'agent' | 'admin';
export type Lang =
  | 'en' | 'hi' | 'hinglish' | 'bn' | 'mr' | 'te'
  | 'ta' | 'gu' | 'kn' | 'ml' | 'pa' | 'or';

export type Risk = 'low' | 'medium' | 'high';
export type Executor = 'ai' | 'api' | 'agent' | 'provider';

export type TaskPhase =
  | 'thinking' | 'routing' | 'clarify' | 'ready' | 'approve'
  | 'working' | 'tracking' | 'done' | 'failed' | 'cancelled';

export type TaskStatus =
  | 'New' | 'Understanding' | 'Waiting for information' | 'Awaiting confirmation'
  | 'Executing' | 'Waiting for third party' | 'Escalated to human'
  | 'Assigned to local provider' | 'In progress' | 'Completed' | 'Failed'
  | 'Cancelled' | 'Refund requested' | 'Refunded';

export interface UserMemory { [key: string]: string }

export interface User {
  id: string;
  name: string;
  role: Role;
  email?: string;
  phone?: string;
  city: string;
  lang: Lang;
  plan?: string;
  credits?: number;
  wallet?: number;          // rupees in the demo store; paise in the database
  easy?: boolean;
  avatar?: string;
  memory?: UserMemory;
}

export interface FamilyPerms {
  view: boolean; create: boolean; notify: boolean;
  approve: boolean; docs: boolean; history: boolean;
}
export interface FamilyMember {
  id: string; ownerId: string; name: string; relation: string;
  phone: string; linkedUserId?: string; perms: FamilyPerms;
}

export interface Provider {
  id: string; name: string; owner?: string; phone?: string;
  city: string; locality: string; cat: string; exp?: number;
  lang?: string[]; bio?: string;
  rating: number; jobs: number; radius: number; eta: number;
  base: number; hourly?: number;
  status: 'Applied' | 'Under verification' | 'Verified' | 'Suspended' | 'Rejected';
  aadhaar?: boolean; pan?: boolean; skill_cert?: boolean;
  address_proof?: boolean; police?: boolean;
  badges: string[]; resp: number; completion: number;
  x: number; y: number; open: boolean;
  lat?: number; lng?: number;      // real coordinates for nearby matching
  bank?: string; payout_cycle?: string;
  avail?: Record<string, string[]>;
  reviews_count?: number; rating_hist?: Record<number, number>;
  cancelled?: number; disputes?: number; joined?: string;
}

export interface Agent {
  id: string; name: string; phone?: string; city: string;
  lang: string[]; online: boolean; skills: string[]; cat?: string; bio?: string;
  rating: number; done: number; cancel?: number; dispute?: number;
  sla: string; resp_min?: number;
  earnings: number; pending?: number; wk_earnings?: number;
  verified?: boolean; aadhaar?: boolean; pan?: boolean;
  skill_test?: 'passed' | 'pending' | boolean; bg_check?: 'passed' | 'pending' | boolean;
  joined?: string; level?: 'New' | 'Standard' | 'Senior'; status?: string;
}

export interface ClarifyOption { l: string; v: string }
export interface ClarifyQuestion {
  id: string; en: string; hi: string; hin: string;
  type?: 'text'; mode?: string; ph?: string;
  options?: ClarifyOption[];
}

export interface TaskOption {
  id: string; title: string; sub: string; price: number | null;
}

export interface WorkStep { en: string; hi: string; hin: string }
export interface TrailStep { label: string; state: 'now' | 'ok' }

export interface TrackState {
  kind: 'provider' | 'agent';
  stage: string;
  startedAt: number;
  mock: boolean;
}

export interface TaskData {
  title?: string;
  phase?: TaskPhase;
  qs?: ClarifyQuestion[];
  qi?: number;
  answers?: Record<string, string>;
  lead?: string;
  options?: TaskOption[];
  pick?: string;
  approveText?: string;
  work?: { steps: WorkStep[]; i: number; startedAt: number } | null;
  result?: string;
  failEn?: string; failHi?: string; failHin?: string;
  needMoney?: boolean; pendingDone?: boolean; softFail?: boolean;
  needsHuman?: boolean;
  attempt?: number;
  trail?: TrailStep[];
  track?: TrackState | null;
  reviewed?: boolean;
  // intent-specific scratch
  number?: string; operator?: string;
  bill?: { kind: string; biller: string; ca: string; amount: number; due: string; period: string };
  from?: string; to?: string; need?: string;
  matches?: Array<{ id: string; name: string; cat: string; rating: number; jobs: number; base: number; eta: number; km: string; score: number }>;
  step?: string;
}

export interface RoutingHop { from?: string; to: string; why: string; at: string }
export interface Routing {
  executor: Executor;
  from?: Executor;
  confidence: number;
  reason: string;
  history: RoutingHop[];
}

export interface AuditEntry { at: string; by: string; action: string; detail: string }

export interface Task {
  task_id: string;
  user_id: string;
  category: string;
  subcategory: string;
  description: string;
  intent: string;
  status: TaskStatus;
  priority: string;
  estimated_cost: number;
  platform_cost: number;
  user_price: number;
  credits_required: number;
  assigned_agent: string | null;
  assigned_provider: string | null;
  risk_level: Risk;
  requires_confirmation: boolean;
  confirmation_status: 'not required' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  result: string | null;
  attachments: unknown[];
  audit_log: AuditEntry[];
  steps: unknown[];
  data: TaskData;
  routing?: Routing;
}

export interface Booking {
  id: string; taskId: string | null; userId: string; providerId: string;
  cat: string; when: string;
  status: 'Requested' | 'Accepted' | 'In progress' | 'Completed' | 'Cancelled' | 'Declined';
  price: number; address: string;
}

export interface Doc {
  id: string; userId: string; name: string; cat: string; size: string;
  added: string; expiry: string; summary: string;
}

export interface Notification {
  id: string; userId: string; title: string; body: string;
  kind: 'info' | 'warn'; at: string; read: boolean;
}

export interface Review {
  id: string; userId: string; providerId: string; taskId?: string | null;
  stars: number; text: string; at: string;
}

export interface Dispute {
  id: string; userId: string; taskId: string | null; type: string; text: string;
  status: 'Open' | 'Refunded' | 'Partially refunded' | 'Closed'; at: string;
}

export interface LedgerEntry {
  id: string; userId: string; type: 'credits' | 'money';
  dir: 'debit' | 'credit'; amount: number; reason: string;
  taskId?: string | null; at: string;
}

export interface AnalyticsEvent {
  name: string; props: Record<string, unknown>; at: string; user: string | null;
}

export interface Plan {
  id: string; name: string; price: number; credits: number; seats: number; perks: string[];
}
export interface CreditPack { c: number; p: number }
export interface ModelTier { tier: string; use: string; model: string; cost: number }

export interface SaathiConfig {
  currency: string;
  pricing: Record<string, number>;
  plans: Plan[];
  packs: CreditPack[];
  commission: { provider: number; agent: number };
  autoApproveUnder: number;
  models: ModelTier[];
}

export interface ThreadMsg { who: 'user' | 'ai'; text: string; taskId?: string; at: string }

/* Recurring reminders — the "never miss a recharge/bill again" feature.
   `ask` is the request Saathi runs when the user taps "Do it now". */
export interface Reminder {
  id: string; userId: string; title: string;
  kind: 'recharge' | 'bill' | 'renewal' | 'custom';
  every: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDue: string;                 // ISO date
  amount?: number;
  ask?: string;
  lastNotified?: string;
}

export interface GeoPoint { lat: number; lng: number; at: string }

/* The whole demo database — persisted to localStorage under one key,
   exactly like the validated prototype. */
export interface DBShape {
  config: SaathiConfig;
  users: User[];
  family: FamilyMember[];
  providers: Provider[];
  agents: Agent[];
  tasks: Task[];
  bookings: Booking[];
  documents: Doc[];
  notifications: Notification[];
  reviews: Review[];
  disputes: Dispute[];
  ledger: LedgerEntry[];
  events: AnalyticsEvent[];
  threads: Record<string, ThreadMsg[]>;
  reminders: Reminder[];
  ui: { svcq?: string; geo?: GeoPoint };
  session: string | null;
  seededAt: string;
  /** 'demo' = fabricated personas for exploring; 'real' = signed-in users only. */
  mode?: 'demo' | 'real';
}
