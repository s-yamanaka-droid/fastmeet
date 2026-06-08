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

  // Google Calendarのbusyすべてを反映（終日イベント含む）。
  // 出張・休暇ブロック等もこれで正しく潰される。
  const busyIntervals = [
    ...busyTimes.map((b) => ({ start: new Date(b.start), end: new Date(b.end) })),
    ...existingBookings.map((b) => ({
      start: new Date(b.start_time),
      end: new Date(b.end_time),
    })),
  ];

  // JST基準で「今日」のY/M/Dを取得
  const startParts = jstParts(fromDate);

  // 1日上限件数（デフォルト無制限）
  const dailyCap = meetingType.max_meetings_per_day ?? Infinity;

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

    // この日と重なる busy 件数（営業時間内のもののみカウント）
    const dayBusyCount = busyIntervals.filter((b) =>
      overlaps(workStart, workEnd, b.start, b.end)
    ).length;

    // 1日上限に達していれば、この日全スロット潰す
    if (dayBusyCount >= dailyCap) continue;

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

export type CopyOptions = {
  recipient?: string;       // 例: "山田 太郎"
  recipientCompany?: string; // 例: "株式会社○○"
  bookingUrl?: string;       // 末尾に併記する FASTMeet予約URL
  meetingTypeName?: string;  // 例: "30分商談ミーティング"
  maxDays?: number;          // 表示する候補日数（デフォルト5）
  slotsPerDay?: number;      // 1日あたり最大候補数（デフォルト3）
  selfName?: string;         // 自分の署名
};

export function formatSlotForCopy(slots: TimeSlot[], opts: CopyOptions = {}): string {
  if (slots.length === 0) {
    return "申し訳ございません、現在ご案内できる日程がございません。\nお手数ですが、別途ご都合をお知らせください。";
  }

  const maxDays = opts.maxDays ?? 5;
  const slotsPerDay = opts.slotsPerDay ?? 3;

  // 日付別グループ化
  const grouped: Record<string, TimeSlot[]> = {};
  for (const slot of slots) {
    const date = new Date(slot.start);
    const jstDate = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "long", day: "numeric", weekday: "short",
    }).format(date);
    if (!grouped[jstDate]) grouped[jstDate] = [];
    grouped[jstDate].push(slot);
  }

  const lines: string[] = [];

  // 宛名
  if (opts.recipientCompany || opts.recipient) {
    const company = opts.recipientCompany ? `${opts.recipientCompany}\n` : "";
    const name = opts.recipient ? `${opts.recipient} 様\n` : "";
    lines.push(`${company}${name}`);
  }

  // 冒頭
  lines.push("お世話になっております。");
  if (opts.selfName) lines.push(`${opts.selfName}でございます。`);
  lines.push("");
  const mtg = opts.meetingTypeName ? `${opts.meetingTypeName}` : "お打ち合わせ";
  lines.push(`${mtg}の件、以下の候補日にてご都合いかがでしょうか。`);
  lines.push("");

  // 日程
  for (const [date, daySlots] of Object.entries(grouped).slice(0, maxDays)) {
    lines.push(`■ ${date}`);
    for (const slot of daySlots.slice(0, slotsPerDay)) {
      const startTime = new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit",
      }).format(new Date(slot.start));
      const endTime = new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit",
      }).format(new Date(slot.end));
      lines.push(`  ${startTime}〜${endTime}`);
    }
    lines.push("");
  }

  // 結び
  lines.push("ご都合のよい日時をお知らせください。");

  // 予約URL（オプション）
  if (opts.bookingUrl) {
    lines.push("");
    lines.push("※ お急ぎの場合はこちらから直接ご予約も可能です：");
    lines.push(opts.bookingUrl);
  }

  lines.push("");
  lines.push("何卒よろしくお願いいたします。");

  return lines.join("\n");
}
