import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getBusyTimes } from "@/lib/google-calendar";
import { generateSlots } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const typeId = searchParams.get("typeId");

  if (!typeId) return NextResponse.json({ error: "typeId required" }, { status: 400 });

  const { data: meetingType, error: typeError } = await supabase
    .from("fastmeet_meeting_types")
    .select("*, fastmeet_users(google_refresh_token, email)")
    .eq("id", typeId)
    .single();

  if (typeError || !meetingType) {
    return NextResponse.json({ error: "Meeting type not found" }, { status: 404 });
  }

  const user = meetingType.fastmeet_users as { google_refresh_token: string; email: string };
  if (!user?.google_refresh_token) {
    return NextResponse.json({ error: "Calendar not connected" }, { status: 400 });
  }

  const now = new Date();
  const until = new Date(now);
  until.setDate(until.getDate() + meetingType.max_days_ahead);

  const [busyTimes, bookingsResult] = await Promise.all([
    getBusyTimes(user.google_refresh_token, now.toISOString(), until.toISOString()).catch(
      () => []
    ),
    supabase
      .from("fastmeet_bookings")
      .select("start_time, end_time")
      .eq("meeting_type_id", typeId)
      .eq("status", "confirmed")
      .gte("start_time", now.toISOString()),
  ]);

  const slots = generateSlots(meetingType, busyTimes, bookingsResult.data ?? []);

  return NextResponse.json({ slots });
}
