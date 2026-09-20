---
name: apdr-competitive-research
description: >
  APDR research pack for competitive analysis, desk research, and written research reports.
  Use in intake / requirements_analysis (and optionally prd). Prefer free APDR research MCP +
  baoyu capture; optional Tavily/Firecrawl when the user has CLI/API keys.
---

# Competitive & Desk Research（APDR）

阶段：`intake` / `requirements_analysis`（可选 enrichment `prd`）。

产物目录：`projects/{projectId}/research/`（笔记、竞品档案、报告）。**Canonical 结论仍写入 artifact**（ProjectBrief.references / RequirementsAnalysis）。

## 执行顺序（默认）

1. **research（Matt）** — `vendor/mattpocock-skills/research/SKILL.md`  
   对核心问题做一手来源调研，落盘带引用的 Markdown。

2. **pm competitor-analysis** — `vendor/pm-skills/pm-market-research/skills/competitor-analysis/SKILL.md`  
   5 家直竞 + 强弱项 + 差异化机会。

3. **competitor-profiling（营销技能包，已适配）** — `vendor/marketing-skills/competitor-profiling/SKILL.md`  
   **不要**强依赖 Firecrawl / DataForSEO。改用：
   - MCP `research`：`search_web` / `fetch_url` / `research_note`
   - 或 `baoyu-url-to-markdown` / WebFetch / `agent-browser`
   - 输出改存到：`projects/{projectId}/research/competitors/<slug>.md`  
     与 `_summary.md`（不要写仓库根 `competitor-profiles/`）

4. **customer-research** — `vendor/marketing-skills/customer-research/SKILL.md`  
   VOC / 评论区 / JTBD 语言；同样用 APDR 抓取工具，不强制付费 SEO API。

5. **market-sizing**（可选）— `vendor/pm-skills/pm-market-research/skills/market-sizing/SKILL.md`

6. **swot-analysis**（可选）— `vendor/pm-skills/pm-product-strategy/skills/swot-analysis/SKILL.md`  
   在竞品摘要齐后再做。

7. **sentiment-analysis**（有反馈数据时）— `vendor/pm-skills/pm-market-research/skills/sentiment-analysis/SKILL.md`

## 可选深度引擎（用户本机已装再调用）

| Skill | 路径 | 条件 |
|-------|------|------|
| tavily-research | `vendor/tavily-skills/tavily-research/SKILL.md` | `tvly` CLI 已登录 |
| firecrawl-market-research | `vendor/firecrawl-skills/firecrawl-market-research/SKILL.md` | `FIRECRAWL_API_KEY` |

未安装时**跳过**，勿阻塞流水线。

## 报告交付

在 `projects/{projectId}/research/` 写一份汇总报告，建议文件名：

`competitive-research-report.md`

结构：

```markdown
# 竞品与市场调研报告 — {title}
日期 / 项目 id

## 问题与范围
## 竞品地图（直竞 / 间竞）
## 逐家档案摘要（链接到 competitors/*.md）
## 用户声音（VOC / 评论）
## SWOT（若已做）
## 市场规模（若已做）
## 对 APDR 的含义（差异化 → Requirements / PRD）
## 来源与引用
```

然后：

- 把关键引用 URL 写入 `ProjectBrief.references` 或 `RequirementsAnalysis`
- `research_note`（如可用）存短摘要
- **不要**把营销站「vs 页」当产品 PRD

## 不要

- 把 SEO「竞品对比落地页」（`competitors` 营销 skill）当产品设计主产物
- 无来源编造定价/市占
- 跳过 `write_artifact` 只丢一堆 md
