#!/usr/bin/env bash
# Clone or update obra/superpowers into vendor/superpowers
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$ROOT/vendor/superpowers"

if [[ -d "$TARGET/.git" ]]; then
  echo "Updating vendor/superpowers ..."
  git -C "$TARGET" pull --ff-only
else
  echo "Cloning into vendor/superpowers ..."
  mkdir -p "$ROOT/vendor"
  git clone --depth 1 https://github.com/obra/superpowers.git "$TARGET"
fi

echo "Done. Skills at: $TARGET/skills/"
echo "Cursor marketplace (optional): in Agent chat run /add-plugin superpowers"
