"use client";

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
          <div style={{
            background: "#fff",
            borderRadius: 16, padding: "22px 24px",
            marginBottom: 28,
            boxShadow: "0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 11, color: "#86868b",
                letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600,
              }}>
                {monthLabel}の稼働実態
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 10, color: "#0066CC", background: "#e8f0fe",
                padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                letterSpacing: "0.05em",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: 3,
                  background: "#0066CC",
                  animation: "fm-pulse 1.6s ease-in-out infinite",
                  display: "inline-block",
                }} />
                LIVE
                {m.updated_at && (
                  <span style={{ color: "#86868b", fontWeight: 500, marginLeft: 4 }}>
                    {relativeTime(m.updated_at)}
                  </span>
                )}
              </div>
              <style>{`@keyframes fm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
              gap: 18,
            }}>
              {[
                { label: "総稼働", value: m.total_hours ? `${Math.round(m.total_hours)}h` : "-" },
                { label: "商談", value: m.meeting_count != null ? `${m.meeting_count}件` : "-" },
                { label: "出張先", value: m.travel_destinations?.length ? `${m.travel_destinations.length}都市` : "-" },
                { label: "Claude", value: m.claude_prompts != null ? `${(m.claude_prompts/1000).toFixed(1)}k` : "-" },
                { label: "深夜稼働", value: m.late_night_count != null ? `${m.late_night_count}回` : "-" },
                { label: "週末予定", value: m.weekend_count != null ? `${m.weekend_count}件` : "-" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{
                    fontSize: 22, fontWeight: 700, color: "#0066CC",
                    letterSpacing: "-0.02em",
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11, color: "#86868b", marginTop: 3, fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {m.travel_destinations && m.travel_destinations.length > 0 && (
              <div style={{
                marginTop: 18, paddingTop: 14,
                borderTop: "1px solid #f0f0f5",
                fontSize: 12, color: "#6e6e73", lineHeight: 1.6,
              }}>
                <span style={{ color: "#86868b", fontWeight: 600, letterSpacing: "0.05em", marginRight: 8 }}>
                  出張先
                </span>
                {m.travel_destinations.join(" / ")}
              </div>
            )}
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
