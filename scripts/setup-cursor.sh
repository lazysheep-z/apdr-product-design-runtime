#!/usr/bin/env bash
# Generate .cursor/mcp.json for APDR conversation mode
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MCP_JSON="$ROOT/.cursor/mcp.json"
EXAMPLE="$ROOT/.cursor/mcp.json.example"

mkdir -p "$ROOT/.cursor" "$ROOT/projects"

if [[ -f "$MCP_JSON" ]]; then
  echo "✓ .cursor/mcp.json already exists — skip (delete to regenerate)"
else
  if [[ -f "$EXAMPLE" ]]; then
    sed "s|\${workspaceFolder}|$ROOT|g" "$EXAMPLE" > "$MCP_JSON"
    echo "✓ Created .cursor/mcp.json from example"
  else
    cat > "$MCP_JSON" <<EOF
{
  "mcpServers": {
    "design-artifacts": {
      "command": "node",
      "args": ["$ROOT/packages/mcp-servers/design-artifacts/dist/index.js"],
      "env": {
        "APDR_PROJECTS_ROOT": "$ROOT/projects"
      }
    }
  }
}
EOF
    echo "✓ Created minimal .cursor/mcp.json"
  fi
fi

# User-level skill symlink hint
USER_SKILL="$HOME/.cursor/skills/apdr-runtime"
if [[ ! -f "$USER_SKILL/SKILL.md" ]]; then
  mkdir -p "$USER_SKILL"
  cp "$ROOT/skills/apdr-runtime/SKILL.md" "$USER_SKILL/SKILL.md"
  echo "✓ Installed user skill → $USER_SKILL/SKILL.md"
else
  echo "✓ User skill already at $USER_SKILL/SKILL.md"
fi

echo ""
echo "Next steps:"
echo "  1. npm run build   (if not done)"
echo "  2. Restart Cursor"
echo "  3. Chat: 用 APDR 做产品设计：项目 id：demo …"
echo ""
echo "Docs: docs/CURSOR-CONVERSATION.md"
