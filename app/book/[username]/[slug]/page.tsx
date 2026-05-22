// Server Component — 初期データをサーバーで取得して BookingClient に渡す
import { getBookingData } from "./getBookingData";
import BookingClient from "./BookingClient";

// 60秒ISR：高速 + 1分以内に新規予約・キャンセルが反映される
export const revalidate = 60;

export default async function BookingPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const data = await getBookingData(username, slug);

  if (!data.user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f7" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>404</div>
          <div style={{ color: "#6e6e73" }}>このユーザーは存在しません</div>
        </div>
      </div>
    );
  }

  if (!data.meetingType) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f7" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>404</div>
          <div style={{ color: "#6e6e73" }}>このミーティング種別は存在しません</div>
        </div>
      </div>
    );
  }

  return (
    <BookingClient
      username={username}
      slug={slug}
      initialData={{
        isPremium: data.isPremium,
        profile: data.profile,
        metrics: data.metrics,
        allTypes: data.allTypes,
        meetingType: data.meetingType,
        slots: data.slots,
      }}
    />
  );
}
