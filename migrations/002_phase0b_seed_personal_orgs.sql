-- Phase 0b: 既存ユーザーごとに「個人組織」を1個ずつ自動生成
-- 既存個人版が壊れないよう、slug = username で互換維持
-- 実行前: 001 が完了していること

BEGIN;

-- 1. 既存ユーザー分の org を生成（重複防止つき）
INSERT INTO fastmeet_organizations (id, slug, name, owner_user_id, plan)
SELECT
  gen_random_uuid(),
  u.username,
  COALESCE(u.name, u.username) || ' (個人)',
  u.id,
  CASE WHEN u.is_premium THEN 'team' ELSE 'free' END
FROM fastmeet_users u
WHERE NOT EXISTS (
  SELECT 1 FROM fastmeet_organizations o WHERE o.owner_user_id = u.id
);

-- 2. 各 owner を membership(owner) に登録
INSERT INTO fastmeet_memberships (organization_id, user_id, role)
SELECT o.id, o.owner_user_id, 'owner'
FROM fastmeet_organizations o
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 3. ユーザーの default_organization_id を埋める
UPDATE fastmeet_users u
SET default_organization_id = o.id
FROM fastmeet_organizations o
WHERE o.owner_user_id = u.id
  AND u.default_organization_id IS NULL;

-- 4. is_premium ユーザーには subscription レコードも生成（active / 既存課金）
INSERT INTO fastmeet_subscriptions (organization_id, plan, status, billing_cycle, payment_method)
SELECT o.id, 'team', 'active', 'monthly', 'card'
FROM fastmeet_organizations o
JOIN fastmeet_users u ON u.id = o.owner_user_id
WHERE u.is_premium = true
  AND NOT EXISTS (
    SELECT 1 FROM fastmeet_subscriptions s WHERE s.organization_id = o.id
  );

-- 5. Free ユーザーにも subscription レコード（plan=free, status=active）
INSERT INTO fastmeet_subscriptions (organization_id, plan, status)
SELECT o.id, 'free', 'active'
FROM fastmeet_organizations o
JOIN fastmeet_users u ON u.id = o.owner_user_id
WHERE COALESCE(u.is_premium, false) = false
  AND NOT EXISTS (
    SELECT 1 FROM fastmeet_subscriptions s WHERE s.organization_id = o.id
  );

COMMIT;

-- =============================================================
-- 検証クエリ（手動で確認）
-- =============================================================
-- SELECT COUNT(*) AS users FROM fastmeet_users;
-- SELECT COUNT(*) AS orgs FROM fastmeet_organizations;
-- SELECT COUNT(*) AS memberships FROM fastmeet_memberships;
-- SELECT COUNT(*) AS subscriptions FROM fastmeet_subscriptions;
-- 期待: users == orgs == memberships == subscriptions （全てが一致）

-- SELECT u.username, u.default_organization_id, o.slug, o.plan
-- FROM fastmeet_users u
-- JOIN fastmeet_organizations o ON o.id = u.default_organization_id;
-- 期待: 全ユーザーが default_organization_id を持ち、username == slug
