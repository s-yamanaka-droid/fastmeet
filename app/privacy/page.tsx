export const metadata = {
  title: "プライバシーポリシー | FASTMeet",
  description: "FASTMeet のプライバシーポリシー。収集する情報、利用目的、第三者提供等について記載しています。",
};

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f5f5f7", padding: "48px 24px" }}>
      <article style={{
        maxWidth: 760, margin: "0 auto",
        background: "#fff", borderRadius: 16, padding: "48px 40px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        color: "#1d1d1f", lineHeight: 1.85,
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
          プライバシーポリシー
        </h1>
        <div style={{ fontSize: 13, color: "#86868b", marginBottom: 32 }}>
          最終更新: 2026年5月
        </div>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>1. 収集する情報</h2>
          <p style={{ fontSize: 14, color: "#3a3a3c" }}>
            FASTMeet は予約フローにおいて以下の情報を収集します。
          </p>
          <ul style={{ fontSize: 14, color: "#3a3a3c", paddingLeft: 22, marginTop: 8 }}>
            <li>お名前、メールアドレス、会社名（任意）、メッセージ（任意）</li>
            <li>Googleアカウントから取得する基本プロフィール情報（メール・名前・アイコン）</li>
            <li>ホストの空き時間判定のために Google カレンダー情報を一時的に参照します</li>
          </ul>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>2. 利用目的</h2>
          <ul style={{ fontSize: 14, color: "#3a3a3c", paddingLeft: 22 }}>
            <li>予約成立に必要なミーティング招待・確認連絡</li>
            <li>サービス改善のためのアクセス解析（個人を特定しない統計情報）</li>
            <li>キャンセル・変更等のリスケジュール通知</li>
          </ul>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>3. 第三者提供</h2>
          <p style={{ fontSize: 14, color: "#3a3a3c" }}>
            法令に基づく場合を除き、本人の同意なく第三者に個人情報を提供することはありません。
            ミーティング招待のため Google Calendar / Zoom 等の第三者ツールにイベント情報を送信しますが、これらは予約成立の必要な範囲内で行われます。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>4. データの保管・破棄</h2>
          <p style={{ fontSize: 14, color: "#3a3a3c" }}>
            ご予約情報は Supabase が提供する暗号化されたデータベースに保管されます。
            予約から1年経過後に自動的に匿名化または削除されます。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>5. 開示・削除請求</h2>
          <p style={{ fontSize: 14, color: "#3a3a3c" }}>
            ご自身の情報の開示・訂正・削除をご希望の場合は、下記連絡先までご連絡ください。
          </p>
        </section>

        <section style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>6. 連絡先</h2>
          <p style={{ fontSize: 14, color: "#3a3a3c" }}>
            FASTMeet 運営: 山中秀斗<br />
            メール: s-yamanaka@tre-pro.co.jp
          </p>
        </section>
      </article>
    </main>
  );
}
