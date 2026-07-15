#!/usr/bin/env bash
# Clone or update JimLiu/baoyu-skills (curated subset documented in integrations/baoyu/CURATED.md)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$ROOT/vendor/baoyu-skills"

if [[ -d "$TARGET/.git" ]]; then
  echo "Updating vendor/baoyu-skills ..."
  git -C "$TARGET" pull --ff-only
else
  echo "Cloning into vendor/baoyu-skills ..."
  mkdir -p "$ROOT/vendor"
  git clone --depth 1 https://github.com/JimLiu/baoyu-skills.git "$TARGET"
fi

echo "Done. $(ls "$TARGET/skills" | wc -l | tr -d ' ') skills in vendor/baoyu-skills/skills/"
echo ""
echo "Next steps (Cursor):"
echo "  1. Agent chat: /plugin marketplace add JimLiu/baoyu-skills"
echo "  2. Agent chat: /plugin install baoyu-skills@baoyu-skills"
echo "  3. For baoyu-imagine: configure API keys — see docs/BAOYU-SETUP.md"
echo ""
echo "APDR uses only these baoyu skills (see integrations/baoyu/CURATED.md):"
cat "$ROOT/integrations/baoyu/CURATED.md" | sed -n '/^| `baoyu/p'
