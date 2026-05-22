"use client";

import { useEffect, useState } from "react";
import { formatSlotForCopy, TimeSlot } from "@/lib/availability";
import type { MeetingType } from "@/lib/supabase";
import PremiumHero from "./PremiumHero";
import MonthCalendar from "./MonthCalendar";
import TimeSlotPicker from "./TimeSlotPicker";
import ProductsTab from "./ProductsTab";
import SkillsTab from "./SkillsTab";

type BookingStep = "slots" | "form" | "done";
type ActiveTab = "booking" | "products" | "skills";

type Props = {
  username: string;
  slug: string;
  initialData: {
    isPremium: boolean;
    profile: Record<string, unknown>;
    metrics: Record<string, unknown> | null;
    allTypes: MeetingType[];
    meetingType: MeetingType | null;
    slots: TimeSlot[];
  };
};

export default function BookingClient({ username, slug, initialData }: Props) {
  const [meetingType, setMeetingType] = useState<MeetingType | null>(initialData.meetingType);
  const [slots, setSlots] = useState<TimeSlot[]>(initialData.slots);
  const [switchingType, setSwitchingType] = useState(false);

  // 種別を切り替える（URL変えずに state + 新スロット取得）
  async function switchMeetingType(t: MeetingType) {
    if (t.id === meetingType?.id) return;
    setSwitchingType(true);
    setMeetingType(t);
    setSelectedSlot(null);
    setSelectedDate(null);
    try {
      const res = await fetch(`/api/availability?typeId=${t.id}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    }
    setSwitchingType(false);
  }
  void slug; void username; // URL変更しないため slug/username 使わない
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [step, setStep] = useState<BookingStep>("slots");
  const loading = false;
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyText, setCopyText] = useState("");
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", notes: "" });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ meetingUrl: string | null; cancelToken: string } | null>(null);
  const [premium] = useState<{ profile: Record<string, unknown>; metrics: Record<string, unknown> | null } | null>(
    initialData.isPremium ? { profile: initialData.profile, metrics: initialData.metrics } : null
  );
  const [guestAuth, setGuestAuth] = useState<{ email: string; name: string; picture?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("booking");
  const [allTypes] = useState<MeetingType[]>(initialData.allTypes);

  // クッキーからゲスト認証情報を読み取り、フォームに自動入力
  useEffect(() => {
    if (typeof document === "undefined") return;
    const match = document.cookie.match(/fastmeet_guest=([^;]+)/);
    if (!match) return;
    try {
      const data = JSON.parse(decodeURIComponent(match[1]));
      if (data.email) {
        setGuestAuth({ email: data.email, name: data.name ?? "", picture: data.picture });
        setForm((f) => ({ ...f, name: data.name || f.name, email: data.email || f.email }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Group slots by date — キーは "YYYY-MM-DD" (Asia/Tokyo) 形式
  const slotsByDate: Record<string, TimeSlot[]> = {};
  for (const slot of slots) {
    const d = new Date(slot.start);
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(d);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const dateKey = `${y}-${m}-${day}`;
    if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];
    slotsByDate[dateKey].push(slot);
  }

  const availableDateSet = new Set(Object.keys(slotsByDate));
  const dates = Object.keys(slotsByDate).sort();
  const currentDate = selectedDate ?? dates[0] ?? null;
  const currentSlots = currentDate ? (slotsByDate[currentDate] ?? []) : [];

  function formatDateLabel(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
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
      setConfirmed({ meetingUrl: data.booking.meeting_url, cancelToken: data.booking.cancel_token });
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
          <p style={{ color: "#6e6e73", fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
            {selectedSlot && (
              <>
                {formatTime(selectedSlot.start)}〜{formatTime(selectedSlot.end)}<br />
              </>
            )}
            確認メールをお送りしました。<br />Googleカレンダーに反映済みです。
          </p>

          {confirmed?.meetingUrl && (
            <a href={confirmed.meetingUrl} target="_blank" rel="noopener noreferrer" style={{
              display: "block", width: "100%", padding: 13, borderRadius: 12, background: "#0066CC", color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 600, marginBottom: 10, boxSizing: "border-box"
            }}>
              ミーティングに参加
            </a>
          )}

          {confirmed?.cancelToken && (
            <a href={`/cancel/${confirmed.cancelToken}`} style={{
              display: "block", fontSize: 13, color: "#6e6e73", textDecoration: "underline", marginTop: 8
            }}>
              予約をキャンセル / 変更
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>
      {/* Premium Hero (only for premium users, only during slot selection) */}
      {premium && step === "slots" && <PremiumHero profile={premium.profile} metrics={premium.metrics} />}

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
            <p style={{ fontSize: 14, color: "#6e6e73", margin: "0 0 14px" }}>{meetingType.description}</p>
          )}

          {/* Duration switcher */}
          {allTypes.length > 1 && step === "slots" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 8 }}>
              <span style={{ fontSize: 11, color: "#86868b", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", alignSelf: "center", marginRight: 6 }}>
                所要時間で切り替え
              </span>
              {allTypes.map((t) => {
                const isActive = t.id === meetingType?.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => switchMeetingType(t)}
                    disabled={switchingType || isActive}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "6px 14px", borderRadius: 20,
                      background: isActive ? t.color : "#fff",
                      color: isActive ? "#fff" : "#3a3a3c",
                      border: `1.5px solid ${isActive ? t.color : "#e0e0e5"}`,
                      fontSize: 13, fontWeight: 700,
                      textDecoration: "none",
                      transition: "all 0.15s",
                      letterSpacing: "-0.005em",
                      cursor: isActive || switchingType ? "default" : "pointer",
                      opacity: switchingType && !isActive ? 0.55 : 1,
                    }}
                  >
                    <span>{t.duration_minutes}分</span>
                    <span style={{
                      fontSize: 11, fontWeight: 500,
                      opacity: 0.85,
                    }}>
                      {t.name.replace(/^\d+分/, "").trim() || "ミーティング"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tab navigation (only for premium users, only during slot selection) */}
      {premium && step === "slots" && (
        <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e5", padding: "0 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 4 }}>
            {([
              { id: "booking" as const, label: "予約" },
              { id: "products" as const, label: "プロダクト" },
              { id: "skills" as const, label: "スキル" },
            ]).map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: "14px 18px",
                    background: "none",
                    border: "none",
                    borderBottom: `2px solid ${isActive ? "#0066CC" : "transparent"}`,
                    color: isActive ? "#0066CC" : "#6e6e73",
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    marginBottom: -1,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 24px" }}>

        {/* Non-booking tabs */}
        {step === "slots" && premium && activeTab === "products" && (
          <ProductsTab
            products={(premium.profile.products as Parameters<typeof ProductsTab>[0]["products"]) ?? []}
            corporateLinks={(premium.profile.corporateLinks as Parameters<typeof ProductsTab>[0]["corporateLinks"]) ?? []}
          />
        )}

        {step === "slots" && premium && activeTab === "skills" && (
          <SkillsTab skills={(premium.profile.skills as Parameters<typeof SkillsTab>[0]["skills"]) ?? []} />
        )}

        {step === "slots" && (!premium || activeTab === "booking") && (
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

            {slots.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 14, padding: 48, textAlign: "center", color: "#6e6e73" }}>
                現在ご案内できる空き時間がありません
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "minmax(320px, 1fr) minmax(280px, 1fr)",
                gap: 20,
              }}
              className="fm-calendar-grid"
              >
                <MonthCalendar
                  availableDates={availableDateSet}
                  selectedDate={selectedDate ?? currentDate}
                  onSelectDate={(d) => { setSelectedDate(d); setSelectedSlot(null); }}
                  accentColor={meetingType.color}
                />
                <TimeSlotPicker
                  slots={currentSlots}
                  selectedDate={selectedDate ?? currentDate}
                  selectedSlot={selectedSlot}
                  onSelectSlot={(slot) => setSelectedSlot(slot)}
                  onConfirm={() => setStep("form")}
                  accentColor={meetingType.color}
                />
              </div>
            )}
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

              {/* Google ログインで自動入力 */}
              {!guestAuth && (
                <a
                  href={`/api/guest-auth/start?redirect_to=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    padding: "12px 20px", marginBottom: 20,
                    background: "#fff", border: "1.5px solid #e0e0e5", borderRadius: 12,
                    fontSize: 14, fontWeight: 600, color: "#1d1d1f",
                    cursor: "pointer", textDecoration: "none", transition: "background 0.15s",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Googleで自動入力
                </a>
              )}

              {guestAuth && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", marginBottom: 20,
                  background: "#e8f5e9", borderRadius: 10,
                  fontSize: 13, color: "#1b5e20",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34A853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span><strong>{guestAuth.name || guestAuth.email}</strong> としてログイン中</span>
                </div>
              )}

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
