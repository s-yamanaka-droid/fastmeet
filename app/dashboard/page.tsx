import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const { data: user } = await supabase
    .from("fastmeet_users")
    .select("id, username")
    .eq("email", session.user.email)
    .single();

  const userId = user?.id ?? null;
  const username = user?.username ?? "";

  const [{ data: meetingTypes }, { data: bookings }] = await Promise.all([
    userId
      ? supabase.from("fastmeet_meeting_types").select("*").eq("user_id", userId).order("created_at")
      : { data: [] },
    userId
      ? supabase
          .from("fastmeet_bookings")
          .select("*, fastmeet_meeting_types!inner(name, color, user_id)")
          .eq("fastmeet_meeting_types.user_id", userId)
          .eq("status", "confirmed")
          .gte("start_time", new Date().toISOString())
          .order("start_time", { ascending: true })
          .limit(20)
      : { data: [] },
  ]);

  return (
    <DashboardClient
      username={username}
      initialMeetingTypes={meetingTypes ?? []}
      initialBookings={bookings ?? []}
    />
  );
}
