import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createCalendarEvent } from "@/lib/google-calendar";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { meetingTypeId, startTime, endTime, guestName, guestEmail, guestCompany, guestNotes } = body;

  if (!meetingTypeId || !startTime || !endTime || !guestName || !guestEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify slot is still available
  const start = new Date(startTime);
  const end = new Date(endTime);

  const { data: existing } = await supabase
    .from("fastmeet_bookings")
    .select("id")
    .eq("meeting_type_id", meetingTypeId)
    .eq("status", "confirmed")
    .or(`start_time.lte.${end.toISOString()},end_time.gte.${start.toISOString()}`);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Slot already booked" }, { status: 409 });
  }

  const { data: meetingType } = await supabase
    .from("fastmeet_meeting_types")
    .select("name, description, fastmeet_users(google_refresh_token, email, name)")
    .eq("id", meetingTypeId)
    .single();

  let googleEventId: string | null = null;

  if (meetingType) {
    const host = (Array.isArray(meetingType.fastmeet_users) ? meetingType.fastmeet_users[0] : meetingType.fastmeet_users) as unknown as { google_refresh_token: string; email: string; name: string };
    if (host?.google_refresh_token) {
      try {
        const event = await createCalendarEvent(host.google_refresh_token, {
          summary: `${meetingType.name} - ${guestName}${guestCompany ? ` (${guestCompany})` : ""}`,
          description: guestNotes ?? undefined,
          startTime,
          endTime,
          guestEmail,
          guestName,
          hostEmail: host.email,
        });
        googleEventId = event.id ?? null;
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
    })
    .select()
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
    .select("*, fastmeet_meeting_types(name, duration_minutes, color)")
    .eq("fastmeet_meeting_types.user_id", userId)
    .eq("status", "confirmed")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookings: data });
}
