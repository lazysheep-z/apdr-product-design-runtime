# AI Product Design Runtime — Agent Guide

## Repository purpose

Orchestrate product design from requirements to frontend via versioned artifacts and MCP tools.

## Conversation mode (primary)

Read **`skills/apdr-runtime/SKILL.md`** when the user says APDR / 产品设计流水线.

Every turn: MCP `design-artifacts` → **`get_next_action`** (or **`start_project`** for new work).

Setup: `npm run setup-cursor` · Docs: `docs/CURSOR-CONVERSATION.md`

## Key commands

```bash
npm install && npm run build
npm run init-project -- --id <id> --title "<title>"
npm run orchestrator -- status --project <id>
npm run orchestrator -- approve --project <id> --type ProjectBrief
npm run orchestrator -- advance --project <id>
```

## MCP

Enable `design-artifacts` first (see `.cursor/mcp.json.example`). Agents must read/write artifacts through MCP, not ad-hoc files in `projects/`.

**Conversation drivers:** `start_project`, `get_next_action`, `approve_latest_artifact`, `advance_pipeline`

## External skills

| Stage | External skills |
|-------|-----------------|
| intake / requirements | operator-preference, document-io, feishu-lark, idea-refine, grill-me, grill-with-docs, **competitive-research**, matt research, marketing competitor-profiling/customer-research, pm-skills（SWOT/TAM/personas）, brainstorming, baoyu capture |
| prd | spec-driven-development, grill-with-docs, research report + SWOT, doc-coauthoring, document-io/feishu, pm strategy/lean-canvas |
| user_flows / IA | baoyu-diagram, pm customer-journey-map |
| ui_design / design_review | anthropic frontend-design, taste-skill, theme-factory, awesome-design-skills, vercel web-design-guidelines, agent-browser |
| frontend_codegen | Superpowers plans/TDD + Matt `/tdd` + vercel-react-best-practices + Addy frontend-ui + code-review |
| backend_codegen（可选） | backend-engineer + `skills/backend-skills/*`；`includeBackend=false` 时跳过 |
| code_intelligence | CodeGraph + optional improve-codebase-architecture |
| handoff / quality | documentation-and-adrs, document-io/feishu, verification-before-completion, browser/webapp/agent-browser, react-best-practices |

Curated docs: `docs/skill-integration.md`. Refresh vendors: `bash scripts/refresh-external-skills.sh`.

## Pipeline stages

`intake` → `requirements_analysis` → `prd` → `user_flows` → `information_architecture` → `wireframes` → `ui_design` → `design_review` → `frontend_codegen` → `backend_codegen`（可选）→ `code_intelligence` → `handoff` → `quality_eval`

New projects: ask whether backend codegen is needed (`includeBackend`). User backend skills go in `skills/backend-skills/`.

## Skill integration (ongoing)

User will provide external skill names + GitHub URLs. Update:

1. `docs/skill-integration.md`
2. `packages/core/src/agents/definitions.ts`
3. Matching `skills/*/SKILL.md`

Do not bypass human gates on PRD, RequirementsAnalysis, or UIDesignSpec unless user explicitly opts out.

## Privacy

See `docs/privacy.md`. Never commit Feishu credentials, personal account ids, or local project workspaces with business data.
