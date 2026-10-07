---
name: apdr-open-design
description: >
  Bind nexu-io/open-design into APDR ui_design and design_review.
  Use design-brief to lock DESIGN.md tokens into UIDesignSpec, and the critique
  template during design review. Optional local OpenDesign app/MCP is not required.
  Never store BYOK or OpenDesign Cloud API keys in the repo.
---

# OpenDesign（APDR 适配）

上游：[nexu-io/open-design](https://github.com/nexu-io/open-design)。

APDR **不**把 OpenDesign 桌面端或 100+ skill 整包当作流水线。只在视觉阶段调用精选能力，真相源仍是 MCP artifact。

## 何时用

| 阶段 | 用法 |
|------|------|
| `ui_design` | 读 `vendor/open-design/design-brief/SKILL.md`，把 8 个设计维度落到 token，写入 `UIDesignSpec` |
| `design_review` | 读 `vendor/open-design/design-templates/critique.md`，五维自评并入 `DesignReviewReport` |
| `wireframes` | **不用**。线框保持低保真；OpenDesign HTML 属于高保真，放到 UI 阶段 |
| `frontend_codegen` | HTML 原型只作视觉参照，不替代已批准的 `UIDesignSpec` / 现有代码增量改造 |

## Workflow（ui_design）

1. `get_latest_artifact` — `Wireframes`（及已批准的 PRD 摘要）
2. 按 design-brief：把自然语言约束收成 palette / accent / typography / display / layout / mood / density / exclude
3. 未指定的维度用 skill 默认值，并在摘要里列出
4. 把 `DESIGN.md` 九节要点写入 `UIDesignSpec`（tokens、components、screens），文件可另存 `projects/{id}/visual/DESIGN.md`
5. 可选：本机已装 OpenDesign（`od`）时，用其 HTML 原型作 `screens[].reference`；未安装则跳过，不阻塞
6. `write_artifact` → 等人明确批准

## Workflow（design_review）

1. 对照 critique 模板给方向、层级、密度、组件、可访问性打分
2. 问题写入 `DesignReviewReport`；不在此阶段直接改前端代码
3. 未通过则退回 `ui_design`（`revise_artifact`），不要跳到 codegen

## 可选本机安装

桌面端或 `od mcp install cursor` 仅增强预览，**不是**门禁前置。密钥留在本机，禁止写入 artifact、SKILL 或 git。

## Do not

- 用 OpenDesign 产物跳过 `approve_latest_artifact`
- 把营销落地页 / 幻灯片 / 视频模板当作默认产品 UI
- 把 BYOK、OpenDesign Cloud key、本机绝对路径提交进仓库
- 在 `docOnlyGuard` 文案任务里改视觉 token
