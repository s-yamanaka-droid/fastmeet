import { MeetingType } from "./supabase";

export type TimeSlot = {
  start: string; // ISO string
  end: string;
};

function toJST(date: Date): Date {
  // date is already in JS Date (UTC). Return same object for comparison.
  return date;
}

function parseTime(timeStr: string, baseDate: Date): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
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

  const busyIntervals = [
    ...busyTimes.map((b) => ({ start: new Date(b.start), end: new Date(b.end) })),
    ...existingBookings.map((b) => ({
      start: new Date(b.start_time),
      end: new Date(b.end_time),
    })),
  ];

  for (let dayOffset = 0; dayOffset < meetingType.max_days_ahead; dayOffset++) {
    const day = new Date(fromDate);
    day.setDate(day.getDate() + dayOffset);

    // working_days: 0=Sun, 1=Mon, ..., 6=Sat
    const dayOfWeek = day.getDay();
    if (!meetingType.working_days.includes(dayOfWeek)) continue;

    // Set date to midnight JST
    day.setHours(0, 0, 0, 0);

    const workStart = parseTime(meetingType.working_hours_start, day);
    const workEnd = parseTime(meetingType.working_hours_end, day);

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
