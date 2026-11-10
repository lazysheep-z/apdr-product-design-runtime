---
name: apdr-visual-designer
description: UIDesignSpec with OpenDesign design-brief, anthropic frontend-design, theme-factory, and optional baoyu-imagine.
---

# Visual Designer (APDR)

## 本地研究、触屏与视觉规则

先读 `skills/design-toolkit/SKILL.md`。新方向按其中 research 参考记录来源、主方向与选择理由；用 UI UX Pro Max 本地库补充规范。原生手机/平板按 Mobile UI/UX Pro Max；触屏 Web、大屏分别按设备规则适配。frontend-design、Taste、OpenDesign 共用一份 tokens，已批准方向优先。Refero 离线工艺资料不算真实竞品证据，不因缺少付费 MCP 阻塞。检查适用的控件状态、按压反馈、误触和布局，将依据/未测项相对路径记入 UIDesignSpec 的 provenance.notes。


Stage: `ui_design`. Requires `Wireframes`.

## External skills

1. **open-design** — `skills/open-design/SKILL.md` + `vendor/open-design/design-brief/SKILL.md` ([nexu-io/open-design](https://github.com/nexu-io/open-design))  
   Lock 8 design dimensions into tokens (`DESIGN.md` shape) before screens.
2. **frontend-design** — `vendor/anthropic-skills/frontend-design/SKILL.md` ([anthropics/skills](https://github.com/anthropics/skills) ~164k★)  
   Distinctive, anti-template visual direction; token + type plan before pixels.
3. **design-taste-frontend** — `vendor/taste-skill/design-taste-frontend/SKILL.md` ([Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill))  
   新版按 page / app 分流：展示页使用 page，后台/分析/设置等操作界面读取同目录 references/app-screens.md；具备方向库、素材脚本、源码 lint 与多宽度浏览器检查。遵循已批准 tokens 和 APDR 设备规范。
4. **theme-factory** — `vendor/anthropic-skills/theme-factory/SKILL.md`  
   Theme/token exploration for UIDesignSpec.
5. **design-system skill** — pick one under `vendor/awesome-design-skills/`  
   Defaults: `agentic` (universal QA gates), or `minimal` / `clean` / `professional`.  
   More styles: `npx typeui.sh pull <slug>` from [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills).
6. **baoyu-imagine** (optional concept screens when Figma unavailable)

## Workflow

1. `get_latest_artifact` — `Wireframes`
2. Run OpenDesign design-brief: resolve palette, type, layout, mood, density, constraints; list defaults used.
3. Brainstorm design plan (color/type/layout/signature) per frontend-design; reject generic AI looks unless brief asks.
4. Apply chosen design-system skill for component anatomy + a11y gates.
5. `write_artifact` — `UIDesignSpec`: tokens, components, screens (optional `projects/{id}/visual/DESIGN.md`)
6. Optional baoyu-imagine or local OpenDesign HTML → `screens[].reference` only
7. Human gate: approve before codegen

## Do not
- Use imagine output as sole UI spec
- Default to purple-gradient / cream-serif / broadsheet AI clichés without brief justification
- Run baoyu-imagine before wireframes are ready


## 通用产品、UI 与验收规则

读取 `skills/product-quality/SKILL.md`，仅加载本任务相关参考；将适用规则写入本阶段产物，独立审查不补造审批。不得将原始项目记录或真实身份沉淀到框架。
