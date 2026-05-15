import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createCalendarEvent, deleteCalendarEvent, ConferencingType } from "@/lib/google-calendar";
import { createZoomMeeting, resolveZoomCreds } from "@/lib/zoom";

type HostUser = {
  google_refresh_token: string;
  email: string;
  name: string | null;
  zoom_account_id: string | null;
  zoom_client_id: string | null;
  zoom_client_secret: string | null;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { meetingTypeId, startTime, endTime, guestName, guestEmail, guestCompany, guestNotes } = body;

  if (!meetingTypeId || !startTime || !endTime || !guestName || !guestEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  const { data: existing } = await supabase
    .from("fastmeet_bookings")
    .select("id")
    .eq("meeting_type_id", meetingTypeId)
    .eq("status", "confirmed")
    .lt("start_time", end.toISOString())
    .gt("end_time", start.toISOString());

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Slot already booked" }, { status: 409 });
  }

  const { data: meetingType } = await supabase
    .from("fastmeet_meeting_types")
    .select("name, description, duration_minutes, conferencing_type, custom_url, location_text, fastmeet_users(google_refresh_token, email, name, zoom_account_id, zoom_client_id, zoom_client_secret)")
    .eq("id", meetingTypeId)
    .single();

  let googleEventId: string | null = null;
  let meetingUrl: string | null = null;

  if (meetingType) {
    const hostRaw = meetingType.fastmeet_users;
    const host = (Array.isArray(hostRaw) ? hostRaw[0] : hostRaw) as unknown as HostUser;
    const conferencingType: ConferencingType = (meetingType.conferencing_type as ConferencingType) || "google_meet";

    let externalUrl: string | undefined;

    if (conferencingType === "zoom") {
      const creds = resolveZoomCreds(host);
      if (creds) {
        try {
          const z = await createZoomMeeting(creds, host.email, {
            topic: `${meetingType.name} - ${guestName}${guestCompany ? ` (${guestCompany})` : ""}`,
            startTime,
            durationMinutes: meetingType.duration_minutes,
            agenda: guestNotes ?? undefined,
          });
          externalUrl = z.joinUrl;
          meetingUrl = z.joinUrl;
        } catch (e) {
          console.error("Zoom create failed:", e);
        }
      }
    } else if (conferencingType === "custom_url") {
      externalUrl = meetingType.custom_url ?? undefined;
      meetingUrl = externalUrl ?? null;
    }

    if (host?.google_refresh_token) {
      try {
        const { eventId, meetUrl } = await createCalendarEvent(host.google_refresh_token, {
          summary: `${meetingType.name} - ${guestName}${guestCompany ? ` (${guestCompany})` : ""}`,
          description: guestNotes ?? undefined,
          startTime,
          endTime,
          guestEmail,
          guestName,
          hostEmail: host.email,
          conferencingType,
          externalMeetingUrl: externalUrl,
          locationText: meetingType.location_text ?? undefined,
        });
        googleEventId = eventId;
        if (conferencingType === "google_meet" && meetUrl) meetingUrl = meetUrl;
      } catch (e) {
        console.error("Calendar event creation failed:", e);
      }
    }
  }

  const { data: booking, error } = await supabase
    .from("fastmeet_bookings")
    .insert({
      meeting_type_id: meetingTypeId,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_company: guestCompany ?? null,
      guest_notes: guestNotes ?? null,
      start_time: startTime,
      end_time: endTime,
      google_event_id: googleEventId,
      meeting_url: meetingUrl,
    })
    .select("*, cancel_token")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("fastmeet_bookings")
    .select("*, fastmeet_meeting_types!inner(name, duration_minutes, color, user_id)")
    .eq("fastmeet_meeting_types.user_id", userId)
    .eq("status", "confirmed")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookings: data });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  const { data: booking } = await supabase
    .from("fastmeet_bookings")
    .select("id, google_event_id, fastmeet_meeting_types(fastmeet_users(google_refresh_token))")
    .eq("cancel_token", token)
    .single();

  if (!booking) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  if (booking.google_event_id) {
    const mtRaw = booking.fastmeet_meeting_types;
    const mt = (Array.isArray(mtRaw) ? mtRaw[0] : mtRaw) as unknown as { fastmeet_users: { google_refresh_token: string } | { google_refresh_token: string }[] };
    const hostRaw = mt?.fastmeet_users;
    const host = (Array.isArray(hostRaw) ? hostRaw[0] : hostRaw) as { google_refresh_token: string };
    if (host?.google_refresh_token) {
      try {
        await deleteCalendarEvent(host.google_refresh_token, booking.google_event_id);
      } catch (e) {
        console.error("Calendar delete failed:", e);
      }
    }
  }

  await supabase.from("fastmeet_bookings").update({ status: "cancelled" }).eq("id", booking.id);
  return NextResponse.json({ success: true });
}
