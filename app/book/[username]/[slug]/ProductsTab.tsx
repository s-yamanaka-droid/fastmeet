"use client";

type Product = {
  name: string;
  url: string;
  category?: string;
  tagline?: string;
  description?: string;
  color?: string;
  public?: boolean;
};

type CorporateLink = {
  name: string;
  url: string;
  description?: string;
};

type Props = {
  products?: Product[];
  corporateLinks?: CorporateLink[];
};

export default function ProductsTab({ products = [], corporateLinks = [] }: Props) {
  return (
    <div>
      {/* Corporate links bar */}
      {corporateLinks.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 11, color: "#5e5e63", fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10,
          }}>
            関連サイト
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {corporateLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 14px", borderRadius: 10,
                  background: "#fff", border: "1px solid #e0e0e5",
                  color: "#1d1d1f", textDecoration: "none",
                  fontSize: 13, fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                <span>{link.name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5e5e63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{
        fontSize: 11, color: "#5e5e63", fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10,
      }}>
        プロダクト・ツール
      </div>
      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 20, lineHeight: 1.6 }}>
        現場で開発し、社外公開しているプロダクト群です。すべて触って試せます。
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 14,
      }}>
        {products.map((p) => (
          <a
            key={p.url}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              background: "#fff",
              borderRadius: 14,
              padding: 20,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.04)",
              transition: "transform 0.15s, box-shadow 0.15s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* accent strip */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: p.color ?? "#0066CC",
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: p.color ?? "#0066CC",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 14, fontWeight: 700,
                flexShrink: 0,
              }}>
                {p.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.01em" }}>
                  {p.name}
                </div>
                {p.category && (
                  <div style={{ fontSize: 11, color: "#5e5e63", marginTop: 1 }}>
                    {p.category}
                  </div>
                )}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0c0c5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </div>

            {p.tagline && (
              <div style={{ fontSize: 13, fontWeight: 600, color: p.color ?? "#0066CC", marginBottom: 6 }}>
                {p.tagline}
              </div>
            )}

            {p.description && (
              <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>
                {p.description}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
