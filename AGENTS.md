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

| Stage | baoyu (slash commands) | Superpowers |
|-------|------------------------|-------------|
| requirements | `/baoyu-url-to-markdown`, format | brainstorming |
| user_flows / IA | `/baoyu-diagram` | — |
| ui_design | `/baoyu-imagine` | — |
| prd (optional) | `/baoyu-slide-deck` | — |
| frontend_codegen | **none** | writing-plans, TDD, subagent-dev |

Curated list: `integrations/baoyu/CURATED.md`. User setup: `docs/BAOYU-SETUP.md`.

## Pipeline stages

`intake` → `requirements_analysis` → `prd` → `user_flows` → `information_architecture` → `wireframes` → `ui_design` → `frontend_codegen`

## Skill integration (ongoing)

User will provide external skill names + GitHub URLs. Update:

1. `docs/skill-integration.md`
2. `packages/core/src/agents/definitions.ts`
3. Matching `skills/*/SKILL.md`

Do not bypass human gates on PRD, RequirementsAnalysis, or UIDesignSpec unless user explicitly opts out.

## Java 规范检查（Agent）

对业务 Java 仓库做规范评分时，遵守 `.cursor/rules/java-code-review-agent.mdc`：

- Gitee 操作前**先向用户索要私人令牌**
- **只读**业务代码，不修改、不提交
- 零扣分才算通过；`--last-commit` 仅统计 diff 变更行

命令与文档：`docs/JAVA-REVIEW-QUICKSTART.md`、`skills/java-code-reviewer/SKILL.md`
