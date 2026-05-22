"use client";

type SkillGroup = {
  category: string;
  items: string[];
};

type Props = {
  skills?: SkillGroup[];
};

const CATEGORY_COLORS: Record<string, string> = {
  "AI & 自動化": "#0066CC",
  "プロダクト開発": "#34A853",
  "デザイン": "#9334EA",
  "経営 / 戦略": "#FF6B35",
  "営業 / 商談": "#1A73E8",
};

export default function SkillsTab({ skills = [] }: Props) {
  return (
    <div>
      <div style={{
        fontSize: 11, color: "#86868b", fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10,
      }}>
        専門領域
      </div>
      <div style={{ fontSize: 13, color: "#6e6e73", marginBottom: 24, lineHeight: 1.6 }}>
        実務で日常的に手を動かしている領域。商談時に「何ができる人か」を即把握いただけます。
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        {skills.map((group) => {
          const color = CATEGORY_COLORS[group.category] ?? "#0066CC";
          return (
            <div
              key={group.category}
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "18px 22px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div style={{
                fontSize: 13, fontWeight: 700, color: "#1d1d1f",
                marginBottom: 12, letterSpacing: "-0.005em",
              }}>
                {group.category}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {group.items.map((item) => (
                  <span
                    key={item}
                    style={{
                      display: "inline-block",
                      padding: "5px 12px",
                      borderRadius: 20,
                      background: `${color}12`,
                      color,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
