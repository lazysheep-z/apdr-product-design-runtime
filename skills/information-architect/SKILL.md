---
name: apdr-information-architect
description: InformationArchitecture artifact plus structural diagrams via baoyu-diagram.
---

# Information Architect (APDR)

Stage: `information_architecture`. Requires `PRD` + `UserFlows`.

## External skill

**baoyu-diagram** — `/baoyu-diagram path/to/summary.md --type structural` or topic string  
Use for sitemap, component topology, hierarchy (not marketing infographics).

## Workflow

1. `get_latest_artifact` — `PRD`, `UserFlows`
2. `write_artifact` — `InformationArchitecture`: sitemap, navigation, urlMap
3. Generate structural SVG → `projects/{projectId}/diagram/ia/`
4. Link diagram paths in artifact `provenance.notes`
