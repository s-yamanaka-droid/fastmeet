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
};

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
      background: "linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)",
      color: "#fff",
      padding: "48px 24px 56px",
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Hero - Name + Titles */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 36,
            background: "linear-gradient(135deg, #0066CC, #00a3ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, fontWeight: 700, flexShrink: 0,
            boxShadow: "0 4px 20px rgba(0,102,204,0.4)",
          }}>
            {p.displayName?.slice(0, 1) ?? "Y"}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
              {p.displayName ?? "Premium Host"}
            </div>
            {p.displayNameEn && (
              <div style={{ fontSize: 12, color: "#8b8b9a", marginTop: 2, letterSpacing: "0.05em" }}>
                {p.displayNameEn}
              </div>
            )}
            {p.titles && p.titles.length > 0 && (
              <div style={{ fontSize: 12, color: "#a0a0b0", marginTop: 6, lineHeight: 1.6 }}>
                {p.titles.join("  /  ")}
              </div>
            )}
          </div>
        </div>

        {/* Tagline (Cの哲学型) */}
        {p.tagline && (
          <div style={{
            fontSize: 28, fontWeight: 700, lineHeight: 1.4,
            letterSpacing: "-0.02em",
            marginBottom: 8,
            background: "linear-gradient(90deg, #fff 0%, #c0d0ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            {p.tagline}
          </div>
        )}

        {/* SubTagline (Bの数字殴り型) */}
        {p.subTagline && (
          <div style={{
            fontSize: 14, color: "#8b8b9a",
            marginBottom: 32, lineHeight: 1.6,
          }}>
            {p.subTagline}
          </div>
        )}

        {/* Metrics Grid */}
        {metrics && (
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: "20px 24px",
            marginBottom: 28,
          }}>
            <div style={{
              fontSize: 11, color: "#6e6e80", marginBottom: 14,
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              {monthLabel}の稼働実態
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
              gap: 16,
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
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11, color: "#8b8b9a", marginTop: 2 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            {m.travel_destinations && m.travel_destinations.length > 0 && (
              <div style={{
                marginTop: 16, paddingTop: 14,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                fontSize: 12, color: "#a0a0b0",
              }}>
                出張: {m.travel_destinations.join(" / ")}
              </div>
            )}
          </div>
        )}

        {/* Philosophy */}
        {p.philosophy && p.philosophy.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{
              fontSize: 11, color: "#6e6e80", marginBottom: 12,
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Why I move fast
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {p.philosophy.map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#c0c0d0", lineHeight: 1.7 }}>
                  <span style={{ color: "#0066CC", flexShrink: 0 }}>—</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subtle CTA hint */}
        <div style={{
          marginTop: 36, fontSize: 12, color: "#8b8b9a",
          textAlign: "center", letterSpacing: "0.05em",
        }}>
          ↓ この時間枠を、あなたの30分のために空けています ↓
        </div>
      </div>
    </section>
  );
}
