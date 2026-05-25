"use client";

import { TimeSlot } from "@/lib/availability";

type Props = {
  slots: TimeSlot[]; // 選択日付分のスロットのみ
  selectedDate: string | null;
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  onConfirm: () => void;
  accentColor?: string;
};

function fmt(iso: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function dateLabel(dateStr: string | null) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long", day: "numeric", weekday: "short",
  }).format(date);
}

export default function TimeSlotPicker({
  slots,
  selectedDate,
  selectedSlot,
  onSelectSlot,
  onConfirm,
  accentColor = "#0066CC",
}: Props) {

  // 午前 / 午後 / 夜 で分ける
  const groups: { label: string; slots: TimeSlot[] }[] = [
    { label: "午前", slots: [] },
    { label: "午後", slots: [] },
    { label: "夜", slots: [] },
  ];

  // JST時刻（UTC+9）で「午前/午後/夜」を判定
  for (const s of slots) {
    const dt = new Date(s.start);
    const jstHour = (dt.getUTCHours() + 9) % 24;
    if (jstHour < 12) groups[0].slots.push(s);
    else if (jstHour < 18) groups[1].slots.push(s);
    else groups[2].slots.push(s);
  }

  const visibleGroups = groups.filter((g) => g.slots.length > 0);

  if (!selectedDate) {
    return (
      <div style={{
        background: "#fff", borderRadius: 16, padding: 32,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        textAlign: "center", color: "#5e5e63", fontSize: 14,
        minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        左のカレンダーから日付を選択してください
      </div>
    );
  }

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: 24,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", marginBottom: 4 }}>
        {dateLabel(selectedDate)}
      </div>
      <div style={{ fontSize: 12, color: "#5e5e63", marginBottom: 18 }}>
        以下から開始時刻をお選びください
      </div>

      {visibleGroups.length === 0 && (
        <div style={{ color: "#5e5e63", fontSize: 14, textAlign: "center", padding: 24 }}>
          この日に空きスロットはありません
        </div>
      )}

      {visibleGroups.map((g) => (
        <div key={g.label} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: "#5e5e63",
            letterSpacing: "0.08em", textTransform: "uppercase",
            marginBottom: 8,
          }}>
            {g.label}
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: 8,
          }}>
            {g.slots.map((slot) => {
              const isSelected = selectedSlot?.start === slot.start;
              return (
                <button
                  key={slot.start}
                  onClick={() => onSelectSlot(slot)}
                  style={{
                    padding: "10px 0",
                    borderRadius: 10,
                    border: `1.5px solid ${isSelected ? accentColor : "#e0e0e5"}`,
                    background: isSelected ? accentColor : "#fff",
                    color: isSelected ? "#fff" : "#1d1d1f",
                    fontSize: 14, fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {fmt(slot.start)}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedSlot && (
        <button
          onClick={onConfirm}
          style={{
            width: "100%",
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            background: accentColor,
            color: "#fff",
            border: "none",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          この時間で予約する  →
        </button>
      )}
    </div>
  );
}
