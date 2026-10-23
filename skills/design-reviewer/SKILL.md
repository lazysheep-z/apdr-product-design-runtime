---
name: apdr-design-reviewer
description: Design quality gate. Checks token consistency, component coverage, responsive behavior, and accessibility before codegen.
---

# Design Reviewer (APDR)

Stage: design_review. Requires: UIDesignSpec + Wireframes approved.

## External skills

- **open-design critique** — `skills/open-design/SKILL.md` + `vendor/open-design/design-templates/critique.md`（五维自评，不直接改代码）
- **frontend-design** — `vendor/anthropic-skills/frontend-design/SKILL.md` (anti-template + hierarchy checks)
- **design-taste-frontend** — `vendor/taste-skill/design-taste-frontend/SKILL.md` (anti-slop checklist; skip dashboard-only rules when irrelevant)
- **design-system agentic** — `vendor/awesome-design-skills/agentic/SKILL.md` (WCAG 2.2 AA gates, required states)
- **web-design-guidelines** — `vendor/vercel-agent-skills/web-design-guidelines/SKILL.md`；默认使用同目录 `references/command.md` 固定规则，不自动拉 main。中文文案、用户规范与既有设计系统优先；框架专属规则仅在适用时检查。
- **agent-browser** — `skills/agent-browser/SKILL.md`（预览交互走查；需本机 CLI）
- [dequelabs/axe-core](https://github.com/dequelabs/axe-core) — accessibility testing engine
- [radix-ui/primitives](https://github.com/radix-ui/primitives) — accessible component patterns

## Workflow

1. get_latest_artifact -- UIDesignSpec, Wireframes
2. Run 4 checks and write results into DesignReviewReport:

   a) Token consistency check
      - Verify every Wireframe region has a corresponding DesignToken category
      - Check color tokens: ensure sufficient palette for all UI states
      - Check spacing tokens: verify scale covers all layout gaps
      - Flag generic AI-default palettes unless brief justified (frontend-design)

   b) Component coverage check
      - Map every IA node / wireframe region to a component in UIDesignSpec
      - Flag any wireframe page that lacks a component mapping
      - List component variants (default, hover, active, disabled, error, loading)

   c) Responsive check
      - Verify token set includes mobile (320px), tablet (768px), desktop (1024px+)
      - Flag any token that only works at one breakpoint

   d) Accessibility check
      - WCAG AA contrast; focus-visible tokens; keyboard-first (agentic gates)
      - Semantic HTML in wireframe pages

3. Collect issues: severity (critical/major/minor), item, recommendation
4. Set passed = true only if no critical or major issues remain
5. Write artifact DesignReviewReport

## Do not
有可执行原型时，先确认 preview `local_tools_status`，再用 `list_browser_tools` / `run_browser_checks` 检查相关主路径与状态，`audit_accessibility` 留下真实扫描报告。默认可见隔离 Chrome；仅显式的隔离自动测试使用 headless。外部 webapp-testing 的 /tmp 与 headless 示例不得覆盖项目的交付约定。

把本轮报告相对路径、页面/产物版本、未覆盖项记入 DesignReviewReport 的 provenance.notes；不以检查无报错替代人工批准。没有原型则做规格审查并注明浏览器未覆盖，不为检查而新造页面。参见 `docs/local-tools.md`。

- Advance to codegen before DesignReviewReport.passed is true
- Approve if critical accessibility issues exist
- Flag cosmetic preferences as issues -- only structural quality

## References
- [dequelabs/axe-core](https://github.com/dequelabs/axe-core) 7k★ -- WCAG compliance engine
- [radix-ui/primitives](https://github.com/radix-ui/primitives) 19k★ -- accessible component library
- [tldraw/tldraw](https://github.com/tldraw/tldraw) 48k★ -- visual diagramming reference
