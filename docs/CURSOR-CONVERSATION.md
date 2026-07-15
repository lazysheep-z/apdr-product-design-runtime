# 通过对话跑完整产品设计流水线

APDR（AI Product Design Runtime）让你**用对话完成**完整产品设计流程，支持 MCP 协议兼容的 AI 工具（Codex / Cursor / Claude Code）。

需求分析 → PRD → 用户流 → 信息架构 → 线框图 → UI → 设计审查 → 前端代码 → 交接文档 → 质量评估

## 一分钟上手（本机）

```bash
git clone <本仓库 URL>
cd ai-product-design-runtime
npm install
npm run build
bash scripts/setup-cursor.sh
```

重启 Cursor，在聊天里说：

```
用 APDR 做产品设计：
项目 id：demo-app
标题：我的产品
需求：我想做一个……
```

Agent 会调用 MCP `get_next_action` 并逐步带你走完 8 个阶段。

## 发给同事的安装包

把**整个仓库**发给对方（或 fork），对方只需：

| 步骤 | 操作 |
|------|------|
| 1 | `npm install && npm run build` |
| 2 | `bash scripts/setup-cursor.sh` |
| 3 | （可选）`npm run install-superpowers && npm run install-baoyu` |
| 4 | 把 `skills/apdr-runtime` 加到 Cursor Skills（见下） |
| 5 | 重启 Cursor |

### 配置 MCP

`scripts/setup-cursor.sh` 会生成 `.cursor/mcp.json`（若不存在），注册：

- **design-artifacts** — 流水线主 MCP（`start_project`、`get_next_action`、`write_artifact` 等）

环境变量 `APDR_PROJECTS_ROOT` 默认指向 `<仓库>/projects`。

### 配置 Skill（推荐）

**方式 A — 项目内 Skill（可提交到 git）**

Skill 已在 `skills/apdr-runtime/SKILL.md`。在 Cursor Settings → Rules / Skills 中确保 Agent 能发现项目 `skills/` 目录（或将该文件复制到个人 `~/.cursor/skills/apdr-runtime/SKILL.md`）。

**方式 B — 用户级 Skill（最适合分发）**

```bash
mkdir -p ~/.cursor/skills/apdr-runtime
cp skills/apdr-runtime/SKILL.md ~/.cursor/skills/apdr-runtime/
```

对方打开**任意**工作区时，说「APDR」也会触发——但 MCP 仍需指向本仓库构建产物，因此**推荐以本仓库为工作区根目录**使用。

## 对话指令备忘

| 用户说 | Agent 应做 |
|--------|------------|
| 新建 + 需求描述 | `start_project` → 完善 Brief → 审批 → `advance_pipeline` |
| 继续 APDR 项目 `{id}` | `get_next_action` → 执行当前 stage skill |
| 批准 / 继续 | `approve_latest_artifact` → `advance_pipeline` → `get_next_action` |
| 进度？ | `get_pipeline_status` |

## MCP 工具一览

```
start_project          # 从自然语言创建项目
get_next_action        # ★ 每轮对话的主驱动
write_artifact         # 写入阶段产物 JSON
approve_latest_artifact
advance_pipeline
get_latest_artifact / read_artifact
get_pipeline_status
list_projects
```

## 产物在哪里

```
projects/{project_id}/
  meta.json
  runtime.json
  artifacts/          # 版本化 JSON 信封
  research/           # 调研 markdown（baoyu）
  wireframes/         # 低保真 HTML
  app/                # 生成的前端（codegen 阶段）
```

## 与 CLI 的关系

```bash
npm run orchestrator -- status --project demo-app
npm run orchestrator -- approve --project demo-app --type PRD
npm run orchestrator -- advance --project demo-app
```

对话模式与 CLI **共用同一套** `projects/` 数据；可混用。

## 故障排查

- **MCP 红叉**：`npm run build`，检查 `.cursor/mcp.json` 里 node 路径与 `dist/index.js` 是否存在
- **get_next_action 报错**：确认 `project_id` 正确，`list_projects` 查看
- **无法 advance**：上游 artifact 须为 `approved`，见 `get_next_action` 的 blockers

## 架构说明

详见 [architecture.md](./architecture.md)、[skill-integration.md](./skill-integration.md)。
