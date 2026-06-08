#!/usr/bin/env bash
# FASTMeet デプロイスクリプト
#
# 目的: vercel --prod 単体だと alias が fastmeet.vercel.app に自動紐付かない
# 事故が再発するため、deploy → alias紐付け → 検証 を一気通貫で実行する。
#
# 使い方:
#   ./deploy.sh         # build + test + deploy + alias + verify
#   ./deploy.sh --skip-test  # テストスキップ（緊急時のみ）

set -euo pipefail

cd "$(dirname "$0")"

CUSTOM_DOMAIN="fastmeet.vercel.app"
SKIP_TEST=0

for arg in "$@"; do
  case "$arg" in
    --skip-test) SKIP_TEST=1 ;;
  esac
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASTMeet Deploy Pipeline"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: テスト
if [ "$SKIP_TEST" -eq 0 ]; then
  echo "[1/4] Vitest 実行中..."
  npm test
  echo "  OK"
else
  echo "[1/4] テストスキップ (--skip-test 指定)"
fi

# Step 2: Vercel デプロイ
echo "[2/4] Vercel production deploy..."
DEPLOY_URL=$(vercel --prod --yes 2>&1 | grep -oE "https://fastmeet-[a-z0-9]+-s-yamanaka-droids-projects\.vercel\.app" | head -1)

if [ -z "$DEPLOY_URL" ]; then
  echo "  ERROR: deployment URL が取得できませんでした"
  exit 1
fi
echo "  → $DEPLOY_URL"

# Step 3: カスタムドメイン alias 強制紐付け
echo "[3/4] alias $CUSTOM_DOMAIN を最新deploymentに紐付け..."
vercel alias set "$DEPLOY_URL" "$CUSTOM_DOMAIN" 2>&1 | tail -2
echo "  OK"

# Step 4: 動作確認（タイトル + main + h1）
echo "[4/4] 動作検証..."
sleep 2

TITLE=$(curl -s "https://${CUSTOM_DOMAIN}/book/yamanaka?_t=$(date +%s)" | grep -oE "<title>[^<]+</title>" | sed 's/<\/\?title>//g')
MAIN_COUNT=$(curl -s "https://${CUSTOM_DOMAIN}/book/yamanaka?_t=$(date +%s)" | grep -c "<main" || echo 0)
H1_COUNT=$(curl -s "https://${CUSTOM_DOMAIN}/book/yamanaka?_t=$(date +%s)" | grep -c "<h1" || echo 0)
JSONLD_COUNT=$(curl -s "https://${CUSTOM_DOMAIN}?_t=$(date +%s)" | grep -c "application/ld+json" || echo 0)

echo "  title: $TITLE"
echo "  <main> count (BOOK): $MAIN_COUNT"
echo "  <h1> count   (BOOK): $H1_COUNT"
echo "  JSON-LD count (LP): $JSONLD_COUNT"

if [ "$MAIN_COUNT" -lt 1 ] || [ "$H1_COUNT" -lt 1 ] || [ "$JSONLD_COUNT" -lt 1 ]; then
  echo ""
  echo "  ⚠️ 検証で異常を検出。手動で https://${CUSTOM_DOMAIN} を確認してください"
  exit 2
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Deploy 完了"
echo "  Production: https://${CUSTOM_DOMAIN}"
echo "  Deployment: ${DEPLOY_URL}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
