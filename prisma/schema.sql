-- ============================================================
-- Digital Saathi — relational schema (32 tables)
-- All monetary amounts in paise (integer). Timestamps UTC.
-- Kept in sync with src/lib/db/schema.ts (Drizzle).
-- ============================================================

CREATE TABLE users (
  id            VARCHAR(24) PRIMARY KEY,
  name          TEXT NOT NULL,
  phone         VARCHAR(20),
  role          VARCHAR(12) NOT NULL DEFAULT 'customer',  -- customer|provider|agent|admin
  lang          VARCHAR(12) NOT NULL DEFAULT 'en',
  plan_id       VARCHAR(24),
  credits       INTEGER NOT NULL DEFAULT 0,
  wallet_paise  INTEGER NOT NULL DEFAULT 0,
  easy_mode     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  user_id  VARCHAR(24) PRIMARY KEY REFERENCES users(id),
  city     TEXT,
  memory   JSONB DEFAULT '{}',
  avatar   TEXT
);

CREATE TABLE family_members (
  id             VARCHAR(24) PRIMARY KEY,
  owner_id       VARCHAR(24) NOT NULL REFERENCES users(id),
  linked_user_id VARCHAR(24) REFERENCES users(id),
  name           TEXT NOT NULL,
  relation       TEXT,
  phone          VARCHAR(20),
  permissions    JSONB DEFAULT '{}'   -- view/create/notify/approve/docs/history
);

CREATE TABLE subscriptions (
  id         VARCHAR(24) PRIMARY KEY,
  user_id    VARCHAR(24) NOT NULL REFERENCES users(id),
  plan_id    VARCHAR(24) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  renews_at  TIMESTAMPTZ,
  status     VARCHAR(16) NOT NULL DEFAULT 'active'
);

CREATE TABLE credit_wallets (
  user_id VARCHAR(24) PRIMARY KEY REFERENCES users(id),
  balance INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE credit_transactions (
  id         VARCHAR(24) PRIMARY KEY,
  user_id    VARCHAR(24) NOT NULL REFERENCES users(id),
  direction  VARCHAR(8) NOT NULL,          -- debit|credit
  amount     INTEGER NOT NULL,
  reason     TEXT,
  task_id    VARCHAR(24),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id                    VARCHAR(24) PRIMARY KEY,
  user_id               VARCHAR(24) NOT NULL REFERENCES users(id),
  category              TEXT,
  subcategory           TEXT,
  description           TEXT NOT NULL,
  intent                VARCHAR(32) NOT NULL,
  status                VARCHAR(32) NOT NULL DEFAULT 'New',
  priority              VARCHAR(12) NOT NULL DEFAULT 'Normal',
  risk_level            VARCHAR(8) NOT NULL DEFAULT 'low',
  requires_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
  confirmation_status   VARCHAR(16) NOT NULL DEFAULT 'not required',
  executor              VARCHAR(12),        -- ai|api|agent|provider
  routing               JSONB,
  phase                 JSONB,
  data                  JSONB,
  estimated_cost_paise  INTEGER NOT NULL DEFAULT 0,
  user_price_paise      INTEGER NOT NULL DEFAULT 0,
  credits_required      INTEGER NOT NULL DEFAULT 0,
  assigned_agent_id     VARCHAR(24),
  assigned_provider_id  VARCHAR(24),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at          TIMESTAMPTZ
);

-- Append-only audit log per task. Never UPDATE or DELETE rows here.
CREATE TABLE task_events (
  id         VARCHAR(24) PRIMARY KEY,
  task_id    VARCHAR(24) NOT NULL REFERENCES tasks(id),
  actor      VARCHAR(24) NOT NULL,
  action     TEXT NOT NULL,
  detail     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_steps (
  id         VARCHAR(24) PRIMARY KEY,
  task_id    VARCHAR(24) NOT NULL REFERENCES tasks(id),
  label      TEXT NOT NULL,
  state      VARCHAR(8) NOT NULL DEFAULT 'now',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE approvals (
  id           VARCHAR(24) PRIMARY KEY,
  task_id      VARCHAR(24) NOT NULL REFERENCES tasks(id),
  user_id      VARCHAR(24) NOT NULL REFERENCES users(id),
  decision     VARCHAR(12) NOT NULL,        -- approved|rejected|auto
  amount_paise INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id               VARCHAR(24) PRIMARY KEY,
  user_id          VARCHAR(24) NOT NULL REFERENCES users(id),
  task_id          VARCHAR(24),
  gateway          VARCHAR(24) NOT NULL DEFAULT 'razorpay',
  gateway_order_id TEXT,
  amount_paise     INTEGER NOT NULL,
  status           VARCHAR(16) NOT NULL DEFAULT 'created',
  webhook_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_methods (
  id      VARCHAR(24) PRIMARY KEY,
  user_id VARCHAR(24) NOT NULL REFERENCES users(id),
  type    VARCHAR(12) NOT NULL,             -- upi|card|wallet
  token   TEXT,
  label   TEXT
);

CREATE TABLE service_categories (
  id        VARCHAR(24) PRIMARY KEY,
  name      TEXT NOT NULL,
  type      VARCHAR(12) NOT NULL,           -- digital|physical
  parent_id VARCHAR(24)
);

CREATE TABLE services (
  id               VARCHAR(24) PRIMARY KEY,
  category_id      VARCHAR(24) REFERENCES service_categories(id),
  name             TEXT NOT NULL,
  description      TEXT,
  base_price_paise INTEGER NOT NULL DEFAULT 0,
  credits          INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE providers (
  id               VARCHAR(24) PRIMARY KEY,
  name             TEXT NOT NULL,
  owner            TEXT,
  phone            VARCHAR(20),
  city             TEXT,
  locality         TEXT,
  category_id      VARCHAR(24),
  cat              TEXT,
  bio              TEXT,
  exp_years        INTEGER,
  lang             JSONB DEFAULT '[]',
  rating           REAL NOT NULL DEFAULT 0,
  jobs_done        INTEGER NOT NULL DEFAULT 0,
  radius_km        INTEGER NOT NULL DEFAULT 5,
  eta_min          INTEGER NOT NULL DEFAULT 45,
  base_price_paise INTEGER NOT NULL DEFAULT 0,
  hourly_paise     INTEGER NOT NULL DEFAULT 0,
  status           VARCHAR(24) NOT NULL DEFAULT 'Applied',  -- Applied|Under verification|Verified|Suspended|Rejected
  completion_rate  REAL NOT NULL DEFAULT 0,
  response_min     INTEGER NOT NULL DEFAULT 20,
  availability     JSONB DEFAULT '{}',       -- day -> ["9-13","14-19"]
  reviews_count    INTEGER NOT NULL DEFAULT 0,
  rating_hist      JSONB DEFAULT '{}',       -- {5:n,4:n,3:n,2:n,1:n}
  cancelled        INTEGER NOT NULL DEFAULT 0,
  disputes         INTEGER NOT NULL DEFAULT 0,
  bank_label       TEXT,
  payout_cycle     VARCHAR(12) DEFAULT 'weekly',
  joined_at        TIMESTAMPTZ DEFAULT now(),
  open             BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE provider_documents (
  id          VARCHAR(24) PRIMARY KEY,
  provider_id VARCHAR(24) NOT NULL REFERENCES providers(id),
  doc_type    VARCHAR(24) NOT NULL,          -- aadhaar|pan|address_proof|skill_cert|police
  status      VARCHAR(12) NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ
);

CREATE TABLE provider_locations (
  provider_id VARCHAR(24) PRIMARY KEY REFERENCES providers(id),
  lat         REAL,
  lng         REAL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
  id            VARCHAR(24) PRIMARY KEY,
  task_id       VARCHAR(24),
  user_id       VARCHAR(24) NOT NULL REFERENCES users(id),
  provider_id   VARCHAR(24) NOT NULL REFERENCES providers(id),
  category      TEXT,
  scheduled_for TEXT,
  address       TEXT,
  status        VARCHAR(16) NOT NULL DEFAULT 'Requested',
  price_paise   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE conversations (
  id         VARCHAR(24) PRIMARY KEY,
  user_id    VARCHAR(24) NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id              VARCHAR(24) PRIMARY KEY,
  conversation_id VARCHAR(24) NOT NULL REFERENCES conversations(id),
  role            VARCHAR(8) NOT NULL,       -- user|ai|system
  text            TEXT,
  task_id         VARCHAR(24),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id          VARCHAR(24) PRIMARY KEY,
  user_id     VARCHAR(24) NOT NULL REFERENCES users(id),
  name        TEXT NOT NULL,
  category    TEXT,
  size_bytes  INTEGER,
  storage_key TEXT,
  expiry_date TEXT,
  summary     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id         VARCHAR(24) PRIMARY KEY,
  user_id    VARCHAR(24) NOT NULL REFERENCES users(id),
  title      TEXT NOT NULL,
  body       TEXT,
  kind       VARCHAR(8) NOT NULL DEFAULT 'info',
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id          VARCHAR(24) PRIMARY KEY,
  user_id     VARCHAR(24) NOT NULL REFERENCES users(id),
  provider_id VARCHAR(24) NOT NULL REFERENCES providers(id),
  task_id     VARCHAR(24),
  stars       INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  text        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE disputes (
  id          VARCHAR(24) PRIMARY KEY,
  user_id     VARCHAR(24) NOT NULL REFERENCES users(id),
  task_id     VARCHAR(24),
  type        TEXT,
  description TEXT,
  status      VARCHAR(24) NOT NULL DEFAULT 'Open',
  resolution  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE refunds (
  id           VARCHAR(24) PRIMARY KEY,
  dispute_id   VARCHAR(24) NOT NULL REFERENCES disputes(id),
  payment_id   VARCHAR(24),
  amount_paise INTEGER NOT NULL,
  status       VARCHAR(16) NOT NULL DEFAULT 'initiated',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agents (
  id             VARCHAR(24) PRIMARY KEY,
  name           TEXT NOT NULL,
  phone          VARCHAR(20),
  city           TEXT,
  lang           JSONB DEFAULT '[]',
  cat            TEXT,
  bio            TEXT,
  skills         JSONB DEFAULT '[]',
  rating         REAL NOT NULL DEFAULT 0,
  done           INTEGER NOT NULL DEFAULT 0,
  cancel         INTEGER NOT NULL DEFAULT 0,
  dispute        INTEGER NOT NULL DEFAULT 0,
  sla            TEXT,
  resp_min       INTEGER,
  earnings_paise INTEGER NOT NULL DEFAULT 0,
  pending_paise  INTEGER NOT NULL DEFAULT 0,
  verified       BOOLEAN NOT NULL DEFAULT FALSE,
  level          VARCHAR(12) NOT NULL DEFAULT 'New',  -- New|Standard|Senior
  status         VARCHAR(16) NOT NULL DEFAULT 'Active',
  online         BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE agent_tasks (
  id             VARCHAR(24) PRIMARY KEY,
  agent_id       VARCHAR(24) NOT NULL REFERENCES agents(id),
  task_id        VARCHAR(24) NOT NULL REFERENCES tasks(id),
  claimed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at   TIMESTAMPTZ,
  earnings_paise INTEGER NOT NULL DEFAULT 0,
  status         VARCHAR(16) NOT NULL DEFAULT 'claimed'
);

CREATE TABLE pricing_rules (
  id         VARCHAR(24) PRIMARY KEY,
  intent     VARCHAR(32) NOT NULL,
  credits    INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(24)
);

CREATE TABLE plan_configs (
  id          VARCHAR(24) PRIMARY KEY,
  plan_key    VARCHAR(24) NOT NULL,
  name        TEXT NOT NULL,
  price_paise INTEGER NOT NULL DEFAULT 0,
  credits     INTEGER NOT NULL DEFAULT 0,
  seats       INTEGER NOT NULL DEFAULT 1,
  perks       JSONB DEFAULT '[]'
);

CREATE TABLE model_usage (
  id         VARCHAR(24) PRIMARY KEY,
  task_id    VARCHAR(24),
  model_tier VARCHAR(16) NOT NULL,          -- light|standard|reasoning|vision|speech|computer
  tokens_in  INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0,
  cost_paise INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE integration_configs (
  id          VARCHAR(24) PRIMARY KEY,
  adapter_key VARCHAR(24) NOT NULL,
  env_var     TEXT,
  is_live     BOOLEAN NOT NULL DEFAULT FALSE,
  notes       TEXT
);

CREATE TABLE audit_logs (
  id          VARCHAR(24) PRIMARY KEY,
  user_id     VARCHAR(24),
  action      TEXT NOT NULL,
  entity_type VARCHAR(24),
  entity_id   VARCHAR(24),
  detail      TEXT,
  ip          VARCHAR(48),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Useful indexes
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_task_events_task ON task_events(task_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_credit_tx_user ON credit_transactions(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
