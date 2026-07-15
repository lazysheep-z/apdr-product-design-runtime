---
name: apdr-code-intelligence
description: |
  APDR code_intelligence 阶段 — 全自动 CodeGraph 索引与分析。
  在前端代码生成后自动运行，产出 CodeIntelligenceReport 供 handoff / quality_eval 消费。
---

# Code Intelligence Analyst (APDR)

Pipeline stage: **code_intelligence** (第 10 阶段，位于 frontend_codegen 与 handoff 之间)

Requires: **CodeBundle** approved（或至少已写入 draft 且 app/ 目录存在）

## 目标

全自动完成：

1. 对 `projects/{projectId}/app/` 运行 CodeGraph 索引
2. 提取路由、组件、入口点、文件树
3. 写入 **CodeIntelligenceReport** artifact
4. 自动批准并推进到 handoff（本阶段 humanGate = optional）

## MCP 工具（repo server）

| 工具 | 用途 |
|------|------|
| `build_code_intelligence_report` | **主工具** — 一键 init + explore + 结构化 JSON |
| `index_codebase` | 仅索引（通常不需要单独调用） |
| `codegraph_explore` | 补充探索特定问题 |
| `codegraph_status` | 诊断 CLI / 索引状态 |

## 自动化工作流（按顺序执行，无需用户确认）

1. `get_latest_artifact` — 读取 `CodeBundle`，记下 `rootPath` 与 `routes`
2. 调用 **repo MCP** → `build_code_intelligence_report`:
   ```json
   {
     "project_id": "{projectId}",
     "code_root": "{CodeBundle.rootPath 可选}",
     "bundle_routes": ["{CodeBundle.routes}"]
   }
   ```
3. 将返回 JSON 作为 content，调用 `write_artifact`:
   ```json
   {
     "project_id": "{projectId}",
     "type": "CodeIntelligenceReport",
     "content": { "...build_code_intelligence_report 返回值..." },
     "status": "review"
   }
   ```
4. 展示摘要：indexed、fileCount、routes 数量、components 数量、warnings
5. **自动推进**（无需人工门禁）:
   - `approve_latest_artifact` — type: `CodeIntelligenceReport`
   - `advance_pipeline`
   - `get_next_action` — 应进入 handoff

## CodeGraph 未安装时

`build_code_intelligence_report` 会降级为文件系统扫描（`indexed: false`），仍产出可用报告并在 `warnings` 中提示安装：

```bash
bash scripts/install-codegraph.sh
```

流水线**不应因此阻塞**；handoff 阶段会使用降级数据。

## 产物位置

- Artifact: `projects/{projectId}/artifacts/` — `CodeIntelligenceReport` JSON
- 索引: `projects/{projectId}/app/.codegraph/`

## Do not

- 跳过本阶段直接进入 handoff
- 要求用户手动运行 `codegraph init`（由 MCP 自动完成）
- 在本阶段修改前端代码（属 frontend_codegen）

## 外部参考

- [CodeGraph](https://github.com/colbymchenry/codegraph) — 本地代码知识图谱 MCP
