-- Phase 0c: 既存 meeting_types / bookings を個人org に紐付け + NOT NULL 制約
-- 実行前: 002 が完了していること
-- 注意: アプリ側コードが organization_id を参照する前に実行（実行後でも OK だが順序整える）

BEGIN;

-- 1. meeting_types を user の個人org に紐付け
UPDATE fastmeet_meeting_types mt
SET organization_id = u.default_organization_id
FROM fastmeet_users u
WHERE mt.user_id = u.id
  AND mt.organization_id IS NULL
  AND u.default_organization_id IS NOT NULL;

-- 2. bookings を meeting_type 経由で org に紐付け
UPDATE fastmeet_bookings b
SET organization_id = mt.organization_id
FROM fastmeet_meeting_types mt
WHERE b.meeting_type_id = mt.id
  AND b.organization_id IS NULL
  AND mt.organization_id IS NOT NULL;

-- 3. 紐付け漏れがないかチェック（あれば中断）
DO $$
DECLARE
  orphan_types int;
  orphan_bookings int;
BEGIN
  SELECT COUNT(*) INTO orphan_types FROM fastmeet_meeting_types WHERE organization_id IS NULL;
  SELECT COUNT(*) INTO orphan_bookings FROM fastmeet_bookings WHERE organization_id IS NULL AND meeting_type_id IS NOT NULL;

  IF orphan_types > 0 THEN
    RAISE EXCEPTION '[ABORT] meeting_types に organization_id 未設定が % 件あります', orphan_types;
  END IF;
  IF orphan_bookings > 0 THEN
    RAISE EXCEPTION '[ABORT] bookings に organization_id 未設定が % 件あります', orphan_bookings;
  END IF;
END $$;

-- 4. NOT NULL 制約付与（全部埋まったので安全）
ALTER TABLE fastmeet_meeting_types
  ALTER COLUMN organization_id SET NOT NULL;

-- bookings は meeting_type_id が NULL のレガシー予約がある可能性があるため NOT NULL は付けない
-- アプリ側で「meeting_type_id IS NULL OR organization_id IS NOT NULL」を保証

COMMIT;

-- =============================================================
-- 検証クエリ
-- =============================================================
-- SELECT COUNT(*) FROM fastmeet_meeting_types WHERE organization_id IS NULL;
-- 期待: 0
-- SELECT COUNT(*) FROM fastmeet_bookings WHERE organization_id IS NULL AND meeting_type_id IS NOT NULL;
-- 期待: 0
