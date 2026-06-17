#!/usr/bin/env bash
# 启动本地 HTTP 服务，局域网可访问规范检查报告
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPORTS="$ROOT/tools/java-code-reviewer/reports"
PORT="${REPORT_PORT:-8765}"

if [[ ! -f "$REPORTS/review-report.html" ]]; then
  echo "❌ 未找到报告，请先运行: bash scripts/java-review.sh --last-commit"
  exit 1
fi

get_ip() {
  ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || \
    ifconfig | awk '/inet / && $2 != "127.0.0.1" {print $2; exit}'
}

IP="$(get_ip)"
if [[ -z "$IP" ]]; then
  echo "⚠️  无法自动获取局域网 IP，请手动替换 <你的IP>"
  IP="<你的IP>"
fi

echo ""
echo "════════════════════════════════════════════"
echo "  Java 规范检查报告 — 局域网访问"
echo "════════════════════════════════════════════"
echo ""
echo "  本机:     http://127.0.0.1:${PORT}/review-report.html"
echo "  局域网:   http://${IP}:${PORT}/review-report.html"
echo ""
echo "  Markdown: http://${IP}:${PORT}/review-report.md"
echo "  JSON:     http://${IP}:${PORT}/review-report.json"
echo ""
echo "  按 Ctrl+C 停止服务"
echo "════════════════════════════════════════════"
echo ""

cd "$REPORTS"
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT" --bind 0.0.0.0
elif command -v python >/dev/null 2>&1; then
  exec python -m SimpleHTTPServer "$PORT"
else
  echo "❌ 需要 python3"
  exit 1
fi
