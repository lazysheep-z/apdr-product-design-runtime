---
name: apdr-find-skills
description: >
  APDR-aware skill discovery. Prefer the stage skill table and vendored externalSkills;
  fall back to vercel-labs find-skills / npx skills find when the need is outside the pipeline.
---

# Find Skills（APDR 适配）

上游：`vendor/vercel-labs-skills/find-skills/SKILL.md`（[vercel-labs/skills](https://github.com/vercel-labs/skills)）。

## 何时用

用户说「该用哪个 skill」「有没有现成 skill」「怎么做 X」且 **不在当前 `get_next_action` 的 skillPath 内**。

## 顺序（强制）

1. 读 `skills/apdr-runtime/SKILL.md` 阶段索引 + 当前 stage 的 `externalSkills`。
2. 读 `docs/skills-sh-leaderboard-review.md` 已评审清单（避免重复安装已绑定 skill）。
3. 仍不够 → 按上游 `find-skills`：`npx skills find <query>`，只推荐官方源（vercel-labs / anthropics / mattpocock / microsoft 等）。
4. 若要纳入流水线：更新 `docs/skill-integration.md` + stage `SKILL.md`，不要只全局安装了事。

## 不要

- 用 WorkBuddy 改版替代官方仓库
- 在 APDR 主流程中跳过 artifact / 审批门禁去「随便装个 skill」
