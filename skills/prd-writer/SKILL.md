---
name: apdr-prd-writer
description: Full PRD with features (MoSCoW), user stories, acceptance criteria, data contracts, success metrics, and feature dependencies.
---

# Product Writer (APDR)

Stage: `prd`. Requires `RequirementsAnalysis` status `approved`.

## External skills (optional)

- **baoyu-format-markdown** — polish exported PRD markdown
- **baoyu-slide-deck** — `/baoyu-slide-deck <prd.md> --outline-only --lang zh` for stakeholder deck outline
- **pm-skills:strategy** — `/strategy` (if pm-skills installed). Apply opportunity-solution tree or prioritization frameworks.

## Workflow

1. `get_latest_artifact` — `RequirementsAnalysis`
2. If pm-skills available: invoke `/strategy` for strategic alignment before writing PRD.
3. For each requirement, define:

   a) **Feature definition**
      - id, name, description
      - Priority: MoSCoW (must / should / could / wont)
      - Dependencies on other features
      - Target release / milestone

   b) **User stories**
      - "As a [persona], I want to [goal], so that [reason]"
      - At least one story per persona per feature

   c) **Acceptance criteria**
      - Given/When/Then format
      - Happy path + error path criteria
      - Edge cases and boundary conditions

   d) **Data contracts** (if applicable)
      - Input fields expected, output fields returned
      - Data types, formats, validation rules
      - Reference: [trpc/trpc](https://github.com/trpc/trpc) 40k★ for API contract patterns

4. Define success metrics: how to measure each feature's impact
5. `write_artifact` — `PRD` with features, userStories, acceptanceCriteria, successMetrics
6. Status `review` → human `approve_artifact` before user flows
7. (Optional) Export PRD content to `projects/{projectId}/exports/prd.md` and run slide-deck outline

## Do not
- Treat slide-deck images as approved PRD — JSON artifact remains canonical
- Let pm-skills strategy output replace the PRD artifact — incorporate insights but keep PRD JSON as canonical
- Write acceptance criteria without covering both happy and error paths

## References
- [phuryn/pm-skills](https://github.com/phuryn/pm-skills) 19k★ — prioritization frameworks
- [trpc/trpc](https://github.com/trpc/trpc) 40k★ — API contract patterns