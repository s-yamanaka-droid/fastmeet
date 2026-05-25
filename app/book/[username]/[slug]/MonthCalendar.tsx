"use client";

import { useState, useMemo } from "react";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

type Props = {
  availableDates: Set<string>; // "YYYY-MM-DD" 形式
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
  accentColor?: string;
};

export default function MonthCalendar({
  availableDates,
  selectedDate,
  onSelectDate,
  accentColor = "#0066CC",
}: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const grid = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startWeekday = firstDay.getDay(); // 0=日
    const totalDays = lastDay.getDate();

    const cells: Array<{ day: number | null; dateStr: string | null }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ day: null, dateStr: null });
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, dateStr });
    }
    // 末尾を6行(42cells)になるよう埋める
    while (cells.length % 7 !== 0) cells.push({ day: null, dateStr: null });
    return cells;
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const monthLabel = `${viewYear}年 ${viewMonth + 1}月`;

  // 前月ボタンを今月より前にしない
  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          aria-label="前の月"
          style={{
            width: 36, height: 36, borderRadius: 18, border: "none",
            background: canGoPrev ? "#f0f0f5" : "transparent",
            color: canGoPrev ? "#1d1d1f" : "#d0d0d5",
            cursor: canGoPrev ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.01em" }}>
          {monthLabel}
        </div>
        <button
          onClick={nextMonth}
          aria-label="次の月"
          style={{
            width: 36, height: 36, borderRadius: 18, border: "none",
            background: "#f0f0f5", color: "#1d1d1f",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Weekday header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            style={{
              textAlign: "center", fontSize: 11, fontWeight: 600,
              color: i === 0 ? "#d93025" : i === 6 ? "#1a73e8" : "#5e5e63",
              padding: "4px 0",
            }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {grid.map((cell, i) => {
          if (!cell.day || !cell.dateStr) {
            return <div key={`empty-${i}`} style={{ aspectRatio: "1 / 1" }} />;
          }
          const isAvailable = availableDates.has(cell.dateStr);
          const isSelected = selectedDate === cell.dateStr;
          const isToday = cell.dateStr === todayStr;
          const weekday = i % 7;

          let bg = "transparent";
          let color = "#d0d0d5"; // 不可
          let cursor: "pointer" | "default" = "default";
          let border = "1.5px solid transparent";

          if (isAvailable) {
            color = weekday === 0 ? "#d93025" : weekday === 6 ? "#1a73e8" : "#1d1d1f";
            cursor = "pointer";
            bg = "#f0f6ff";
          }
          if (isSelected) {
            bg = accentColor;
            color = "#fff";
          }
          if (isToday && !isSelected) {
            border = `1.5px solid ${accentColor}`;
          }

          return (
            <button
              key={cell.dateStr}
              onClick={() => isAvailable && onSelectDate(cell.dateStr!)}
              disabled={!isAvailable}
              style={{
                aspectRatio: "1 / 1",
                borderRadius: 10,
                background: bg,
                color,
                border,
                cursor,
                fontSize: 14,
                fontWeight: isSelected ? 700 : isAvailable ? 600 : 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "background 0.15s",
              }}
            >
              {cell.day}
              {isAvailable && !isSelected && (
                <span style={{
                  position: "absolute", bottom: 4,
                  width: 4, height: 4, borderRadius: 2,
                  background: accentColor,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 11, color: "#5e5e63" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: accentColor }} />
          予約可
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#d0d0d5" }} />
          予約不可
        </div>
        <div style={{ marginLeft: "auto" }}>
          タイムゾーン: 日本標準時 (UTC+9)
        </div>
      </div>
    </div>
  );
}
