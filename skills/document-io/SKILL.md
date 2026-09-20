---
name: apdr-document-io
description: >
  Read/write local documents for APDR (Word/PDF/PPTX/XLSX) and structured co-authoring.
  Use when importing requirements from .docx/.pdf, exporting PRD/Handoff as Office files,
  or collaboratively drafting long-form docs. Prefer Feishu (lark-doc) when the user works in 飞书云文档.
---

# Document I/O (APDR)

横切能力：本地办公文档读写 + 结构化共创。飞书云文档见 `skills/feishu-lark/SKILL.md`。

## External skills（vendor）

| Skill | Path | 用途 |
|-------|------|------|
| docx | `vendor/anthropic-skills/docx/SKILL.md` | 读/写/改 Word |
| pdf | `vendor/anthropic-skills/pdf/SKILL.md` | 读/写 PDF |
| pptx | `vendor/anthropic-skills/pptx/SKILL.md` | 演示稿 |
| xlsx | `vendor/anthropic-skills/xlsx/SKILL.md` | 表格导入（字段词典、清单） |
| doc-coauthoring | `vendor/anthropic-skills/doc-coauthoring/SKILL.md` | 长文档共创工作流 |

Source: [anthropics/skills](https://github.com/anthropics/skills)

## APDR 阶段映射

| 阶段 | 典型用法 |
|------|----------|
| intake / requirements | 用户丢来 Word/PDF 需求 → 转 markdown → 写入 `ProjectBrief` / `RequirementsAnalysis` |
| prd | 可选导出 `projects/{id}/exports/prd.docx` 或 pptx 大纲（canonical 仍是 MCP PRD JSON） |
| handoff | 可选导出交接 Word/PDF；ADR 仍用 markdown |
| quality_eval | 不把 Office 文件当质量真相源 |

## Workflow

1. 判断介质：本地 Office → 本 skill；飞书 URL/token → `skills/feishu-lark/SKILL.md`
2. 读取：按对应 anthropic skill 提取正文 → 落到 `projects/{id}/research/` 或 `exports/`
3. **必须**把结构化结论 `write_artifact` 进 MCP；禁止只改本地文件就算阶段完成
4. 导出：从 approved artifact 生成 Office 文件时，在 `provenance.notes` 记录本地相对路径（不要写绝对用户路径）

## Do not

- 把 `.docx/.pdf` 当流水线唯一真相（artifact JSON 优先）
- 把个人路径、邮箱、密钥写进 artifact 或仓库
- 默认提交二进制 Office 到 git（仓库 `.gitignore` 已忽略 `*.docx` 等）
