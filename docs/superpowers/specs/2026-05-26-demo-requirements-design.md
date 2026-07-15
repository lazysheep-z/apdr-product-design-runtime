# Demo Product — Requirements Clarification (Superpowers brainstorming)

**Date:** 2026-05-26  
**APDR project:** `demo`  
**Stage:** `intake` → preparing `requirements_analysis`  
**Upstream artifact:** `demo:brief:v1` (draft, minimal: "M0 smoke test")

## Context explored

- Orchestrator: `demo` at stage 1/8 (`intake`), `ProjectBrief` draft only, `can advance: yes`.
- `skills/requirements-analyst/SKILL.md` already mandates **superpowers:brainstorming** before `RequirementsAnalysis`.
- Gap: brief has no goals, personas, or constraints — brainstorming must happen *before* structured artifact write.

## Purpose of this demo

Validate the **APDR + Superpowers handoff**: conversational clarification → written spec → `RequirementsAnalysis` JSON via `design-artifacts` MCP → human `approve` → `advance`.

Not building product features yet (HARD-GATE: no implementation until spec approved).

## Three approaches for what "Demo Product" should prove

| Approach | What it tests | Trade-off |
|----------|---------------|-----------|
| **A. Pipeline smoke (recommended)** | End-to-end artifact chain with thinnest real content: brief → requirements → skip optional PRD → minimal user flow → stub UI spec → scaffold frontend | Fastest proof Superpowers + APDR wiring; weak as a "real" product demo |
| **B. Superpowers-only engineering slice** | Treat demo as a tiny CLI/tool inside this repo; skip user_flows/ui_design | Proves `writing-plans` + TDD path only; does not exercise design pipeline |
| **C. Full product slice** | One vertical feature (e.g. "news intake dashboard") through all 8 stages | Best narrative demo; slowest; needs real URLs/research (baoyu) |

**Recommendation:** Approach **A** — matches `problemStatement: "M0 smoke test"` and exercises the integration your `docs/skill-integration.md` Phase 1 describes.

## Design (Approach A)

### In scope

1. Enrich `ProjectBrief` with one persona, two goals, one non-goal, one constraint.
2. Produce `RequirementsAnalysis` covering orchestrator, MCP artifacts, and Superpowers spec/plan linkage.
3. One primary job-to-be-done: *operator runs pipeline commands and sees stage/artifact status*.
4. Explicit assumption: `design-artifacts` MCP is enabled in Cursor.

### Out of scope

- Production UI polish, auth, deployment.
- Java code review workflow (separate skill).
- Forking Superpowers skills into APDR core.

### Success criteria

- `npm run orchestrator -- status --project demo` shows `requirements_analysis` complete with `RequirementsAnalysis` in `review` or `approved`.
- This spec file path is referenced in artifact `provenance.notes`.
- No application code written before user approves this spec.

### Error handling

- If MCP unavailable: document blocker in `openQuestions`; do not hand-edit `projects/demo/artifacts/*.json` (AGENTS.md rule).
- If brief stays empty: do not advance past `requirements_analysis`.

## Mapping → `RequirementsAnalysis` artifact (draft)

Use after user approves this spec; write via MCP `write_artifact`:

```json
{
  "problems": [
    "Design artifacts are scattered without a governed pipeline",
    "Agents may skip clarification and write ad-hoc files under projects/"
  ],
  "jobsToBeDone": [
    "As a pipeline operator, I can see current stage and next artifact so I know what to approve",
    "As an agent, I can run brainstorming before structuring requirements so assumptions are explicit"
  ],
  "assumptions": [
    "design-artifacts MCP is configured per .cursor/mcp.json.example",
    "Demo is disposable and safe to reset"
  ],
  "risks": [
    "Superpowers spec/plan files may drift from JSON artifacts without provenance links",
    "Empty ProjectBrief leads to hollow RequirementsAnalysis if brainstorming is skipped"
  ],
  "openQuestions": [
    "Should demo advance through PRD or skip to user_flows for M0?",
    "Will demo use baoyu research URLs or synthetic content only?"
  ],
  "summary": "M0 validates APDR orchestration with Superpowers brainstorming feeding RequirementsAnalysis; Approach A is a thin vertical pipeline smoke test, not a customer-facing product."
}
```

## Provenance (for agents)

- Skills: `superpowers:brainstorming` (this document)
- Next: user approval → `write_artifact` RequirementsAnalysis → `approve` → optional `advance`
- Later stage (`frontend_codegen`): `superpowers:writing-plans` + `test-driven-development` per AGENTS.md

## Spec self-review

- [x] No TBD placeholders in required fields
- [x] Consistent with Approach A scope
- [x] Single implementation plan scope (requirements stage only)
- [x] Ambiguity flagged in `openQuestions` rather than left implicit
