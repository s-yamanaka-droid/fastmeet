#!/usr/bin/env bash
# Phase 0a-0d の各段階で動作確認するスクリプト
# 使い方: ./scripts/verify_migration.sh
#
# チェック項目:
#  1. /book/yamanaka が 200 で返る
#  2. <main> + <h1> がページに存在
#  3. JSON-LD が LP に存在
#  4. Vitest が pass
#  5. Lighthouse Performance スコア維持（90+）

set -euo pipefail

cd "$(dirname "$0")/.."

URL="https://fastmeet.vercel.app"
PASS=0
FAIL=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASTMeet マイグレーション後 検証"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. /book/yamanaka が 200
echo "[1/5] /book/yamanaka の HTTP status..."
STATUS=$(curl -o /dev/null -s -w "%{http_code}" "${URL}/book/yamanaka")
if [ "$STATUS" = "200" ]; then
  echo "  OK ($STATUS)"
  PASS=$((PASS+1))
else
  echo "  FAIL ($STATUS) ❌"
  FAIL=$((FAIL+1))
fi

# 2. <main> + <h1> 存在確認
echo "[2/5] BOOK ページの <main> + <h1>..."
HTML=$(curl -s "${URL}/book/yamanaka?_t=$(date +%s)")
MAIN_COUNT=$(echo "$HTML" | grep -c "<main" || echo 0)
H1_COUNT=$(echo "$HTML" | grep -c "<h1" || echo 0)
if [ "$MAIN_COUNT" -ge 1 ] && [ "$H1_COUNT" -ge 1 ]; then
  echo "  OK (main=$MAIN_COUNT, h1=$H1_COUNT)"
  PASS=$((PASS+1))
else
  echo "  FAIL (main=$MAIN_COUNT, h1=$H1_COUNT) ❌"
  FAIL=$((FAIL+1))
fi

# 3. JSON-LD 存在
echo "[3/5] LP の JSON-LD..."
JSONLD=$(curl -s "$URL?_t=$(date +%s)" | grep -c "application/ld+json" || echo 0)
if [ "$JSONLD" -ge 1 ]; then
  echo "  OK ($JSONLD)"
  PASS=$((PASS+1))
else
  echo "  FAIL ($JSONLD) ❌"
  FAIL=$((FAIL+1))
fi

# 4. Vitest pass
echo "[4/5] Vitest..."
if npm test --silent 2>&1 | grep -q "Tests.*passed"; then
  echo "  OK"
  PASS=$((PASS+1))
else
  echo "  FAIL ❌"
  FAIL=$((FAIL+1))
fi

# 5. Lighthouse Performance >= 90
echo "[5/5] Lighthouse Performance スコア..."
lighthouse "${URL}/book/yamanaka" --output json --output-path /tmp/lh-verify.json \
  --only-categories=performance --chrome-flags="--headless --no-sandbox" --quiet 2>/dev/null
PERF=$(python3 -c "import json; d=json.load(open('/tmp/lh-verify.json')); print(round(d['categories']['performance']['score']*100))")
if [ "$PERF" -ge 90 ]; then
  echo "  OK ($PERF/100)"
  PASS=$((PASS+1))
else
  echo "  FAIL ($PERF/100) ❌"
  FAIL=$((FAIL+1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "結果: $PASS pass / $FAIL fail"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL" -gt 0 ]; then
  echo "⚠️ 検証失敗あり。次の Phase に進む前に修正してください。"
  exit 1
fi
echo "✓ 全項目pass。次の Phase に進めます。"
