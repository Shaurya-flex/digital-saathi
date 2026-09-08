import {
  boolean, integer, jsonb, pgTable, real, text, timestamp, varchar,
} from 'drizzle-orm/pg-core';

/* Relational schema — 32 tables. Money is stored in paise (integer),
   timestamps in UTC. Mirrored as raw SQL in prisma/schema.sql. */

const id = () => varchar('id', { length: 24 }).primaryKey();
const ts = (name: string) => timestamp(name, { withTimezone: true });

export const users = pgTable('users', {
  id: id(),
  name: text('name').notNull(),
  phone: varchar('phone', { length: 20 }),
  role: varchar('role', { length: 12 }).notNull().default('customer'),
  lang: varchar('lang', { length: 12 }).notNull().default('en'),
  planId: varchar('plan_id', { length: 24 }),
  credits: integer('credits').notNull().default(0),
  walletPaise: integer('wallet_paise').notNull().default(0),
  easyMode: boolean('easy_mode').notNull().default(false),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const profiles = pgTable('profiles', {
  userId: varchar('user_id', { length: 24 }).primaryKey().references(() => users.id),
  city: text('city'),
  memory: jsonb('memory').$type<Record<string, string>>().default({}),
  avatar: text('avatar'),
});

export const familyMembers = pgTable('family_members', {
  id: id(),
  ownerId: varchar('owner_id', { length: 24 }).notNull().references(() => users.id),
  linkedUserId: varchar('linked_user_id', { length: 24 }).references(() => users.id),
  name: text('name').notNull(),
  relation: text('relation'),
  phone: varchar('phone', { length: 20 }),
  permissions: jsonb('permissions').$type<Record<string, boolean>>().default({}),
});

export const subscriptions = pgTable('subscriptions', {
  id: id(),
  userId: varchar('user_id', { length: 24 }).notNull().references(() => users.id),
  planId: varchar('plan_id', { length: 24 }).notNull(),
  startedAt: ts('started_at').notNull().defaultNow(),
  renewsAt: ts('renews_at'),
  status: varchar('status', { length: 16 }).notNull().default('active'),
});

export const creditWallets = pgTable('credit_wallets', {
  userId: varchar('user_id', { length: 24 }).primaryKey().references(() => users.id),
  balance: integer('balance').notNull().default(0),
});

export const creditTransactions = pgTable('credit_transactions', {
  id: id(),
  userId: varchar('user_id', { length: 24 }).notNull().references(() => users.id),
  direction: varchar('direction', { length: 8 }).notNull(), // debit | credit
  amount: integer('amount').notNull(),
  reason: text('reason'),
  taskId: varchar('task_id', { length: 24 }),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: id(),
  userId: varchar('user_id', { length: 24 }).notNull().references(() => users.id),
  category: text('category'),
  subcategory: text('subcategory'),
  description: text('description').notNull(),
  intent: varchar('intent', { length: 32 }).notNull(),
  status: varchar('status', { length: 32 }).notNull().default('New'),
  priority: varchar('priority', { length: 12 }).notNull().default('Normal'),
  riskLevel: varchar('risk_level', { length: 8 }).notNull().default('low'),
  requiresConfirmation: boolean('requires_confirmation').notNull().default(false),
  confirmationStatus: varchar('confirmation_status', { length: 16 }).notNull().default('not required'),
  executor: varchar('executor', { length: 12 }), // ai | api | agent | provider
  routing: jsonb('routing'),
  phase: jsonb('phase'),
  data: jsonb('data'),
  estimatedCostPaise: integer('estimated_cost_paise').notNull().default(0),
  userPricePaise: integer('user_price_paise').notNull().default(0),
  creditsRequired: integer('credits_required').notNull().default(0),
  assignedAgentId: varchar('assigned_agent_id', { length: 24 }),
  assignedProviderId: varchar('assigned_provider_id', { length: 24 }),
  createdAt: ts('created_at').notNull().defaultNow(),
  updatedAt: ts('updated_at').notNull().defaultNow(),
  completedAt: ts('completed_at'),
});

/* Append-only audit log for every task. Rows are never updated or deleted. */
export const taskEvents = pgTable('task_events', {
  id: id(),
  taskId: varchar('task_id', { length: 24 }).notNull().references(() => tasks.id),
  actor: varchar('actor', { length: 24 }).notNull(),
  action: text('action').notNull(),
  detail: text('detail'),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const taskSteps = pgTable('task_steps', {
  id: id(),
  taskId: varchar('task_id', { length: 24 }).notNull().references(() => tasks.id),
  label: text('label').notNull(),
  state: varchar('state', { length: 8 }).notNull().default('now'),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const approvals = pgTable('approvals', {
  id: id(),
  taskId: varchar('task_id', { length: 24 }).notNull().references(() => tasks.id),
  userId: varchar('user_id', { length: 24 }).notNull().references(() => users.id),
  decision: varchar('decision', { length: 12 }).notNull(), // approved | rejected | auto
  amountPaise: integer('amount_paise').notNull().default(0),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const payments = pgTable('payments', {
  id: id(),
  userId: varchar('user_id', { length: 24 }).notNull().references(() => users.id),
  taskId: varchar('task_id', { length: 24 }),
  gateway: varchar('gateway', { length: 24 }).notNull().default('razorpay'),
  gatewayOrderId: text('gateway_order_id'),
  amountPaise: integer('amount_paise').notNull(),
  status: varchar('status', { length: 16 }).notNull().default('created'),
  webhookVerified: boolean('webhook_verified').notNull().default(false),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const paymentMethods = pgTable('payment_methods', {
  id: id(),
  userId: varchar('user_id', { length: 24 }).notNull().references(() => users.id),
  type: varchar('type', { length: 12 }).notNull(), // upi | card | wallet
  token: text('token'),
  label: text('label'),
});

export const serviceCategories = pgTable('service_categories', {
  id: id(),
  name: text('name').notNull(),
  type: varchar('type', { length: 12 }).notNull(), // digital | physical
  parentId: varchar('parent_id', { length: 24 }),
});

export const services = pgTable('services', {
  id: id(),
  categoryId: varchar('category_id', { length: 24 }).references(() => serviceCategories.id),
  name: text('name').notNull(),
  description: text('description'),
  basePricePaise: integer('base_price_paise').notNull().default(0),
  credits: integer('credits').notNull().default(1),
});

export const providers = pgTable('providers', {
  id: id(),
  name: text('name').notNull(),
  owner: text('owner'),
  phone: varchar('phone', { length: 20 }),
  city: text('city'),
  locality: text('locality'),
  categoryId: varchar('category_id', { length: 24 }),
  cat: text('cat'),
  bio: text('bio'),
  expYears: integer('exp_years'),
  lang: jsonb('lang').$type<string[]>().default([]),
  rating: real('rating').notNull().default(0),
  jobsDone: integer('jobs_done').notNull().default(0),
  radiusKm: integer('radius_km').notNull().default(5),
  etaMin: integer('eta_min').notNull().default(45),
  basePricePaise: integer('base_price_paise').notNull().default(0),
  hourlyPaise: integer('hourly_paise').notNull().default(0),
  status: varchar('status', { length: 24 }).notNull().default('Applied'),
  completionRate: real('completion_rate').notNull().default(0),
  responseMin: integer('response_min').notNull().default(20),
  availability: jsonb('availability').$type<Record<string, string[]>>().default({}),
  reviewsCount: integer('reviews_count').notNull().default(0),
  ratingHist: jsonb('rating_hist').$type<Record<string, number>>().default({}),
  cancelled: integer('cancelled').notNull().default(0),
  disputes: integer('disputes').notNull().default(0),
  bankLabel: text('bank_label'),
  payoutCycle: varchar('payout_cycle', { length: 12 }).default('weekly'),
  joinedAt: ts('joined_at').defaultNow(),
  open: boolean('open').notNull().default(false),
});

export const providerDocuments = pgTable('provider_documents', {
  id: id(),
  providerId: varchar('provider_id', { length: 24 }).notNull().references(() => providers.id),
  docType: varchar('doc_type', { length: 24 }).notNull(), // aadhaar | pan | address_proof | skill_cert | police
  status: varchar('status', { length: 12 }).notNull().default('pending'),
  verifiedAt: ts('verified_at'),
});

export const providerLocations = pgTable('provider_locations', {
  providerId: varchar('provider_id', { length: 24 }).primaryKey().references(() => providers.id),
  lat: real('lat'),
  lng: real('lng'),
  updatedAt: ts('updated_at').notNull().defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: id(),
  taskId: varchar('task_id', { length: 24 }),
  userId: varchar('user_id', { length: 24 }).notNull().references(() => users.id),
  providerId: varchar('provider_id', { length: 24 }).notNull().references(() => providers.id),
  category: text('category'),
  scheduledFor: text('scheduled_for'),
  address: text('address'),
  status: varchar('status', { length: 16 }).notNull().default('Requested'),
  pricePaise: integer('price_paise').notNull().default(0),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const conversations = pgTable('conversations', {
  id: id(),
  userId: varchar('user_id', { length: 24 }).notNull().references(() => users.id),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const messages = pgTable('messages', {
  id: id(),
  conversationId: varchar('conversation_id', { length: 24 }).notNull().references(() => conversations.id),
  role: varchar('role', { length: 8 }).notNull(), // user | ai | system
  text: text('text'),
  taskId: varchar('task_id', { length: 24 }),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const documents = pgTable('documents', {
  id: id(),
  userId: varchar('user_id', { length: 24 }).notNull().references(() => users.id),
  name: text('name').notNull(),
  category: text('category'),
  sizeBytes: integer('size_bytes'),
  storageKey: text('storage_key'),
  expiryDate: text('expiry_date'),
  summary: text('summary'),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: id(),
  userId: varchar('user_id', { length: 24 }).notNull().references(() => users.id),
  title: text('title').notNull(),
  body: text('body'),
  kind: varchar('kind', { length: 8 }).notNull().default('info'),
  read: boolean('read').notNull().default(false),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const reviews = pgTable('reviews', {
  id: id(),
  userId: varchar('user_id', { length: 24 }).notNull().references(() => users.id),
  providerId: varchar('provider_id', { length: 24 }).notNull().references(() => providers.id),
  taskId: varchar('task_id', { length: 24 }),
  stars: integer('stars').notNull(),
  text: text('text'),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const disputes = pgTable('disputes', {
  id: id(),
  userId: varchar('user_id', { length: 24 }).notNull().references(() => users.id),
  taskId: varchar('task_id', { length: 24 }),
  type: text('type'),
  description: text('description'),
  status: varchar('status', { length: 24 }).notNull().default('Open'),
  resolution: text('resolution'),
  createdAt: ts('created_at').notNull().defaultNow(),
  resolvedAt: ts('resolved_at'),
});

export const refunds = pgTable('refunds', {
  id: id(),
  disputeId: varchar('dispute_id', { length: 24 }).notNull().references(() => disputes.id),
  paymentId: varchar('payment_id', { length: 24 }),
  amountPaise: integer('amount_paise').notNull(),
  status: varchar('status', { length: 16 }).notNull().default('initiated'),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const agents = pgTable('agents', {
  id: id(),
  name: text('name').notNull(),
  phone: varchar('phone', { length: 20 }),
  city: text('city'),
  lang: jsonb('lang').$type<string[]>().default([]),
  cat: text('cat'),
  bio: text('bio'),
  skills: jsonb('skills').$type<string[]>().default([]),
  rating: real('rating').notNull().default(0),
  done: integer('done').notNull().default(0),
  cancel: integer('cancel').notNull().default(0),
  dispute: integer('dispute').notNull().default(0),
  sla: text('sla'),
  respMin: integer('resp_min'),
  earningsPaise: integer('earnings_paise').notNull().default(0),
  pendingPaise: integer('pending_paise').notNull().default(0),
  verified: boolean('verified').notNull().default(false),
  level: varchar('level', { length: 12 }).notNull().default('New'),
  status: varchar('status', { length: 16 }).notNull().default('Active'),
  online: boolean('online').notNull().default(false),
  joinedAt: ts('joined_at').defaultNow(),
});

export const agentTasks = pgTable('agent_tasks', {
  id: id(),
  agentId: varchar('agent_id', { length: 24 }).notNull().references(() => agents.id),
  taskId: varchar('task_id', { length: 24 }).notNull().references(() => tasks.id),
  claimedAt: ts('claimed_at').notNull().defaultNow(),
  completedAt: ts('completed_at'),
  earningsPaise: integer('earnings_paise').notNull().default(0),
  status: varchar('status', { length: 16 }).notNull().default('claimed'),
});

export const pricingRules = pgTable('pricing_rules', {
  id: id(),
  intent: varchar('intent', { length: 32 }).notNull(),
  credits: integer('credits').notNull(),
  updatedAt: ts('updated_at').notNull().defaultNow(),
  updatedBy: varchar('updated_by', { length: 24 }),
});

export const planConfigs = pgTable('plan_configs', {
  id: id(),
  planKey: varchar('plan_key', { length: 24 }).notNull(),
  name: text('name').notNull(),
  pricePaise: integer('price_paise').notNull().default(0),
  credits: integer('credits').notNull().default(0),
  seats: integer('seats').notNull().default(1),
  perks: jsonb('perks').$type<string[]>().default([]),
});

export const modelUsage = pgTable('model_usage', {
  id: id(),
  taskId: varchar('task_id', { length: 24 }),
  modelTier: varchar('model_tier', { length: 16 }).notNull(),
  tokensIn: integer('tokens_in').notNull().default(0),
  tokensOut: integer('tokens_out').notNull().default(0),
  costPaise: integer('cost_paise').notNull().default(0),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const integrationConfigs = pgTable('integration_configs', {
  id: id(),
  adapterKey: varchar('adapter_key', { length: 24 }).notNull(),
  envVar: text('env_var'),
  isLive: boolean('is_live').notNull().default(false),
  notes: text('notes'),
});

export const auditLogs = pgTable('audit_logs', {
  id: id(),
  userId: varchar('user_id', { length: 24 }),
  action: text('action').notNull(),
  entityType: varchar('entity_type', { length: 24 }),
  entityId: varchar('entity_id', { length: 24 }),
  detail: text('detail'),
  ip: varchar('ip', { length: 48 }),
  createdAt: ts('created_at').notNull().defaultNow(),
});
