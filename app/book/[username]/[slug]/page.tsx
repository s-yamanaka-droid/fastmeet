// Server Component — 初期データをサーバーで取得して BookingClient に渡す
import { getBookingData } from "./getBookingData";
import BookingClient from "./BookingClient";

// 30秒ISR：高速 + 30秒以内にリアルタイム反映
export const revalidate = 30;

export const metadata = {
  title: { absolute: "FASTMeet" },
};

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
          <div style={{ color: "#4b5563" }}>このユーザーは存在しません</div>
        </div>
      </div>
    );
  }

  if (!data.meetingType) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f7" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>404</div>
          <div style={{ color: "#4b5563" }}>このミーティング種別は存在しません</div>
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
        news: data.news,
      }}
    />
  );
}
