import Link from "next/link";

export const metadata = {
  title: "お問い合わせ | FASTMeet",
  description: "FASTMeet に関するお問い合わせ。サポート・営業・OAuth関連の連絡先一覧。",
};

export default function ContactPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f5f5f7", padding: "48px 24px" }}>
      <article style={{
        maxWidth: 720, margin: "0 auto",
        background: "#fff", borderRadius: 16, padding: "48px 40px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        color: "#1d1d1f", lineHeight: 1.85,
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
          お問い合わせ
        </h1>
        <div style={{ fontSize: 13, color: "#5e5e63", marginBottom: 32 }}>
          サービスに関するご質問・要望・不具合報告など、お気軽にご連絡ください。
        </div>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>運営者</h2>
          <p style={{ fontSize: 14, color: "#3a3a3c" }}>
            山中秀斗（Shuto Yamanaka）<br />
            株式会社トレプロ 取締役 / 株式会社楽観 代表取締役
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>連絡先</h2>
          <div style={{ background: "#fafafa", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#5e5e63", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>メール（サポート）</div>
              <a href="mailto:s-yamanaka@tre-pro.co.jp" style={{ color: "#0066CC", textDecoration: "none", fontSize: 15, fontWeight: 600 }}>
                s-yamanaka@tre-pro.co.jp
              </a>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#5e5e63", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>運営会社</div>
              <div style={{ fontSize: 14 }}>株式会社トレプロ / 株式会社楽観</div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>カテゴリ別の連絡先</h2>
          <ul style={{ fontSize: 14, color: "#3a3a3c", paddingLeft: 22, lineHeight: 2 }}>
            <li><strong>サービスに関するご質問・要望</strong> → 上記メール</li>
            <li><strong>不具合・障害報告</strong> → 上記メール（件名に「FASTMeet 不具合」と記載）</li>
            <li><strong>個人情報の開示・削除請求</strong> → 上記メール（件名に「FASTMeet 個人情報請求」と記載）</li>
            <li><strong>OAuth / セキュリティに関する報告</strong> → 上記メール（件名に「FASTMeet Security」と記載）</li>
            <li><strong>取材・パートナーシップ</strong> → 上記メール</li>
          </ul>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>返信について</h2>
          <p style={{ fontSize: 14, color: "#3a3a3c" }}>
            通常2営業日以内にご返信いたします。お急ぎの場合はその旨を件名に明記してください。
            不具合報告については優先対応します。
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>関連</h2>
          <ul style={{ fontSize: 14, paddingLeft: 22 }}>
            <li><Link href="/privacy" style={{ color: "#0066CC" }}>プライバシーポリシー</Link></li>
            <li><Link href="/terms" style={{ color: "#0066CC" }}>利用規約</Link></li>
            <li><Link href="/" style={{ color: "#0066CC" }}>FASTMeet トップ</Link></li>
          </ul>
        </section>
      </article>
    </main>
  );
}
