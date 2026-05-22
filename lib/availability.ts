import { MeetingType } from "./supabase";

export type TimeSlot = {
  start: string; // ISO string
  end: string;
};

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * JSTの「指定年月日 0:00」を表すUTC Dateを返す。
 * 例: jstMidnight(2026, 5, 23) → JST 2026-05-23 00:00 = UTC 2026-05-22 15:00
 */
function jstMidnight(year: number, month0: number, day: number): Date {
  // Date.UTC(y, m, d, h, ...) は UTC基準。JSTの 0:00 を表すには UTC -9時 にする。
  return new Date(Date.UTC(year, month0, day, -9, 0, 0, 0));
}

/** JSTのhh:mmを、指定したJST日の midnight に加算してUTC Dateを返す */
function jstTimeOnDay(jstDayMidnight: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  return new Date(jstDayMidnight.getTime() + h * 60 * 60 * 1000 + m * 60 * 1000);
}

/** JSTのY/M/Dと曜日を取得 */
function jstParts(date: Date): { year: number; month0: number; day: number; dayOfWeek: number } {
  const jstView = new Date(date.getTime() + JST_OFFSET_MS);
  return {
    year: jstView.getUTCFullYear(),
    month0: jstView.getUTCMonth(),
    day: jstView.getUTCDate(),
    dayOfWeek: jstView.getUTCDay(),
  };
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function overlaps(
  slotStart: Date,
  slotEnd: Date,
  busyStart: Date,
  busyEnd: Date
): boolean {
  return slotStart < busyEnd && slotEnd > busyStart;
}

export function generateSlots(
  meetingType: MeetingType,
  busyTimes: Array<{ start: string; end: string }>,
  existingBookings: Array<{ start_time: string; end_time: string }>,
  fromDate: Date = new Date()
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  const advanceNoticeMs = meetingType.advance_notice_hours * 60 * 60 * 1000;
  const earliestStart = new Date(now.getTime() + advanceNoticeMs);

  // 24時間以上連続するbusy（終日出張・休暇ブロック等）は除外。
  // 個別の予定（数時間まで）だけを busy として扱う。
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const filteredBusy = busyTimes.filter((b) => {
    const dur = new Date(b.end).getTime() - new Date(b.start).getTime();
    return dur < ONE_DAY_MS;
  });

  const busyIntervals = [
    ...filteredBusy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) })),
    ...existingBookings.map((b) => ({
      start: new Date(b.start_time),
      end: new Date(b.end_time),
    })),
  ];

  // JST基準で「今日」のY/M/Dを取得
  const startParts = jstParts(fromDate);

  for (let dayOffset = 0; dayOffset < meetingType.max_days_ahead; dayOffset++) {
    // JST基準で日付を進める
    const dayJstMidnight = jstMidnight(
      startParts.year,
      startParts.month0,
      startParts.day + dayOffset
    );

    // JST基準の曜日
    const { dayOfWeek } = jstParts(dayJstMidnight);

    // working_days: 0=Sun, 1=Mon, ..., 6=Sat
    if (!meetingType.working_days.includes(dayOfWeek)) continue;

    const workStart = jstTimeOnDay(dayJstMidnight, meetingType.working_hours_start);
    const workEnd = jstTimeOnDay(dayJstMidnight, meetingType.working_hours_end);

    let cursor = new Date(workStart);
    while (cursor < workEnd) {
      const slotStart = new Date(cursor);
      const slotEnd = addMinutes(slotStart, meetingType.duration_minutes);

      if (slotEnd > workEnd) break;

      // Effective busy window includes buffer
      const effectiveStart = addMinutes(slotStart, -meetingType.buffer_before_minutes);
      const effectiveEnd = addMinutes(slotEnd, meetingType.buffer_after_minutes);

      const isBusy = busyIntervals.some((b) =>
        overlaps(effectiveStart, effectiveEnd, b.start, b.end)
      );

      const isPast = slotStart <= earliestStart;

      if (!isBusy && !isPast) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        });
      }

      cursor = addMinutes(cursor, 30); // 30-min increments
    }
  }

  return slots;
}

export function formatSlotForCopy(slots: TimeSlot[]): string {
  if (slots.length === 0) return "現在ご案内できる日程がありません。";

  const grouped: Record<string, TimeSlot[]> = {};
  for (const slot of slots.slice(0, 20)) {
    const date = new Date(slot.start);
    const jstDate = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(date);
    if (!grouped[jstDate]) grouped[jstDate] = [];
    grouped[jstDate].push(slot);
  }

  const lines: string[] = ["以下の日程はいかがでしょうか。\n"];
  for (const [date, daySlots] of Object.entries(grouped).slice(0, 5)) {
    lines.push(`【${date}】`);
    for (const slot of daySlots.slice(0, 3)) {
      const startTime = new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(slot.start));
      const endTime = new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(slot.end));
      lines.push(`・${startTime}〜${endTime}`);
    }
    lines.push("");
  }

  lines.push("ご都合のよい日時をお知らせください。\nよろしくお願いいたします。");
  return lines.join("\n");
}
