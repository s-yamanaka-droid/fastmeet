import { google, calendar_v3 } from "googleapis";

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
}

export async function getBusyTimes(
  refreshToken: string,
  timeMin: string,
  timeMax: string
): Promise<Array<{ start: string; end: string }>> {
  const auth = getOAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: "Asia/Tokyo",
      items: [{ id: "primary" }],
    },
  });

  const busy = res.data.calendars?.["primary"]?.busy ?? [];
  return busy.map((b) => ({ start: b.start!, end: b.end! }));
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
