"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 本番ログ用（Sentryなど入れる時はここに送る）
    if (typeof window !== "undefined") {
      console.error("FASTMeet error:", error);
    }
  }, [error]);

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
            width: 64,
            height: 64,
            borderRadius: 32,
            background: "#fff1f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d93025" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: "#1d1d1f" }}>
          一時的なエラーが発生しました
        </h1>
        <p style={{ color: "#4b5563", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
          ご迷惑をおかけしております。<br />
          時間をおいて再度お試しください。
        </p>
        {error.digest && (
          <div style={{ fontSize: 11, color: "#6b6b70", marginBottom: 20, fontFamily: "ui-monospace, monospace" }}>
            エラーID: {error.digest}
          </div>
        )}
        <button
          onClick={reset}
          style={{
            width: "100%",
            padding: 13,
            borderRadius: 12,
            background: "#0066CC",
            color: "#fff",
            border: "none",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          もう一度読み込む
        </button>
        <Link
          href="/"
          style={{
            display: "block",
            fontSize: 13,
            color: "#4b5563",
            textDecoration: "underline",
            marginTop: 8,
          }}
        >
          トップページに戻る
        </Link>
      </div>
    </main>
  );
}
