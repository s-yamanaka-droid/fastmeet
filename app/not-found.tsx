import Link from "next/link";

export default function NotFound() {
  return (
    <main
      role="main"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f7",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 48,
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#0066CC",
            letterSpacing: "-0.04em",
            marginBottom: 12,
            lineHeight: 1,
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: "#1d1d1f" }}>
          このページは見つかりません
        </h1>
        <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
          URLが変更されたか、削除された可能性があります。
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            borderRadius: 12,
            background: "#0066CC",
            color: "#fff",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          トップページに戻る
        </Link>
      </div>
    </main>
  );
}
