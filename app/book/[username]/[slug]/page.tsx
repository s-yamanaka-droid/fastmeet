"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { formatSlotForCopy, TimeSlot } from "@/lib/availability";
import type { MeetingType } from "@/lib/supabase";

type BookingStep = "slots" | "form" | "done";

export default function BookingPage({ params }: { params: Promise<{ username: string; slug: string }> }) {
  const { username, slug } = use(params);

  const [meetingType, setMeetingType] = useState<MeetingType | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [step, setStep] = useState<BookingStep>("slots");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyText, setCopyText] = useState("");
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", notes: "" });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Look up user by username
      const { data: user } = await supabase
        .from("fastmeet_users")
        .select("id")
        .eq("username", username)
        .single();

      if (!user) { setLoading(false); return; }

      const { data: mt } = await supabase
        .from("fastmeet_meeting_types")
        .select("*")
        .eq("user_id", user.id)
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (!mt) { setLoading(false); return; }
      setMeetingType(mt);

      const res = await fetch(`/api/availability?typeId=${mt.id}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
      setLoading(false);
    })();
  }, [username, slug]);

  // Group slots by date
  const slotsByDate: Record<string, TimeSlot[]> = {};
  for (const slot of slots) {
    const date = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit"
    }).format(new Date(slot.start));
    if (!slotsByDate[date]) slotsByDate[date] = [];
    slotsByDate[date].push(slot);
  }

  const dates = Object.keys(slotsByDate);
  const currentDate = selectedDate ?? dates[0] ?? null;
  const currentSlots = currentDate ? (slotsByDate[currentDate] ?? []) : [];

  function formatDateLabel(dateStr: string) {
    const [y, m, d] = dateStr.split("/").map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric", weekday: "short" }).format(date);
  }

  function formatTime(iso: string) {
    return new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit"
    }).format(new Date(iso));
  }

  function handleCopyText() {
    const text = formatSlotForCopy(slots);
    setCopyText(text);
    setShowCopyModal(true);
  }

  function doCopy() {
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot || !meetingType) return;
    setSubmitting(true);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meetingTypeId: meetingType.id,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        guestName: form.name,
        guestEmail: form.email,
        guestCompany: form.company || null,
        guestNotes: form.notes || null,
      }),
    });

    const data = await res.json();
    if (data.booking) {
      setStep("done");
    } else {
      alert("予約に失敗しました: " + (data.error ?? "不明"));
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f7" }}>
        <div style={{ color: "#6e6e73", fontSize: 15 }}>読み込み中...</div>
      </div>
    );
  }

  if (!meetingType) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f7" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>404</div>
          <div style={{ color: "#6e6e73" }}>このページは存在しません</div>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f7" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 48, maxWidth: 480, width: "100%", margin: "0 24px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: "#1d1d1f" }}>予約が確定しました</h2>
          <p style={{ color: "#6e6e73", fontSize: 15, lineHeight: 1.6 }}>
            {selectedSlot && (
              <>
                {formatTime(selectedSlot.start)}〜{formatTime(selectedSlot.end)}<br />
              </>
            )}
            確認メールをお送りしました。<br />Googleカレンダーに反映済みです。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e5", padding: "16px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: meetingType.color }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: "#1d1d1f" }}>{meetingType.name}</span>
            <span style={{ fontSize: 13, color: "#6e6e73", background: "#f0f0f5", padding: "2px 10px", borderRadius: 20 }}>
              {meetingType.duration_minutes}分
            </span>
          </div>
          {meetingType.description && (
            <p style={{ fontSize: 14, color: "#6e6e73", margin: 0 }}>{meetingType.description}</p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 24px" }}>
        {step === "slots" && (
          <>
            {/* Copy text button */}
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleCopyText}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 10,
                  background: "#fff", border: "1px solid #e0e0e5",
                  color: "#0066CC", fontSize: 14, fontWeight: 600, cursor: "pointer"
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                候補日テキストをコピー
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: slots.length > 0 ? "220px 1fr" : "1fr", gap: 16 }}>
              {/* Date selector */}
              {dates.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 14, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", alignSelf: "start" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#6e6e73", padding: "4px 8px 8px" }}>日付を選択</div>
                  {dates.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      style={{
                        width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10,
                        border: "none", cursor: "pointer",
                        background: currentDate === d ? "#e8f0fe" : "transparent",
                        color: currentDate === d ? "#0066CC" : "#1d1d1f",
                        fontWeight: currentDate === d ? 600 : 400,
                        fontSize: 14,
                      }}
                    >
                      {formatDateLabel(d)}
                      <span style={{ float: "right", fontSize: 12, color: "#6e6e73" }}>
                        {slotsByDate[d].length}件
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Time slots */}
              <div>
                {slots.length === 0 ? (
                  <div style={{ background: "#fff", borderRadius: 14, padding: 48, textAlign: "center", color: "#6e6e73" }}>
                    現在ご案内できる空き時間がありません
                  </div>
                ) : (
                  <>
                    {currentDate && (
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f", marginBottom: 12 }}>
                        {formatDateLabel(currentDate)}
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                      {currentSlots.map((slot) => (
                        <button
                          key={slot.start}
                          onClick={() => { setSelectedSlot(slot); setStep("form"); }}
                          style={{
                            padding: "12px 8px", borderRadius: 12,
                            border: "1.5px solid",
                            borderColor: "#0066CC",
                            background: "#fff",
                            color: "#0066CC",
                            fontSize: 15, fontWeight: 600, cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "#0066CC"; (e.target as HTMLButtonElement).style.color = "#fff"; }}
                          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "#fff"; (e.target as HTMLButtonElement).style.color = "#0066CC"; }}
                        >
                          {formatTime(slot.start)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {step === "form" && selectedSlot && (
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <button
              onClick={() => { setStep("slots"); }}
              style={{ background: "none", border: "none", color: "#0066CC", fontSize: 14, cursor: "pointer", marginBottom: 20, padding: 0, fontWeight: 500 }}
            >
              ← 日時を選び直す
            </button>

            <div style={{ background: "#e8f0fe", borderRadius: 12, padding: "12px 16px", marginBottom: 24 }}>
              <div style={{ fontSize: 14, color: "#0066CC", fontWeight: 600 }}>
                選択した日時: {new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "long", day: "numeric", weekday: "short" }).format(new Date(selectedSlot.start))} {formatTime(selectedSlot.start)}〜{formatTime(selectedSlot.end)}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, color: "#1d1d1f" }}>お客様情報</h3>

              {[
                { label: "お名前 *", key: "name", placeholder: "山田 太郎", required: true },
                { label: "メールアドレス *", key: "email", placeholder: "taro@example.com", required: true, type: "email" },
                { label: "会社名", key: "company", placeholder: "株式会社〇〇", required: false },
              ].map(({ label, key, placeholder, required, type }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#3a3a3c", marginBottom: 6 }}>{label}</label>
                  <input
                    type={type ?? "text"}
                    required={required}
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#3a3a3c", marginBottom: 6 }}>ご用件・メモ（任意）</label>
                <textarea
                  rows={3}
                  placeholder="事前にお伝えしたいことがあればご記入ください"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%", padding: 14, borderRadius: 12,
                  background: submitting ? "#999" : "#0066CC",
                  color: "#fff", border: "none", fontSize: 16, fontWeight: 600, cursor: submitting ? "default" : "pointer"
                }}
              >
                {submitting ? "予約中..." : "予約を確定する"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Copy text modal */}
      {showCopyModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24
        }} onClick={() => setShowCopyModal(false)}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 560, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>候補日テキスト</h3>
              <button onClick={() => setShowCopyModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6e6e73", fontSize: 20 }}>×</button>
            </div>
            <textarea
              readOnly
              value={copyText}
              rows={12}
              style={{ background: "#f5f5f7", borderRadius: 10, border: "none", padding: 14, fontSize: 14, lineHeight: 1.7, color: "#1d1d1f", resize: "none" }}
            />
            <button
              onClick={doCopy}
              style={{
                marginTop: 14, width: "100%", padding: 13, borderRadius: 12,
                background: copied ? "#34A853" : "#0066CC",
                color: "#fff", border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer"
              }}
            >
              {copied ? "コピーしました" : "コピーする"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
