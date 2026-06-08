export default function Loading() {
  return (
    <main
      role="main"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f7",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          aria-hidden
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            border: "3px solid #e0e0e5",
            borderTopColor: "#0066CC",
            margin: "0 auto 14px",
            animation: "fm-spin 0.9s linear infinite",
          }}
        />
        <div style={{ fontSize: 13, color: "#4b5563", fontWeight: 500 }}>
          読み込み中...
        </div>
      </div>
      <style>{`
        @keyframes fm-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
