# baoyu-skills 安装与使用（APDR）

## 一、仓库内已完成的安装

```bash
cd "/Users/chaoyang/Documents/工作文件/爬虫获取新闻_20260318/产品相关mcp架构"
bash scripts/install-baoyu-skills.sh   # 更新 vendor/baoyu-skills
```

- 源码位置：`vendor/baoyu-skills/skills/`
- APDR 包装说明：`skills/*/SKILL.md`（告诉 Agent 何时调用哪个 baoyu skill）
- 精选列表：`integrations/baoyu/CURATED.md`

## 二、你必须在 Cursor 里做的两步（启用 slash 命令）

仓库 vendored **不等于** Cursor 能自动识别 baoyu 命令。请在 **Agent 对话** 执行：

```text
/plugin marketplace add JimLiu/baoyu-skills
```

```text
/plugin install baoyu-skills@baoyu-skills
```

安装后可用 `/baoyu-diagram`、`/baoyu-imagine` 等（与 README 一致）。

验证：让 Agent「列出已安装的 baoyu 相关 skill」或试跑：

```text
/baoyu-diagram "用户登录流程" --type flowchart --lang zh
```

## 三、环境依赖

| 依赖 | 用途 |
|------|------|
| Node.js 20+ | 已满足 APDR 构建 |
| `bun` 或 `npx` | baoyu 脚本执行（`brew install oven-sh/bun/bun` 推荐） |
| `design-artifacts` MCP | 读写 PRD / UserFlows 等 artifact（见 README） |

### baoyu-imagine 首次配置（出图）

第一次用 `baoyu-imagine` 前，在项目或用户目录创建配置：

```bash
mkdir -p .baoyu-skills/baoyu-imagine
```

在 `.baoyu-skills/.env` 或 `~/.baoyu-skills/.env` 中配置**至少一个** API Key，例如：

```bash
OPENAI_API_KEY=sk-...
# 或 GOOGLE_API_KEY=...
# 或 DASHSCOPE_API_KEY=...
```

按 skill 引导完成 `EXTEND.md`（首次运行会提示）。详见 `vendor/baoyu-skills/skills/baoyu-imagine/SKILL.md`。

## 四、与 Superpowers 一起用（推荐顺序）

| 顺序 | 工具 | 做什么 |
|------|------|--------|
| 1 | APDR + `design-artifacts` MCP | 结构化 Brief → PRD → 用户流 → IA → 线框 → UI Spec |
| 2 | **baoyu**（本页） | 调研抓页、SVG 图、概念屏、汇报 PPT |
| 3 | **Superpowers** | `UIDesignSpec` 批准后：`writing-plans` + TDD 写代码 |

```text
/add-plugin superpowers
```

前端阶段 **只用 Superpowers**，不要用 baoyu 出图代替 UI Spec。

## 五、按 APDR 阶段操作手册

假设项目 id 为 `demo`（先 `npm run init-project -- --id demo --title "我的产品"`）。

### 1. 需求分析（requirements_analyst）

1. 打开 Agent，确认已装 `design-artifacts` MCP（`.cursor/mcp.json.example`）
2. 竞品/参考页：

```text
/baoyu-url-to-markdown https://竞品文档地址
```

3. 将摘要写入 artifact：

```text
用 design-artifacts 读取 demo 的 ProjectBrief，结合调研结果 write_artifact RequirementsAnalysis，然后等我 approve
```

4. 终端审批：

```bash
npm run orchestrator -- approve --project demo --type RequirementsAnalysis
npm run orchestrator -- advance --project demo
```

### 2. 用户流（ux_strategist）

PRD `approved` 后：

```text
读取 demo 的 PRD，生成 UserFlows artifact；对主流程用 /baoyu-diagram 生成 sequence 图，SVG 保存到 projects/demo/diagram/ 并在 artifact 的 provenance.notes 里记录路径
```

```bash
npm run orchestrator -- approve --project demo --type UserFlows
npm run orchestrator -- advance --project demo
```

### 3. 信息架构（information_architect）

```text
根据 demo 的 UserFlows 和 PRD 写 InformationArchitecture；用 /baoyu-diagram --type structural 画站点/组件结构图
```

### 4. UI 设计（visual_designer）

```text
读取 demo 的 Wireframes，写 UIDesignSpec；关键屏用 /baoyu-imagine 生成概念图，reference 路径写入 screens[].reference
```

```bash
npm run orchestrator -- approve --project demo --type UIDesignSpec
npm run orchestrator -- advance --project demo
```

### 5. PRD 汇报稿（可选，product_writer）

```text
/baoyu-slide-deck projects/demo/artifacts/PRD导出.md --outline-only --lang zh
```

（需先把 PRD artifact 内容导出为 md，或让 Agent 从 `read_artifact` 生成临时 md。）

### 6. 前端代码（frontend_engineer）

```text
UIDesignSpec 已 approved。使用 Superpowers writing-plans，再 subagent-driven-development 实现；最后用 design-artifacts 写 CodeBundle。
```

## 六、常见问题

**Q: 只 vendored 了仓库，命令无效？**  
A: 必须执行第二节的 `/plugin install`。

**Q: baoyu 和 Superpowers 同时触发？**  
A: 需求/设计阶段优先 APDR + baoyu；写代码阶段只说「实现」并点名 Superpowers，避免同时跑 brainstorming 和出图。

**Q: 图表产物放哪？**  
A: 建议 `projects/{projectId}/diagram/`、`projects/{projectId}/visual/`，并在 artifact `provenance.notes` 或 `screens[].reference` 记录相对路径。

## 七、更新 baoyu

```bash
bash scripts/install-baoyu-skills.sh
```

Cursor 插件：`/plugin` → Marketplaces → baoyu-skills → Update marketplace
