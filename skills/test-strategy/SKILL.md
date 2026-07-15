---
name: apdr-test-strategy
description: Generates test plans for generated frontend code. Covers unit, component, integration, and E2E testing.
---

# Test Strategy (APDR)

Optional enhancement for stage: frontend_codegen. Run after code is generated.

This skill does NOT create a separate pipeline stage. It enhances the CodeBundle artifact.

## External references

- [vitest-dev/vitest](https://github.com/vitest-dev/vitest) 16k★ -- unit and component testing framework
- [microsoft/playwright](https://github.com/microsoft/playwright) 91k★ -- browser E2E testing

## Workflow

1. get_latest_artifact -- CodeBundle, PRD
2. Analyze CodeBundle.routes and PRD features to build test inventory:

   a) Unit tests (vitest)
      - Pure functions, utilities, helpers
      - Format/validation logic
      - API data transformation
      - File: src/**/*.test.ts

   b) Component tests (vitest + testing-library)
      - Every React component in the codebase
      - States: default, loading, empty, error, edge
      - User interactions: click, type, submit
      - File: src/components/**/*.test.tsx

   c) Integration tests (vitest + msw)
      - Page-level flows: render -> fetch data -> display
      - Form submission flow: fill -> submit -> response
      - Auth flow: login -> redirect -> protected page
      - File: src/pages/**/*.test.tsx

   d) E2E tests (Playwright)
      - Critical user journeys from UserFlows
      - Cross-page navigation, real API interactions
      - Responsive testing: mobile + desktop
      - File: e2e/**/*.spec.ts

3. Write test files into project/app directory
4. Bundle test plan: test commands, coverage expectations, CI integration
5. Add to CodeBundle artifact as provenance.notes

## Do not
- Skip E2E tests for critical user journeys
- Generate tests for generated code without running them
- Use Cypress -- prefer Playwright for cross-browser E2E

## References
- [vitest-dev/vitest](https://github.com/vitest-dev/vitest) 16k★
- [microsoft/playwright](https://github.com/microsoft/playwright) 91k★
