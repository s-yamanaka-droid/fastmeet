import { google } from "googleapis";

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
  }
) {
  const auth = getOAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.insert({
    calendarId: "primary",
    sendUpdates: "all",
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: event.startTime,
        timeZone: "Asia/Tokyo",
      },
      end: {
        dateTime: event.endTime,
        timeZone: "Asia/Tokyo",
      },
      attendees: [
        { email: event.hostEmail },
        { email: event.guestEmail, displayName: event.guestName },
      ],
      conferenceData: {
        createRequest: {
          requestId: `calbook-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
    conferenceDataVersion: 1,
  });

  return res.data;
}
