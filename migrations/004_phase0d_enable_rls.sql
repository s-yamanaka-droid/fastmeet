-- Phase 0d: RLS 有効化（組織境界の強制）
-- 実行前: 003 が完了 + アプリ側コードが「組織モード」対応済みであること
-- ⚠️ アプリ側未対応で実行すると個人版ページが見えなくなる可能性あり

-- 注意: 公開予約ページ（/book/[slug]）は SSR で service_role キーを使うため RLS バイパス可
-- ただし「公開フラグ」つき meeting_type のみ返す制御をアプリ側で必須

BEGIN;

-- =============================================================
-- 1. RLS 有効化
-- =============================================================
ALTER TABLE fastmeet_organizations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fastmeet_memberships    ENABLE ROW LEVEL SECURITY;
ALTER TABLE fastmeet_subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fastmeet_api_keys       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fastmeet_api_usage      ENABLE ROW LEVEL SECURITY;
ALTER TABLE fastmeet_meeting_types  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fastmeet_bookings       ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 2. ポリシー：member は自org のデータを read
-- =============================================================

-- organizations: メンバーは所属orgのみ閲覧
CREATE POLICY org_member_select_orgs ON fastmeet_organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM fastmeet_memberships
      WHERE user_id = auth.uid()
    )
  );

-- memberships: 同org メンバー間で閲覧可
CREATE POLICY org_member_select_memberships ON fastmeet_memberships
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM fastmeet_memberships
      WHERE user_id = auth.uid()
    )
  );

-- subscriptions: 所属orgのみ
CREATE POLICY org_member_select_subscriptions ON fastmeet_subscriptions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM fastmeet_memberships
      WHERE user_id = auth.uid()
    )
  );

-- api_keys: 所属orgのみ。member 以上で閲覧、owner/admin のみ作成削除（後で別ポリシー）
CREATE POLICY org_member_select_apikeys ON fastmeet_api_keys
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM fastmeet_memberships
      WHERE user_id = auth.uid()
    )
  );

-- meeting_types: 所属orgのみ
CREATE POLICY org_member_select_meeting_types ON fastmeet_meeting_types
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM fastmeet_memberships
      WHERE user_id = auth.uid()
    )
  );

-- bookings: 所属orgのみ
CREATE POLICY org_member_select_bookings ON fastmeet_bookings
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM fastmeet_memberships
      WHERE user_id = auth.uid()
    )
  );

-- =============================================================
-- 3. ポリシー：owner/admin のみ org 設定変更
-- =============================================================
CREATE POLICY org_admin_update_orgs ON fastmeet_organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM fastmeet_memberships
      WHERE user_id = auth.uid() AND role IN ('owner','admin')
    )
  );

-- meeting_types: owner/admin のみ作成・編集・削除
CREATE POLICY org_admin_insert_meeting_types ON fastmeet_meeting_types
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM fastmeet_memberships
      WHERE user_id = auth.uid() AND role IN ('owner','admin')
    )
  );

CREATE POLICY org_admin_update_meeting_types ON fastmeet_meeting_types
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM fastmeet_memberships
      WHERE user_id = auth.uid() AND role IN ('owner','admin')
    )
  );

CREATE POLICY org_admin_delete_meeting_types ON fastmeet_meeting_types
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM fastmeet_memberships
      WHERE user_id = auth.uid() AND role IN ('owner','admin')
    )
  );

-- bookings: 認証ユーザーは自org のみ閲覧、変更は admin 以上
-- ゲスト予約作成は service_role 経由（RLS バイパス、アプリ側で公開フラグ判定）

-- =============================================================
-- 4. APIキー作成/削除: owner/admin のみ
-- =============================================================
CREATE POLICY org_admin_insert_apikeys ON fastmeet_api_keys
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM fastmeet_memberships
      WHERE user_id = auth.uid() AND role IN ('owner','admin')
    )
  );

CREATE POLICY org_admin_update_apikeys ON fastmeet_api_keys
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM fastmeet_memberships
      WHERE user_id = auth.uid() AND role IN ('owner','admin')
    )
  );

CREATE POLICY org_admin_delete_apikeys ON fastmeet_api_keys
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM fastmeet_memberships
      WHERE user_id = auth.uid() AND role IN ('owner','admin')
    )
  );

COMMIT;

-- =============================================================
-- 検証クエリ
-- =============================================================
-- 別ユーザーでログイン状態をシミュレートして他org にアクセスできないことを確認
-- SET LOCAL request.jwt.claims = '{"sub":"<別ユーザーUUID>"}';
-- SELECT * FROM fastmeet_meeting_types;
-- 期待: 0 行（他org のmeeting_type が見えない）
