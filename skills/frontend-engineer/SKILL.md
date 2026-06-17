---
name: apdr-frontend-engineer
description: Code from approved UIDesignSpec via Superpowers plans + TDD; artifacts via MCP.
---

# Frontend Engineer (APDR)

Stage: `frontend_codegen`. Requires `UIDesignSpec` status `approved`.

## External skills (Superpowers only — no baoyu)

1. **writing-plans** — `vendor/superpowers/skills/writing-plans/SKILL.md`
2. **using-git-worktrees** — isolated branch
3. **subagent-driven-development** — task execution + review
4. **test-driven-development** — red/green/refactor

Install Cursor plugin: `/add-plugin superpowers`

## Workflow

1. `get_latest_artifact` — `UIDesignSpec`, `PRD` (summary)
2. Invoke **writing-plans**; save plan under `projects/{projectId}/plans/` or `docs/superpowers/plans/`
3. Implement with **subagent-driven-development** + TDD
4. `scaffold_frontend` (repo MCP) if needed
5. `write_artifact` — `CodeBundle` with rootPath, routes, previewUrl

## Do not

- Use baoyu-imagine or slide-deck in this stage
- Start coding before `UIDesignSpec` is `approved`
