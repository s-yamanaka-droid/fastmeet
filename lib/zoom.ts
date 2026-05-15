// Zoom Meeting creation via Server-to-Server OAuth
// Each user provides their own ZOOM credentials (stored in fastmeet_users)
// Falls back to global env vars if user credentials are empty (for personal/owner use)

type ZoomCreds = {
  accountId: string;
  clientId: string;
  clientSecret: string;
};

async function getAccessToken(creds: ZoomCreds): Promise<string> {
  const basic = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64");
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${creds.accountId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  if (!res.ok) {
    throw new Error(`Zoom token error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export async function createZoomMeeting(
  creds: ZoomCreds,
  hostEmail: string,
  opts: {
    topic: string;
    startTime: string; // ISO
    durationMinutes: number;
    agenda?: string;
  }
): Promise<{ joinUrl: string; startUrl: string; meetingId: number }> {
  const token = await getAccessToken(creds);

  const res = await fetch(`https://api.zoom.us/v2/users/${encodeURIComponent(hostEmail)}/meetings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: opts.topic,
      type: 2, // scheduled
      start_time: opts.startTime,
      duration: opts.durationMinutes,
      timezone: "Asia/Tokyo",
      agenda: opts.agenda ?? "",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        waiting_room: false,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Zoom create meeting error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return {
    joinUrl: data.join_url,
    startUrl: data.start_url,
    meetingId: data.id,
  };
}

export function resolveZoomCreds(user: {
  zoom_account_id?: string | null;
  zoom_client_id?: string | null;
  zoom_client_secret?: string | null;
}): ZoomCreds | null {
  const accountId = user.zoom_account_id || process.env.ZOOM_ACCOUNT_ID;
  const clientId = user.zoom_client_id || process.env.ZOOM_CLIENT_ID;
  const clientSecret = user.zoom_client_secret || process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) return null;
  return { accountId, clientId, clientSecret };
}
