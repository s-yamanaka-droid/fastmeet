import Link from "next/link";

export const metadata = {
  title: "利用規約 | FASTMeet",
  description: "FASTMeet の利用規約。サービス利用にあたっての条件・禁止事項・免責事項等を記載。",
};

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f5f5f7", padding: "48px 24px" }}>
      <article style={{
        maxWidth: 800, margin: "0 auto",
        background: "#fff", borderRadius: 16, padding: "48px 40px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        color: "#1d1d1f", lineHeight: 1.85,
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
          利用規約
        </h1>
        <div style={{ fontSize: 13, color: "#5e5e63", marginBottom: 32 }}>
          最終更新: 2026年5月25日
        </div>

        <p style={{ fontSize: 14, color: "#3a3a3c", marginBottom: 28 }}>
          本規約は、山中秀斗（以下「運営者」）が提供する日程調整サービス「FASTMeet」（以下「本サービス」）の利用条件を定めるものです。
          利用者は本規約に同意の上、本サービスを利用するものとします。
        </p>

        <Section title="第1条（適用）">
          <p>本規約は、本サービスの利用に関わる一切の関係に適用されるものとします。</p>
        </Section>

        <Section title="第2条（利用登録）">
          <ul style={ul}>
            <li><strong>ホスト</strong>: 本サービスでは、Googleアカウントによる認証を通じてホストとして利用登録を行います</li>
            <li><strong>ゲスト</strong>: 予約をするゲストは登録不要で利用できます</li>
            <li>登録情報に虚偽があった場合、運営者は登録を取り消すことができます</li>
          </ul>
        </Section>

        <Section title="第3条（料金）">
          <p>本サービスは現時点で<strong>無料</strong>で提供されます。将来的に有料プランを追加する場合は、事前に告知します。</p>
        </Section>

        <Section title="第4条（禁止事項）">
          <p>利用者は本サービス利用にあたり、以下の行為をしてはなりません。</p>
          <ul style={ul}>
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスのサーバー・ネットワークを不当に妨害・破壊しようとする行為</li>
            <li>本サービスの運営を妨害するおそれのある行為</li>
            <li>他の利用者または第三者になりすます行為</li>
            <li>不正アクセス、botによる予約スパム、自動化された予約取得</li>
            <li>本サービスのリバースエンジニアリング</li>
            <li>本サービスを商業目的で無断利用すること（本サービス自体は無料で提供）</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </Section>

        <Section title="第5条（本サービスの提供の停止等）">
          <p>運営者は、以下のいずれかの事由があると判断した場合、利用者に通知することなく本サービスの全部または一部の提供を停止または中断することができます。</p>
          <ul style={ul}>
            <li>本サービスにかかるシステムの保守点検・更新を行う場合</li>
            <li>地震、落雷、火災、停電または天災などの不可抗力により提供が困難となった場合</li>
            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
            <li>第三者サービス（Google / Supabase / Vercel等）の障害</li>
          </ul>
        </Section>

        <Section title="第6条（著作権・知的財産権）">
          <p>本サービスのソースコード・デザイン・コンテンツに関する著作権は運営者または正当な権利者に帰属し、利用者は無断で複製・転載・配布できません。</p>
        </Section>

        <Section title="第7条（免責事項）">
          <ul style={ul}>
            <li>本サービスは現状有姿で提供されます</li>
            <li>サービスの停止・中断・データ消失等によって生じた損害について、運営者は責任を負いません</li>
            <li>ホストとゲスト間の予約・ミーティングに関するトラブルは当事者間で解決するものとします</li>
            <li>本サービスが Google / Supabase / Vercel 等の第三者サービスに依存することに起因する障害について、運営者は責任を負いません</li>
          </ul>
        </Section>

        <Section title="第8条（サービス内容の変更等）">
          <p>運営者は、利用者への事前通知なくサービス内容を変更・追加・廃止することがあり、これによって利用者に生じたいかなる損害についても責任を負いません。</p>
        </Section>

        <Section title="第9条（利用規約の変更）">
          <p>運営者は必要と判断した場合、利用者に通知することなく本規約を変更することができるものとします。変更後の規約は、本サービス上に掲示された時点で効力を生じるものとします。</p>
        </Section>

        <Section title="第10条（個人情報の取扱い）">
          <p>本サービスにおける個人情報の取扱いについては、別途 <Link href="/privacy" style={a}>プライバシーポリシー</Link> に定めます。</p>
        </Section>

        <Section title="第11条（準拠法・裁判管轄）">
          <p>本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄とします。</p>
        </Section>

        <Section title="第12条（連絡方法）">
          <p>本規約に関するお問い合わせは <Link href="/contact" style={a}>お問い合わせページ</Link> または <a href="mailto:s-yamanaka@tre-pro.co.jp" style={a}>s-yamanaka@tre-pro.co.jp</a> までご連絡ください。</p>
        </Section>

        <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #e0e0e5", fontSize: 12, color: "#5e5e63" }}>
          関連: <Link href="/privacy" style={a}>プライバシーポリシー</Link> / <Link href="/contact" style={a}>お問い合わせ</Link> / <Link href="/" style={a}>トップ</Link>
        </div>
      </article>
    </main>
  );
}

const ul = { fontSize: 14, color: "#3a3a3c", paddingLeft: 22, lineHeight: 1.9 } as const;
const a = { color: "#0066CC", textDecoration: "underline" } as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#1d1d1f" }}>{title}</h2>
      <div style={{ fontSize: 14, color: "#3a3a3c" }}>{children}</div>
    </section>
  );
}
