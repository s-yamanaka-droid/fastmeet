// Server Component: /book/[username] — slug 省略時のエントリポイント
// デフォルト種別（最短duration）でSSR
import { getBookingData } from "./[slug]/getBookingData";
import BookingClient from "./[slug]/BookingClient";

export const revalidate = 30;

export default async function BookingPageDefault({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getBookingData(username);

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
          <div style={{ fontSize: 48, marginBottom: 12 }}>準備中</div>
          <div style={{ color: "#4b5563" }}>ミーティング種別が設定されていません</div>
        </div>
      </div>
    );
  }

  return (
    <BookingClient
      username={username}
      slug={data.meetingType.slug}
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
