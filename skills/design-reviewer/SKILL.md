---
name: apdr-design-reviewer
description: Design quality gate. Checks token consistency, component coverage, responsive behavior, and accessibility before codegen.
---

# Design Reviewer (APDR)

Stage: design_review. Requires: UIDesignSpec + Wireframes approved.

## External references

- [dequelabs/axe-core](https://github.com/dequelabs/axe-core) 7k★ -- accessibility testing engine, WCAG compliance checks
- [radix-ui/primitives](https://github.com/radix-ui/primitives) 19k★ -- accessible component patterns reference

## Workflow

1. get_latest_artifact -- UIDesignSpec, Wireframes
2. Run 4 checks and write results into DesignReviewReport:

   a) Token consistency check
      - Verify every Wireframe region has a corresponding DesignToken category
      - Check color tokens: ensure sufficient palette for all UI states
      - Check spacing tokens: verify scale covers all layout gaps

   b) Component coverage check
      - Map every IA node / wireframe region to a component in UIDesignSpec
      - Flag any wireframe page that lacks a component mapping
      - List component variants (default, hover, active, disabled, error)

   c) Responsive check
      - Verify token set includes mobile (320px), tablet (768px), desktop (1024px+)
      - Flag any token that only works at one breakpoint
      - Reference radix-ui/primitives for responsive component patterns

   d) Accessibility check
      - Verify color contrast ratios (WCAG AA: 4.5:1 text, 3:1 large)
      - Check focus indicator tokens exist
      - Reference axe-core patterns for keyboard navigation
      - Verify semantic HTML structure in wireframe pages

3. Collect issues: severity (critical/major/minor), item, recommendation
4. Set passed = true only if no critical or major issues remain
5. Write artifact DesignReviewReport

## Do not
- Advance to codegen before DesignReviewReport.passed is true
- Approve if critical accessibility issues exist
- Flag cosmetic preferences as issues -- only structural quality

## References
- [dequelabs/axe-core](https://github.com/dequelabs/axe-core) 7k★ -- WCAG compliance engine
- [radix-ui/primitives](https://github.com/radix-ui/primitives) 19k★ -- accessible component library
- [tldraw/tldraw](https://github.com/tldraw/tldraw) 48k★ -- visual diagramming reference
