# Java 代码规范检查 — 接入指南

## 你现在已经有什么

本仓库已内置 **`@apdr/java-code-reviewer`** 工具，具备：

| 能力 | 说明 |
|------|------|
| 规则配置 | `rules/team-backend-rules.yaml` — **已映射团队 docx 规范** |
| 多格式报告 | console / JSON / HTML / Markdown |
| 精确代码定位 | 文件、行号、上下文代码片段 |
| 扣分汇总 | 按类别、按规范条目统计 |
| Git 变更扫描 | `--changed-only` 只检查 PR/MR 中改动的 `.java` |
| Gitee CI 模板 | `templates/gitee-pipeline.yml` |

## 快速验证（本仓库内）

```bash
npm install
npm run build -w @apdr/java-code-reviewer
npm run java-review:sample
```

报告输出在 `packages/java-code-reviewer/reports/`：
- `review-report.html` — 可视化报告（推荐给团队看）
- `review-report.json` — 机器可读，可对接看板
- `review-report.md` — 可粘贴到 Gitee MR 评论

## 接入你的 Java 项目（3 步）

### 第 1 步：把工具放进 Java 仓库

任选一种方式：

**A. 子目录拷贝（最简单）**

```bash
cp -r packages/java-code-reviewer /path/to/your-java-repo/tools/java-code-reviewer
cd /path/to/your-java-repo/tools/java-code-reviewer && npm install && npm run build
```

**B. Git Submodule**

```bash
git submodule add <本仓库地址> tools/java-code-reviewer
```

### 第 2 步：把你的「文字版规范」映射到 rules.yaml

打开 `rules/default-rules.yaml`，对每一条规范：

```yaml
- id: N001              # 工具内部 ID，唯一
  category: 命名规范      # 分类（报告汇总用）
  specRef: "1.1"         # ← 填你规范文档的章节号
  title: 类名使用 UpperCamelCase   # ← 规范标题
  description: ...       # ← 规范原文说明
  deduction: 3           # ← 扣分值
  severity: error        # error | warning | info
  checker: naming-class  # 检查器类型（见下表）
```

#### 可用检查器

| checker | 用途 |
|---------|------|
| `naming-class` | 类名 UpperCamelCase |
| `naming-method` | 方法名 lowerCamelCase |
| `naming-constant` | 常量 UPPER_SNAKE_CASE |
| `naming-variable` | 局部变量 lowerCamelCase |
| `missing-javadoc-class` | 类缺 Javadoc |
| `missing-javadoc-public-method` | public 方法缺 Javadoc |
| `wildcard-import` | 禁止 `import xxx.*` |
| `empty-catch` | 空 catch 块 |
| `system-out` | 禁止 System.out/err |
| `magic-number` | 魔法数字 |
| `public-field` | public 非 final 字段 |
| `todo-without-issue` | TODO 无工单号 |
| `line-length` | 行长度（config.max） |
| `regex` | 自定义正则（config.pattern） |

**把你的规范文档发给我**，我可以帮你批量生成完整的 `rules.yaml`。

### 第 3 步：配置 Gitee 流水线

1. 复制 `templates/gitee-pipeline.yml` 到你的 Java 仓库
2. Gitee → 仓库 → **流水线** → 新建，选择该 YAML
3. 每次 Push / MR 自动运行，未达标（默认 < 60 分）流水线失败

本地 MR 前自检：

```bash
node tools/java-code-reviewer/dist/cli.js \
  --changed-only \
  --base origin/main \
  --format html,console \
  --out reports
```

## 报告里有什么（回答你的核心需求）

每一项违规包含：

1. **规范编号** `specRef` — 对应你文档里的「1.1」「4.2」等
2. **扣分** — 该项扣多少分
3. **问题描述** — 人话说明哪里不对
4. **代码位置** — `文件:行号`
5. **代码片段** — 违规行 + 上下各 2 行上下文

示例（console 输出）：

```
[ERROR] src/.../UserService.java:12  (-3分)
  规范: 1.1 类名使用 UpperCamelCase
  说明: 类名「bad_user_service」应使用 UpperCamelCase
  代码: public class bad_user_service {
```

## Gitee 权限与下一步

你提到可以给我 Gitee 操作权限。建议流程：

1. **先把你的规范文档**（文字版 Markdown/Word 导出）发给我或放到仓库 `docs/java-coding-standard.md`
2. 我帮你生成 **完整 rules.yaml**（每条规范 → 检查器 + 扣分）
3. 你在 Gitee 添加 **部署公钥 / CI Token**，我帮你配置流水线 + MR 自动评论

## 与 Superpowers 配合

在 Cursor 中执行 `/add-plugin superpowers` 后，代码审查阶段可 invoke **`requesting-code-review`** skill，并结合本工具报告做人工复核。

本地 skill 见：`skills/java-code-reviewer/SKILL.md`
