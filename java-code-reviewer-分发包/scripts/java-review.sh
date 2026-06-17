#!/usr/bin/env bash
# dfws-customer Java 规范检查
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REVIEWER="$ROOT/tools/java-code-reviewer"
RULES="${JAVA_REVIEW_RULES:-$REVIEWER/rules/team-backend-rules.yaml}"
OUT="${JAVA_REVIEW_OUT:-$REVIEWER/reports}"
BASE="${JAVA_REVIEW_BASE:-origin/master}"
REPO_ROOT="${JAVA_REVIEW_REPO:-$ROOT}"

if [[ "${1:-}" == "--last-commit" ]]; then
  BASE="HEAD~1"
  shift
fi

if ! command -v git >/dev/null 2>&1; then
  echo "❌ 未找到 git"
  exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "❌ 未找到 node，请安装 Node.js 20+"
  exit 1
fi

cd "$REVIEWER"
if [[ ! -f "$REVIEWER/dist/cli.js" ]]; then
  npm install --silent 2>/dev/null || npm install
  npm run build --silent 2>/dev/null || npm run build
fi

MODE="changed"
PATHS=()
if [[ "${1:-}" == "--all" ]]; then
  MODE="all"
  shift
  PATHS=("${@:-crm-customer/src/main/java}")
elif [[ "${1:-}" == "--path" ]]; then
  MODE="path"
  shift
  PATHS=("$@")
fi

CLI=(node "$REVIEWER/dist/cli.js" --rules "$RULES" --format html,json,markdown,console --out "$OUT" --repo-root "$REPO_ROOT")

if [[ "$MODE" == "changed" ]]; then
  echo "📋 检查 git 变更 Java 文件，基线: $BASE"
  if [[ "$BASE" == "HEAD~1" ]]; then
    echo "   （模式: 仅最近一次 commit）"
    git -C "$REPO_ROOT" log -1 --oneline 2>/dev/null || true
  fi
  CLI+=(--changed-only --base "$BASE")
else
  echo "📋 扫描: ${PATHS[*]}"
  for p in "${PATHS[@]}"; do
    if [[ "$p" = /* ]]; then CLI+=(--path "$p"); else CLI+=(--path "$REPO_ROOT/$p"); fi
  done
fi

echo "▶ 运行规范检查..."
set +e
"${CLI[@]}"
EXIT=$?
set -e

[[ -f "$OUT/review-report.html" ]] && echo "📊 HTML: $OUT/review-report.html" && [[ "$(uname)" == Darwin ]] && open "$OUT/review-report.html" 2>/dev/null || true
[[ -f "$OUT/review-report.md" ]] && echo "📝 MR 评论: $OUT/review-report.md"

[[ $EXIT -eq 0 ]] && echo "✅ 通过" || echo "❌ 未通过"
exit $EXIT
