#!/usr/bin/env bash
# APDR × Ruflo Integration Setup
# Installs ruflo and configures the multi-agent swarm for APDR
set -euo pipefail

APDR_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== APDR × Ruflo Setup ==="
echo "APDR root: $APDR_ROOT"
echo ""

# Step 1: Install ruflo
if command -v ruflo &>/dev/null; then
    echo "[1/3] ruflo already installed: $(ruflo --version 2>/dev/null || echo 'unknown')"
else
    echo "[1/3] Installing ruflo (npm)..."
    cd "$APDR_ROOT"
    npm install ruflo
    echo "  ✓ ruflo installed"
fi

# Step 2: Configure ruflo-config.yaml with correct APDR_ROOT
CONFIG_FILE="$APDR_ROOT/packages/ruflo-apdr/config/ruflo-config.yaml"
if [ -f "$CONFIG_FILE" ]; then
    echo "[2/3] Configuring paths in ruflo-config.yaml..."
    # Replace <APDR_ROOT> placeholders with actual path
    sed -i '' "s|<APDR_ROOT>|$APDR_ROOT|g" "$CONFIG_FILE"
    echo "  ✓ Paths configured"
fi

# Step 3: Smoke test
echo "[3/3] Verifying ruflo..."
if command -v ruflo &>/dev/null; then
    ruflo --help 2>&1 | head -5 || echo "  (run 'npx ruflo --help' for help)"
    echo "  ✓ ruflo ready"
else
    echo "  ! ruflo not in PATH. Try: npx ruflo --help"
fi

echo ""
echo "=== Setup complete ==="
echo ""
echo "Start APDR swarm:"
echo "  npx ruflo start --config $CONFIG_FILE"
echo ""
echo "Config file: $CONFIG_FILE"
echo "Docs: $APDR_ROOT/packages/ruflo-apdr/README.md"
