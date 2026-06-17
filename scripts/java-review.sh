#!/usr/bin/env bash
# Java 规范检查（只读：仅生成报告，不修改业务代码）
# Agent 约束：.cursor/rules/java-code-review-agent.mdc（Gitee 须索要令牌；零扣分通过）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REVIEWER="$ROOT/packages/java-code-reviewer"
RULES="${JAVA_REVIEW_RULES:-$REVIEWER/rules/team-backend-rules.yaml}"
OUT="${JAVA_REVIEW_OUT:-$REVIEWER/reports}"
BASE="${JAVA_REVIEW_BASE:-origin/main}"
REPO_ROOT="${JAVA_REVIEW_REPO:-$(git -C "$ROOT" rev-parse --show-toplevel 2>/dev/null || echo "$ROOT")}"

if ! command -v git >/dev/null 2>&1; then
  echo "❌ 未找到 git。macOS 请运行: xcode-select --install"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "❌ 未找到 node。请先安装 Node.js 20+"
  exit 1
fi

cd "$ROOT"
npm run build -w @apdr/java-code-reviewer --silent 2>/dev/null || npm run build -w @apdr/java-code-reviewer

MODE="changed"
PATHS=()
if [[ "${1:-}" == "--all" ]]; then
  MODE="all"
  shift
  PATHS=("${1:-src/main/java}")
elif [[ "${1:-}" == "--path" ]]; then
  MODE="path"
  shift
  PATHS=("$@")
fi

CLI=(node "$REVIEWER/dist/cli.js" --rules "$RULES" --format html,json,markdown,console --out "$OUT" --repo-root "$REPO_ROOT")

if [[ "$MODE" == "changed" ]]; then
  echo "📋 模式: 仅检查 git 变更 (.java)  基线: $BASE"
  CLI+=(--changed-only --base "$BASE")
elif [[ "$MODE" == "all" || "$MODE" == "path" ]]; then
  echo "📋 模式: 扫描目录 ${PATHS[*]}"
  for p in "${PATHS[@]}"; do
    CLI+=(--path "$REPO_ROOT/$p")
  done
fi

echo "▶ 运行规范检查..."
set +e
"${CLI[@]}"
EXIT=$?
set -e

HTML="$OUT/review-report.html"
if [[ -f "$HTML" ]]; then
  echo ""
  echo "📊 报告: $HTML"
  if [[ "$(uname)" == "Darwin" ]]; then
    open "$HTML" 2>/dev/null || true
  fi
fi

MD="$OUT/review-report.md"
if [[ -f "$MD" ]]; then
  echo "📝 MR 评论可复制: $MD"
fi

if [[ $EXIT -eq 0 ]]; then
  echo "✅ 检查通过"
else
  echo "❌ 未通过（见报告扣分明细）"
fi
exit $EXIT
