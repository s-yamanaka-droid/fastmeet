import { google, calendar_v3 } from "googleapis";

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
}

// 「予約取れない」と判定すべきでないイベントの判別。
// - 「タスク：◯◯」「task:◯◯」「ブロック：◯◯」「その他：」 等のメモ的エントリ
// - transparency=transparent（カレンダー側で「予定なし扱い」マーク済み）
const SKIP_TITLE_PATTERNS = [
  /^タスク[:：]/i,
  /^task[:：]/i,
  /^ブロック[:：]/i,
  /^その他[:：]/i,
  /^移動[:：]/i,  // 移動はカレンダー上の自己リマインドなので予約可
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
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    timeZone: "Asia/Tokyo",
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 2500,
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
