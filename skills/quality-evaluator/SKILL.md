---
name: apdr-quality-evaluator
description: Final quality gate. Runs artifact quality assessments and feature-flow-wireframe coverage checks across the entire pipeline.
---

# Quality Evaluator (APDR)

## 本地设计证据核验

界面交付读取 `skills/design-toolkit/SKILL.md` 的审查规则；检查设计来源、批准方向与实现一致性，以及本次触屏变更的证据。区分 Refero 本地工艺资料与真实在线研究、APDR 本地评审与完整 Impeccable 流程。Web 代码交付优先复用或执行已安装 detector 对本次文件的扫描；没有运行 detector、浏览器或实机时明确写未执行；静态启发式检查、零违规和审美评分不能证明完整合规。优先复用同版本证据，纯文档不跑界面工具。


Pipeline stage: quality_eval. Requires: HandoffDoc (and all upstream artifacts).

This stage runs two evaluation capabilities that were registered but never implemented:

## Capability 1: eval.artifact.quality

For each artifact in the project, run a rubric-based quality check:

| Artifact Type | Rubric Dimensions |
|---------------|------------------|
| ProjectBrief | Problem clarity, goal alignment, persona completeness, constraint coverage |
| RequirementsAnalysis | JTBD completeness, risk identification, assumption flagging, open question quality |
| PRD | Feature completeness, AC testability, priority clarity, dependency mapping |
| UserFlows | Happy path clarity, error path coverage, permission coverage, diagram quality |
| InformationArchitecture | Sitemap completeness, navigation logic, URL consistency, content type coverage |
| Wireframes | Page coverage, layout structure, state coverage (default/error/loading/empty) |
| UIDesignSpec | Token completeness, component coverage, accessibility consideration, responsive planning |
| DesignReviewReport | Issue completeness, fix confirmation, pass/fail correctness |
| CodeBundle | Structure, naming, accessibility attributes, responsive implementation |
| CodeIntelligenceReport | Index completeness, route/component coverage vs CodeBundle |
| HandoffDoc | Component docs completeness, build instructions clarity, API contract coverage |
| DecisionRecords | ADR coverage (all critical stages), ADR quality (context+decision+consequences), numbering consistency |

For each artifact:
- Score 0-10 on each rubric dimension
- List specific issues found
- Calculate overall score (percentage)

## Capability 2: eval.coverage.feature_flow

Cross-reference PRD features against downstream artifacts:

1. get_latest_artifact: PRD, UserFlows, Wireframes, UIDesignSpec
2. For each PRD feature:
   - Check UserFlows, Wireframes, UIDesignSpec coverage (existing)
   - **Check CodeIntelligenceReport.routes / .components** for implementation signals
   - Does it have a corresponding UserFlow? (yes/no)
   - Does it have Wireframe pages? (yes/no)
   - Does it map to UIDesignSpec components? (yes/no)
3. Report coverage gaps: features missing flows, flows missing wireframes, wireframes missing components

## Output

Write artifact QualityReport:
- qualityScores[]: per-artifact scores with issues
- coverageGaps[]: feature coverage matrix
- overallScore: weighted total
- passed: true only if overallScore >= 70, all required checks in scope passed with current-version evidence, and no unresolved critical/major issues
- summary: plain-text summary for user review

## External skills

- **verification-before-completion** — `vendor/superpowers/skills/verification-before-completion/SKILL.md`
- **browser-testing-with-devtools** — `vendor/addy-agent-skills/browser-testing-with-devtools/SKILL.md`
- **webapp-testing** — `vendor/anthropic-skills/webapp-testing/SKILL.md`
- **web-design-guidelines** — `vendor/vercel-agent-skills/web-design-guidelines/SKILL.md`
- **vercel-react-best-practices** — `vendor/vercel-agent-skills/react-best-practices/`（含 `AGENTS.md`）
- **agent-browser** — `skills/agent-browser/SKILL.md`
- [microsoft/playwright](https://github.com/microsoft/playwright) — E2E / a11y audit patterns
- [dequelabs/axe-core](https://github.com/dequelabs/axe-core) — WCAG rubric

## Before claiming pass

Run verification-before-completion: show evidence (scores, coverage gaps, optional browser checks). Do not claim “quality passed” without `QualityReport` written.

有本地页面的代码交付：优先复用**同一版本、同一页面状态**已有的浏览器与 axe 证据，缺失/过期部分再通过 preview `run_browser_checks` / `audit_accessibility` 补测，避免重复全量执行。技能参数先读 `list_browser_tools`。文档交付不强行生成页面或跑浏览器。

QualityReport 的 provenance.notes 记录项目内 evidence/ 相对路径、被测版本、实际执行范围，以及失败/未执行/不适用项。axe 的 violations 和 incomplete 都要审阅；自动零违规不等于完整可访问性合规。没有工具、没有页面或未执行时写明缺口，不伪造通过、不代替人工批准。Vercel 规则默认读已固定的 `vendor/vercel-agent-skills/web-design-guidelines/references/command.md`，用户设计系统优先。


## 通用产品、UI 与验收规则

读取 `skills/product-quality/SKILL.md`，仅加载本任务相关参考；将适用规则写入本阶段产物，独立审查不补造审批。不得将原始项目记录或真实身份沉淀到框架。
