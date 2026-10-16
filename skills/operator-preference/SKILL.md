---
name: apdr-operator-preference
description: >
  Cross-cutting APDR skill: learn and apply the human operator's collaboration habits
  across multi-turn stage gates (how much to ask, how dense to write, how they approve/revise).
  Not a product persona — this is the person driving APDR in the IDE.
---

# Operator Preference (APDR 横切)

在 **intake / requirements / PRD / UI / design_review / frontend** 等人机门禁多轮对话中使用。
**不**替代产品 personas；只优化「你怎么跟 Agent 协作」。

## MCP（优先）

```
get_operator_preference { project_id }
set_operator_preference { project_id, preference: { ...partial } }
```

`get_next_action` 会附带偏好与「交付护栏」。引擎会按偏好**自动跳过**阶段。

## When

- 新项目首次 intake：用 2–3 个短问题收集偏好，经 MCP 写入
- 用户说「简洁一点 / 只改文案 / 不要代码只要飞书文档 / 改现有原型」：立刻 `set_operator_preference`
- 每个阶段开始：先 `get_operator_preference`

## Persist

1. MCP → `projects/{id}/operator-preference.json`（**gitignore，不进公开仓库**）
2. 关键字段镜像到 `meta.json`：`deliveryTarget` / `prototypeMode` / `taskMode`

**隐私**：只存协作枚举；禁止姓名、邮箱、手机、飞书 open_id、租户域名、本机绝对路径。写入时会自动 `[redacted]`。

### Schema

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
  "deliveryTarget": "code|feishu-doc|both",
  "taskMode": "full|copy_only|patch_ui",
  "previewPort": 5180,
  "previewHostLan": true,
  "notes": []
}
```

### 推荐默认值

中文 / concise / strict / patch / **incremental** / docOnlyGuard / deliveryMode=both / deliveryTarget=code / taskMode=full / previewHostLan=true。

### 路线跳过（引擎）

| 设置 | 跳过阶段 |
|------|----------|
| `deliveryTarget=feishu-doc` | user_flows → code_intelligence（PRD 后直接 handoff） |
| `taskMode=copy_only` | UX/UI/设计审查/后端/图谱（Brief 后可进 frontend 文案改） |
| `prototypeMode=incremental` 或 `taskMode=patch_ui` | 可选 UX：flows/IA/wireframes/ui/design_review |

## Intake 最多 2–3 题

1. 从零新建，还是改现有原型？（→ prototypeMode / taskMode）
2. 要代码、只要飞书/文档，还是都要？（→ deliveryTarget）
3. 是否需要后端？ / 只要改文案？（→ includeBackend / taskMode=copy_only）

## Apply rules

| Preference | Agent behavior |
|------------|----------------|
| `concise` | 每轮 ≤5 要点；中文短句 |
| `strict` | 未明确「批准」不 approve |
| `patch` | 只改被点名段落 |
| `incremental` / `patch_ui` | 既有代码上改；跳过可选 UX |
| `copy_only` / `docOnlyGuard` | 只改文案；改字段前先列影响点 |
| `feishu-doc` | 文档交付；跳过线框→代码 |
| `offline-html` / `preview` | 按交付护栏校验 pack:single 与 LAN 预览 |

## Do not

- 把操作者偏好写进产品 personas
- 跳过 required gates（除非路线已跳过该阶段）
- 把飞书账号 / 个人路径写入 preference 或 artifact
