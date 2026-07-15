---
name: apdr-frontend-code-reviewer
description: Frontend code quality gate. Checks generated code against best practices, component structure, a11y, and performance.
---

# Frontend Code Reviewer (APDR)

Optional gate within stage: frontend_codegen. Run after code generation, before CodeBundle approval.

This skill does NOT create a separate pipeline stage. It enhances the frontend_codegen phase.

## External references

- [shadcn-ui/ui](https://github.com/shadcn-ui/ui) 117k★ -- UI component patterns with CLI, radix-based accessibility
- [microsoft/playwright](https://github.com/microsoft/playwright) 91k★ -- accessibility tree audit, component testing
- [radix-ui/primitives](https://github.com/radix-ui/primitives) 19k★ -- accessible headless components, patterns reference

## Workflow

1. get_latest_artifact -- CodeBundle, UIDesignSpec, DesignReviewReport
2. Navigate to CodeBundle.rootPath and run checks:

   a) Component structure check
      - Every UI spec component maps to a React component file
      - File naming convention: PascalCase.tsx
      - Component is exported, has proper TypeScript types
      - Reference: shadcn-ui component patterns

   b) Accessibility check
      - All interactive elements have aria attributes or use semantic HTML
      - Forms have associated labels
      - Images have alt text or aria-hidden
      - Color is not the only differentiator
      - Reference: radix-ui primitives for accessible patterns

   c) Responsive check
      - CSS uses relative units (rem, em, %), not fixed px for layout
      - Media queries or container queries present for breakpoints
      - No horizontal scroll on 320px viewport

   d) Performance check
      - No inline styles for repeated elements -- use CSS classes
      - Images have width+height attributes
      - Bundle size checklist: lazy loading for heavy components

3. Write issues to CodeBundle provenance.notes
4. Update CodeBundle artifact if fixable issues are found

## Do not
- Block the pipeline for style preferences -- only structural issues
- Re-run tests (they are the test-strategy skill's job)
- Evaluate backend code -- this is frontend-only

## References
- [shadcn-ui/ui](https://github.com/shadcn-ui/ui) 117k★
- [radix-ui/primitives](https://github.com/radix-ui/primitives) 19k★
- [microsoft/playwright](https://github.com/microsoft/playwright) 91k★
