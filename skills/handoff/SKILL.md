---
name: apdr-handoff
description: Developer handoff documentation. Generates component docs, build instructions, API contracts, and deployment guide.
---

# Handoff Specialist (APDR)

Pipeline stage: handoff. Requires: CodeBundle + UIDesignSpec approved.

## External references

- [storybookjs/storybook](https://github.com/storybookjs/storybook) 90k★ -- component documentation and UI development environment

## Workflow

1. get_latest_artifact -- CodeBundle, UIDesignSpec, PRD
2. Generate the following under projects/{projectId}/docs/:

   a) Component documentation
      - For each component in CodeBundle: name, file path, props table
      - Reference: Storybook CSF format for component stories
      - Include usage examples, required context, variations

   b) Route map
      - All routes with page component, data dependencies, auth requirements
      - Link each route to its source UserFlow and WireframePage

   c) Design token reference
      - Export UIDesignSpec.tokens as CSS custom properties list
      - Include token name, value, usage context, responsive override

   d) Build & run instructions
      - npm install, npm run dev, npm run build
      - Environment variables needed (from PRD constraints)
      - Preview server URL from CodeBundle.previewUrl

   e) API contracts (if applicable)
      - Endpoints: method, path, request/response shapes
      - Auth requirements, error formats

3. Write HandoffDoc artifact with projectSummary, componentList, routes, designTokens, buildInstructions, apiEndpoints
4. Save docs under projects/{projectId}/docs/ as markdown files
5. Optionally scaffold Storybook config if storybook is detected in stack

## Do not
- Treat Storybook scaffold as required -- only if it matches the stack
- Skip build instructions -- they are the first thing a developer reads
- Omit auth/API contracts for protected routes

## References
- [storybookjs/storybook](https://github.com/storybookjs/storybook) 90k★
- [shadcn-ui/ui](https://github.com/shadcn-ui/ui) 117k★ -- component design patterns
- [microsoft/playwright](https://github.com/microsoft/playwright) 91k★ -- E2E test patterns
