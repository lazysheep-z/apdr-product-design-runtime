# Java 代码规范检查工具 — 团队分发包

基于《后端日常开发检查评估准则(PHP、Go、Java).docx》的自动化检查工具，生成 HTML/JSON/Markdown 报告，按规范条目扣分。

## 环境要求

- **Node.js 20+**（`node --version`）
- **Git**（检查 commit / MR 变更时需要）
- 被检查的 **Java 项目**（含 `.git` 目录）

## 安装（一次性）

### 方式 A：拷进 Java 项目（推荐）

将整个分发包里的 **`tools`** 和 **`scripts`** 两个文件夹，复制到你的 Java 项目**根目录**（与 `pom.xml` 同级）：

```
你的Java项目/
├── pom.xml
├── tools/java-code-reviewer/    ← 从本包复制
└── scripts/                     ← 从本包复制
    ├── java-review.sh
    └── serve-report.sh
```

目录结构应与本包一致，无需改路径。

### 方式 B：仅拷贝工具目录

若已有 `scripts/`，只需复制 `tools/java-code-reviewer/`。

### 首次运行前（可选）

本包已包含编译好的 `dist/`，一般**可直接运行**。若 `dist/` 缺失或需重建：

```bash
cd tools/java-code-reviewer
npm install
npm run build
```

## 日常使用

在 **Java 项目根目录** 执行：

```bash
# 检查最近一次 commit 的 Java 变更（推荐）
bash scripts/java-review.sh --last-commit

# 检查相对 master 分支的 MR 变更
bash scripts/java-review.sh

# 扫描指定目录
bash scripts/java-review.sh --all src/main/java
```

### 查看报告

- **HTML**（推荐）：`tools/java-code-reviewer/reports/review-report.html`
- **Markdown**（贴 MR 评论）：`tools/java-code-reviewer/reports/review-report.md`
- **JSON**：`tools/java-code-reviewer/reports/review-report.json`

### 局域网分享报告（可选）

```bash
# 先跑检查，再启动 HTTP 服务
bash scripts/java-review.sh --last-commit
REPORT_PORT=8766 bash scripts/serve-report.sh
```

终端会打印 `http://<本机IP>:8766/review-report.html`，同事同网段可访问。

## 通过标准

| 结果 | 条件 |
|------|------|
| **通过** | 总扣分 = **0** |
| **未通过** | 有任何扣分项（一、二类别） |

- 「三、一般合规项」扣 **0 分**，仅提示，不影响通过判定。
- `--last-commit` 模式：**只统计 git diff 新增/修改行**，不把文件里历史存量问题算进本次。

## 扣分规则

| 类别 | 扣分 |
|------|------|
| 一、核心红线 | -2 分/项 |
| 二、优化建议 | -1 分/项 |
| 三、一般合规项 | 0 分（提示） |

规则配置文件：`tools/java-code-reviewer/rules/team-backend-rules.yaml`  
需人工检查的条目：`tools/java-code-reviewer/rules/manual-checks.md`

## 本包目录说明

```
java-code-reviewer-分发包/
├── README.md                          ← 本说明
├── 后端日常开发检查评估准则(...).docx  ← 规范原文
├── tools/java-code-reviewer/
│   ├── dist/                          ← 检查器（已编译）
│   ├── rules/                         ← 规则 YAML
│   ├── package.json
│   └── reports/                       ← 报告输出目录
├── scripts/
│   ├── java-review.sh                 ← 一键检查
│   └── serve-report.sh                ← 局域网看报告
└── gitee/
    └── gitee-pipeline.yml             ← Gitee CI 模板（可选）
```

## Gitee CI（可选）

将 `gitee/gitee-pipeline.yml` 内容配置到仓库流水线，可在 MR 时自动检查。详见 Gitee 流水线文档。

## 常见问题

**Q：报告里得分 82 为什么还显示未通过？**  
A：通过看**总扣分是否为 0**，不是看得分是否 ≥70。

**Q：需要 Cursor 吗？**  
A：不需要。命令行 + 浏览器即可。

**Q：会改我的代码吗？**  
A：不会。只读代码、只生成报告。

**Q：Windows 能用吗？**  
A：建议在 Git Bash / WSL 下运行 `bash scripts/java-review.sh`。或直接用 Node：

```bash
node tools/java-code-reviewer/dist/cli.js \
  --rules tools/java-code-reviewer/rules/team-backend-rules.yaml \
  --changed-only --base HEAD~1 \
  --format html,json,markdown,console \
  --out tools/java-code-reviewer/reports \
  --repo-root .
```

## 版本

- 工具版本：0.1.0
- 规则来源：后端日常开发检查评估准则 docx
- 打包日期：2026-06-08
