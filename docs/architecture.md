# Architecture

## Layers

1. **Atomic capabilities** — `packages/core/src/registry/capabilities.ts`
2. **Workflows** — `packages/core/src/workflows/pipeline.ts`
3. **Agents** — `packages/core/src/agents/definitions.ts` + `skills/*/SKILL.md`
4. **Orchestrator** — `packages/orchestrator` (CLI, gates, stage advance)
5. **MCP** — `packages/mcp-servers/*` (artifact I/O, research, preview, repo)

## Artifact flow

```
ProjectBrief → RequirementsAnalysis → PRD → UserFlows → IA → Wireframes → UIDesignSpec → CodeBundle
```

Each artifact is a versioned JSON envelope under `projects/{id}/artifacts/`.

## Human gates (default)

| Artifact | Gate |
|----------|------|
| RequirementsAnalysis | required |
| PRD | required |
| UIDesignSpec | required |
| Others | optional |

## Skill integration (pending)

When you provide skill names + GitHub links, we update:

- `packages/core/src/agents/definitions.ts` — `skillPath`, `mcpServers`
- `skills/<agent>/SKILL.md` — copied or linked instructions
- `docs/skill-integration.md` — mapping table

See `docs/skill-integration.md` for the template.
