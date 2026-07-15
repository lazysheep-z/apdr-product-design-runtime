---
name: apdr-visual-designer
description: UIDesignSpec artifact; concept screens via baoyu-imagine when Figma is unavailable.
---

# Visual Designer (APDR)

Stage: `ui_design`. Requires `Wireframes`.

## External skill

**baoyu-imagine** — `/baoyu-imagine --prompt "..." --image projects/{projectId}/visual/screen-01.png --ar 9:16`  
Requires API key — see `docs/BAOYU-SETUP.md`.  
Upstream: `vendor/baoyu-skills/skills/baoyu-imagine/SKILL.md`

## Workflow

1. `get_latest_artifact` — `Wireframes`
2. `write_artifact` — `UIDesignSpec`: tokens, components, screens
3. For key screens without Figma: generate concept images with `baoyu-imagine`
4. Set `screens[].reference` to image paths under `projects/{projectId}/visual/`
5. Human gate: `approve_artifact` type `UIDesignSpec` before codegen

## Do not

- Use imagine output as sole UI spec — tokens + components required in artifact
- Run baoyu-imagine before wireframes are approved
