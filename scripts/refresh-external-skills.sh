#!/usr/bin/env bash
# Refresh selected external skills used by APDR (jsDelivr / raw mirrors).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)/vendor"

download() {
  local dest="$1" url="$2"
  mkdir -p "$(dirname "$dest")"
  curl -fsSL --max-time 40 "$url" -o "$dest"
  echo "OK $(wc -c <"$dest" | tr -d ' ') $dest"
}

echo "== addy-agent-skills =="
for s in idea-refine frontend-ui-engineering documentation-and-adrs spec-driven-development code-review-and-quality browser-testing-with-devtools planning-and-task-breakdown; do
  download "$ROOT/addy-agent-skills/$s/SKILL.md" \
    "https://cdn.jsdelivr.net/gh/addyosmani/agent-skills@main/skills/$s/SKILL.md"
done

echo "== anthropic-skills =="
for s in frontend-design theme-factory web-artifacts-builder webapp-testing docx pdf pptx xlsx doc-coauthoring; do
  download "$ROOT/anthropic-skills/$s/SKILL.md" \
    "https://cdn.jsdelivr.net/gh/anthropics/skills@main/skills/$s/SKILL.md"
done

echo "== awesome-design-skills =="
for s in agentic minimal clean professional; do
  download "$ROOT/awesome-design-skills/$s/SKILL.md" \
    "https://cdn.jsdelivr.net/gh/bergside/awesome-design-skills@main/skills/$s/SKILL.md"
done

echo "== larksuite-cli (docs only, no credentials) =="
for s in lark-shared lark-doc lark-wiki lark-drive lark-sheets lark-base lark-slides; do
  download "$ROOT/larksuite-cli/$s/SKILL.md" \
    "https://cdn.jsdelivr.net/gh/larksuite/cli@main/skills/$s/SKILL.md"
done
for ref in lark-doc-fetch.md lark-doc-xml.md lark-doc-md.md lark-doc-update.md; do
  download "$ROOT/larksuite-cli/lark-doc/references/$ref" \
    "https://cdn.jsdelivr.net/gh/larksuite/cli@main/skills/lark-doc/references/$ref" || true
done

echo "== vercel-labs/skills find-skills =="
download "$ROOT/vercel-labs-skills/find-skills/SKILL.md" \
  "https://cdn.jsdelivr.net/gh/vercel-labs/skills@main/skills/find-skills/SKILL.md"

echo "== vercel-labs/agent-skills =="
download "$ROOT/vercel-agent-skills/web-design-guidelines/SKILL.md" \
  "https://cdn.jsdelivr.net/gh/vercel-labs/agent-skills@main/skills/web-design-guidelines/SKILL.md"
download "$ROOT/vercel-agent-skills/react-best-practices/SKILL.md" \
  "https://cdn.jsdelivr.net/gh/vercel-labs/agent-skills@main/skills/react-best-practices/SKILL.md"
download "$ROOT/vercel-agent-skills/react-best-practices/AGENTS.md" \
  "https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-best-practices/AGENTS.md" || true

echo "== vercel-labs/agent-browser stub =="
download "$ROOT/vercel-agent-browser/SKILL.md" \
  "https://raw.githubusercontent.com/vercel-labs/agent-browser/main/skills/agent-browser/SKILL.md"

echo "== mattpocock/skills (selected) =="
download "$ROOT/mattpocock-skills/grilling/SKILL.md" \
  "https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grilling/SKILL.md" || true
download "$ROOT/mattpocock-skills/grill-me/SKILL.md" \
  "https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grill-me/SKILL.md" || true
download "$ROOT/mattpocock-skills/grill-with-docs/SKILL.md" \
  "https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/grill-with-docs/SKILL.md" || true
download "$ROOT/mattpocock-skills/tdd/SKILL.md" \
  "https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/tdd/SKILL.md" || true
download "$ROOT/mattpocock-skills/improve-codebase-architecture/SKILL.md" \
  "https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/improve-codebase-architecture/SKILL.md" || true
download "$ROOT/mattpocock-skills/codebase-design/SKILL.md" \
  "https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/codebase-design/SKILL.md" || true
download "$ROOT/mattpocock-skills/domain-modeling/SKILL.md" \
  "https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/domain-modeling/SKILL.md" || true
download "$ROOT/mattpocock-skills/handoff/SKILL.md" \
  "https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/handoff/SKILL.md" || true
download "$ROOT/mattpocock-skills/research/SKILL.md" \
  "https://cdn.jsdelivr.net/gh/mattpocock/skills@main/skills/engineering/research/SKILL.md" || true

echo "== marketing-skills (competitor / customer research) =="
download "$ROOT/marketing-skills/competitor-profiling/SKILL.md" \
  "https://cdn.jsdelivr.net/gh/coreyhaines31/marketingskills@main/skills/competitor-profiling/SKILL.md" || true
download "$ROOT/marketing-skills/customer-research/SKILL.md" \
  "https://cdn.jsdelivr.net/gh/coreyhaines31/marketingskills@main/skills/customer-research/SKILL.md" || true

echo "== pm-skills market research extras =="
for s in market-sizing sentiment-analysis competitor-analysis; do
  download "$ROOT/pm-skills/pm-market-research/skills/$s/SKILL.md" \
    "https://cdn.jsdelivr.net/gh/phuryn/pm-skills@main/pm-market-research/skills/$s/SKILL.md" || true
done
download "$ROOT/pm-skills/pm-product-strategy/skills/swot-analysis/SKILL.md" \
  "https://cdn.jsdelivr.net/gh/phuryn/pm-skills@main/pm-product-strategy/skills/swot-analysis/SKILL.md" || true

echo "== optional tavily / firecrawl =="
download "$ROOT/tavily-skills/tavily-research/SKILL.md" \
  "https://cdn.jsdelivr.net/gh/tavily-ai/skills@main/skills/tavily-research/SKILL.md" || true

echo "== nexu-io/open-design (subset only) =="
download "$ROOT/open-design/design-brief/SKILL.md" \
  "https://raw.githubusercontent.com/nexu-io/open-design/main/skills/design-brief/SKILL.md" || true
download "$ROOT/open-design/design-templates/critique.md" \
  "https://raw.githubusercontent.com/nexu-io/open-design/main/design-templates/critique/SKILL.md" || true

echo "Done. Feishu auth stays on the machine via lark-cli; never commit secrets."
echo "OpenDesign: skills/open-design/SKILL.md (no desktop app, no API keys)."
echo "Leaderboard review: docs/skills-sh-leaderboard-review.md"
echo "Research pack review: docs/research-skills-review.md"
echo "See vendor/pm-skills/README.md and skills/feishu-lark/SKILL.md"
