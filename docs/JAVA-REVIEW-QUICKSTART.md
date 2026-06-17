# Java 规范检查 — 最简操作指南

> 配合 Cursor 使用：Agent 约束见 `.cursor/rules/java-code-review-agent.mdc`（只读、Gitee 须索要令牌、零扣分通过）。

## Agent 约束摘要

| 项 | 规则 |
|----|------|
| Gitee | 必须先向用户索要私人令牌，不用旧令牌 |
| 权限 | **只读**代码；不修改、不 commit、不 push |
| 通过 | 总扣分 = 0；有扣分即未通过 |
| 范围 | `--last-commit` 只统计 diff 变更行 |

## 前提（一次性）

```bash
# 1. Cursor 里执行（全局插件，只需一次）
/add-plugin superpowers

# 2. 本仓库依赖（只需一次）
cd 产品相关mcp架构
npm install && npm run build -w @apdr/java-code-reviewer

# 3. Git — macOS 通常已自带，验证：
git --version
# 若没有：xcode-select --install
```

**你当前环境**：Git 2.39.5 已安装，**无需再装**。

---

## 最方便的三条命令（推荐）

| 谁 | 什么时候 | 命令 | 结果 |
|----|----------|------|------|
| **你（审查者）** | 伙伴提 MR 后 | `npm run review:mr` | 只查变更 Java → 自动打开 HTML 报告 |
| **伙伴** | push 前自检 | `npm run review:check` | 同上，不通过不能合（可配 hook） |
| **全员** | 查整个模块 | `npm run review:all -- src/main/java` | 扫全目录 |

### 审查者日常（最省事）

```bash
# 在 Java 项目根目录，或本工具仓库根目录
npm run review:mr
```

浏览器自动打开 `packages/java-code-reviewer/reports/review-report.html`，里面每条违规都有：

- 规范编号（如 **一-12**）
- 扣分（如 **-2 分**）
- 文件行号 + 代码片段

把 `review-report.md` 内容粘贴到 Gitee MR 评论即可。

### 伙伴提交前（可选 git hook）

```bash
# 一次性安装 pre-push hook（在 Java 项目根目录执行）
cp scripts/git-hooks/pre-push .git/hooks/pre-push && chmod +x .git/hooks/pre-push
```

之后每次 `git push` 前自动跑规范检查，未通过会阻止 push。

---

## 上线后理想流程（Gitee 全自动）

```
伙伴开发 → git push → 开 MR
         ↓
Gitee 流水线自动 java-review（--changed-only）
         ↓
  ├─ 通过 → 你 Code Review + 合并
  └─ 未通过 → 流水线红，MR 附 review-report.md
         ↓
伙伴按报告改 → 再 push → 再检
```

流水线模板：`packages/java-code-reviewer/templates/gitee-pipeline.yml`

---

## 环境变量（可选）

| 变量 | 默认 | 说明 |
|------|------|------|
| `JAVA_REVIEW_BASE` | `origin/main` | MR 对比基线分支 |
| `JAVA_REVIEW_RULES` | `team-backend-rules.yaml` | 规则文件 |
| `JAVA_REVIEW_OUT` | `packages/java-code-reviewer/reports` | 报告目录 |
| `JAVA_REVIEW_REPO` | 当前 git 根目录 | Java 项目路径 |

---

## Superpowers 怎么配合

1. **伙伴**：`writing-plans` / TDD 写代码 → push 前 `npm run review:check`
2. **你**：收到 MR → `npm run review:mr` → 打开 HTML 看扣分
3. **你**：invoke **requesting-code-review**，对照 `manual-checks.md` 里无法自动检的条目（一-9 主分支、二-17 提交信息等）
4. **反馈**：把 `review-report.md` + 人工项贴到 MR

---

## 接入 Java 项目（一次性）

```bash
cp -r packages/java-code-reviewer /path/to/java-repo/tools/java-code-reviewer
cp scripts/java-review.sh /path/to/java-repo/scripts/
# 在 java 项目 package.json 加：
# "review:mr": "bash scripts/java-review.sh"
# "review:check": "bash scripts/java-review.sh"
```

或把本仓库作为 submodule 引用工具。
