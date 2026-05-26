import { NextResponse } from "next/server";
import { getTodayNews } from "@/lib/now-on-air";

export const dynamic = "force-dynamic";

export async function GET() {
  const news = await getTodayNews();
  return NextResponse.json(news);
}
