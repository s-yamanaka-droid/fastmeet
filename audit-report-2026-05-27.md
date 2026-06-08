# AI Product Audit Report — FASTMeet
> 診断日: 2026-05-27 | URL: https://fastmeet.vercel.app | タイプ: SaaS（日程調整・公開予約）
> Powered by Shoot Agent Site Audit v2.1
> Lighthouse LP: Perf 96 / SEO 100 / A11y 90 / BP 100
> Lighthouse BOOK: Perf 97 / SEO 100 / A11y 93 / BP 100

## 総合スコア: 87 / 100 — グレード A

| カテゴリ | スコア | 主な減点理由 |
|---|---|---|
| A. セキュリティ | 95/100 | X-XSS-Protection未設定（モダンブラウザでは不要）/ npm audit未実行 |
| B. 機能完成度 | 85/100 | カスタム404・error.tsx・loading.tsx 未実装 / TODO 4件 |
| C. 法的対応 | 79/100 | Cookie同意バナーなし（本番審査前は要）/ 個人情報取扱の明示性やや弱 |
| D. コンバージョン | 88/100 | 決済導線なし（β）/ FAQセクション未設置 |
| E. SEO | 92/100 | JSON-LD 構造化データなし / 予約ページに h1 なし |
| F. UX/デザイン | 92/100 | 一部 color-contrast 4.5:1未満 / 予約ページ `<main>` ランドマーク欠如 |
| G. パフォーマンス | 95/100 | 予約ページ初回 SSR 2.5s（Calendar API呼び出し） |
| H. コード品質 | 74/100 | テスト 0件 / inline style 多用（CSS設計ゼロ） |

## Core Web Vitals（Lighthouse 実測）

| 指標 | LP | BOOK | 基準 | 判定 |
|---|---|---|---|---|
| FCP | 1.5s | 1.0s | <1.8s | ✅✅ |
| LCP | 2.2s | 1.7s | <2.5s | ✅✅ |
| CLS | 0 | 0 | <0.1 | ✅✅ |
| TBT | 0ms | 0ms | <200ms | ✅✅ |
| Speed Index | 4.3s | 4.4s | <3.4s | ⚠️⚠️ |

## 直近の良い変更（このセッション）
1. ✅ 候補日テキスト生成に敬語テンプレ + 宛名/URL併記オプション追加
2. ✅ ドッグフード表現（philosophy）→「作って即出す。検証は本番で回す」に置換
3. ✅ PremiumHero displayName を `fontSize 30→18` で抑制
4. ✅ 予約ページのブラウザタブ title を「FASTMeet」のみに（layout templateバイパス）
5. ⚠️ **発見：alias `fastmeet.vercel.app` が最新deploymentに紐付いてなかった** → 監査中に修正済

## 優先改善アクション TOP 10

| # | 優先 | カテゴリ | 項目 | 回収pt | 工数 |
|---|---|---|---|---|---|
| 1 | 🔴 | F | 予約ページに `<main>` ランドマーク追加（a11y / Lighthouse） | +2 | 5分 |
| 2 | 🔴 | E | 予約ページに `<h1>` を1つ（例: 「{displayName}の予約」visually-hidden可） | +3 | 5分 |
| 3 | 🔴 | F | カラーコントラスト修正（#5e5e63 #7c7c87 等が背景白で 4.5:1 ぎりぎり/未満） | +2 | 15分 |
| 4 | 🟡 | B | `app/error.tsx` + `app/global-error.tsx` で ErrorBoundary 実装 | +5 | 15分 |
| 5 | 🟡 | B | `app/not-found.tsx` でカスタム404（ブランド統一） | +5 | 10分 |
| 6 | 🟡 | B | `app/loading.tsx` で Suspense スケルトン | +5 | 15分 |
| 7 | 🟡 | E | JSON-LD（SoftwareApplication or LocalBusiness）追加 | +15 | 20分 |
| 8 | 🟡 | H | `lib/styles/tokens.ts` で色・スペーシング token化 → inline styleから参照 | +10 | 1h |
| 9 | 🟢 | D | LP に「よくある質問」FAQセクション追加（離脱防止 + SEO） | +5 | 30分 |
| 10 | 🟢 | H | Vitest 導入 → `lib/availability.ts` の generateSlots に単体テスト | +10 | 1h |

合計 **+62pt** 回収可能（理論上 → 重複/上限丸めで実効 +20〜30pt）

## カテゴリ別 詳細

### A. セキュリティ 95/100
- ✅ HSTS preload (`max-age=63072000; includeSubDomains; preload`)
- ✅ CSP（default-src 'self' + 必要なGoogle/Zoom/Supabaseドメインのみ許可）
- ✅ X-Frame-Options DENY / frame-ancestors 'none'
- ✅ X-Content-Type-Options nosniff
- ✅ Referrer-Policy strict-origin-when-cross-origin
- ✅ Permissions-Policy（camera/microphone/geolocation すべて空）
- ✅ ハードコードAPIキー 0件
- ✅ robots.txt が /api/, /dashboard, /cancel/ を Disallow
- ✅ .env.local が .gitignore で除外
- ⚠️ npm audit 未実行（CIに組み込み推奨）

### B. 機能完成度 85/100
- ✅ Booking API / Availability API / Google Calendar連携が実動作
- ✅ Zoom連携、cancel_token によるキャンセル機能
- ✅ モバイル対応（responsive grid）
- ❌ カスタム 404 ページなし（Next.js デフォルト = ブランド外）
- ❌ ErrorBoundary (`error.tsx`) なし — API 失敗時に whitescreen リスク
- ❌ 共通 loading.tsx なし
- ⚠️ TODO/FIXME/console.log 計4件残存

### C. 法的対応 79/100
- ✅ /privacy /terms /contact 全て 200
- ✅ Copyright © 2026 山中秀斗
- ⚠️ Cookie同意バナー未実装（現状外部スクリプト最小だが、GA等入れたら必要）
- ⚠️ プライバシーポリシーの個人情報項目記載は要中身レビュー
- ✅ OAuth スコープ説明セクション（LPに掲載済み）

### D. コンバージョン 88/100
- ✅ Hero に2つのCTA（予約 / ホスト登録β）
- ✅ Features 6項目 / OAuth Scopes / After Booking / 最終CTA で導線多層化
- ✅ CTAコピー明確（「山中秀斗の予約ページを見る」「予約ページを開く」）
- ⚠️ FAQ未実装（「ゲストもログイン必要？」「キャンセルは？」等は離脱の典型理由）
- N/A 決済（β）

### E. SEO 92/100
- ✅ title / description / OGP 4項目 / Twitter Card すべて設定
- ✅ canonical 設定 / sitemap.xml 200 / robots.txt 200
- ✅ Lighthouse SEO 100/100
- ❌ JSON-LD 構造化データ 0件（SoftwareApplication schema追加で検索表示強化）
- ❌ /book/[username] に `<h1>` なし（Lighthouse は通るが SEO 視点NG）

### F. UX/UI 92/100
- ✅ 絵文字 0個（山中ルール準拠）
- ✅ ファビコン・OGP画像 配置済
- ✅ アニメーション（fm-fade-in, fm-pulse 等）
- ⚠️ color-contrast 違反：`#5e5e63 #7c7c87` が背景白で 4.5:1 未満エリアあり
- ⚠️ 予約ページに `<main>` ランドマークなし → スクリーンリーダー navigation 困難
- ⚠️ Lighthouse Accessibility 90-93/100（合格圏だが改善余地）

### G. パフォーマンス 95/100
- ✅ Lighthouse Performance 96-97/100
- ✅ LP TTFB 0.48s、BOOK 初回 2.5s（SSR + Google Calendar API）、ISR キャッシュヒット時 40ms
- ✅ CDN: Vercel Edge
- ✅ Next.js Turbopack 最適化
- ⚠️ Speed Index 4.3-4.4s（Lighthouse は許容圏内だが LP のヒーローセクションの fonts/scripts 並列ロードで改善余地）

### H. コード品質 74/100
- ✅ TypeScript `: any` 使用 0 件（型安全）
- ✅ ディレクトリ構造クリーン（app / lib / types 分離）
- ✅ README 存在
- ❌ テストファイル 0 件（generateSlots 等は単体テスト価値高い）
- ❌ inline style 多用 — `app/page.tsx`, `PremiumHero.tsx`, `BookingClient.tsx` で style={{}} 多数。デザイントークン化されていない
- ⚠️ TODO/FIXME/console 4件

## 前回比較
> .audit-scores.json なし（初回計測）。次回からの比較ベースラインとして保存。

## Slack 報告

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASTMeet サイト診断レポート
URL: https://fastmeet.vercel.app  |  診断日: 2026-05-27
Lighthouse LP:   Perf 96 / SEO 100 / A11y 90 / BP 100
Lighthouse BOOK: Perf 97 / SEO 100 / A11y 93 / BP 100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 総合スコア: 87/100  グレード A

  A. セキュリティ      95/100  合格
  B. 機能完成度        85/100  合格
  C. 法的対応          79/100  要改善
  D. コンバージョン    88/100  合格
  E. SEO               92/100  合格   (h1欠如・JSON-LDなし)
  F. UX/デザイン       92/100  合格   (a11y軽微)
  G. パフォーマンス    95/100  合格   FCP 1.0s LCP 1.7s CLS 0
  H. コード品質        74/100  要改善 (テスト 0件・inline style)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 優先改善 TOP 3（合計 +10点 / 25分で回収可能）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 予約ページに <main> + <h1> 追加  +5点  工数:10分
   → BookingClient 最上部を <main role="main"> に / 種別名を h1 に

2. カラーコントラスト修正  +2点  工数:15分
   → #5e5e63 → #4b5563、#7c7c87 → #5e5e63 に置換（既に部分採用済）

3. JSON-LD 追加  +3点  工数:15分
   → layout.tsx で SoftwareApplication schema を script埋め込み

■ 監査中に修正済（バックグラウンド発見）
   - fastmeet.vercel.app の alias が最新deploymentに未紐付け → 修正
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
