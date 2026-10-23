# Changelog

## v0.3.9 (2026-10-23)

### Evidence-driven local tools
- Existing preview MCP now exposes local tool status, browser checks and axe accessibility audits; research MCP supports local document conversion with source hashes.
- Add pinned Playwright MCP, axe and MarkItDown adapters, with local-only checks, isolated browser sessions, bounded execution and project-relative evidence.
- Route tools by stage and task type; document-only and copy-only work does not require browser checks. Preserve human approval gates.
- Fix intake agent selection, deduplicate external skills and reuse evidence only for the tested artifact version.
- Unimplemented research search/fetch tools explicitly report unavailable instead of producing placeholder evidence.
- Include installation guidance, a pinned MIT-licensed interface checklist and 11 isolated regression tests.

### Distribution privacy
- Exclude local draft exports, evidence, business workspaces, credentials, machine configuration and backups from distribution.
- Synchronize root package and lockfile versions. Rebuild and reconnect running MCP clients after updating; optional local dependencies require separate installation.

## v0.3.8.1 (2026-10-16)

### Privacy scrub
- Remove personal absolute path from `docs/BAOYU-SETUP.md`
- Sanitizer uses generic `*.feishu.cn` (no tenant hostname)

## v0.3.8 (2026-10-16)

### Habit-driven pipeline shortcuts
- MCP：`get_operator_preference` / `set_operator_preference`（自动脱敏 notes）
- `get_next_action` 附带路线与交付护栏（文案护栏 / LAN 预览 / 离线单 HTML）
- 引擎按偏好跳过阶段：
  - `deliveryTarget=feishu-doc` → PRD 后直达 handoff
  - `taskMode=copy_only` → 跳过 UX/UI/后端/图谱
  - `prototypeMode=incremental` / `patch_ui` → 跳过可选 UX
- 上游门禁可按路线放宽（如增量 codegen 只需 PRD）

## v0.3.7 (2026-09-21)

### OpenDesign
- 接入 [nexu-io/open-design](https://github.com/nexu-io/open-design) 精选能力，不入库桌面端
- `ui_design`：`design-brief` 锁定 token → `UIDesignSpec`
- `design_review`：critique 五维自评
- 适配层：`skills/open-design/SKILL.md`

## v0.3.6 (2026-09-20)

### Operator habits（协作默认）
- `skills/operator-preference`：推荐默认值（中文 / concise / strict / patch / incremental）
- 新增字段：`prototypeMode`、`docOnlyGuard`、`deliveryMode`
- `apdr-runtime` / `intake` / `frontend-engineer` 对齐：严格门禁、增量改造、文案护栏、预览/离线交付约定

### Privacy
- `.gitignore`：默认不发布 `projects/*` 业务工作区（仅保留 demo / conv-test 占位）
- 屏蔽飞书 CLI 凭证、本机 MCP 绝对路径配置
- README / LICENSE 去掉实名署名，仅保留公开维护者标识

## v0.3.5 (2026-07-29)

### 竞品分析 / 查资料 / 写报告
- 统一入口：`skills/competitive-research/SKILL.md`
- 评审：`docs/research-skills-review.md`
- 接入：mattpocock `research`、marketing `competitor-profiling` + `customer-research`（适配 APDR MCP）、pm `market-sizing` / `sentiment-analysis` / `swot-analysis`
- 可选：`tavily-research`、`firecrawl-market-research`（需本机密钥）
- **不接入**：SEO vs 落地页、站会报告、学术文献流水线

## v0.3.4 (2026-07-29)

### skills.sh 榜单复核与接入
- 评审文档：`docs/skills-sh-leaderboard-review.md`（官方源，不用 WorkBuddy 改版）
- **新接入**：`react-best-practices`、`agent-browser` 适配、`tdd` / `improve-codebase-architecture` / `codebase-design`、`find-skills` 适配
- **加强绑定**：`grill-with-docs` → requirements/PRD；`grill-me` 标注榜单别名 *briumi*；`web-design-guidelines` 标注 *web-design-tay*
- **不接入主流程**：`microsoft-foundry`（Azure Agent 平台，与产品设计流水线正交）

## v0.3.3 (2026-07-29)

### Backend codegen（可选阶段）
- 新增流水线阶段 `backend_codegen` → artifact `BackendCodeBundle`
- Intake **必问**是否需要后端；`ProjectBrief.includeBackend` + `meta.includeBackend`
- `includeBackend=false` 时 `advance_pipeline` / `get_next_action` 自动跳过该阶段
- Skill：`skills/backend-engineer/SKILL.md`；用户扩展目录：`skills/backend-skills/`

## v0.3.2 (2026-07-29)

### Document I/O + Feishu
- 接入 anthropic `docx`/`pdf`/`pptx`/`xlsx`/`doc-coauthoring` → `skills/document-io`
- 接入官方 `larksuite/cli` 文档类 skills → `skills/feishu-lark`（不入库任何 CLI ID/密钥）
- `.gitignore` 屏蔽 `.lark-cli/`、`appsecret*`、加密凭证文件

### Skill wave (GitHub 热门接入)
- 调研并接入：addyosmani/agent-skills、anthropics/skills、phuryn/pm-skills 子集、bergside/awesome-design-skills 起步集
- 新增横切 `skills/operator-preference/SKILL.md`（多轮门禁协作习惯）
- 更新 `packages/core` agent definitions + stage playbooks + 各阶段 `SKILL.md`
- 新增 `scripts/refresh-external-skills.sh`；vendor 目录增加 addy/anthropic/awesome-design/pm-skills

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
