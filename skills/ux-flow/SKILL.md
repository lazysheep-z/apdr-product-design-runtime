---
name: apdr-ux-flow
description: UserFlows artifact with task flows, error paths, permission flows, and system boundary diagrams.
---

# UX Strategist (APDR)

## 真实流程参考与本地降级

需要参考操作流程时读 `skills/design-toolkit/SKILL.md` 及其 research 参考。已有 Refero 在线工具时可查 Flows/Screens；否则用现有产品、用户提供或公开参考，按本地方法提炼步骤、异常、恢复和确认。记录真实来源；仅有工艺规则时标明缺少外部案例，不虚构 Refero 结果。不改变当前阶段的 UserFlows 结构和人工门禁。


Stage: `user_flows`. Requires `PRD` status `approved`.

## External skills

- **baoyu-diagram** — `/baoyu-diagram "<task flow>" --type flowchart|sequence --lang zh`
- **pm customer-journey-map** — `vendor/pm-skills/pm-market-research/skills/customer-journey-map/SKILL.md`  
  End-to-end stages, emotions, pain points (feeds flow design; does not replace Mermaid task flows).

## Workflow

1. `get_latest_artifact` — `PRD`
2. Optional: customer-journey-map for primary persona journey context.
3. For each PRD feature, define:

   a) **Happy path** — the ideal user journey step by step
      - Every step labeled: action, decision, system response
      - Touchpoints: UI screen, API, notification

   b) **Error / sad paths** — what happens when things go wrong
      - Validation errors, network failures, permission denied, not found
      - Each error maps to a user-facing message and recovery action

   c) **Permission / role flows** (if multi-role)
      - Admin flow, user flow, guest flow
      - Role-based access boundaries

   d) **System boundary diagram**
      - What the user sees vs what the system does vs external services
      - Mermaid sequence diagram showing User ↔ Frontend ↔ API ↔ Database

4. For each critical flow, run `/baoyu-diagram` and save SVG under:
   - `projects/{projectId}/diagram/flows/`
5. Record SVG paths in `provenance.notes` or flow metadata
6. `write_artifact` — `UserFlows` with `flows[]` (include `mermaid` per flow in content)
7. `approve_artifact` gate before IA stage

## Do not
- Replace `UserFlows` JSON with only images — artifact is source of truth
- Skip error paths — they are where most UX issues surface
- Use `baoyu-infographic` for product UI wireframes

## References
- [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) 126k★ — flow visualization
- [phuryn/pm-skills](https://github.com/phuryn/pm-skills) 19k★ — user research patterns

## 通用产品、UI 与验收规则

读取 `skills/product-quality/SKILL.md`，仅加载本任务相关参考；将适用规则写入本阶段产物，独立审查不补造审批。不得将原始项目记录或真实身份沉淀到框架。
