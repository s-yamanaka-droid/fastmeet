import { createClient } from "@supabase/supabase-js";
import { getBusyTimes } from "@/lib/google-calendar";
import { generateSlots, TimeSlot } from "@/lib/availability";
import { getTodayNews, NewsItem } from "@/lib/now-on-air";
import type { MeetingType, CalUser } from "@/lib/supabase";

type User = CalUser & {
  is_premium?: boolean | null;
  profile_data?: Record<string, unknown> | null;
  google_refresh_token?: string | null;
  fastmeet_metrics?: Record<string, unknown> | Record<string, unknown>[] | null;
};

// Server-side Supabase client (use service-like anon - same key works for our RLS)
const serverSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export type BookingPageData = {
  user: User | null;
  isPremium: boolean;
  profile: Record<string, unknown>;
  metrics: Record<string, unknown> | null;
  allTypes: MeetingType[];
  meetingType: MeetingType | null;
  slots: TimeSlot[];
  news: { date: string; items: NewsItem[] };
};

export async function getBookingData(username: string, slug?: string): Promise<BookingPageData> {
  // 1) ユーザー + メトリクス + 全種別 を並列取得
  const [userRes, typesRes] = await Promise.all([
    serverSupabase
      .from("fastmeet_users")
      .select("*, fastmeet_metrics(*)")
      .eq("username", username)
      .single(),
    // typesは後で user_id 必要なのでこの段階ではスキップ → 下で並列取得
    Promise.resolve(null),
  ]);

  const user = userRes.data as User | null;
  if (!user) {
    return { user: null, isPremium: false, profile: {}, metrics: null, allTypes: [], meetingType: null, slots: [], news: { date: "", items: [] } };
  }

  void typesRes;

  // 2) 種別 + 既存予約 を並列取得
  const [allTypesRes, bookingsRes] = await Promise.all([
    serverSupabase
      .from("fastmeet_meeting_types")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("duration_minutes", { ascending: true }),
    serverSupabase
      .from("fastmeet_bookings")
      .select("start_time, end_time, meeting_type_id")
      .eq("status", "confirmed")
      .gte("start_time", new Date().toISOString()),
  ]);

  const allTypes = (allTypesRes.data ?? []) as MeetingType[];
  // slug 指定なしの場合は最短duration（30分）をデフォルトに
  const meetingType = slug
    ? (allTypes.find((t) => t.slug === slug) ?? null)
    : (allTypes[0] ?? null);
  const bookings = bookingsRes.data ?? [];

  // 3) 該当種別が見つかれば BusyTimes 取得 → スロット生成
  let slots: TimeSlot[] = [];
  if (meetingType && user.google_refresh_token) {
    const now = new Date();
    const until = new Date(now);
    until.setDate(until.getDate() + (meetingType.max_days_ahead ?? 14));
    try {
      const busy = await getBusyTimes(
        user.google_refresh_token,
        now.toISOString(),
        until.toISOString()
      );
      const relevantBookings = bookings.filter((b) => b.meeting_type_id === meetingType.id);
      slots = generateSlots(meetingType, busy, relevantBookings);
    } catch {
      // fall back to no calendar
      slots = generateSlots(meetingType, [], bookings.filter((b) => b.meeting_type_id === meetingType.id));
    }
  } else if (meetingType) {
    slots = generateSlots(meetingType, [], bookings.filter((b) => b.meeting_type_id === meetingType.id));
  }

  // metrics: 月別履歴を保持しつつ表示は「最新月」を選ぶ
  const metricsRaw = user.fastmeet_metrics;
  const metricsArray: Record<string, unknown>[] = Array.isArray(metricsRaw)
    ? metricsRaw.filter((m): m is Record<string, unknown> => !!m && typeof m === "object")
    : metricsRaw
    ? [metricsRaw as Record<string, unknown>]
    : [];
  const metrics = metricsArray.length
    ? metricsArray.sort((a, b) => String(b.month ?? "").localeCompare(String(a.month ?? "")))[0]
    : null;

  // Now on AIr の今日のニュース取得（失敗時は空配列）
  const news = await getTodayNews().catch(() => ({ date: "", items: [] }));

  return {
    user,
    isPremium: !!user.is_premium,
    profile: (user.profile_data ?? {}) as Record<string, unknown>,
    metrics,
    allTypes,
    meetingType,
    slots,
    news,
  };
}
