export const metadata = {
  title: "利用規約 | FASTMeet",
  description: "FASTMeet の利用規約。サービス利用にあたっての条件・禁止事項等を記載しています。",
};

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f5f5f7", padding: "48px 24px" }}>
      <article style={{
        maxWidth: 760, margin: "0 auto",
        background: "#fff", borderRadius: 16, padding: "48px 40px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        color: "#1d1d1f", lineHeight: 1.85,
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
          利用規約
        </h1>
        <div style={{ fontSize: 13, color: "#86868b", marginBottom: 32 }}>
          最終更新: 2026年5月
        </div>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>第1条（適用）</h2>
          <p style={{ fontSize: 14, color: "#3a3a3c" }}>
            本規約は、FASTMeet（以下「本サービス」）の利用条件を定めるものです。
            利用者は本規約に同意の上、本サービスを利用するものとします。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>第2条（利用登録）</h2>
          <p style={{ fontSize: 14, color: "#3a3a3c" }}>
            本サービスを利用するゲストは、登録なしで予約を行えます。
            ホストとして本サービスを利用する場合は、Google アカウントによる認証が必要です。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>第3条（禁止事項）</h2>
          <ul style={{ fontSize: 14, color: "#3a3a3c", paddingLeft: 22 }}>
            <li>法令または公序良俗に違反する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>他の利用者または第三者になりすます行為</li>
            <li>不正アクセス、リバースエンジニアリング、botによる予約スパム</li>
            <li>本サービスを商業目的で無断利用すること</li>
          </ul>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>第4条（免責事項）</h2>
          <p style={{ fontSize: 14, color: "#3a3a3c" }}>
            本サービスは現状有姿で提供されます。
            サービスの停止・中断・データ消失等によって生じた損害について、運営者は責任を負わないものとします。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>第5条（規約の変更）</h2>
          <p style={{ fontSize: 14, color: "#3a3a3c" }}>
            運営者は必要と判断した場合、利用者に通知することなく本規約を変更することができるものとします。
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>第6条（準拠法・裁判管轄）</h2>
          <p style={{ fontSize: 14, color: "#3a3a3c" }}>
            本規約の解釈にあたっては、日本法を準拠法とします。
            本サービスに関して紛争が生じた場合には、運営者の住所地を管轄する裁判所を専属的合意管轄とします。
          </p>
        </section>
      </article>
    </main>
  );
}
