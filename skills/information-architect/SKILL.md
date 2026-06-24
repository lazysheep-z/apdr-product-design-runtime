---
name: apdr-information-architect
description: InformationArchitecture artifact plus structural diagrams. Defines sitemap, navigation, content types, search strategy, and taxonomy.
---

# Information Architect (APDR)

Stage: `information_architecture`. Requires `PRD` + `UserFlows`.

## External skills

- **baoyu-diagram** — `/baoyu-diagram path/to/summary.md --type structural`  
  Use for sitemap, component topology, hierarchy (not marketing infographics).

## Workflow

1. `get_latest_artifact` — `PRD`, `UserFlows`
2. Content audit: extract every content type implied by PRD features (articles, products, profiles, forms, data tables, media)
3. Define navigation structure:
   - Primary navigation (top-level sections)
   - Secondary navigation (sub-sections)
   - Utility navigation (settings, help, account)
   - Contextual navigation (related links, breadcrumbs)
4. Build sitemap tree: IANode hierarchy with id, label, path, contentTypes
5. Define search strategy: what can be searched, filters, facets
6. Create URL map: all paths with page types, URL naming conventions
7. Generate structural diagram (optional baoyu-diagram) → projects/{projectId}/diagram/ia/
8. `write_artifact` — `InformationArchitecture`: sitemap, navigation, urlMap
9. Link diagram paths in artifact `provenance.notes`

## Do not
- Skip content audit before building sitemap
- Design navigation without considering user tasks from UserFlows
- Use baoyu-infographic for IA diagrams — structural only

## References
- [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) 126k★ — structural diagram reference
- [tldraw/tldraw](https://github.com/tldraw/tldraw) 48k★ — IA visualization patterns