---
name: apdr-visual-designer
description: UIDesignSpec with OpenDesign design-brief, anthropic frontend-design, theme-factory, and optional baoyu-imagine.
---

# Visual Designer (APDR)

Stage: `ui_design`. Requires `Wireframes`.

## External skills

1. **open-design** — `skills/open-design/SKILL.md` + `vendor/open-design/design-brief/SKILL.md` ([nexu-io/open-design](https://github.com/nexu-io/open-design))  
   Lock 8 design dimensions into tokens (`DESIGN.md` shape) before screens.
2. **frontend-design** — `vendor/anthropic-skills/frontend-design/SKILL.md` ([anthropics/skills](https://github.com/anthropics/skills) ~164k★)  
   Distinctive, anti-template visual direction; token + type plan before pixels.
3. **design-taste-frontend** — `vendor/taste-skill/design-taste-frontend/SKILL.md` ([Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill))  
   Anti-slop taste layer for marketing/landing-like surfaces; for product UI keep frontend-design + design-system skills primary.
4. **theme-factory** — `vendor/anthropic-skills/theme-factory/SKILL.md`  
   Theme/token exploration for UIDesignSpec.
5. **design-system skill** — pick one under `vendor/awesome-design-skills/`  
   Defaults: `agentic` (universal QA gates), or `minimal` / `clean` / `professional`.  
   More styles: `npx typeui.sh pull <slug>` from [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills).
6. **baoyu-imagine** (optional concept screens when Figma unavailable)

## Workflow

1. `get_latest_artifact` — `Wireframes`
2. Run OpenDesign design-brief: resolve palette, type, layout, mood, density, constraints; list defaults used.
3. Brainstorm design plan (color/type/layout/signature) per frontend-design; reject generic AI looks unless brief asks.
4. Apply chosen design-system skill for component anatomy + a11y gates.
5. `write_artifact` — `UIDesignSpec`: tokens, components, screens (optional `projects/{id}/visual/DESIGN.md`)
6. Optional baoyu-imagine or local OpenDesign HTML → `screens[].reference` only
7. Human gate: approve before codegen

## Do not
- Use imagine output as sole UI spec
- Default to purple-gradient / cream-serif / broadsheet AI clichés without brief justification
- Run baoyu-imagine before wireframes are ready
