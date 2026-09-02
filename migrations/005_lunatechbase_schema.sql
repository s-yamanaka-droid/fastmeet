-- FastMeet physical separation: create the LunaTech-owned schema in lunatechbase.
-- Run against Supabase project tzplwkjwtshfomshuwwh before copying data.

BEGIN;

CREATE TABLE public.fastmeet_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  username text NOT NULL UNIQUE,
  google_refresh_token text,
  timezone text DEFAULT 'Asia/Tokyo',
  is_premium boolean DEFAULT false,
  profile_data jsonb DEFAULT '{}'::jsonb,
  zoom_account_id text,
  zoom_client_id text,
  zoom_client_secret text,
  created_at timestamptz DEFAULT now(),
  default_organization_id uuid
);

CREATE TABLE public.fastmeet_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  owner_user_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  custom_domain text UNIQUE,
  branding_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  email_template jsonb NOT NULL DEFAULT '{}'::jsonb,
  webhook_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fastmeet_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.fastmeet_organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.fastmeet_users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_by uuid REFERENCES public.fastmeet_users(id),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE public.fastmeet_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES public.fastmeet_organizations(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete')),
  billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly')),
  payment_method text CHECK (payment_method IN ('card', 'bank_transfer')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  canceled_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fastmeet_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.fastmeet_organizations(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.fastmeet_users(id),
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  scopes text[] NOT NULL DEFAULT ARRAY['read', 'write'],
  rate_limit_rpm integer NOT NULL DEFAULT 600,
  monthly_quota integer NOT NULL DEFAULT 100,
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fastmeet_api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL REFERENCES public.fastmeet_api_keys(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.fastmeet_organizations(id) ON DELETE CASCADE,
  month text NOT NULL,
  call_count integer NOT NULL DEFAULT 0,
  UNIQUE (api_key_id, month)
);

CREATE TABLE public.fastmeet_meeting_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.fastmeet_users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  description text,
  color text DEFAULT '#0066CC',
  buffer_before_minutes integer DEFAULT 0,
  buffer_after_minutes integer DEFAULT 15,
  advance_notice_hours integer DEFAULT 2,
  max_days_ahead integer DEFAULT 14,
  working_hours_start text DEFAULT '09:00',
  working_hours_end text DEFAULT '18:00',
  working_days integer[] DEFAULT '{1,2,3,4,5}'::integer[],
  is_active boolean DEFAULT true,
  conferencing_type text DEFAULT 'google_meet',
  custom_url text,
  location_text text,
  created_at timestamptz DEFAULT now(),
  max_meetings_per_day integer DEFAULT 7,
  calendar_prefix text DEFAULT '【外M】',
  organization_id uuid NOT NULL REFERENCES public.fastmeet_organizations(id),
  UNIQUE (user_id, slug)
);

CREATE TABLE public.fastmeet_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_type_id uuid REFERENCES public.fastmeet_meeting_types(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_company text,
  guest_notes text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'confirmed',
  google_event_id text,
  meeting_url text,
  cancel_token text DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz DEFAULT now(),
  organization_id uuid REFERENCES public.fastmeet_organizations(id)
);

CREATE TABLE public.fastmeet_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.fastmeet_users(id) ON DELETE CASCADE,
  month text NOT NULL,
  claude_hours numeric DEFAULT 0,
  claude_prompts integer DEFAULT 0,
  meeting_count integer DEFAULT 0,
  meeting_hours numeric DEFAULT 0,
  internal_count integer DEFAULT 0,
  internal_hours numeric DEFAULT 0,
  task_count integer DEFAULT 0,
  task_hours numeric DEFAULT 0,
  travel_count integer DEFAULT 0,
  travel_hours numeric DEFAULT 0,
  travel_destinations text[],
  late_night_count integer DEFAULT 0,
  weekend_count integer DEFAULT 0,
  active_days integer DEFAULT 0,
  total_hours numeric DEFAULT 0,
  raw_data jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, month)
);

CREATE INDEX idx_fastmeet_orgs_owner ON public.fastmeet_organizations(owner_user_id);
CREATE INDEX idx_fastmeet_orgs_plan ON public.fastmeet_organizations(plan);
CREATE INDEX idx_fastmeet_memberships_org ON public.fastmeet_memberships(organization_id);
CREATE INDEX idx_fastmeet_memberships_user ON public.fastmeet_memberships(user_id);
CREATE INDEX idx_fastmeet_subscriptions_status ON public.fastmeet_subscriptions(status);
CREATE INDEX idx_fastmeet_api_keys_org ON public.fastmeet_api_keys(organization_id);
CREATE INDEX idx_fastmeet_api_usage_org_month ON public.fastmeet_api_usage(organization_id, month);
CREATE INDEX idx_fastmeet_bookings_start ON public.fastmeet_bookings(start_time);

ALTER TABLE public.fastmeet_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fastmeet_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fastmeet_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fastmeet_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fastmeet_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fastmeet_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fastmeet_meeting_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fastmeet_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fastmeet_metrics ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.fastmeet_users FROM anon, authenticated;
REVOKE ALL ON public.fastmeet_organizations FROM anon, authenticated;
REVOKE ALL ON public.fastmeet_memberships FROM anon, authenticated;
REVOKE ALL ON public.fastmeet_subscriptions FROM anon, authenticated;
REVOKE ALL ON public.fastmeet_api_keys FROM anon, authenticated;
REVOKE ALL ON public.fastmeet_api_usage FROM anon, authenticated;
REVOKE ALL ON public.fastmeet_meeting_types FROM anon, authenticated;
REVOKE ALL ON public.fastmeet_bookings FROM anon, authenticated;
REVOKE ALL ON public.fastmeet_metrics FROM anon, authenticated;

GRANT ALL ON public.fastmeet_users TO service_role;
GRANT ALL ON public.fastmeet_organizations TO service_role;
GRANT ALL ON public.fastmeet_memberships TO service_role;
GRANT ALL ON public.fastmeet_subscriptions TO service_role;
GRANT ALL ON public.fastmeet_api_keys TO service_role;
GRANT ALL ON public.fastmeet_api_usage TO service_role;
GRANT ALL ON public.fastmeet_meeting_types TO service_role;
GRANT ALL ON public.fastmeet_bookings TO service_role;
GRANT ALL ON public.fastmeet_metrics TO service_role;

COMMIT;
