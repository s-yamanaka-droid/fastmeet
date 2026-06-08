-- Phase 0a: 新テーブル作成 + 既存テーブル拡張（後方互換 / 既存影響ゼロ）
-- 実行前に Supabase バックアップを取ること
-- 関連設計書: ~/vault/9-AI蓄積/decisions/2026-05-27_FASTMeet_DB設計_organization化.md

BEGIN;

-- =============================================================
-- 1. fastmeet_organizations
-- =============================================================
CREATE TABLE IF NOT EXISTS fastmeet_organizations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  name            text NOT NULL,
  owner_user_id   uuid NOT NULL,
  plan            text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','team')),
  custom_domain   text UNIQUE,
  branding_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  email_template  jsonb NOT NULL DEFAULT '{}'::jsonb,
  webhook_url     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orgs_owner ON fastmeet_organizations(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_orgs_plan  ON fastmeet_organizations(plan);
CREATE INDEX IF NOT EXISTS idx_orgs_slug  ON fastmeet_organizations(slug);

-- =============================================================
-- 2. fastmeet_memberships
-- =============================================================
CREATE TABLE IF NOT EXISTS fastmeet_memberships (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES fastmeet_organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES fastmeet_users(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  invited_by      uuid REFERENCES fastmeet_users(id),
  joined_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memb_org  ON fastmeet_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memb_user ON fastmeet_memberships(user_id);

-- owner_user_id への FK を後付け（fastmeet_users 既存テーブル参照）
ALTER TABLE fastmeet_organizations
  ADD CONSTRAINT fastmeet_organizations_owner_user_id_fkey
  FOREIGN KEY (owner_user_id) REFERENCES fastmeet_users(id) ON DELETE RESTRICT;

-- =============================================================
-- 3. fastmeet_subscriptions
-- =============================================================
CREATE TABLE IF NOT EXISTS fastmeet_subscriptions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id          uuid NOT NULL UNIQUE REFERENCES fastmeet_organizations(id) ON DELETE CASCADE,
  stripe_customer_id       text UNIQUE,
  stripe_subscription_id   text UNIQUE,
  plan                     text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','team')),
  status                   text NOT NULL DEFAULT 'active' CHECK (status IN ('active','past_due','canceled','trialing','incomplete')),
  billing_cycle            text CHECK (billing_cycle IN ('monthly','yearly')),
  payment_method           text CHECK (payment_method IN ('card','bank_transfer')),
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  trial_end                timestamptz,
  canceled_at              timestamptz,
  metadata                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subs_stripe_customer ON fastmeet_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subs_status          ON fastmeet_subscriptions(status);

-- =============================================================
-- 4. fastmeet_api_keys
-- =============================================================
CREATE TABLE IF NOT EXISTS fastmeet_api_keys (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES fastmeet_organizations(id) ON DELETE CASCADE,
  created_by      uuid NOT NULL REFERENCES fastmeet_users(id),
  name            text NOT NULL,
  key_prefix      text NOT NULL,
  key_hash        text NOT NULL UNIQUE,
  scopes          text[] NOT NULL DEFAULT ARRAY['read','write'],
  rate_limit_rpm  integer NOT NULL DEFAULT 600,
  monthly_quota   integer NOT NULL DEFAULT 100,
  last_used_at    timestamptz,
  expires_at      timestamptz,
  revoked_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apikeys_org  ON fastmeet_api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_apikeys_hash ON fastmeet_api_keys(key_hash) WHERE revoked_at IS NULL;

-- =============================================================
-- 5. fastmeet_api_usage
-- =============================================================
CREATE TABLE IF NOT EXISTS fastmeet_api_usage (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id      uuid NOT NULL REFERENCES fastmeet_api_keys(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES fastmeet_organizations(id) ON DELETE CASCADE,
  month           text NOT NULL,
  call_count      integer NOT NULL DEFAULT 0,
  UNIQUE (api_key_id, month)
);

CREATE INDEX IF NOT EXISTS idx_apiusage_org_month ON fastmeet_api_usage(organization_id, month);

-- =============================================================
-- 6. 既存テーブル拡張（NULL許容なので既存行影響ゼロ）
-- =============================================================
ALTER TABLE fastmeet_users
  ADD COLUMN IF NOT EXISTS default_organization_id uuid REFERENCES fastmeet_organizations(id);

ALTER TABLE fastmeet_meeting_types
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES fastmeet_organizations(id);

ALTER TABLE fastmeet_bookings
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES fastmeet_organizations(id);

COMMIT;

-- =============================================================
-- 検証クエリ（手動で確認）
-- =============================================================
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema='public' AND table_name LIKE 'fastmeet_%' ORDER BY table_name;
-- 期待: fastmeet_api_keys, fastmeet_api_usage, fastmeet_bookings, fastmeet_meeting_types,
--       fastmeet_memberships, fastmeet_metrics, fastmeet_organizations, fastmeet_subscriptions, fastmeet_users
