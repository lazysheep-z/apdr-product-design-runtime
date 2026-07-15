# baoyu-skills — APDR 精选清单

完整上游仓库：`vendor/baoyu-skills/`（[JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills)）

以下 **5 个** 已接入 APDR 流水线；其余 17 个不默认启用。

| Skill ID | APDR 阶段 | Agent | 命令示例 |
|----------|-----------|-------|----------|
| `baoyu-url-to-markdown` | intake, requirements_analysis | requirements_analyst | `/baoyu-url-to-markdown https://example.com/docs` |
| `baoyu-format-markdown` | requirements_analysis, prd | requirements_analyst, product_writer | `/baoyu-format-markdown path/to/draft.md` |
| `baoyu-diagram` | user_flows, information_architecture | ux_strategist, information_architect | `/baoyu-diagram "OAuth 登录流程" --type sequence` |
| `baoyu-imagine` | ui_design | visual_designer | `/baoyu-imagine --prompt "..." --image out.png --ar 16:9` |
| `baoyu-slide-deck` | prd（演示稿，可选） | product_writer | `/baoyu-slide-deck path/to/prd.md --outline-only` |

## 本地 SKILL 路径（无 Cursor 插件时 Agent 可读）

| Skill ID | vendor 路径 |
|----------|-------------|
| baoyu-url-to-markdown | `vendor/baoyu-skills/skills/baoyu-url-to-markdown/SKILL.md` |
| baoyu-format-markdown | `vendor/baoyu-skills/skills/baoyu-format-markdown/SKILL.md` |
| baoyu-diagram | `vendor/baoyu-skills/skills/baoyu-diagram/SKILL.md` |
| baoyu-imagine | `vendor/baoyu-skills/skills/baoyu-imagine/SKILL.md` |
| baoyu-slide-deck | `vendor/baoyu-skills/skills/baoyu-slide-deck/SKILL.md` |

## 未接入（按需自行安装插件后使用）

`baoyu-infographic`, `baoyu-xhs-images`, `baoyu-post-to-wechat`, `baoyu-comic`, `baoyu-danger-*`, …
