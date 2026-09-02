import { google, calendar_v3 } from "googleapis";
import { logSafeIntegrationError } from "@/lib/safe-integration-error";

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
}

// 「予約取れない」と判定すべきでないイベント（空き時間扱い）
//
// 正規プレフィックス8種のうち、以下2つは空き扱い：
//   - 「タスク：」… 個人作業ブロック。予約取れる時間
//   - 「その他：」… その他リマインダ。予約取れる時間
//
// 残りはbusy扱い：
//   - 「社内：」「#社内定例：」「社外：」「【外M】」「【会社名】」「移動：」
//
// 過去の標準外プレフィックス（互換のため SKIP に残す）：
//   - 「task：」（小文字 = タスクの旧バリエーション）
//   - 「ブロック：」（バッファ枠等の旧プレフィックス）
//
// あわせて transparency=transparent（カレンダー側で「予定なし」明示）も空き扱い
const SKIP_TITLE_PATTERNS = [
  /^タスク[:：]/i,
  /^その他[:：]/i,
  /^task[:：]/i,      // 過去互換
  /^ブロック[:：]/i,  // 過去互換
];

function shouldSkipAsBusy(ev: { summary?: string | null; transparency?: string | null }): boolean {
  if (ev.transparency === "transparent") return true;
  const title = (ev.summary ?? "").trim();
  if (!title) return false;
  return SKIP_TITLE_PATTERNS.some((rx) => rx.test(title));
}

export async function getBusyTimes(
  refreshToken: string,
  timeMin: string,
  timeMax: string
): Promise<Array<{ start: string; end: string }>> {
  const auth = getOAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth });

  // events.list で取得（summary・transparency 込み）
  // タイムアウト4秒：Calendar API が重い時もページ全体を止めない
  const TIMEOUT_MS = 4000;
  const res = await Promise.race([
    calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      timeZone: "Asia/Tokyo",
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 500,
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Calendar API timeout")), TIMEOUT_MS)
    ),
  ]).catch((e) => {
    logSafeIntegrationError("getBusyTimes", e);
    return { data: { items: [] } };
  });

  const items = res.data.items ?? [];
  const busy: Array<{ start: string; end: string }> = [];

  for (const ev of items) {
    if (shouldSkipAsBusy(ev)) continue;
    // status=cancelled / declined はスキップ
    if (ev.status === "cancelled") continue;
    // 山中本人が declined しているイベントもスキップ
    const myAttendee = ev.attendees?.find((a) => a.self);
    if (myAttendee?.responseStatus === "declined") continue;

    const start = ev.start?.dateTime ?? ev.start?.date;
    const end = ev.end?.dateTime ?? ev.end?.date;
    if (!start || !end) continue;

    // 終日イベント（date 形式）の場合、time は 00:00 JST 開始として ISO 化
    const startIso = ev.start?.dateTime
      ? start
      : new Date(`${start}T00:00:00+09:00`).toISOString();
    const endIso = ev.end?.dateTime
      ? end
      : new Date(`${end}T00:00:00+09:00`).toISOString();

    busy.push({ start: startIso, end: endIso });
  }

  return busy;
}

export type ConferencingType = "google_meet" | "zoom" | "in_person" | "custom_url" | "none";

export async function createCalendarEvent(
  refreshToken: string,
  event: {
    summary: string;
    description?: string;
    startTime: string;
    endTime: string;
    guestEmail: string;
    guestName: string;
    hostEmail: string;
    conferencingType: ConferencingType;
    externalMeetingUrl?: string; // for zoom or custom_url
    locationText?: string; // for in_person
  }
): Promise<{ eventId: string | null; meetUrl: string | null }> {
  const auth = getOAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth });

  const requestBody: calendar_v3.Schema$Event = {
    summary: event.summary,
    description: event.description,
    start: { dateTime: event.startTime, timeZone: "Asia/Tokyo" },
    end: { dateTime: event.endTime, timeZone: "Asia/Tokyo" },
    attendees: [
      { email: event.hostEmail },
      { email: event.guestEmail, displayName: event.guestName },
    ],
  };

  let createMeet = false;

  if (event.conferencingType === "google_meet") {
    requestBody.conferenceData = {
      createRequest: {
        requestId: `fastmeet-${Date.now()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    };
    createMeet = true;
  } else if (event.conferencingType === "zoom" || event.conferencingType === "custom_url") {
    if (event.externalMeetingUrl) {
      requestBody.location = event.externalMeetingUrl;
      requestBody.description = `${event.description ?? ""}\n\n参加URL: ${event.externalMeetingUrl}`.trim();
    }
  } else if (event.conferencingType === "in_person") {
    if (event.locationText) {
      requestBody.location = event.locationText;
    }
  }

  const res = await calendar.events.insert({
    calendarId: "primary",
    sendUpdates: "all",
    requestBody,
    conferenceDataVersion: createMeet ? 1 : 0,
  });

  const meetUrl = res.data.hangoutLink ?? null;
  return { eventId: res.data.id ?? null, meetUrl };
}

export async function deleteCalendarEvent(refreshToken: string, eventId: string) {
  const auth = getOAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });
  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({
    calendarId: "primary",
    eventId,
    sendUpdates: "all",
  });
}
