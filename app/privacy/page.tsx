import Link from "next/link";

export const metadata = {
  title: "プライバシーポリシー | FASTMeet",
  description: "FASTMeet のプライバシーポリシー。Googleユーザーデータの取扱い・OAuthスコープ詳細・保管期間・第三者提供等について記載。",
};

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f5f5f7", padding: "48px 24px" }}>
      <article style={{
        maxWidth: 800, margin: "0 auto",
        background: "#fff", borderRadius: 16, padding: "48px 40px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        color: "#1d1d1f", lineHeight: 1.85,
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
          プライバシーポリシー
        </h1>
        <div style={{ fontSize: 13, color: "#5e5e63", marginBottom: 32 }}>
          最終更新: 2026年5月25日 / 発行者: 山中秀斗（FASTMeet 運営者）
        </div>

        <p style={{ fontSize: 14, color: "#3a3a3c", marginBottom: 28 }}>
          FASTMeet（以下「本サービス」）は、ユーザーの個人情報の保護を重要視しています。
          本ポリシーは、本サービスがどのようにユーザーデータ（特に Google ユーザーデータ）を扱うかを説明します。
        </p>

        <Section title="1. 収集する情報">
          <p>本サービスは以下の情報を収集します。</p>
          <h3 style={subH}>1-1. Google OAuth によって取得する情報（ホスト=予約を受ける側）</h3>
          <ul style={ul}>
            <li><strong>メールアドレス・氏名・プロフィール画像</strong>（<code>openid / email / profile</code> スコープ）— ログイン識別とホストとしての表示のため</li>
            <li><strong>Googleカレンダーの予定情報</strong>（<code>calendar.readonly</code> スコープ）— 既存予定との重複を避け、空き時間を判定するため</li>
            <li><strong>Googleカレンダーへの予定書き込み権限</strong>（<code>calendar.events</code> スコープ）— 予約成立時にホスト側カレンダーへイベントを作成するため</li>
            <li><strong>OAuth リフレッシュトークン</strong> — 上記スコープでGoogle APIを継続的に呼ぶため（暗号化された Supabase データベースに保存）</li>
          </ul>
          <h3 style={subH}>1-2. ゲスト（予約する側）から取得する情報</h3>
          <ul style={ul}>
            <li>お名前、メールアドレス、会社名（任意）、メモ（任意）— ホストへ通知し、ミーティング招待を送るため</li>
          </ul>
        </Section>

        <Section title="2. Googleユーザーデータの利用目的">
          <p>FASTMeet が取得したGoogleユーザーデータは、<strong>厳密に以下の目的のためのみ</strong>使用します。</p>
          <ul style={ul}>
            <li>ホストのカレンダー予定を読み取り、空き時間スロットを計算する</li>
            <li>ゲストが選択した時間にホストのカレンダーへ予約イベントを作成する</li>
            <li>Google Meet URL の自動発行（<code>conferenceData</code> 経由）</li>
            <li>ホストの「今月の稼働実態」メトリクス（予約ページに表示される件数集計）</li>
          </ul>
          <p style={{ marginTop: 12, fontWeight: 600 }}>
            これら以外の目的（広告配信、第三者への販売、AIモデルの学習データ等）には<strong>一切利用しません</strong>。
          </p>
        </Section>

        <Section title="3. 第三者提供">
          <p>本サービスは、以下の場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。</p>
          <ul style={ul}>
            <li>法令に基づく開示請求があった場合</li>
            <li>予約成立時に Google Calendar / Zoom 等のミーティングツールにイベント情報を送信する場合（本人が明示的にトリガーした処理）</li>
          </ul>
        </Section>

        <Section title="4. データの保管・破棄">
          <ul style={ul}>
            <li>ユーザーデータは <strong>Supabase（PostgreSQL ホスティング）</strong> の暗号化されたデータベースに保管されます</li>
            <li>OAuth リフレッシュトークンは暗号化されて保存され、Google API 呼び出し時のみ復号して使用</li>
            <li>予約情報は予約成立から <strong>1年経過後に自動削除</strong> または匿名化されます</li>
            <li>ユーザーが本サービスからアカウント削除を希望した場合、24時間以内に全データを削除します</li>
          </ul>
        </Section>

        <Section title="5. ユーザーの権利">
          <p>ユーザーは以下の権利を有します。</p>
          <ul style={ul}>
            <li><strong>開示請求</strong>: 当サービスが保有する自己情報の開示を求めることができます</li>
            <li><strong>訂正・削除請求</strong>: 自己情報の訂正・削除を求めることができます</li>
            <li><strong>OAuth 認可の取り消し</strong>: <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={a}>Google アカウント設定</a> から、本サービスへのアクセス権を直接取り消せます</li>
          </ul>
        </Section>

        <Section title="6. 安全管理措置">
          <ul style={ul}>
            <li>全通信は HTTPS（TLS 1.3）で暗号化</li>
            <li>セキュリティヘッダー（HSTS / X-Frame-Options / Referrer-Policy / Permissions-Policy 等）を強制適用</li>
            <li>OAuth リフレッシュトークンは暗号化保存、Vercel/Supabase の最小権限アクセスのみ</li>
            <li>Google API スコープは最小限のみ要求</li>
          </ul>
        </Section>

        <Section title="7. Cookie の使用">
          <p>本サービスは以下のCookieを使用します。</p>
          <ul style={ul}>
            <li>セッションCookie（NextAuth）: ログイン状態の維持</li>
            <li>本サービスは広告配信・トラッキング目的のサードパーティCookieを使用していません</li>
          </ul>
        </Section>

        <Section title="8. ポリシーの変更">
          <p>本ポリシーは予告なく改定されることがあります。重要な変更がある場合は、本サービス内に告知します。</p>
        </Section>

        <Section title="9. 連絡先">
          <p>
            本ポリシーに関するお問い合わせ、開示・削除請求は以下まで。<br />
            運営者: 山中秀斗<br />
            メール: <a href="mailto:s-yamanaka@tre-pro.co.jp" style={a}>s-yamanaka@tre-pro.co.jp</a><br />
            問い合わせフォーム: <Link href="/contact" style={a}>/contact</Link>
          </p>
        </Section>

        <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #e0e0e5", fontSize: 12, color: "#5e5e63" }}>
          関連: <Link href="/terms" style={a}>利用規約</Link> / <Link href="/contact" style={a}>お問い合わせ</Link> / <Link href="/" style={a}>トップ</Link>
        </div>
      </article>
    </main>
  );
}

const subH = { fontSize: 14, fontWeight: 700, marginTop: 14, marginBottom: 6, color: "#1d1d1f" } as const;
const ul = { fontSize: 14, color: "#3a3a3c", paddingLeft: 22, lineHeight: 1.9 } as const;
const a = { color: "#0066CC", textDecoration: "underline" } as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "#1d1d1f" }}>{title}</h2>
      <div style={{ fontSize: 14, color: "#3a3a3c" }}>{children}</div>
    </section>
  );
}
