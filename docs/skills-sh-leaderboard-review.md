# skills.sh All-Time 榜单复核（APDR 接入结论）

复核日期：2026-07-29。来源为 skills.sh 安装量榜 + 官方 GitHub；**不采用** WorkBuddy 二次改包，一律绑定 upstream。

| 榜单名（博主） | 官方定位 | GitHub / skills.sh | APDR 结论 | 接入位置 |
|---|---|---|---|---|
| **find-skills** ~260 万 | 发现/安装生态 skill | [vercel-labs/skills](https://github.com/vercel-labs/skills) `find-skills` | **有用（横切）** | `skills/find-skills` + runtime：先查 APDR stage 表，再 `npx skills find` |
| **frontend-design** ~69.5 万 | 高辨识度 UI 实现 | [anthropics/skills](https://github.com/anthropics/skills) `frontend-design` | **有用（已有）** | `ui_design` / `design_review` / `frontend_codegen` |
| **briumi** ~63.7 万 | 多轮追问、挖漏洞 | skills.sh **无此名**；描述与安装量对齐 **[mattpocock/skills grill-me](https://github.com/mattpocock/skills)**（~69 万） | **有用（已有，纠名）** | `intake` / `requirements_analysis`；别名见下 |
| **vercel-react-best-practices** | React/Next 性能规则 ~70 条 | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) `react-best-practices` | **有用（新接入）** | `frontend_codegen` + `quality_eval`（读 `AGENTS.md`） |
| **agent-browser** ~57 万 | 浏览器自动化 CLI | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | **有用（新接入）** | `design_review` / `quality_eval`；需本机安装 CLI；与 Cursor browser MCP 互补 |
| **grillwithdocs** ~53.9 万 | 对照文档/领域词审查计划 | [mattpocock/skills](https://github.com/mattpocock/skills) `grill-with-docs` | **有用（加强绑定）** | `requirements_analysis` / `prd`；依赖 `grilling` + `domain-modeling` |
| **improve-codebase-architecture** ~52.4 万 | 浅模块加深、架构重构规划 | 同上 `improve-codebase-architecture` | **有用（可选）** | `code_intelligence` 之后 / 老项目维护；**非**每项目强制 |
| **tdd** ~50.3 万 | 红绿循环 + seam 纪律 | 同上 `tdd` | **有用（互补）** | `frontend_codegen` / `backend_codegen`；与 Superpowers TDD 并用（Matt=方法论，SP=执行流程） |
| **web-design-tay** ~48.4 万 | UI 上线体检 | skills.sh **无此名**；量级对齐 **[web-design-guidelines](https://github.com/vercel-labs/agent-skills)**（~49.8 万） | **有用（已有，纠名）** | `design_review` / `quality_eval` |
| **microsoft-foundry** | Azure Foundry Agent 全生命周期 | [microsoft/azure-skills](https://github.com/microsoft/azure-skills) / agent-skills | **不接入主流程** | 平台部署/评估工具，与「需求→前端产品设计」正交；用户自装即可 |

## 命名说明

- **briumi**：生态无同名 skill；按能力描述判定为 **grill-me**（WorkBuddy 侧可能改名/音译）。
- **web-design-tay**：生态无同名；按能力与安装量判定为 **web-design-guidelines**。

## 原则

1. Prefer official repos（Vercel / Anthropic / Matt Pocock），不 vendor 博主改版。
2. APDR 阶段 skill 优先于盲目 `find-skills`。
3. `microsoft-foundry`、纯 Azure 运维类不写入默认 pipeline。
