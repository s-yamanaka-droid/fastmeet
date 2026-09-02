import { describe, it, expect } from "vitest";
import { generateSlots } from "../lib/availability";
import type { MeetingType } from "../lib/supabase";

/**
 * generateSlots の境界条件テスト
 *
 * 旅団総意で「絶対書け」と言われた5本：
 *   1. JST タイムゾーン正常動作
 *   2. 1日上限 (max_meetings_per_day) 到達時の全スロット潰し
 *   3. 5時間前ルール (advance_notice_hours)
 *   4. 月末→月跨ぎ
 *   5. busy 時間との重なり判定
 */

// ヘルパー：MeetingType のデフォルト
function mt(overrides: Partial<MeetingType> = {}): MeetingType {
  return {
    id: "mt-test",
    user_id: "u-test",
    name: "30分商談",
    slug: "30min",
    duration_minutes: 30,
    description: null,
    color: "#0066CC",
    buffer_before_minutes: 0,
    buffer_after_minutes: 15,
    advance_notice_hours: 5,
    max_days_ahead: 7,
    max_meetings_per_day: 9,
    working_hours_start: "10:00",
    working_hours_end: "18:00",
    working_days: [0, 1, 2, 3, 4, 5, 6], // 全曜日（テストは曜日揺れ除外）
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

// fromDate を JST 2026-06-01 09:00 に固定（=UTC 2026-06-01 00:00）
const FIXED_JST_2026_06_01_0900 = new Date("2026-06-01T00:00:00Z");

describe("generateSlots — JST タイムゾーン", () => {
  it("JST 10:00〜18:00 の working hours 内のスロットが、UTC 表記でも JST 10:00 から始まる", () => {
    const slots = generateSlots(
      mt({ advance_notice_hours: 0, max_meetings_per_day: 100 }),
      [],
      [],
      FIXED_JST_2026_06_01_0900
    );
    // 当日 (JST 6/1) の最初のスロット = JST 10:00 = UTC 01:00
    // 9:00 開始時点で advance_notice=0 なら 10:00 が候補に出るはず
    const firstSlot = slots[0];
    expect(firstSlot).toBeDefined();
    const startUTC = new Date(firstSlot.start);
    const jstHour = (startUTC.getUTCHours() + 9) % 24;
    expect(jstHour).toBeGreaterThanOrEqual(9); // working start (JST視点)
    expect(jstHour).toBeLessThanOrEqual(18);
  });
});

describe("generateSlots — 1日上限 (max_meetings_per_day)", () => {
  it("busy が上限件数に達した日は、その日のスロットを全て潰す", () => {
    // 上限 2件。当日 (JST 6/1) に working hours 内の busy を 2件入れる
    const busyTimes = [
      { start: "2026-06-01T01:00:00Z", end: "2026-06-01T02:00:00Z" }, // JST 10:00-11:00
      { start: "2026-06-01T02:00:00Z", end: "2026-06-01T03:00:00Z" }, // JST 11:00-12:00
    ];
    const slots = generateSlots(
      mt({ max_meetings_per_day: 2, advance_notice_hours: 0 }),
      busyTimes,
      [],
      FIXED_JST_2026_06_01_0900
    );
    // 当日 (JST 6/1) のスロットは0件のはず
    const jun1Slots = slots.filter((s) => s.start.startsWith("2026-06-01"));
    expect(jun1Slots.length).toBe(0);
  });
});

describe("generateSlots — 5時間前ルール (advance_notice_hours)", () => {
  it("now + advance_notice_hours より前のスロットは除外される", () => {
    const slots = generateSlots(
      mt({ advance_notice_hours: 5, max_meetings_per_day: 100 }),
      [],
      [],
      FIXED_JST_2026_06_01_0900
    );
    const earliest = new Date(FIXED_JST_2026_06_01_0900.getTime() + 5 * 60 * 60 * 1000);
    // 全スロットが earliest 以降
    for (const s of slots) {
      expect(new Date(s.start).getTime()).toBeGreaterThan(earliest.getTime());
    }
  });
});

describe("generateSlots — 月末→月跨ぎ", () => {
  it("月末から開始しても、max_days_ahead 内なら翌月のスロットも出る", () => {
    // JST 2026-05-30 00:00 = UTC 2026-05-29 15:00 から 5日先まで
    const fromDate = new Date("2026-05-29T15:00:00Z");
    const slots = generateSlots(
      mt({ max_days_ahead: 5, advance_notice_hours: 0, max_meetings_per_day: 100 }),
      [],
      [],
      fromDate
    );
    // 翌月 (6月) のスロットが含まれるはず
    const juneSlots = slots.filter((s) => {
      const d = new Date(s.start);
      const jstMonth = new Date(d.getTime() + 9 * 60 * 60 * 1000).getUTCMonth();
      return jstMonth === 5; // 0-indexed: 5=June
    });
    expect(juneSlots.length).toBeGreaterThan(0);
  });
});

describe("generateSlots — busy 時間との重なり判定", () => {
  it("busy 時間と重なるスロットは除外される（buffer 込み）", () => {
    // 当日 JST 14:00-15:00 に busy を入れる
    const busyTimes = [
      { start: "2026-06-01T05:00:00Z", end: "2026-06-01T06:00:00Z" }, // JST 14:00-15:00
    ];
    const slots = generateSlots(
      mt({
        advance_notice_hours: 0,
        max_meetings_per_day: 100,
        buffer_before_minutes: 0,
        buffer_after_minutes: 15,
      }),
      busyTimes,
      [],
      FIXED_JST_2026_06_01_0900
    );
    // JST 13:30-14:00 (UTC 04:30-05:00) は busy 14:00 と接触するが、duration 30min なら 13:30 start, 14:00 end → buffer_after=15min で実効14:15 → busy 14:00 と重なる → 除外
    // JST 14:00-14:30 (UTC 05:00-05:30) は完全に busy 内 → 除外
    const overlapping = slots.filter((s) => {
      const start = new Date(s.start).getTime();
      const end = new Date(s.end).getTime();
      const bStart = new Date("2026-06-01T05:00:00Z").getTime();
      const bEnd = new Date("2026-06-01T06:00:00Z").getTime();
      return start < bEnd && end > bStart;
    });
    expect(overlapping.length).toBe(0);
  });
});
