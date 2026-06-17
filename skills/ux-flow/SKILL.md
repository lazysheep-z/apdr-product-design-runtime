---
name: apdr-ux-flow
description: UserFlows artifact plus baoyu-diagram SVG exports from approved PRD.
---

# UX Strategist (APDR)

Stage: `user_flows`. Requires `PRD` status `approved`.

## External skill

**baoyu-diagram** — `/baoyu-diagram "<task flow>" --type flowchart|sequence --lang zh`  
Upstream: `vendor/baoyu-skills/skills/baoyu-diagram/SKILL.md`

## Workflow

1. `get_latest_artifact` — `PRD`
2. `write_artifact` — `UserFlows` with `flows[]` (include `mermaid` per flow in content)
3. For each critical flow, run `/baoyu-diagram` and save SVG under:
   - `projects/{projectId}/diagram/flows/`
4. Record SVG paths in `provenance.notes` or flow metadata
5. `approve_artifact` gate before IA stage

## Do not

- Replace `UserFlows` JSON with only images — artifact is source of truth
- Use `baoyu-infographic` for product UI wireframes
