-- 緊急ロールバック用 SQL
-- Phase 0d → 0c → 0b → 0a の逆順で巻き戻す
-- 実行前: pg_dump で必ずバックアップを取る

-- =============================================================
-- Phase 0d ロールバック: RLS 無効化 + ポリシー削除
-- =============================================================
BEGIN;

DROP POLICY IF EXISTS org_member_select_orgs ON fastmeet_organizations;
DROP POLICY IF EXISTS org_admin_update_orgs ON fastmeet_organizations;
DROP POLICY IF EXISTS org_member_select_memberships ON fastmeet_memberships;
DROP POLICY IF EXISTS org_member_select_subscriptions ON fastmeet_subscriptions;
DROP POLICY IF EXISTS org_member_select_apikeys ON fastmeet_api_keys;
DROP POLICY IF EXISTS org_admin_insert_apikeys ON fastmeet_api_keys;
DROP POLICY IF EXISTS org_admin_update_apikeys ON fastmeet_api_keys;
DROP POLICY IF EXISTS org_admin_delete_apikeys ON fastmeet_api_keys;
DROP POLICY IF EXISTS org_member_select_meeting_types ON fastmeet_meeting_types;
DROP POLICY IF EXISTS org_admin_insert_meeting_types ON fastmeet_meeting_types;
DROP POLICY IF EXISTS org_admin_update_meeting_types ON fastmeet_meeting_types;
DROP POLICY IF EXISTS org_admin_delete_meeting_types ON fastmeet_meeting_types;
DROP POLICY IF EXISTS org_member_select_bookings ON fastmeet_bookings;

ALTER TABLE fastmeet_organizations  DISABLE ROW LEVEL SECURITY;
ALTER TABLE fastmeet_memberships    DISABLE ROW LEVEL SECURITY;
ALTER TABLE fastmeet_subscriptions  DISABLE ROW LEVEL SECURITY;
ALTER TABLE fastmeet_api_keys       DISABLE ROW LEVEL SECURITY;
ALTER TABLE fastmeet_api_usage      DISABLE ROW LEVEL SECURITY;
ALTER TABLE fastmeet_meeting_types  DISABLE ROW LEVEL SECURITY;
ALTER TABLE fastmeet_bookings       DISABLE ROW LEVEL SECURITY;

COMMIT;

-- =============================================================
-- Phase 0c ロールバック: NOT NULL 解除
-- =============================================================
BEGIN;
ALTER TABLE fastmeet_meeting_types ALTER COLUMN organization_id DROP NOT NULL;
COMMIT;

-- =============================================================
-- Phase 0b ロールバック: 個人org データ削除（⚠️ Stripe連携後は使用不可）
-- =============================================================
-- BEGIN;
-- DELETE FROM fastmeet_subscriptions;
-- DELETE FROM fastmeet_memberships;
-- DELETE FROM fastmeet_organizations;
-- UPDATE fastmeet_users SET default_organization_id = NULL;
-- COMMIT;

-- =============================================================
-- Phase 0a ロールバック: 全テーブル DROP + 拡張列削除
-- =============================================================
-- BEGIN;
-- ALTER TABLE fastmeet_bookings DROP COLUMN IF EXISTS organization_id;
-- ALTER TABLE fastmeet_meeting_types DROP COLUMN IF EXISTS organization_id;
-- ALTER TABLE fastmeet_users DROP COLUMN IF EXISTS default_organization_id;
-- DROP TABLE IF EXISTS fastmeet_api_usage;
-- DROP TABLE IF EXISTS fastmeet_api_keys;
-- DROP TABLE IF EXISTS fastmeet_subscriptions;
-- DROP TABLE IF EXISTS fastmeet_memberships;
-- DROP TABLE IF EXISTS fastmeet_organizations;
-- COMMIT;
