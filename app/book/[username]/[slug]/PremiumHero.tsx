"use client";

import MetricsRich from "./MetricsRich";

type Profile = {
  displayName?: string;
  displayNameEn?: string;
  titles?: string[];
  tagline?: string;
  subTagline?: string;
  philosophy?: string[];
  avatarUrl?: string | null;
};

type Metrics = {
  month?: string;
  claude_hours?: number;
  claude_prompts?: number;
  meeting_count?: number;
  meeting_hours?: number;
  task_count?: number;
  travel_count?: number;
  travel_destinations?: string[];
  late_night_count?: number;
  weekend_count?: number;
  active_days?: number;
  total_hours?: number;
  updated_at?: string;
};

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

export default function PremiumHero({
  profile,
  metrics,
}: {
  profile: Record<string, unknown>;
  metrics: Record<string, unknown> | null;
}) {
  const p = profile as Profile;
  const m = (metrics ?? {}) as Metrics;

  const monthLabel = m.month ? `${m.month.split("-")[0]}年${parseInt(m.month.split("-")[1])}月` : "今月";

  return (
    <section style={{
      background: "linear-gradient(180deg, #f0f6ff 0%, #f5f5f7 100%)",
      padding: "48px 24px 48px",
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Name + Titles */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 32,
            background: "linear-gradient(135deg, #0066CC 0%, #00b4d8 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 700, flexShrink: 0,
            color: "#fff",
            boxShadow: "0 6px 20px rgba(0,102,204,0.25)",
          }}>
            {p.displayName?.slice(0, 1) ?? "Y"}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.01em" }}>
              {p.displayName ?? "Premium Host"}
            </div>
            {p.displayNameEn && (
              <div style={{ fontSize: 12, color: "#86868b", marginTop: 2, letterSpacing: "0.05em" }}>
                {p.displayNameEn}
              </div>
            )}
            {p.titles && p.titles.length > 0 && (
              <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 6, lineHeight: 1.6 }}>
                {p.titles.join("  /  ")}
              </div>
            )}
          </div>
        </div>

        {/* Tagline */}
        {p.tagline && (
          <div style={{
            fontSize: 30, fontWeight: 700, lineHeight: 1.35,
            letterSpacing: "-0.025em",
            marginBottom: 10,
            color: "#1d1d1f",
          }}>
            {p.tagline}
          </div>
        )}

        {/* SubTagline */}
        {p.subTagline && (
          <div style={{
            fontSize: 15, color: "#6e6e73",
            marginBottom: 32, lineHeight: 1.6,
          }}>
            {p.subTagline}
          </div>
        )}

        {/* Metrics Card */}
        {metrics && (
          <div style={{ marginBottom: 28 }}>
            <MetricsRich metrics={metrics} />
          </div>
        )}

        {/* Philosophy */}
        {p.philosophy && p.philosophy.length > 0 && (
          <div>
            <div style={{
              fontSize: 11, color: "#86868b", marginBottom: 12,
              letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600,
            }}>
              Why I move fast
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {p.philosophy.map((line, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12,
                  fontSize: 14, color: "#3a3a3c", lineHeight: 1.7,
                }}>
                  <span style={{ color: "#0066CC", flexShrink: 0, fontWeight: 700 }}>—</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
