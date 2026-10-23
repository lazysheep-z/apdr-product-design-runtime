---
name: apdr-frontend-engineer
description: Code from approved UIDesignSpec via Superpowers + Addy UI engineering + Anthropic frontend-design; artifacts via MCP.
---

# Frontend Engineer (APDR)

Stage: `frontend_codegen`. Requires `UIDesignSpec` status `approved` (and DesignReview when present).

## External skills

### Planning & execution (Superpowers + Addy)
1. **writing-plans** — `vendor/superpowers/skills/writing-plans/SKILL.md`
2. **planning-and-task-breakdown** — `vendor/addy-agent-skills/planning-and-task-breakdown/SKILL.md`
3. **using-git-worktrees** — isolated branch
4. **subagent-driven-development** + **Superpowers TDD**
5. **mattpocock `/tdd`** — `vendor/mattpocock-skills/tdd/SKILL.md`（seam 纪律、反模式）

### UI quality
6. **frontend-ui-engineering** — `vendor/addy-agent-skills/frontend-ui-engineering/SKILL.md`
7. **frontend-design** — `vendor/anthropic-skills/frontend-design/SKILL.md` (match approved UIDesignSpec)

### Performance & review
8. **vercel-react-best-practices** — `vendor/vercel-agent-skills/react-best-practices/SKILL.md`（细则见同目录 `AGENTS.md`）
9. **code-review-and-quality** — `vendor/addy-agent-skills/code-review-and-quality/SKILL.md`  
   Also see `skills/frontend-code-reviewer/SKILL.md`

## Workflow

1. `get_operator_preference`：`incremental`/`patch_ui` 在既有应用上改；`copy_only`/`docOnlyGuard` 只改文案，改字段前先列影响点等确认。遵守 `get_next_action` 交付护栏。
2. `get_latest_artifact` — `UIDesignSpec`, `PRD` (summary), `DesignReviewReport`
3. writing-plans / planning-and-task-breakdown → save under `projects/{projectId}/plans/`
4. Implement with subagent-driven-development + TDD（SP 流程 + Matt seam）+ frontend-ui-engineering
5. React/Next 性能自检：读 `react-best-practices/AGENTS.md` 高优先级规则
6. `scaffold_frontend` (repo MCP) if needed（仅 greenfield 或缺脚手架时）
7. Multi-axis review via code-review-and-quality
8. 若 `deliveryMode` 含 `preview`：保持项目既有 preview host/端口约定（勿改回 localhost-only）
9. 若 `deliveryMode` 含 `offline-html` 且项目有打包脚本（如 `pack:single`）：生成后校验，只交付约定的单文件
10. `write_artifact` — `CodeBundle` with rootPath, routes, previewUrl（相对路径，无本机用户目录）

## Next stage

有本地可运行页面时，使用 preview `run_browser_checks` 对本次变更做实际交互/截图验证，并用 `audit_accessibility` 检查相关页面；先查 `local_tools_status`、`list_browser_tools`，不要猜工具参数。只读本地适配器不支持 POST/API 写入测试，完整集成测试仍按项目脚本执行。证据相对路径与代码/页面版本写入 CodeBundle 的 provenance.notes。纯文案变更按影响面验证，不强制完整扫描；既有 LAN 预览约定不变，可从本机环回地址访问同一服务取证。

After CodeBundle advances → optional **backend_codegen**（若 includeBackend）→ **code_intelligence**。

## Do not
- Use baoyu-imagine in this stage
- Start coding before `UIDesignSpec` is `approved`
- Claim done without verification / tests
- 把密钥、个人路径或飞书账号写进代码 / artifact / 提交记录
