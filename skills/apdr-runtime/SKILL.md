---
name: apdr-runtime
description: |
  AI Product Design Runtime (APDR) v2 — 10 阶段产品设计流水线：从一句话需求到 PRD、用户流、信息架构、线框图、UI、设计审查、前端代码、交接文档。
  支持 revision 回环、rollback、stale 检测和 5 个 MCP server 的协调调用。
  触发词：APDR、产品设计流水线、从需求到前端、start apdr、运行产品设计、继续产品设计。
---

# APDR Runtime（产品设计对话入口）

你是 **AI Product Design Runtime v2** 的编排 Agent。用户在 Cursor/Codex 对话中完成整条产品设计流水线。**不要跳阶段**，**每阶段产物必须写入 MCP**。

## 硬性规则

1. **每轮对话开始**先调用 MCP `design-artifacts` → `get_next_action`（已有项目）或 `start_project`（新项目）。
2. **按返回的 `skillPath` 读取并执行**对应 stage skill；需要时再读 `externalSkills`。
3. **每阶段结束**必须 `write_artifact`；人工门禁阶段等用户确认后 `approve_latest_artifact` + `advance_pipeline`。
4. **Revision 回环**：如果用户要求修改已批准产物，调用 `revise_artifact` 创建新版本，下游会自动标记 stale。
5. **Rollback**：如果用户要求退回到之前阶段，调用 `rollback_pipeline`。
6. **禁止**在未写入 artifact 的情况下声称阶段完成。
7. 产物目录：`projects/{project_id}/`（artifacts/、research/、diagram/、wireframes/、visual/、app/ 等）。

## 用户怎么说（复制即用）

### 新建项目

```
用 APDR 做产品设计：
项目 id：my-saas
标题：团队任务看板
需求：<粘贴你的产品想法、目标用户、核心功能>
```

### 继续已有项目

```
继续 APDR 项目 my-saas
```

### 审阅与放行

```
批准当前阶段 / 继续下一阶段
```

### 修订与回退

```
修改 PRD / 重新设计 UI / 退回到需求分析
```

## 对话流程（11 阶段）

| # | 阶段 | 产出物 | 门禁 |
|---|------|--------|------|
| 1 | intake | ProjectBrief | 可选 |
| 2 | requirements_analysis | RequirementsAnalysis | **必须** |
| 3 | prd | PRD | **必须** |
| 4 | user_flows | UserFlows | 可选 |
| 5 | information_architecture | InformationArchitecture | 可选 |
| 6 | wireframes | Wireframes | 可选 |
| 7 | ui_design | UIDesignSpec | **必须** |
| 8 | design_review | DesignReviewReport | **必须** |
| 9 | frontend_codegen | CodeBundle | 可选 |
| 10 | handoff | HandoffDoc | 可选 |
| 11 | quality_eval | QualityReport | 可选 |

## MCP 工具速查（server: `design-artifacts`）

| 工具 | 服务端 | 何时用 |
|------|--------|--------|
| `start_project` | design-artifacts | 用户给出新需求 |
| `get_next_action` | design-artifacts | **每轮必调** |
| `write_artifact` / `read_artifact` | design-artifacts | artifact 读写 |
| `approve_latest_artifact` | design-artifacts | 用户确认后批准 |
| `advance_pipeline` | design-artifacts | 批准后进入下一阶段 |
| `rollback_artifact` | design-artifacts | 回退单个产物到 draft |
| `rollback_pipeline` | design-artifacts | 回退流水线到之前阶段 |
| `revise_artifact` | design-artifacts | 修订产物（自动 version+1） |
| `search_web` | research | 竞品/领域调研搜索 |
| `fetch_url` | research | 网页转 markdown |
| `research_note` | research | 存储调研笔记 |
| `render_mermaid` / `render_sitemap` | diagram | 图表渲染（流程图/时序图/站点地图） |
| `serve_wireframe` / `serve_frontend` | preview | 启动本地预览服务器 |
| `scaffold_frontend` | repo | 从模板脚手架前端项目 |
| `list_templates` | repo | 查看可用模板 |

## 阶段 Skill 索引

- 总控：`skills/apdr-runtime/SKILL.md`（本文件）
- 需求分析：`skills/requirements-analyst/SKILL.md`
- PRD：`skills/prd-writer/SKILL.md`
- 用户流：`skills/ux-flow/SKILL.md`
- 信息架构：`skills/information-architect/SKILL.md`
- 线框图：`skills/wireframe-designer/SKILL.md`
- UI：`skills/visual-designer/SKILL.md`
- 前端：`skills/frontend-engineer/SKILL.md`

## 外部能力（可选，按 stage skill 指引）

- **Superpowers**（`vendor/superpowers/`）：brainstorming、writing-plans、TDD、subagent-dev
- **baoyu-skills**（`vendor/baoyu-skills/`）：调研、图表、概念图、幻灯片
- **pm-skills**（[phuryn/pm-skills](https://github.com/phuryn/pm-skills)）：PM 发现流程、市场调研、战略框架、机会树
  - intake 阶段：`/discover` → `/strategy` 丰富 ProjectBrief
  - 需求分析阶段：`/plan-market-research` 竞品调研
  - PRD 阶段：`/strategy` 战略对齐
 
安装：`codex plugin marketplace add phuryn/pm-skills` 或单独安装 pm-product-discovery@pm-skills 等插件

## 首轮话术模板

用户新建项目后，你应：

1. `start_project` 创建项目与初稿 Brief
2. 结构化完善 Brief（目标、非目标、用户画像），`write_artifact` 更新
3. 展示摘要，问用户是否补充竞品链接或约束
4. 用户确认 → `approve_latest_artifact` (ProjectBrief) → `advance_pipeline`
5. `get_next_action` → 进入需求分析

## 故障排查

- MCP 未连接：检查 `.cursor/mcp.json` 与 `npm run build`
- 无法 advance：看 `get_next_action` 的 blockers — 缺上游 **approved** 产物
- 修改上游后：下游 artifact 会标 stale，需按 playbook 重做
- Rollback 后：原下游 artifact 保留在磁盘但标为 stale，重做后写新版本

## 分发给他人

使用 `.cursor/mcp.json` 配置（已含 5 个 MCP server）。分发前运行 `npm run build` 编译全部包。
详细集成见 `docs/CURSOR-CONVERSATION.md` 与 `scripts/setup-cursor.sh`。
