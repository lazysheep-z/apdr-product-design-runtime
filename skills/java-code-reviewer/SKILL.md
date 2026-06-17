---
name: java-code-reviewer
description: Use when reviewing Java code against team coding standards, scoring violations, generating deduction reports, or setting up Gitee CI checks for Java MRs. Triggers on Java规范检查, 代码扣分, java-review, Gitee MR 检查.
---

# Java Code Reviewer

## Agent 强制约束（必须遵守）

1. **Gitee**：访问 Gitee 前必须先向用户索要私人令牌；禁止使用已删除的旧令牌；令牌不得写入仓库。
2. **只读**：仅读取代码并运行检查生成报告；**禁止**修改代码、`git commit`、`git push`、创建 PR（除非用户单次明确授权）。
3. **通过标准**：总扣分 = 0 才算通过；有任何扣分即为未通过。
4. **范围**：`--last-commit` 时仅统计 diff 新增/修改行。

完整条文：`.cursor/rules/java-code-review-agent.mdc`

## When to use

- 伙伴提交 Java 代码后，需要按团队规范检查并扣分
- 需要生成 HTML/JSON 报告，展示「哪条规范 → 哪行代码 → 扣多少分」
- 配置 Gitee 流水线在 MR 时自动检查

## Workflow

1. **确认规则文件** — `packages/java-code-reviewer/rules/default-rules.yaml`（或项目内 `tools/java-code-reviewer/rules/`）
2. **运行检查**（推荐一条命令）：

```bash
npm run review:mr          # 审查者：查 MR 变更，自动打开 HTML 报告
npm run review:check       # 伙伴：push 前自检
npm run review:all -- src/main/java   # 扫全目录
```

或底层命令：

```bash
npm run build -w @apdr/java-code-reviewer
npm run java-review -- --path <java-src-dir> --format html,json,console --out reports
```

3. **解读报告** — 打开 `reports/review-report.html` 或 `review-report.md`
4. **反馈给提交者** — 复制违规明细到 Gitee MR 评论，每条含 specRef + 行号 + 代码片段

## 映射你的规范

用户若有「文字版规范」，逐条写入 `rules/default-rules.yaml`：

- `specRef` = 规范章节号
- `deduction` = 扣分
- `checker` = 检查器类型（见 `docs/JAVA-CODE-REVIEW-SETUP.md`）

## 证据要求

引用 **verification-before-completion**：声称「检查通过」前必须运行 `java-review` 并展示 `finalScore` 与 `violationCount`。

## 参考

- 完整接入：`docs/JAVA-CODE-REVIEW-SETUP.md`
- **最简操作**：`docs/JAVA-REVIEW-QUICKSTART.md`
- Gitee CI 模板：`packages/java-code-reviewer/templates/gitee-pipeline.yml`
