---
name: apdr-frontend-code-reviewer
description: Frontend code quality gate using Addy multi-axis review plus a11y/responsive checks.
---

# Frontend Code Reviewer (APDR)

Optional gate within stage: frontend_codegen. Run after code generation, before CodeBundle approval.

## External skills

1. **code-review-and-quality** — `vendor/addy-agent-skills/code-review-and-quality/SKILL.md`  
   Five axes: correctness, readability, architecture, security, performance.
2. **frontend-ui-engineering** — `vendor/addy-agent-skills/frontend-ui-engineering/SKILL.md`
3. References: radix-ui primitives, Playwright a11y tree (optional audit)

## Workflow

1. get_latest_artifact -- CodeBundle, UIDesignSpec, DesignReviewReport
2. Navigate to CodeBundle.rootPath and run checks:

   a) Five-axis review (code-review-and-quality)
   b) Component structure vs UIDesignSpec
   c) Accessibility (semantic HTML, labels, focus)
   d) Responsive (no fixed-px layout traps; 320px no horizontal scroll)
   e) Performance basics (lazy heavy routes, image dimensions)

3. Write issues to CodeBundle provenance.notes
4. Update CodeBundle artifact if fixable issues are found

## Do not
- Block the pipeline for pure style preferences
- Re-run the full test suite (test-strategy's job)
- Evaluate backend code
