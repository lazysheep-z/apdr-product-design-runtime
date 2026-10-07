# OpenDesign (vendored subset)

Source: [nexu-io/open-design](https://github.com/nexu-io/open-design) (Apache-2.0).

This directory is **not** the desktop app. APDR vendors only the skills the pipeline runs inside Cursor:

| Path | Upstream | APDR stage |
|------|----------|------------|
| `design-brief/SKILL.md` | `skills/design-brief` | `ui_design` — lock tokens into `DESIGN.md` shape, then `UIDesignSpec` |
| `design-templates/critique.md` | `design-templates/critique` | `design_review` — five-dimension critique before approve |

Do not commit OpenDesign Cloud keys, BYOK API keys, or local `~/.config` MCP snippets.

Refresh: `bash scripts/refresh-external-skills.sh`.
Adapter: `skills/open-design/SKILL.md`.
