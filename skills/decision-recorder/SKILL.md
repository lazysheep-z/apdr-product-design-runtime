---
name: apdr-decision-recorder
description: Records key product and design decisions as Markdown ADR (Architecture Decision Records) using MADR format.
---

# Decision Recorder (APDR)

Records key decisions at each pipeline stage using the MADR format ([adr/madr](https://github.com/adr/madr) 2284★).

Call this skill at the END of each pipeline stage, after writing the stage artifact.

## ADR Format

Each decision record is a Markdown file saved under `projects/{projectId}/decisions/`:

```markdown
# ADR-{NNN}: {decision title}

## Context
Why was this decision needed? What constraints or tradeoffs were considered?

## Decision
What was decided? Which option was chosen and why?

## Consequences
What does this mean going forward? What tradeoffs were accepted?

## Metadata
- Stage: {pipeline stage}
- Date: {YYYY-MM-DD}
- Artifact: {artifact type and ID}
- Author: APDR agent ({agent name})
```

## What to Record Per Stage

| Stage | Decisions to Record |
|-------|-------------------|
| intake | Why this product/market? Why these target users? Why exclude other segments? |
| requirements_analysis | Why prioritize these JTBD? Why exclude certain requirements? Key assumptions flagged |
| prd | Why MoSCoW priorities? Feature tradeoffs. Why exclude features? Success metric choices |
| user_flows | Why this flow over alternatives? Design pattern choices. Error handling philosophy |
| information_architecture | Navigation structure decisions. Content grouping logic. Search strategy choices |
| wireframes | Layout patterns. Component placement reasoning. State handling approach |
| ui_design | Design token choices (color palette, typography, spacing). Component design decisions. Dark mode strategy |
| design_review | Issues found, fixes applied, waivers granted |
| frontend_codegen | Tech stack choices. Framework selection. State management approach. API integration patterns |

## Workflow

1. Identify the key decisions made in the current stage
2. For each decision, write an ADR under `projects/{projectId}/decisions/ADR-{NNN}-{slug}.md`
3. Use sequential numbering across the whole project (ADR-001, ADR-002, etc.)
4. Link the ADR back to the stage's artifact in the `Metadata.Artifact` field
5. Reference the ADR in the stage artifact's `provenance.notes`

## Do not

- Record trivial decisions (every line break, every variable name)
- Skip controversial decisions (the ones that need most justification)
- Overwrite existing ADRs — always append new ones
- Use ADRs to replace the stage artifact — they complement it

## References

- [adr/madr](https://github.com/adr/madr) 2284★ — MADR specification
- [joelparkerhenderson/architecture-decision-record](https://github.com/joelparkerhenderson/architecture-decision-record) — ADR overview
