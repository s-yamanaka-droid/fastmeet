"use client";

import { useEffect, useState, useRef } from "react";

type Metrics = {
  month?: string;
  claude_hours?: number;
  claude_prompts?: number;
  meeting_count?: number;
  meeting_hours?: number;
  internal_count?: number;
  internal_hours?: number;
  task_count?: number;
  task_hours?: number;
  travel_count?: number;
  travel_hours?: number;
  travel_destinations?: string[];
  late_night_count?: number;
  weekend_count?: number;
  active_days?: number;
  total_hours?: number;
  updated_at?: string;
};

function CountUp({
  end,
  duration = 1100,
  decimals = 0,
  suffix = "",
  prefix = "",
}: {
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef(end);

  useEffect(() => {
    targetRef.current = end;
    startRef.current = null;
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * targetRef.current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration]);

  const display = decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString();

  return <>{prefix}{display}{suffix}</>;
}

function relativeTime(iso?: string): string {
  if (!iso) return "";
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((now - t) / 1000));
  if (diffSec < 60) return `${diffSec}秒前`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}日前`;
}

function daysInMonth(monthStr?: string): number {
  if (!monthStr) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

function daysElapsed(monthStr?: string): number {
  const now = new Date();
  if (!monthStr) return now.getDate();
  const [y, m] = monthStr.split("-").map(Number);
  if (y === now.getFullYear() && m === now.getMonth() + 1) return now.getDate();
  return daysInMonth(monthStr);
}

export default function MetricsRich({ metrics }: { metrics: Record<string, unknown> | null }) {
  if (!metrics) return null;
  const m = metrics as Metrics;

  const monthLabel = m.month ? `${m.month.split("-")[0]}年${parseInt(m.month.split("-")[1])}月` : "今月";
  const elapsed = daysElapsed(m.month);
  const inMonth = daysInMonth(m.month);

  const totalH = m.total_hours ?? 0;
  const standardWork = 160; // 標準月160h
  const totalPct = Math.min((totalH / standardWork) * 100, 999);

  const claudeH = m.claude_hours ?? 0;
  const claudePrompts = m.claude_prompts ?? 0;
  const claudeDays = m.active_days ?? 0;
  const promptsPerDay = claudeDays > 0 ? Math.round(claudePrompts / claudeDays) : 0;

  const meetingCount = m.meeting_count ?? 0;
  const meetingPerDay = elapsed > 0 ? (meetingCount / elapsed).toFixed(1) : "0";

  const travelCount = m.travel_count ?? 0;
  const dests = m.travel_destinations ?? [];

  const lateNight = m.late_night_count ?? 0;
  const weekend = m.weekend_count ?? 0;
  const lateNightPerDay = elapsed > 0 ? (lateNight / elapsed).toFixed(1) : "0";

  // sleep estimate
  const totalHours24 = elapsed * 24;
  const lifeOverhead = elapsed * 3; // 食事・風呂・移動雑用想定3h/日
  const sleepHours = Math.max(0, totalHours24 - totalH - lifeOverhead);
  const avgSleep = elapsed > 0 ? sleepHours / elapsed : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{
          fontSize: 11, color: "#86868b", fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          {monthLabel}の稼働実態
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 10, color: "#0066CC", background: "#e8f0fe",
          padding: "4px 12px", borderRadius: 20, fontWeight: 700,
          letterSpacing: "0.05em",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 3, background: "#0066CC",
            animation: "fm-pulse 1.6s ease-in-out infinite",
            display: "inline-block",
          }} />
          LIVE
          {m.updated_at && (
            <span style={{ color: "#86868b", fontWeight: 500, marginLeft: 2 }}>
              {relativeTime(m.updated_at)}
            </span>
          )}
        </div>
      </div>

      {/* Hero metric */}
      <div style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f0f6ff 100%)",
        borderRadius: 18,
        padding: "28px 28px 24px",
        marginBottom: 14,
        boxShadow: "0 4px 20px rgba(0,102,204,0.08), 0 0 0 1px rgba(0,0,0,0.03)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(0,102,204,0.10) 0%, transparent 70%)",
        }} />

        <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", position: "relative" }}>
          <div>
            <div style={{ fontSize: 11, color: "#86868b", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              総稼働時間
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{
                fontSize: 64, fontWeight: 800, color: "#0066CC",
                letterSpacing: "-0.04em", lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}>
                <CountUp end={totalH} decimals={0} />
              </span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#0066CC", marginLeft: 2 }}>h</span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#86868b", marginBottom: 6 }}>
              <span>標準勤務 160h との比較</span>
              <span style={{ color: "#0066CC", fontWeight: 700 }}>
                <CountUp end={totalPct} decimals={0} suffix="%" />
              </span>
            </div>
            <div style={{ height: 10, background: "#e8f0fe", borderRadius: 5, overflow: "hidden", position: "relative" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${Math.min(totalPct, 100)}%`,
                background: "linear-gradient(90deg, #0066CC 0%, #00b4d8 100%)",
                borderRadius: 5, transition: "width 1.2s ease-out",
              }} />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "#3a3a3c", lineHeight: 1.6 }}>
              月の{Math.round((elapsed / inMonth) * 100)}%経過時点
              （{elapsed} / {inMonth}日）で <strong style={{ color: "#0066CC" }}>{Math.round(totalPct)}%</strong> 完了
            </div>
          </div>
        </div>
      </div>

      {/* Grid of rich cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
        marginBottom: 18,
      }}>
        {/* Claude card */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "18px 20px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          borderTop: "3px solid #FF6B35",
          position: "relative",
        }}>
          <div style={{ fontSize: 10, color: "#86868b", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            Claude Code
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#1d1d1f", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4 }}>
            <CountUp end={claudePrompts} />
          </div>
          <div style={{ fontSize: 11, color: "#86868b", fontWeight: 500, marginBottom: 12 }}>
            prompts / month
          </div>
          <div style={{ fontSize: 11, color: "#3a3a3c", lineHeight: 1.7 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86868b" }}>稼働時間</span>
              <span style={{ fontWeight: 600 }}>{claudeH.toFixed(1)}h</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86868b" }}>稼働日数</span>
              <span style={{ fontWeight: 600 }}>{claudeDays}日</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86868b" }}>日平均</span>
              <span style={{ fontWeight: 600, color: "#FF6B35" }}>{promptsPerDay.toLocaleString()} p/日</span>
            </div>
          </div>
        </div>

        {/* Meeting card */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "18px 20px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          borderTop: "3px solid #34A853",
        }}>
          <div style={{ fontSize: 10, color: "#86868b", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            商談・社外打合せ
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#1d1d1f", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4 }}>
            <CountUp end={meetingCount} suffix="件" />
          </div>
          <div style={{ fontSize: 11, color: "#86868b", fontWeight: 500, marginBottom: 12 }}>
            外部MTG
          </div>
          <div style={{ fontSize: 11, color: "#3a3a3c", lineHeight: 1.7 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86868b" }}>社内MTG</span>
              <span style={{ fontWeight: 600 }}>{m.internal_count ?? 0}件</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86868b" }}>タスク枠</span>
              <span style={{ fontWeight: 600 }}>{m.task_count ?? 0}件</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86868b" }}>日平均</span>
              <span style={{ fontWeight: 600, color: "#34A853" }}>{meetingPerDay} 件/日</span>
            </div>
          </div>
        </div>

        {/* Travel card */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "18px 20px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          borderTop: "3px solid #9334EA",
        }}>
          <div style={{ fontSize: 10, color: "#86868b", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            出張・移動
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#1d1d1f", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4 }}>
            <CountUp end={dests.length} suffix="都市" />
          </div>
          <div style={{ fontSize: 11, color: "#86868b", fontWeight: 500, marginBottom: 12 }}>
            出張先
          </div>
          {dests.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {dests.map((d) => (
                <span key={d} style={{
                  fontSize: 10, fontWeight: 600,
                  padding: "2px 8px", borderRadius: 10,
                  background: "#f3eaff", color: "#7c2bd9",
                }}>
                  {d}
                </span>
              ))}
            </div>
          ) : null}
          <div style={{ fontSize: 11, color: "#3a3a3c", lineHeight: 1.7 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86868b" }}>移動回数</span>
              <span style={{ fontWeight: 600 }}>{travelCount}件</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86868b" }}>移動時間</span>
              <span style={{ fontWeight: 600 }}>{(m.travel_hours ?? 0).toFixed(1)}h</span>
            </div>
          </div>
        </div>

        {/* Sleep / Late night card */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "18px 20px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          borderTop: "3px solid #EF4444",
        }}>
          <div style={{ fontSize: 10, color: "#86868b", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            深夜・週末稼働
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#1d1d1f", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 4 }}>
            <CountUp end={lateNight} suffix="件" />
          </div>
          <div style={{ fontSize: 11, color: "#86868b", fontWeight: 500, marginBottom: 12 }}>
            22時以降の予定
          </div>
          <div style={{ fontSize: 11, color: "#3a3a3c", lineHeight: 1.7 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86868b" }}>週末予定</span>
              <span style={{ fontWeight: 600 }}>{weekend}件</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86868b" }}>推定睡眠</span>
              <span style={{ fontWeight: 600, color: "#EF4444" }}>{avgSleep.toFixed(1)}h / 日</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#86868b" }}>深夜頻度</span>
              <span style={{ fontWeight: 600 }}>{lateNightPerDay} 回/日</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footnote */}
      <div style={{
        fontSize: 11, color: "#86868b", lineHeight: 1.6,
        padding: "10px 14px", background: "rgba(0,102,204,0.04)",
        borderRadius: 10, border: "1px solid rgba(0,102,204,0.08)",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
        flexWrap: "wrap",
      }}>
        <span>
          Google Calendar・Claude Code 稼働ログから 15分おきに自動更新
        </span>
        <span style={{ color: "#0066CC", fontWeight: 600 }}>
          月{Math.round(inMonth > 0 ? (totalH / elapsed * inMonth) : 0)}h ペース
        </span>
      </div>

      <style>{`@keyframes fm-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.85); } }`}</style>
    </div>
  );
}
