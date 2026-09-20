---
name: apdr-operator-preference
description: >
  Cross-cutting APDR skill: learn and apply the human operator's collaboration habits
  across multi-turn stage gates (how much to ask, how dense to write, how they approve/revise).
  Not a product persona — this is the person driving APDR in the IDE.
---

# Operator Preference (APDR 横切)

在 **intake / requirements / PRD / UI / design_review** 等人机门禁多轮对话中使用。
**不**替代产品 personas；只优化「你怎么跟 Agent 协作」。

## When

- 新项目首次 intake：用 2–3 个短问题收集偏好，写入项目笔记
- 用户说「简洁一点 / 别问那么多 / 直接出稿 / 逐条改」：立刻更新偏好并应用到本阶段
- 每个阶段开始：先读偏好再提问/写稿
- 若项目尚无偏好文件：采用下方 **推荐默认值**（来自高频中文协作习惯），再按用户当场纠正覆盖

## Persist

写入（任选其一，优先已有路径）：

1. `projects/{projectId}/operator-preference.json`
2. 或 Cursor 用户规则（跨项目）

**隐私**：偏好文件只存协作风格枚举与短 note；**禁止**写入姓名、邮箱、手机、飞书 open_id、租户域名、本机绝对路径。

### Schema（最小）

```json
{
  "communicationDensity": "concise|balanced|thorough",
  "clarifyFirst": true,
  "gateStyle": "strict|default|fast-forward-optional",
  "feedbackStyle": "summary-only|inline-comments|rewrite-whole",
  "language": "zh|en",
  "wireframeFidelity": "low|mid",
  "revisionMode": "patch|restage",
  "prototypeMode": "greenfield|incremental",
  "docOnlyGuard": true,
  "deliveryMode": "preview|offline-html|both|none",
  "notes": []
}
```

### 推荐默认值（无偏好文件时）

```json
{
  "communicationDensity": "concise",
  "clarifyFirst": true,
  "gateStyle": "strict",
  "feedbackStyle": "summary-only",
  "language": "zh",
  "wireframeFidelity": "mid",
  "revisionMode": "patch",
  "prototypeMode": "incremental",
  "docOnlyGuard": true,
  "deliveryMode": "both",
  "notes": []
}
```

说明：默认偏「中文、简洁、严格门禁、逐段修订、增量改现有原型」。若用户明确是从零新建，将 `prototypeMode` 改为 `greenfield`。

## Apply rules

| Preference | Agent behavior |
|------------|----------------|
| `concise` | 每轮 ≤5 要点；先出 draft 再问关键缺口；回复用中文短句 |
| `thorough` | 先澄清矩阵，再写 artifact |
| `fast-forward-optional` | 可选门禁阶段写完后主动建议 `approve + advance` |
| `strict` | 必等人明确「批准」才 `approve_latest_artifact` |
| `patch` | 修订时只改被点名段落，不整份重写 |
| `restage` | 用 `revise_artifact` 开新版本 |
| `incremental` | 优先在已有代码/原型上增量改造；禁止无关重构 |
| `greenfield` | 按完整流水线从 Brief 推到代码 |
| `docOnlyGuard=true` | 优化需求/字段说明文案时，**不改**字段名、指标口径、页面模块与交互；若必须改，先列影响点等用户确认 |
| `deliveryMode=offline-html` | 前端阶段结束后按项目约定打包单文件离线 HTML（若项目有 `pack:single` 等脚本） |
| `deliveryMode=preview` | 保持局域网可访问预览；勿把 host 改回 localhost-only（若项目已固定端口） |

## Intake 时最多问 2–3 题（concise 模式）

1. 从零新建，还是改现有原型/仓库？
2. 沟通要简洁还是要先穷尽澄清？
3. （仅当交付相关）要局域网预览、离线单 HTML，还是只要代码？

其余字段用推荐默认值，用户随时可改口覆盖。

## Do not

- 把操作者偏好写进产品 `personas`
- 在未确认时猜测敏感偏好并固化
- 跳过 required human gates（PRD / Requirements / UI / DesignReview）
- 把飞书账号、个人身份、本机路径写入 `operator-preference.json` 或 artifact
