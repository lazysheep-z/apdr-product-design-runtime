---
name: apdr-backend-engineer
description: >
  Optional APDR backend_codegen stage. Generates API/service code from approved PRD + frontend CodeBundle.
  Skipped when ProjectBrief.includeBackend is false. User-provided backend skills live under skills/backend-skills/.
---

# Backend Engineer (APDR)

Stage: `backend_codegen`（**可选**）。上游：`PRD` + `CodeBundle`（前端）。

## 何时运行

1. Intake 已问过用户「是否需要生成后端代码？」
2. `ProjectBrief.includeBackend === true`（或 `meta.includeBackend === true`）
3. 若为 `false` / 未设置：引擎在 `advance_pipeline` 时**自动跳过**本阶段 → `code_intelligence`

## External / drop-in skills

| 来源 | 路径 | 说明 |
|------|------|------|
| Superpowers | `vendor/superpowers/skills/writing-plans`、`test-driven-development` | 计划 + TDD |
| Addy | `vendor/addy-agent-skills/documentation-and-adrs` | API/架构决策 ADR |
| **用户后续提供** | `skills/backend-skills/*/SKILL.md` | **优先调用**；你提供新 skill 后放入此目录即可 |

执行本阶段时：

1. 列出 `skills/backend-skills/` 下所有 `*/SKILL.md`
2. 按 description 匹配当前栈/任务，**先读再执行**用户 skill
3. 若目录为空：用本文件下方「默认实现」完成最小可用后端

## Workflow

1. `get_latest_artifact` — `PRD`、`CodeBundle`、`ProjectBrief`（确认 `includeBackend`）
2. 若 `includeBackend !== true`：告知用户将跳过 → `advance_pipeline`
3. 与用户确认栈（默认 `node-express` 或用户 skill 指定）
4. Invoke writing-plans（或用户 backend skill 的计划步骤）
5. 在 `projects/{projectId}/server/`（或用户 skill 指定路径）实现：
   - 路由 / handlers 对齐 PRD 功能与前端 `CodeBundle.routes` 所需 API
   - 数据模型、校验、错误形状
   - `.env.example`（**不要**写入真实密钥）
6. TDD：至少覆盖核心 endpoint 的 happy path
7. `write_artifact` type `BackendCodeBundle`：

```json
{
  "stack": "node-express",
  "rootPath": "projects/{projectId}/server",
  "apiBasePath": "/api",
  "endpoints": [{ "method": "GET", "path": "/api/...", "description": "..." }],
  "dataModels": [{ "name": "Entity", "fields": ["id", "..."] }],
  "envVars": ["DATABASE_URL", "PORT"],
  "notes": "skills used: ..."
}
```

8. 可选 approve → advance → `code_intelligence`

## 默认实现（无用户 skill 时）

- Express + TypeScript 最小脚手架
- 按 PRD `must` 功能生成 REST stub（可先返回 mock）
- `README.md`：启动命令、环境变量说明
- 禁止把生产密钥写入仓库

## Do not

- 在 `includeBackend=false` 时仍强行写后端
- 跳过 `write_artifact BackendCodeBundle`
- 把 app_secret / 数据库密码写入 artifact 或代码明文
- 替代前端 `CodeBundle`（两端分开）
