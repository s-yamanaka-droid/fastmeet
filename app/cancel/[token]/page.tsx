"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";

export default function CancelPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [booking, setBooking] = useState<{ id: string; guest_name: string; start_time: string; end_time: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("fastmeet_bookings")
        .select("id, guest_name, start_time, end_time, status")
        .eq("cancel_token", token)
        .single();
      setBooking(data);
      setLoading(false);
    })();
  }, [token]);

  async function handleCancel() {
    setCancelling(true);
    const res = await fetch(`/api/bookings?token=${token}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setDone(true);
    } else {
      alert("キャンセルに失敗しました");
      setCancelling(false);
    }
  }

  const formatDT = (iso: string) =>
    new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric", month: "long", day: "numeric", weekday: "short",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));

  const wrap = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f7", padding: 24 };
  const card = { background: "#fff", borderRadius: 20, padding: 40, maxWidth: 480, width: "100%", textAlign: "center" as const, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" };

  if (loading) return <div style={wrap}><div style={{ color: "#6e6e73" }}>読み込み中...</div></div>;

  if (!booking) {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", marginBottom: 8 }}>予約が見つかりません</div>
          <div style={{ color: "#6e6e73", fontSize: 14 }}>URLが正しいかご確認ください</div>
        </div>
      </div>
    );
  }

  if (booking.status === "cancelled" || done) {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "#f0f0f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", marginBottom: 8 }}>予約をキャンセルしました</div>
          <div style={{ color: "#6e6e73", fontSize: 14, lineHeight: 1.6 }}>Googleカレンダーからも削除されました</div>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", marginBottom: 16 }}>予約をキャンセルしますか？</div>
        <div style={{ background: "#f5f5f7", borderRadius: 12, padding: "14px 16px", marginBottom: 24, textAlign: "left" }}>
          <div style={{ fontSize: 13, color: "#6e6e73", marginBottom: 4 }}>予約日時</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f" }}>{formatDT(booking.start_time)}</div>
        </div>
        <button
          onClick={handleCancel}
          disabled={cancelling}
          style={{ width: "100%", padding: 13, borderRadius: 12, background: cancelling ? "#999" : "#c0392b", color: "#fff", border: "none", fontSize: 15, fontWeight: 600, cursor: cancelling ? "default" : "pointer", marginBottom: 10 }}
        >
          {cancelling ? "キャンセル中..." : "キャンセルする"}
        </button>
        <button
          onClick={() => window.close()}
          style={{ width: "100%", padding: 13, borderRadius: 12, background: "#f0f0f5", color: "#1d1d1f", border: "none", fontSize: 15, fontWeight: 500, cursor: "pointer" }}
        >
          戻る
        </button>
      </div>
    </div>
  );
}
