---
name: apdr-quality-evaluator
description: Final quality gate. Runs artifact quality assessments and feature-flow-wireframe coverage checks across the entire pipeline.
---

# Quality Evaluator (APDR)

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
- passed: true if overallScore >= 70 and no critical issues
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
