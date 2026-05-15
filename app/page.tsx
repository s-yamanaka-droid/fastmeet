import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#f5f5f7" }}>
      <div className="card max-w-md w-full p-10 text-center" style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: "#0066CC",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 24
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: "#1d1d1f" }}>CalBook</h1>
        <p style={{ color: "#6e6e73", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          Googleカレンダーと連携して<br />
          リアルタイムに空き日程を共有
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {[
            { icon: "🔗", text: "URLを送るだけで先方が日程選択" },
            { icon: "📋", text: "候補日テキストをワンクリックでコピー" },
            { icon: "📅", text: "確定即Googleカレンダーに反映" },
          ].map((item) => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", fontSize: 14, color: "#3a3a3c" }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <form action={async () => {
          "use server";
          await signIn("google");
        }}>
          <button type="submit" style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "12px 24px",
            background: "#fff",
            border: "1.5px solid #e0e0e5",
            borderRadius: 12,
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            color: "#1d1d1f",
            transition: "background 0.15s",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Googleでログイン
          </button>
        </form>
      </div>
    </main>
  );
}
