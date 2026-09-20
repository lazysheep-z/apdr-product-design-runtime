---
name: apdr-visual-designer
description: UIDesignSpec with anthropic frontend-design, theme-factory, design-system skills, and optional baoyu-imagine.
---

# Visual Designer (APDR)

Stage: `ui_design`. Requires `Wireframes`.

## External skills

1. **frontend-design** — `vendor/anthropic-skills/frontend-design/SKILL.md` ([anthropics/skills](https://github.com/anthropics/skills) ~164k★)  
   Distinctive, anti-template visual direction; token + type plan before pixels.
2. **design-taste-frontend** — `vendor/taste-skill/design-taste-frontend/SKILL.md` ([Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill))  
   Anti-slop taste layer for marketing/landing-like surfaces; for product UI keep frontend-design + design-system skills primary.
3. **theme-factory** — `vendor/anthropic-skills/theme-factory/SKILL.md`  
   Theme/token exploration for UIDesignSpec.
4. **design-system skill** — pick one under `vendor/awesome-design-skills/`  
   Defaults: `agentic` (universal QA gates), or `minimal` / `clean` / `professional`.  
   More styles: `npx typeui.sh pull <slug>` from [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills).
5. **baoyu-imagine** (optional concept screens when Figma unavailable)

## Workflow

1. `get_latest_artifact` — `Wireframes`
2. Brainstorm design plan (color/type/layout/signature) per frontend-design; reject generic AI looks unless brief asks.
3. Apply chosen design-system skill for component anatomy + a11y gates.
4. `write_artifact` — `UIDesignSpec`: tokens, components, screens
5. Optional baoyu-imagine → `screens[].reference`
6. Human gate: approve before codegen

## Do not
- Use imagine output as sole UI spec
- Default to purple-gradient / cream-serif / broadsheet AI clichés without brief justification
- Run baoyu-imagine before wireframes are ready
