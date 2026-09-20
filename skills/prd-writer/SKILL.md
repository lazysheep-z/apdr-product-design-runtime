---
name: apdr-prd-writer
description: Full PRD with MoSCoW, stories, AC, data contracts; powered by spec-driven-development and pm strategy skills.
---

# Product Writer (APDR)

Stage: `prd`. Requires `RequirementsAnalysis` status `approved`.

## External skills

1. **spec-driven-development** — `vendor/addy-agent-skills/spec-driven-development/SKILL.md`  
   Gated Specify → Plan mindset for the **product** PRD (not application code yet).
2. **grill-with-docs** — `vendor/mattpocock-skills/grill-with-docs/SKILL.md`（揪缺口、歧义、术语矛盾）
3. **competitive-research / SWOT** — 消费 `projects/{id}/research/`；可补 `swot-analysis`
4. **doc-coauthoring** — `vendor/anthropic-skills/doc-coauthoring/SKILL.md`（长 PRD 共创）
5. **document-io / feishu-lark** — 可选导出 Word/PPTX 或发布到飞书（canonical 仍是 PRD JSON）
6. **pm product-strategy / lean-canvas** — `vendor/pm-skills/pm-product-strategy/skills/`
7. **baoyu-format-markdown** / **baoyu-slide-deck** (optional stakeholder exports)

## Workflow

1. `get_latest_artifact` — `RequirementsAnalysis`
2. Surface assumptions (spec-driven) before drafting features.
3. Optional lean-canvas / product-strategy for prioritization context.
4. For each requirement define: MoSCoW feature, user stories, Given/When/Then AC, data contracts, success metrics.
5. `write_artifact` PRD → human approve → advance.
6. Optional: export markdown + slide outline.

## Do not
- Treat slide-deck as canonical PRD
- Let strategy canvases replace PRD JSON
- Write AC without happy + error paths
