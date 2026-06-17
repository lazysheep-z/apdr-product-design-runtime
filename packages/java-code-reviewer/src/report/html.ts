import type { ReviewReport } from "../types.js";

function escapeHtml(s: string | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatHtmlReport(report: ReviewReport): string {
  const statusClass = report.passed ? "pass" : "fail";
  const statusText = report.passed ? "通过" : "未通过";

  const categoryRows = Object.entries(report.byCategory)
    .sort((a, b) => b[1].deduction - a[1].deduction)
    .map(
      ([cat, stat]) =>
        `<tr><td>${escapeHtml(cat)}</td><td>${stat.count}</td><td>-${stat.deduction}</td></tr>`
    )
    .join("\n");

  const ruleRows = Object.entries(report.byRule)
    .sort((a, b) => b[1].deduction - a[1].deduction)
    .map(
      ([, stat]) =>
        `<tr><td>${escapeHtml(stat.specRef)}</td><td>${escapeHtml(stat.title)}</td><td>${stat.count}</td><td>-${stat.deduction}</td></tr>`
    )
    .join("\n");

  const violationBlocks = report.violations
    .map((v) => {
      const ctx = [
        ...(v.contextBefore ?? []).map((l) => `<span class="ctx">${escapeHtml(l)}</span>`),
        `<span class="hit">${escapeHtml(v.snippet)}</span>`,
        ...(v.contextAfter ?? []).map((l) => `<span class="ctx">${escapeHtml(l)}</span>`),
      ].join("\n");
      return `
      <article class="violation ${v.severity}">
        <header>
          <span class="badge ${v.severity}">${v.severity}</span>
          <strong>${escapeHtml(v.file)}:${v.line}</strong>
          <span class="deduction">-${v.deduction} 分</span>
        </header>
        <dl>
          <dt>规范编号</dt><dd>${escapeHtml(v.specRef)}</dd>
          <dt>规则</dt><dd>${escapeHtml(v.title)}</dd>
          <dt>类别</dt><dd>${escapeHtml(v.category)}</dd>
          <dt>问题</dt><dd>${escapeHtml(v.message)}</dd>
          <dt>规范说明</dt><dd>${escapeHtml(v.description)}</dd>
        </dl>
        <pre class="code"><code>${ctx}</code></pre>
      </article>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Java 代码规范检查报告</title>
  <style>
    :root { --bg:#0f1419; --card:#1a2332; --text:#e6edf3; --muted:#8b949e; --pass:#3fb950; --fail:#f85149; --warn:#d29922; }
    * { box-sizing: border-box; }
    body { font-family: "SF Pro Text", system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 2rem; line-height: 1.5; }
    h1 { font-size: 1.5rem; margin-bottom: .5rem; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
    .card { background: var(--card); border-radius: 8px; padding: 1rem 1.25rem; }
    .card .label { color: var(--muted); font-size: .85rem; }
    .card .value { font-size: 1.75rem; font-weight: 600; }
    .card.pass .value { color: var(--pass); }
    .card.fail .value { color: var(--fail); }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0 2rem; background: var(--card); border-radius: 8px; overflow: hidden; }
    th, td { padding: .65rem 1rem; text-align: left; border-bottom: 1px solid #30363d; }
    th { background: #21262d; color: var(--muted); font-size: .85rem; }
    .violation { background: var(--card); border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1rem; border-left: 4px solid var(--warn); }
    .violation.error { border-left-color: var(--fail); }
    .violation header { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; margin-bottom: .75rem; }
    .badge { font-size: .7rem; text-transform: uppercase; padding: .15rem .45rem; border-radius: 4px; background: #30363d; }
    .badge.error { background: #490202; color: #ffa198; }
    .deduction { margin-left: auto; color: var(--fail); font-weight: 600; }
    dl { display: grid; grid-template-columns: 6rem 1fr; gap: .25rem .75rem; font-size: .9rem; margin: 0 0 .75rem; }
    dt { color: var(--muted); }
    pre.code { background: #0d1117; border-radius: 6px; padding: .75rem 1rem; overflow-x: auto; margin: 0; font-size: .85rem; line-height: 1.45; }
    .hit { display: block; background: #490202; color: #ffa198; margin: 0 -1rem; padding: 0 1rem; }
    .ctx { display: block; color: #8b949e; }
    .meta { color: var(--muted); font-size: .9rem; }
    .banner { border-radius: 8px; padding: 1rem 1.25rem; margin: 1rem 0 1.5rem; font-size: 1.1rem; font-weight: 600; }
    .banner.pass { background: #0f2d1a; color: var(--pass); border: 1px solid #238636; }
    .banner.fail { background: #490202; color: #ffa198; border: 1px solid var(--fail); }
  </style>
</head>
<body>
  <h1>Java 代码规范检查报告</h1>
  <div class="banner ${statusClass}">${report.passed ? "✅ 通过 — 零扣分" : `❌ 未通过 — 总扣分 ${report.totalDeduction} 分（有任何扣分即为未通过，与最终得分无关）`}</div>
  <p class="meta">生成于 ${escapeHtml(report.generatedAt)} · 扫描 ${report.filesScanned} 个文件 · 检查 ${report.linesChecked} 行代码 · ${report.violationCount} 项违规${report.diffLinesOnly ? ` · 统计范围：仅 diff 新增/修改行（${escapeHtml(report.baseRef ?? "HEAD~1")}）` : ""}</p>

  <div class="summary">
    <div class="card"><div class="label">检查行数</div><div class="value">${report.linesChecked}</div></div>
    <div class="card"><div class="label">基础分</div><div class="value">${report.baseScore}</div></div>
    <div class="card ${statusClass}"><div class="label">总扣分</div><div class="value">-${report.totalDeduction}</div></div>
    <div class="card"><div class="label">最终得分（参考）</div><div class="value">${report.finalScore}</div></div>
    <div class="card ${statusClass}"><div class="label">检查结果</div><div class="value">${statusText}</div></div>
  </div>

  <h2>按类别扣分</h2>
  <table><thead><tr><th>类别</th><th>次数</th><th>扣分</th></tr></thead><tbody>${categoryRows || "<tr><td colspan=3>无</td></tr>"}</tbody></table>

  <h2>按规范条目扣分</h2>
  <table><thead><tr><th>规范编号</th><th>规则</th><th>次数</th><th>扣分</th></tr></thead><tbody>${ruleRows || "<tr><td colspan=4>无</td></tr>"}</tbody></table>

  <h2>违规明细（含代码上下文）</h2>
  ${violationBlocks || "<p>未发现违规项 🎉</p>"}
</body>
</html>`;
}
