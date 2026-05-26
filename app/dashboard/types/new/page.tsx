"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const COLORS = ["#0066CC", "#34A853", "#FBBC05", "#EA4335", "#9334EA", "#0AB5DB"];
const DURATIONS = [15, 30, 45, 60, 90];
const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function NewMeetingType() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    duration_minutes: 30,
    description: "",
    color: "#0066CC",
    buffer_before_minutes: 0,
    buffer_after_minutes: 15,
    advance_notice_hours: 2,
    max_days_ahead: 14,
    working_hours_start: "09:00",
    working_hours_end: "18:00",
    working_days: [1, 2, 3, 4, 5],
    conferencing_type: "google_meet" as "google_meet" | "zoom" | "in_person" | "custom_url" | "none",
    calendar_prefix: "【外M】",
    custom_url: "",
    location_text: "",
  });

  function toggleDay(day: number) {
    setForm((f) => ({
      ...f,
      working_days: f.working_days.includes(day)
        ? f.working_days.filter((d) => d !== day)
        : [...f.working_days, day].sort(),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/meeting-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-") }),
    });
    const data = await res.json();
    if (data.meetingType) {
      router.push("/dashboard");
    } else {
      alert("エラー: " + (data.error ?? "不明"));
      setSaving(false);
    }
  }

  const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: "#3a3a3c", marginBottom: 6 };
  const fieldStyle = { marginBottom: 20 };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e0e0e5", padding: "0 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, height: 56 }}>
          <Link href="/dashboard" style={{ color: "#0066CC", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
            ← ダッシュボード
          </Link>
          <span style={{ color: "#c0c0c5" }}>/</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f" }}>ミーティング種別を作成</span>
        </div>
      </header>

      <div style={{ maxWidth: 640, margin: "32px auto", padding: "0 24px" }}>
        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>

          <div style={fieldStyle}>
            <label style={labelStyle}>ミーティング名 *</label>
            <input
              required
              placeholder="例：30分商談ミーティング"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>説明（任意）</label>
            <textarea
              rows={2}
              placeholder="ミーティングの目的や準備事項など"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>時間</label>
              <select
                value={form.duration_minutes}
                onChange={(e) => setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) }))}
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>{d}分</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>URLスラッグ</label>
              <input
                placeholder="30min（省略可）"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.replace(/[^a-z0-9-]/g, "") }))}
              />
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>カラー</label>
            <div style={{ display: "flex", gap: 10 }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  style={{
                    width: 30, height: 30, borderRadius: 15, background: c, border: "none", cursor: "pointer",
                    outline: form.color === c ? `3px solid ${c}` : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e0e0e5", margin: "20px 0" }} />

          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f", marginBottom: 16 }}>ミーティング場所</h3>

          <div style={fieldStyle}>
            <label style={labelStyle}>会議ツール</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
              {[
                { value: "google_meet", label: "Google Meet", hint: "自動生成" },
                { value: "zoom", label: "Zoom", hint: "自動生成" },
                { value: "custom_url", label: "URLを指定", hint: "Teams等" },
                { value: "in_person", label: "対面", hint: "場所を指定" },
                { value: "none", label: "なし", hint: "電話など" },
              ].map((t) => {
                const selected = form.conferencing_type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, conferencing_type: t.value as typeof f.conferencing_type }))}
                    style={{
                      padding: "10px 8px", borderRadius: 10,
                      border: "1.5px solid",
                      borderColor: selected ? "#0066CC" : "#e0e0e5",
                      background: selected ? "#e8f0fe" : "#fff",
                      color: selected ? "#0066CC" : "#3a3a3c",
                      cursor: "pointer", textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: selected ? "#0066CC" : "#4b5563", marginTop: 2 }}>{t.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {form.conferencing_type === "custom_url" && (
            <div style={fieldStyle}>
              <label style={labelStyle}>ミーティングURL</label>
              <input
                type="url"
                placeholder="https://teams.microsoft.com/..."
                value={form.custom_url}
                onChange={(e) => setForm((f) => ({ ...f, custom_url: e.target.value }))}
              />
            </div>
          )}

          {form.conferencing_type === "in_person" && (
            <div style={fieldStyle}>
              <label style={labelStyle}>場所</label>
              <input
                type="text"
                placeholder="例：弊社オフィス（東京都渋谷区...）"
                value={form.location_text}
                onChange={(e) => setForm((f) => ({ ...f, location_text: e.target.value }))}
              />
            </div>
          )}

          {form.conferencing_type === "zoom" && (
            <div style={{ background: "#fff8e1", border: "1px solid #f9d471", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#8b6914", marginBottom: 20, lineHeight: 1.6 }}>
              Zoomを使うには事前にダッシュボードの「Zoom連携」設定が必要です。未設定の場合、予約は確定しますが Zoomリンクは生成されません（カレンダー登録のみ）。
            </div>
          )}

          <hr style={{ border: "none", borderTop: "1px solid #e0e0e5", margin: "20px 0" }} />

          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f", marginBottom: 16 }}>カレンダー登録設定</h3>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              Calendar イベント・タイトル プレフィックス
              <span style={{ fontWeight: 400, color: "#5e5e63", fontSize: 11, marginLeft: 8 }}>
                予約成立時の Google Calendar イベントに自動付与
              </span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
              {[
                { value: "【外M】", label: "【外M】", hint: "外部商談" },
                { value: "社外：", label: "社外：", hint: "軽め打合せ" },
                { value: "社内：", label: "社内：", hint: "社内MTG" },
                { value: "#社内定例：", label: "#社内定例：", hint: "定例" },
                { value: "タスク：", label: "タスク：", hint: "個人作業" },
                { value: "その他：", label: "その他：", hint: "その他" },
              ].map((p) => {
                const selected = form.calendar_prefix === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, calendar_prefix: p.value }))}
                    style={{
                      padding: "10px 8px", borderRadius: 10,
                      border: "1.5px solid",
                      borderColor: selected ? "#0066CC" : "#e0e0e5",
                      background: selected ? "#e8f0fe" : "#fff",
                      color: selected ? "#0066CC" : "#3a3a3c",
                      cursor: "pointer", textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: selected ? "#0066CC" : "#5e5e63", marginTop: 2 }}>{p.hint}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "#5e5e63", lineHeight: 1.6 }}>
              例：「{form.calendar_prefix}{form.calendar_prefix?.startsWith("【") ? "" : ""}山田太郎／株式会社○○ - {form.name || "30分商談ミーティング"}」
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e0e0e5", margin: "20px 0" }} />

          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f", marginBottom: 16 }}>空き時間の設定</h3>

          <div style={fieldStyle}>
            <label style={labelStyle}>営業日</label>
            <div style={{ display: "flex", gap: 8 }}>
              {DAYS.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: form.working_days.includes(i) ? "#0066CC" : "#f0f0f5",
                    color: form.working_days.includes(i) ? "#fff" : "#3a3a3c",
                    border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>営業開始</label>
              <input type="time" value={form.working_hours_start} onChange={(e) => setForm((f) => ({ ...f, working_hours_start: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>営業終了</label>
              <input type="time" value={form.working_hours_end} onChange={(e) => setForm((f) => ({ ...f, working_hours_end: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
            <div>
              <label style={labelStyle}>前バッファ（分）</label>
              <input type="number" min={0} max={60} step={5} value={form.buffer_before_minutes} onChange={(e) => setForm((f) => ({ ...f, buffer_before_minutes: Number(e.target.value) }))} />
            </div>
            <div>
              <label style={labelStyle}>後バッファ（分）</label>
              <input type="number" min={0} max={60} step={5} value={form.buffer_after_minutes} onChange={(e) => setForm((f) => ({ ...f, buffer_after_minutes: Number(e.target.value) }))} />
            </div>
            <div>
              <label style={labelStyle}>最短予告（時間）</label>
              <input type="number" min={0} max={72} value={form.advance_notice_hours} onChange={(e) => setForm((f) => ({ ...f, advance_notice_hours: Number(e.target.value) }))} />
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>表示期間（日先まで）</label>
            <input type="number" min={3} max={60} value={form.max_days_ahead} onChange={(e) => setForm((f) => ({ ...f, max_days_ahead: Number(e.target.value) }))} style={{ maxWidth: 120 }} />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%", padding: "13px", borderRadius: 12, background: saving ? "#999" : "#0066CC",
              color: "#fff", border: "none", fontSize: 16, fontWeight: 600, cursor: saving ? "default" : "pointer"
            }}
          >
            {saving ? "作成中..." : "作成する"}
          </button>
        </form>
      </div>
    </div>
  );
}
