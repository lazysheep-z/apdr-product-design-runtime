#!/usr/bin/env bash
# Install CodeGraph CLI for APDR code_intelligence pipeline stage
set -euo pipefail

echo "=== APDR: Installing CodeGraph ==="

if command -v codegraph >/dev/null 2>&1; then
  echo "✓ codegraph already installed: $(codegraph version 2>/dev/null || echo unknown)"
else
  echo "→ Installing CodeGraph CLI..."
  if command -v npm >/dev/null 2>&1; then
    npm install -g @colbymchenry/codegraph
  else
    curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh
  fi
fi

echo ""
echo "→ Wiring Cursor MCP (optional, for agent-side codegraph_explore)..."
if command -v codegraph >/dev/null 2>&1; then
  codegraph install --target=cursor --yes 2>/dev/null || \
    echo "  (skip codegraph install — run manually: codegraph install --target=cursor --yes)"
else
  echo "  ⚠ codegraph not on PATH — open a new terminal and re-run"
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MCP_JSON="$HOME/.cursor/mcp.json"

if [[ -f "$MCP_JSON" ]] && ! grep -q '"codegraph"' "$MCP_JSON" 2>/dev/null; then
  echo "→ Add codegraph to ~/.cursor/mcp.json manually if needed:"
  echo '  "codegraph": { "command": "codegraph", "args": ["serve", "--mcp"] }'
fi

echo ""
echo "✓ CodeGraph ready for APDR stage: code_intelligence"
echo "  Pipeline hook: repo MCP build_code_intelligence_report (no manual init needed)"
echo "  Docs: skills/code-intelligence/SKILL.md"
