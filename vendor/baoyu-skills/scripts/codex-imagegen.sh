#!/bin/bash
# codex-imagegen: generate images via Codex CLI's built-in image_gen tool
# Thin shell wrapper — implementation in codex-imagegen/main.ts (Bun TypeScript)
#
# Usage: ./codex-imagegen.sh --help

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if command -v bun &>/dev/null; then
    BUN_X="bun"
elif command -v npx &>/dev/null; then
    BUN_X="npx -y bun"
else
    echo "Error: bun or npx required. Install: brew install oven-sh/bun/bun" >&2
    exit 1
fi

exec $BUN_X "$SCRIPT_DIR/codex-imagegen/main.ts" "$@"
