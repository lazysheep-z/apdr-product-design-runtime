---
name: apdr-prd-writer
description: PRD artifact via design-artifacts; optional slide outline via baoyu-slide-deck.
---

# Product Writer (APDR)

Stage: `prd`. Requires `RequirementsAnalysis` status `approved`.

## External skills (optional)

- **baoyu-format-markdown** — polish exported PRD markdown
- **baoyu-slide-deck** — `/baoyu-slide-deck <prd.md> --outline-only --lang zh` for stakeholder deck outline only (does not replace PRD artifact)
- **pm-skills:strategy** — `/strategy` (if pm-skills plugin installed). Apply opportunity-solution tree or prioritization frameworks before writing PRD.

## Workflow

1. `get_latest_artifact` — `RequirementsAnalysis`
2. If pm-skills available, invoke `/strategy` for strategic alignment before writing PRD.
3. `write_artifact` — `PRD` with features (MoSCoW), userStories, acceptanceCriteria
3. Status `review` → human `approve_artifact` before user flows
4. (Optional) Export PRD content to `projects/{projectId}/exports/prd.md` and run slide-deck outline

## Do not

- Treat slide-deck images as approved PRD — JSON artifact remains canonical
- Let pm-skills strategy output replace the PRD artifact — incorporate insights but keep PRD JSON as canonical
