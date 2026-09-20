---
name: apdr-agent-browser
description: >
  Optional browser automation for APDR design_review / quality_eval via vercel-labs/agent-browser CLI.
  Prefer Cursor browser MCP when available; use agent-browser for CLI/CDP accessibility-tree workflows.
---

# Agent Browser（APDR 适配）

上游 stub：`vendor/vercel-agent-browser/SKILL.md`（[vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)）。

## 何时用

- `design_review` / `quality_eval`：打开 `CodeBundle.previewUrl` 做交互走查、截图、表单流
- 竞品页抓取辅助（intake/research，注意版权与登录墙）

## 前置

本机安装 CLI（用户环境，不入库二进制）：

```bash
npm i -g agent-browser   # 或按上游 README
agent-browser install    # Chrome for Testing
```

运行时加载完整指令：`agent-browser skills get core`（勿只依赖过期拷贝）。

## 与 Cursor browser MCP

| 场景 | 优先 |
|------|------|
| Cursor 内嵌预览 / 已有 browser tab | `cursor-ide-browser` MCP |
| 无 MCP、要 CLI 脚本化、a11y tree refs | `agent-browser` |

## 产出

发现写入 `DesignReviewReport` / `QualityReport` issues；截图可放 `projects/{id}/visual/qa/`。

## 不要

- 替代 `write_artifact`
- 把登录凭证写入仓库
