# AI Product Design Runtime (APDR) v0.3.0

> Author: **Joker (张超阳)**

从一句产品需求到前端代码的 AI 产品设计流水线。支持 **Codex、Cursor、Claude Code** 等任意 MCP 协议兼容工具。

[![GitHub](https://img.shields.io/badge/GitHub-apdr--product--design--runtime-blue)](https://github.com/lazysheep-z/apdr-product-design-runtime)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 一句话

APDR = **5 个 MCP Server** + **16 个 Skill 文件** + **11 阶段流水线**

AI 对话工具通过 MCP 协议接入后，即可自动完成从需求录入到前端代码生成的整条产品设计流程，你只需在关键节点审阅放行。

---

## 11 阶段流水线

| # | 阶段 | 产出 | 人工门禁 |
|---|------|------|----------|
| 1 | intake | ProjectBrief (结构化需求) | 可选 |
| 2 | requirements_analysis | RequirementsAnalysis (JTBD/风险) | **必须** |
| 3 | prd | PRD (MoSCoW/验收标准/数据契约) | **必须** |
| 4 | user_flows | UserFlows (含错误路径/权限流) | 可选 |
| 5 | information_architecture | IA (站点地图/搜索/导航) | 可选 |
| 6 | wireframes | Wireframes (HTML + 交互标注) | 可选 |
| 7 | ui_design | UIDesignSpec (Token/组件/概念图) | **必须** |
| 8 | design_review | DesignReviewReport (Token/响应式/a11y) | **必须** |
| 9 | frontend_codegen | CodeBundle (React/Vite + 测试) | 可选 |
| 10 | handoff | HandoffDoc (组件文档/API/部署) | 可选 |
| 11 | quality_eval | QualityReport (全流程评分/覆盖率) | 可选 |

## 特性

- **MCP 原生** — 标准 MCP 协议，不绑定任何特定 AI 工具
- **5 个独立 MCP Server** — design-artifacts(主控)、research(调研)、diagram(图表)、preview(预览)、repo(代码)
- **Human Gate** — 关键阶段需人工确认，非关键阶段自动推进
- **版本化 Artifact** — JSON 信封，支持 rollback/revision/stale 传播
- **Skill 驱动** — 每个阶段有独立 SKILL.md 指令（可用 SkillOpt 自动优化）
- **外部集成** — 支持 pm-skills(19k★)、Superpowers(7k★)、baoyu-skills 等生态
- **适配多种工具** — Codex、Cursor、Claude Code 均可使用

## 快速开始

### 前置要求

- Node.js >= 20
- 支持 MCP 协议的 AI 工具（Codex / Cursor / Claude Code 等）

### 方式一：从 GitHub 克隆

```bash
git clone https://github.com/lazysheep-z/apdr-product-design-runtime.git
cd apdr-product-design-runtime
npm install
npm run build
```

然后在你的 AI 工具中配置 MCP server。配置方式见下方「配置 MCP」。

### 方式二：Codex 市场安装

```bash
codex plugin marketplace add lazysheep-z/apdr-product-design-runtime
```

### 方式三：直接拷贝插件目录

复制 `plugins/apdr-product-design-runtime/` 到你的 `~/plugins/` 下，然后运行：

```bash
bash ~/plugins/apdr-product-design-runtime/setup.sh /path/to/apdr-repo
```

## 配置 MCP

### Cursor

编辑 `.cursor/mcp.json`（将 `<APDR_ROOT>` 替换为你的仓库路径）：

```json
{
  "mcpServers": {
    "design-artifacts": {
      "command": "node",
      "args": ["<APDR_ROOT>/packages/mcp-servers/design-artifacts/dist/index.js"],
      "env": { "APDR_PROJECTS_ROOT": "<APDR_ROOT>/projects" }
    },
    "research": {
      "command": "node",
      "args": ["<APDR_ROOT>/packages/mcp-servers/research/dist/index.js"],
      "env": { "APDR_PROJECTS_ROOT": "<APDR_ROOT>/projects" }
    },
    "preview": {
      "command": "node",
      "args": ["<APDR_ROOT>/packages/mcp-servers/preview/dist/index.js"],
      "env": { "APDR_PROJECTS_ROOT": "<APDR_ROOT>/projects" }
    },
    "repo": {
      "command": "node",
      "args": ["<APDR_ROOT>/packages/mcp-servers/repo/dist/index.js"],
      "env": { "APDR_PROJECTS_ROOT": "<APDR_ROOT>/projects" }
    },
    "diagram": {
      "command": "node",
      "args": ["<APDR_ROOT>/packages/mcp-servers/diagram/dist/index.js"],
      "env": { "APDR_PROJECTS_ROOT": "<APDR_ROOT>/projects" }
    }
  }
}
```

### Codex / Claude Code

通过 Codex Plugin 或 MCP 配置接口添加。参考 `setup.sh` 脚本自动配置。

### 工作流配置 (Cursor Rules)

在 Cursor 中，将 `.cursor/rules/apdr-product-design-runtime.mdc` 设为 `alwaysApply: true`，每次对话时会自动加载 APDR 编排逻辑。

## 技术架构

```
┌──────────────────────────────────────────────────────────┐
│  AI 对话工具 (Codex / Cursor / Claude Code)              │
│  ── 读取 SKILL.md  → 调用 MCP tool → 写入 artifact      │
└──────────┬───────────────────────────────────────────────┘
           │ MCP 协议
           ▼
┌──────────────────────────────────────────────────────────┐
│  design-artifacts  项目创建 / 阶段控制 / Artifact CRUD   │
│  research          网络搜索 / 网页抓取 / 调研笔记        │
│  diagram           Mermaid 流程图 / 时序图 / 站点地图    │
│  preview           本地线框图 / 前端预览服务器           │
│  repo              模板脚手架 / Git 状态查询             │
└──────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│  projects/{id}/    产物目录 (JSON + HTML + 代码)         │
│  skills/           16 个 SKILL.md 指令文件               │
│  packages/         8 个 npm 包（core/orchestrator/MCP）  │
└──────────────────────────────────────────────────────────┘
```

## 项目结构

```
apdr-product-design-runtime/
├── packages/
│   ├── core/                  # 类型定义 + 能力注册 + artifact schemas
│   ├── orchestrator/          # CLI + pipeline 引擎
│   ├── mcp-shared/            # MCP server 公共工具
│   └── mcp-servers/
│       ├── design-artifacts/  # 主控 MCP
│       ├── research/          # 调研 MCP
│       ├── preview/           # 预览 MCP
│       ├── repo/              # 代码 MCP
│       └── diagram/           # 图表 MCP
├── skills/                    # 16 个 agent SKILL.md
│   ├── intake/                # 需求录入
│   ├── requirements-analyst/  # 需求分析
│   ├── prd-writer/            # PRD 撰写
│   ├── ux-flow/               # 用户流
│   ├── information-architect/ # 信息架构
│   ├── wireframe-designer/    # 线框图
│   ├── visual-designer/       # UI 设计
│   ├── design-reviewer/       # 设计审查
│   ├── frontend-engineer/     # 前端生成
│   ├── frontend-code-reviewer/# 代码审查
│   ├── test-strategy/         # 测试策略
│   ├── handoff/               # 交接文档
│   ├── quality-evaluator/     # 质量评估
│   └── ...                    # 其他辅助技能
├── projects/                  # 项目数据
├── templates/                 # 脚手架模板
├── vendor/                    # 外部技能 (Superpowers, baoyu)
├── docs/                      # 文档
└── skillopt/                  # SkillOpt 配置（可选）
```

## 版本历史

详见 [CHANGELOG.md](CHANGELOG.md)

- **v0.3.0** (2026-06-24) — 11 阶段流水线，7 个新 skill，质量评估
- **v0.2.0** (2026-06-17) — 8 阶段流水线，5 个 MCP Server，Codex Plugin
- **v0.1.0** (2026-06-10) — 初始版本

## 相关项目

- [phuryn/pm-skills](https://github.com/phuryn/pm-skills) 19k★ — PM 技能市场
- [microsoft/SkillOpt](https://github.com/microsoft/SkillOpt) 7.7k★ — SKILL.md 自动优化
- [obra/superpowers](https://github.com/obra/superpowers) 7k★ — 工程方法论
- [JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills) — 内容生产技能集

## 许可

MIT License. Copyright (c) 2026 Joker (张超阳)
