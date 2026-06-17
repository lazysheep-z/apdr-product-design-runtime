# AI Product Design Runtime (APDR)

从产品需求到前端页面的 AI 设计运行时：需求分析 → PRD → 用户流 → 信息架构 → 低保真 → UI 规范 → 代码生成。

## 架构分层

| 层级 | 位置 | 职责 |
|------|------|------|
| Atomic Capabilities | `packages/core/src/capabilities` | 可组合、可测试的原子操作 |
| Workflows | `packages/core/src/workflows` | 阶段状态机、审批 gate |
| Agents | `packages/core/src/agents` | 目标导向执行体（prompt + 工具绑定） |
| Orchestrator | `packages/orchestrator` | CLI / workflow 引擎 |
| MCP Servers | `packages/mcp-servers/*` | 对外部世界的 I/O 边界 |

## 快速开始

### 对话模式（推荐）

在 Cursor 里用聊天跑完整流水线：

```bash
npm install
npm run build
bash scripts/setup-cursor.sh   # 生成 .cursor/mcp.json + 安装入口 Skill
```

重启 Cursor 后发送：

```
用 APDR 做产品设计：
项目 id：my-app
标题：团队任务看板
需求：<你的产品想法>
```

详见 **[docs/CURSOR-CONVERSATION.md](docs/CURSOR-CONVERSATION.md)**（可转发给同事）。

入口 Skill：`skills/apdr-runtime/SKILL.md`  
主 MCP 工具：`get_next_action` · `start_project`

### CLI 模式

```bash
npm install
npm run build

# 初始化示例项目
npm run init-project -- --id demo --title "Demo App"

# 查看项目状态
npm run orchestrator -- status --project demo

# 启动 design-artifacts MCP（供 Cursor 配置）
npm run dev:artifacts-mcp
```

## Cursor MCP 配置示例

在 `.cursor/mcp.json` 或用户 MCP 设置中加入：

```json
{
  "mcpServers": {
    "design-artifacts": {
      "command": "node",
      "args": [
        "/绝对路径/产品相关mcp架构/packages/mcp-servers/design-artifacts/dist/index.js"
      ],
      "env": {
        "APDR_PROJECTS_ROOT": "/绝对路径/产品相关mcp架构/projects"
      }
    }
  }
}
```

## 目录

- `docs/` — 架构与 schema 说明
- `packages/core` — 核心类型、artifact 存储、registry
- `packages/orchestrator` — 工作流 CLI
- `packages/mcp-servers/` — MCP 服务
- `skills/` — 阶段 Skills + **`apdr-runtime` 对话入口**
- `templates/` — wireframe / React 模板
- `projects/` — 运行时项目数据

## MVP 进度

- [x] M0: Artifact schema + 本地 store + design-artifacts MCP
- [x] M1 骨架: PRD workflow + agents 定义
- [x] **对话运行时**: `apdr-runtime` Skill + MCP `get_next_action` / `start_project`
- [ ] M2–M6: 与你提供的 skills 逐步集成

## 外部 Skills

| 包 | 仓库内 | Cursor 插件 |
|----|--------|-------------|
| Superpowers | `vendor/superpowers/` · `npm run install-superpowers` | `/add-plugin superpowers` |
| baoyu（精选 5 个） | `vendor/baoyu-skills/` · `npm run install-baoyu` | 见 [docs/BAOYU-SETUP.md](docs/BAOYU-SETUP.md) |

**操作手册**：[docs/BAOYU-SETUP.md](docs/BAOYU-SETUP.md)（含按阶段命令、API Key、与 Superpowers 顺序）

## 下一步

请提供你现有的 **skill 名称** 与 **GitHub 链接**，我会逐一映射到 workflow 阶段并更新 `skills/` 与 `docs/skill-integration.md`。
