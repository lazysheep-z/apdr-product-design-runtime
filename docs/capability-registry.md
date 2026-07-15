# Capability Registry v2

42 个能力，分 10 个 domain。完整源码见 `packages/core/src/registry/capabilities.ts`。

## Taxonomy

```
{layer}.{domain}.{action}.{variant}
layer: atomic | composite
domain: intake | research | analysis | spec | ux | visual | code | govern | diagram | eval
```

| Domain | 用途 | 能力数 |
|--------|------|--------|
| intake | 需求录入 | 1 |
| analysis | 需求分析 | 2 |
| research | 外部调研 | 3 |
| spec | PRD / AC / 幻灯片 | 4 |
| ux | 用户流、IA、线框 | 7 |
| visual | UI / tokens / CSS / 概念图 | 6 |
| code | 前端生成 / scaffold / preview | 5 |
| govern | 版本、审批、rollback、stale | 5 |
| diagram | 图表渲染（Mermaid/SVG） | 2 |
| eval | 质量检查、覆盖率 | 2 |

## MCP 映射

| Capability | MCP Server | MCP Tool |
|------------|------------|----------|
| intake.parse.brief | design-artifacts | start_project |
| govern.artifact.\* | design-artifacts | list_artifacts, approve_artifact, rollback_artifact |
| govern.pipeline.\* | design-artifacts | advance_pipeline, rollback_pipeline, get_pipeline_status |
| research.search.web | research | search_web |
| research.fetch.url | research | fetch_url |
| research.note.store | research | research_note |
| diagram.render.mermaid | diagram | render_mermaid |
| diagram.render.sitemap | diagram | render_sitemap |
| ux.wireframe.preview.start | preview | serve_wireframe |
| code.preview.serve | preview | serve_frontend |
| code.scaffold.\* | repo | scaffold_frontend |

## 完整注册能力列表

### Intake (1)
- atomic: `intake.parse.brief`

### Analysis (2)
- composite: `analysis.extract.requirements`
- atomic: `analysis.assumptions.validate`

### Research (3)
- atomic: `research.search.web`, `research.fetch.url`, `research.note.store`

### Spec / PRD (4)
- composite: `spec.prd.generate`
- atomic: `spec.prd.validate`, `spec.prd.export_markdown`, `spec.slide_deck.generate`

### UX (7)
- composite: `ux.flow.render`, `ux.ia.generate`, `ux.wireframe.generate`
- atomic: `ux.flow.render.diagram`, `ux.flow.validate_completeness`, `ux.ia.render.sitemap`, `ux.wireframe.render.html`, `ux.wireframe.preview.start`

### Visual (6)
- composite: `visual.token.infer`
- atomic: `visual.token.infer.color`, `visual.token.infer.typography`, `visual.token.infer.spacing`, `visual.css.generate`, `visual.concept.render`

### Code (5)
- composite: `code.react.page.generate`
- atomic: `code.scaffold.react_vite`, `code.scaffold.html`, `code.preview.serve`, `code.quality.check`

### Govern (5)
- atomic: `govern.artifact.approve`, `govern.artifact.rollback`, `govern.pipeline.rollback_stage`, `govern.stale.list`, `govern.artifact.list`

### Diagram (2)
- atomic: `diagram.render.mermaid`, `diagram.render.sitemap`

### Eval (2)
- atomic: `eval.artifact.quality`, `eval.coverage.feature_flow`
