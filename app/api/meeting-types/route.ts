import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

async function getUserId(email: string) {
  const { data } = await supabase
    .from("fastmeet_users")
    .select("id")
    .eq("email", email)
    .single();
  return data?.id;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await getUserId(session.user.email);
  if (!userId) return NextResponse.json({ meetingTypes: [] });

  const { data, error } = await supabase
    .from("fastmeet_meeting_types")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ meetingTypes: data });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await getUserId(session.user.email);
  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { name, slug, duration_minutes, description, color, buffer_before_minutes,
    buffer_after_minutes, advance_notice_hours, max_days_ahead,
    working_hours_start, working_hours_end, working_days,
    conferencing_type, custom_url, location_text } = body;

  const { data, error } = await supabase
    .from("fastmeet_meeting_types")
    .insert({
      user_id: userId,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      duration_minutes: duration_minutes ?? 30,
      description: description ?? null,
      color: color ?? "#0066CC",
      buffer_before_minutes: buffer_before_minutes ?? 0,
      buffer_after_minutes: buffer_after_minutes ?? 15,
      advance_notice_hours: advance_notice_hours ?? 2,
      max_days_ahead: max_days_ahead ?? 14,
      working_hours_start: working_hours_start ?? "09:00",
      working_hours_end: working_hours_end ?? "18:00",
      working_days: working_days ?? [1, 2, 3, 4, 5],
      conferencing_type: conferencing_type ?? "google_meet",
      custom_url: custom_url ?? null,
      location_text: location_text ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ meetingType: data });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const userId = await getUserId(session.user.email);
  const { error } = await supabase
    .from("fastmeet_meeting_types")
    .delete()
    .eq("id", id)
    .eq("user_id", userId!);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
