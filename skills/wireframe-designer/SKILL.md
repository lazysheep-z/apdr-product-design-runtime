---
name: apdr-wireframe-designer
description: Low-fidelity wireframes from IA. Generates HTML wireframes with multiple fidelity levels, interaction annotations, and preview servers.
---

# Wireframe Designer (APDR)

Stage: wireframes. Requires: InformationArchitecture + UserFlows approved.

## External references

- [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) 126k★ -- collaborative whiteboard, can export wireframe concepts
- [tldraw/tldraw](https://github.com/tldraw/tldraw) 48k★ -- infinite canvas for diagramming

## Workflow

1. get_latest_artifact -- InformationArchitecture, UserFlows
2. Plan page inventory: extract every unique page/screen from the sitemap
3. For each page, define:
   - Layout structure (header, nav, content, footer regions)
   - Content placeholders (labels, sample text, data types)
   - Key interactions (click, scroll, hover, form submit)
   - States (default, empty, error, loading)
4. Generate HTML from templates/wireframe/page.html per page
   - Use region IDs consistent with IA node IDs
   - Include interaction annotations as data attributes
   - Add responsive breakpoint indicators (mobile, tablet, desktop)
5. register_preview_url on preview MCP when HTML files exist
6. Write Wireframes artifact with pages, regions, interactions, htmlPath per page

## Do not
- Use baoyu-infographic -- wireframes are structural, not decorative
- Skip error/empty/loading states for interactive elements
- Generate UI design tokens in this stage -- keep it low-fidelity

## Fidelity guide
- Low-fi: basic boxes, placeholder text, grayscale (#ccc fills)
- Mid-fi: refined spacing, consistent alignment, grey values (#999-#ddd)
- Stay low-fi unless UserFlows or brand calls for mid-fi
