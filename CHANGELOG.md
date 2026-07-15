# Changelog

## v0.3.1 (2026-07-15)

### Cleanup
- 移除示例/业务项目产物（`finance-dashboard`、`brand-digital-intel`）
- MCP 配置仅保留 design-artifacts / research / preview / repo / diagram（可选 codegraph）主流程 server

## v0.3.0 (2026-06-24)

### New Pipeline Stages
- **design_review** — 设计审查门禁，置于 UI 设计和前端代码之间。检查 token 一致性、组件覆盖度、响应式、无障碍 (WCAG AA)。
- **handoff** — 交接文档生成，位于流水线末尾。产出组件文档、构建说明、API 契约、部署指南。
- **quality_eval** — 最终质量评估，收官阶段。对全部产物做评分，验证 PRD 特性→用户流→线框→组件的覆盖率。

### New Skills (8 skills)
- `skills/intake/SKILL.md` — 专用需求录入技能，集成 pm-skills 发现链
- `skills/design-reviewer/SKILL.md` — 设计审查，引用 axe-core(7k★)
- `skills/frontend-code-reviewer/SKILL.md` — 前端代码审查，引用 shadcn-ui(117k★)
- `skills/test-strategy/SKILL.md` — 测试策略，引用 vitest(16k★)+playwright(91k★)
- `skills/handoff/SKILL.md` — 开发者交接文档，引用 storybook(90k★)
- `skills/ux-writer/SKILL.md` — UX 文案策略，引用 trpc(40k★)
- `skills/quality-evaluator/SKILL.md` — 质量评估，实现 eval.artifact.quality + eval.coverage.feature_flow
- `skills/wireframe-designer/SKILL.md` — 重写(11→39行)，引用 excalidraw(126k★)+tldraw(48k★)

### Enhanced Skills (4 skills)
- `skills/information-architect/SKILL.md` — 增强(20→37行)，新增内容审计、搜索策略、分类法
- `skills/ux-flow/SKILL.md` — 增强(27→48行)，新增错误路径、权限流、系统边界
- `skills/prd-writer/SKILL.md` — 增强(27→53行)，新增数据契约、成功指标、Given/When/Then
- `skills/apdr-runtime/SKILL.md` — 更新 11 阶段流水线描述

### External Integrations
- **phuryn/pm-skills** (19k★) — intake 和 requirements 阶段集成 /discover + /strategy + /plan-market-research
- **microsoft/SkillOpt** (7.7k★) — 可选 skill 自动优化，配置文件位于 `skillopt/apdr-skillopt-config.yaml`
- Referenced 11 high-star GitHub repos (all 5000+★) across new skills

### Infrastructure
- 流水线从 8 阶段扩展到 11 阶段
- 5 个 MCP Server 全部从 stub 升级为真实实现
- Pipeline 引擎新增 rollback/revision/stale 管理
- Orchestrator CLI 新增 rollback/revise/diff/stale 命令
- Capability Registry 从 11 个扩展到 45+ 个能力
- Codex Plugin 已创建，支持市场安装

## v0.2.0 (2026-06-17)

- 8-stage design pipeline with 5 MCP servers
- Core artifact schemas and store (JSON file-based)
- Skill-based agent system with Superpowers + baoyu integrations
- Pipeline engine with stage advancement and human gates
- Orchestrator CLI (init/status/advance/approve)
- Codex plugin with marketplace support

## v0.1.0 (2026-06-10)

- Initial project structure
- Monorepo with npm workspaces
- TypeScript configuration
- Basic package scaffolding
