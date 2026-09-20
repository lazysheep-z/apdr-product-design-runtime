---
name: apdr-feishu-lark
description: >
  Feishu/Lark cloud docs via official lark-cli agent skills (lark-doc/wiki/drive/sheets).
  Use when the user shares 飞书/Lark doc URLs, wants to publish PRD/handoff to Feishu,
  or sync research notes from Feishu. Never store app_id, app_secret, tokens, or personal open_id in the repo.
---

# Feishu / Lark CLI（APDR）

用官方 [larksuite/cli](https://github.com/larksuite/cli)（`lark-cli`）读写飞书云文档，服务 APDR 调研导入与产物发布。

## 安全（硬性）

1. **禁止**把 `app_id` / `app_secret` / access token / `open_id` / 个人 `cli_*` 配置写入本仓库、artifact、CHANGELOG、SKILL 或 git。
2. 凭证只存在本机密钥链 / 用户本地 config（由 `lark-cli config init` / `auth login` 管理）。
3. 回答用户时：可用「已登录用户 / bot」描述身份，**不要复述** token 或完整 open_id。
4. 写入飞书前：确认用户意图；优先 `--dry-run`（若命令支持）；破坏性覆盖需二次确认。
5. **禁止**把个人租户域名、姓名、邮箱、手机号当「配置样例」写进仓库；文档 URL 仅在用户明确要求发布后写入 `provenance`。
6. 公开仓库推送前：确认未暂存 `projects/` 业务目录与任何 `.enc` / `appsecret` 文件（见 `docs/privacy.md`）。

## 前置

```bash
# 官方 CLI（推荐）
npm install -g @larksuite/cli
# 或 npx
npx @larksuite/cli --help

# 本机首次配置与登录（交互，不在仓库里存密钥）
lark-cli config init --new
lark-cli auth login --domain docs --domain drive --no-wait --json
lark-cli auth status --json --verify
```

可选：全局安装官方 skills（不提交个人配置）：

```bash
npx skills add larksuite/cli -y -g
```

## Vendor skills（只含官方说明，无密钥）

| Skill | Path |
|-------|------|
| lark-shared | `vendor/larksuite-cli/lark-shared/SKILL.md` |
| lark-doc | `vendor/larksuite-cli/lark-doc/SKILL.md` |
| lark-wiki | `vendor/larksuite-cli/lark-wiki/SKILL.md` |
| lark-drive | `vendor/larksuite-cli/lark-drive/SKILL.md` |
| lark-sheets | `vendor/larksuite-cli/lark-sheets/SKILL.md` |
| lark-base | `vendor/larksuite-cli/lark-base/SKILL.md` |
| lark-slides | `vendor/larksuite-cli/lark-slides/SKILL.md` |
| lark-im | `vendor/larksuite-cli/lark-im/SKILL.md`（仅当用户明确要发群消息） |

文档操作前 **必读** `lark-shared`，再读 `lark-doc` 及其 `references/`。

## APDR 阶段映射

| 阶段 | 用法 |
|------|------|
| intake / requirements | `docs +fetch` 飞书需求/竞品笔记 → markdown → `write_artifact` |
| prd | 可选：把 approved PRD 摘要 `docs +create` / `+update` 发到飞书（JSON artifact 仍 canonical） |
| user_flows / IA | 可选从飞书知识库拉流程图说明；图仍用 diagram MCP / baoyu |
| handoff | 可选发布交接文档到飞书 Wiki/Doc；本地 `HandoffDoc` + ADR 仍要写入 MCP |
| quality_eval | 飞书链接只作附件引用，不替代 QualityReport |

## Workflow（读）

1. 用户给出飞书/Lark URL 或 token（含 `#share-...` 时优先锚点局部读取）
2. Read `vendor/larksuite-cli/lark-shared/SKILL.md` + `lark-doc/SKILL.md`
3. `lark-cli docs +fetch --doc "<url-or-token>"`（按官方 skill 选 `--scope` / `--detail`）
4. 将正文落到 `projects/{projectId}/research/feishu-*.md`（相对路径）
5. 提炼进对应 artifact 并 `write_artifact`

## Workflow（写 / 发布）

1. 确认目标 artifact 已 `approved`（或用户明确要求草稿同步）
2. 用 artifact 内容生成飞书 XML/Markdown（遵守 `lark-doc` references）
3. `lark-cli docs +create` 或 `+update`
4. 把**文档 URL**（非密钥）写入 artifact `provenance.notes` 或 `references`

## Do not

- 把本机 `~/.lark-cli`、Application Support 下的加密凭证、appsecret 文件拷进仓库
- 在 CI/脚本里硬编码个人 app 凭证
- 用飞书发稿替代 MCP 门禁（approve / advance 仍要走 design-artifacts）
- 默认安装/调用考勤、邮箱、CRM 等与产品设计流水线无关的 lark skills（按需）
