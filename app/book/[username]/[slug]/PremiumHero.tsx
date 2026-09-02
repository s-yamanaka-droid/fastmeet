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

type NewsItem = { rank: number; title: string; url: string; image?: string };

export default function PremiumHero({
  profile,
  metrics,
  news,
}: {
  profile: Record<string, unknown>;
  metrics: Record<string, unknown> | null;
  news?: { date: string; items: NewsItem[] };
}) {
  const p = profile as Profile;
  const m = (metrics ?? {}) as Metrics;

  const monthLabel = m.month ? `${m.month.split("-")[0]}年${parseInt(m.month.split("-")[1])}月` : "今月";

  return (
    <section style={{
      position: "relative",
      background: "#ffffff",
      padding: "64px 24px 56px",
      overflow: "hidden",
    }}>
      {/* メッシュグラデ背景（複数のラジアルを重ねて空気感） */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 50% at 15% 20%, rgba(0,102,204,0.10) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 85% 0%, rgba(0,180,216,0.10) 0%, transparent 65%),
          radial-gradient(ellipse 70% 60% at 50% 100%, rgba(155,89,255,0.06) 0%, transparent 70%),
          linear-gradient(180deg, #fafcff 0%, #ffffff 100%)
        `,
        pointerEvents: "none",
      }} />
      {/* グリッドノイズ */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,102,204,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,102,204,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 880, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Name + Avatar + Titles */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16, marginBottom: 32,
          animation: "fm-fade-in 0.7s ease-out",
        }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              position: "relative",
              width: 56, height: 56, borderRadius: 28,
              background: "linear-gradient(135deg, #0066CC 0%, #00b4d8 70%, #6b5bff 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700, color: "#fff",
              letterSpacing: "-0.03em",
              boxShadow: "0 4px 12px -4px rgba(0,102,204,0.35)",
              border: "2px solid #fff",
            }}>
              {p.displayName?.slice(0, 1) ?? "Y"}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 18, fontWeight: 700, color: "#0f0f1a",
              letterSpacing: "-0.015em", lineHeight: 1.3,
            }}>
              {p.displayName ?? "Premium Host"}
              {p.displayNameEn && (
                <span style={{
                  fontSize: 11, color: "#6b6b70", marginLeft: 8,
                  letterSpacing: "0.08em", fontWeight: 500,
                  textTransform: "uppercase",
                }}>
                  {p.displayNameEn}
                </span>
              )}
            </div>
            {p.titles && p.titles.length > 0 && (
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 5,
                marginTop: 8,
              }}>
                {p.titles.map((t, i) => (
                  <span key={i} style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "3px 9px",
                    background: "rgba(15,15,26,0.04)",
                    border: "1px solid rgba(15,15,26,0.08)",
                    borderRadius: 6,
                    fontSize: 10.5, fontWeight: 600, color: "#3a3a4c",
                    letterSpacing: "-0.005em",
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI News カラム — Now on AIr 連携 */}
        {news && news.items.length > 0 && (
          <div style={{
            marginBottom: 36,
            animation: "fm-fade-up 0.9s ease-out 0.1s both",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 14, flexWrap: "wrap", gap: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: 3, background: "#FF6B35",
                  animation: "fm-pulse 1.6s ease-in-out infinite",
                  display: "inline-block",
                }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#FF6B35",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                }}>
                  Today&apos;s AI News
                </span>
                <span style={{ fontSize: 11, color: "#6b6b70", fontWeight: 500 }}>
                  {news.date}
                </span>
              </div>
              <a href="https://s-yamanaka-droid.github.io/nowonair/"
                 target="_blank" rel="noopener noreferrer"
                 style={{
                   fontSize: 11, color: "#5e5e63", textDecoration: "none",
                   display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600,
                 }}>
                Now on AIr で全件 →
              </a>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
            }}>
              {news.items.map((n) => (
                <a key={n.rank}
                   href={n.url}
                   target="_blank" rel="noopener noreferrer"
                   style={{
                     display: "flex", flexDirection: "column",
                     padding: "14px 16px",
                     background: "rgba(255,255,255,0.7)",
                     border: "1px solid rgba(15,15,26,0.08)",
                     borderRadius: 12,
                     textDecoration: "none", color: "#1d1d1f",
                     transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
                     backdropFilter: "blur(8px)",
                     gap: 6,
                   }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: "linear-gradient(135deg, #FF6B35 0%, #FF8C00 100%)",
                      color: "#fff", fontSize: 11, fontWeight: 800,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {n.rank}
                    </span>
                    <span style={{ fontSize: 10, color: "#6b6b70", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      TOPIC
                    </span>
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: "#1d1d1f",
                    lineHeight: 1.55, letterSpacing: "-0.005em",
                    display: "-webkit-box", WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                  }}>
                    {n.title}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 装飾ディバイダ */}
        <div aria-hidden style={{
          height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(0,102,204,0.2) 30%, rgba(107,91,255,0.2) 70%, transparent 100%)",
          marginBottom: 32,
        }} />

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
              fontSize: 11, color: "#5e5e63", marginBottom: 12,
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

      <style>{`
        @keyframes fm-fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fm-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
