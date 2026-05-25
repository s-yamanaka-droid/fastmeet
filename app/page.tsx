import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "FASTMeet | Googleカレンダー連携の日程調整SaaS",
  description: "Googleカレンダーとリアルタイム同期。先方にURLを送るだけで日程調整が完了。商談・面接・社内MTG調整の往復メールをゼロに。",
  openGraph: {
    title: "FASTMeet | Googleカレンダー連携の日程調整SaaS",
    description: "リアルタイム空き時間共有 + 自動Google Meet/Zoom発行で、商談調整の往復メールをゼロに。",
    url: "https://fastmeet.vercel.app",
    siteName: "FASTMeet",
    images: [{ url: "https://fastmeet.vercel.app/og.png" }],
    locale: "ja_JP",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main style={{ background: "#fff", color: "#1d1d1f" }}>

      {/* Top Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)", borderBottom: "1px solid #e0e0e5",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#1d1d1f" }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #0066CC 0%, #00b4d8 100%)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>FASTMeet</span>
          </Link>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Link href="/#features" style={{ color: "#3a3a3c", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>機能</Link>
            <Link href="/#scopes" style={{ color: "#3a3a3c", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>権限</Link>
            <Link href="/privacy" style={{ color: "#3a3a3c", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>プライバシー</Link>
            <Link href="/contact" style={{ color: "#3a3a3c", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>お問い合わせ</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "80px 24px 60px", background: "linear-gradient(180deg, #f5f9ff 0%, #ffffff 100%)" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#e8f0fe", color: "#0066CC", borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: "#0066CC" }} />
            Googleカレンダー連携・無料β公開中
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: 18, color: "#1d1d1f" }}>
            日程調整の往復を、<br />ゼロに。
          </h1>
          <p style={{ fontSize: 17, color: "#6e6e73", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 36px" }}>
            FASTMeet は Googleカレンダーとリアルタイム同期し、空き時間を1つのURLで共有。
            先方が選んだ瞬間に Google Meet / Zoom のURL付きで予約成立。
            商談・面接・社内MTG調整のメール往復から解放されます。
          </p>
          <form action={async () => {
            "use server";
            await signIn("google");
          }}>
            <button type="submit" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 28px",
              background: "#1d1d1f", color: "#fff",
              border: "none", borderRadius: 12,
              fontSize: 15, fontWeight: 600, cursor: "pointer",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Googleで無料ではじめる
            </button>
          </form>
          <div style={{ marginTop: 16, fontSize: 12, color: "#86868b" }}>
            登録不要・クレジットカード不要・15秒でスタート
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "60px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, color: "#0066CC", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>FEATURES</div>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>機能</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {[
              { title: "リアルタイム空き時間", desc: "Googleカレンダーと30秒以内に同期。新規予定が入れば即座にブロック。", icon: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" },
              { title: "Meet / Zoom 自動発行", desc: "予約確定と同時にミーティングURLを生成。手動でリンクを作る手間ゼロ。", icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" },
              { title: "1日上限カット", desc: "1日◯件まで等のキャップを設定可能。過密予約を自動で防止。", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3" },
              { title: "候補日テキストコピー", desc: "URL貼り付けが難しい相手には「以下の日程はいかがでしょうか」テキストをワンクリック生成。", icon: "M9 9h13v13H9z M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" },
              { title: "30秒キャンセル", desc: "予約完了メールから「キャンセル」ボタンで即座に再調整。山中側のカレンダーからも自動削除。", icon: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" },
              { title: "実績バッジ", desc: "ホストのリアル稼働状況を表示。先方に「忙しい人の時間」を実感してもらう。", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
            ].map((f, i) => (
              <div key={i} style={{ background: "#fafafa", borderRadius: 14, padding: 22, border: "1px solid #f0f0f5" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#e8f0fe", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {f.icon.split(" M").map((d, j) => (
                      <path key={j} d={j === 0 ? d : "M" + d} />
                    ))}
                  </svg>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "#6e6e73", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scopes (OAuth justification) */}
      <section id="scopes" style={{ padding: "60px 24px", background: "#f5f9ff" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 12, color: "#0066CC", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>OAUTH SCOPES</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>FASTMeet が必要とする権限</h2>
            <p style={{ fontSize: 14, color: "#6e6e73", marginTop: 10, lineHeight: 1.7 }}>
              FASTMeet は最小限のGoogleカレンダー権限のみを使用します。<br/>
              データを第三者に販売したり、目的外で利用することは一切ありません。
            </p>
          </div>
          <div style={{ background: "#fff", borderRadius: 14, padding: "8px 0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            {[
              {
                scope: "calendar.readonly",
                purpose: "空き時間の検出",
                detail: "ホストのカレンダーの予定（タイトル・時刻）を読み取り、busy/空き判定に使います。ゲストが選択できる時間枠の計算のみに使用。",
              },
              {
                scope: "calendar.events",
                purpose: "予約イベントの作成",
                detail: "ゲストが予約を確定した時、ホストのカレンダーに該当予定を新規作成します。既存イベントの編集・削除は予約成立分のみ対象。",
              },
              {
                scope: "userinfo.email / profile",
                purpose: "ログイン識別",
                detail: "メールアドレス・氏名・アバターのみ取得。ログインしたユーザーを識別するための最小限の情報。",
              },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "20px 28px",
                borderBottom: i < 2 ? "1px solid #f0f0f5" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                  <code style={{ background: "#0a0a0f", color: "#7eb3ff", padding: "3px 10px", borderRadius: 6, fontSize: 12, fontFamily: "ui-monospace, monospace" }}>{s.scope}</code>
                  <strong style={{ fontSize: 14 }}>{s.purpose}</strong>
                </div>
                <div style={{ fontSize: 13, color: "#3a3a3c", lineHeight: 1.7 }}>{s.detail}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, fontSize: 12, color: "#6e6e73", textAlign: "center" }}>
            詳細: <Link href="/privacy" style={{ color: "#0066CC", textDecoration: "underline" }}>プライバシーポリシー</Link> /
            <Link href="/terms" style={{ color: "#0066CC", textDecoration: "underline", marginLeft: 8 }}>利用規約</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "60px 24px", background: "#1d1d1f", color: "#fff" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12 }}>
            日程調整の往復を、今日からゼロに。
          </h2>
          <p style={{ fontSize: 14, color: "#a0a0b0", marginBottom: 28, lineHeight: 1.7 }}>
            15秒でGoogle連携、自分の予約URLが完成。
          </p>
          <form action={async () => {
            "use server";
            await signIn("google");
          }}>
            <button type="submit" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "13px 26px",
              background: "#fff", color: "#1d1d1f",
              border: "none", borderRadius: 12,
              fontSize: 15, fontWeight: 600, cursor: "pointer",
            }}>
              Googleではじめる
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "40px 24px", background: "#fafafa", borderTop: "1px solid #e0e0e5" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #0066CC, #00b4d8)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>FASTMeet</span>
            <span style={{ fontSize: 12, color: "#86868b" }}>© 2026 山中秀斗</span>
          </div>
          <div style={{ display: "flex", gap: 18, fontSize: 12, color: "#6e6e73" }}>
            <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>プライバシーポリシー</Link>
            <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>利用規約</Link>
            <Link href="/contact" style={{ color: "inherit", textDecoration: "none" }}>お問い合わせ</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
