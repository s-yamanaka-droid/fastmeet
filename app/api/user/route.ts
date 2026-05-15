import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("calbook_users")
    .select("id, username, name, timezone")
    .eq("email", session.user.email)
    .single();

  return NextResponse.json({
    userId: data?.id ?? null,
    username: data?.username ?? (session as { username?: string }).username ?? "",
    name: data?.name ?? session.user.name,
    timezone: data?.timezone ?? "Asia/Tokyo",
  });
}
