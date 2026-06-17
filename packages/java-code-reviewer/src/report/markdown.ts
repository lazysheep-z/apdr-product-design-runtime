import type { ReviewReport } from "../types.js";

export function formatMarkdownReport(report: ReviewReport): string {
  const lines: string[] = [];
  lines.push("# Java 代码规范检查报告");
  lines.push("");
  lines.push(`| 项目 | 值 |`);
  lines.push(`|------|-----|`);
  lines.push(`| 生成时间 | ${report.generatedAt} |`);
  lines.push(`| 扫描文件 | ${report.filesScanned} |`);
  lines.push(`| 检查行数 | ${report.linesChecked} |`);
  if (report.diffLinesOnly) {
    lines.push(`| 统计范围 | 仅 diff 新增/修改行 (${report.baseRef ?? "HEAD~1"}) |`);
  }
  lines.push(`| 违规项数 | ${report.violationCount} |`);
  lines.push(`| 基础分 | ${report.baseScore} |`);
  lines.push(`| 总扣分 | -${report.totalDeduction} |`);
  lines.push(`| **最终得分** | **${report.finalScore}** |`);
  lines.push(`| 通过标准 | 零扣分（有任何扣分项即为未通过） |`);
  lines.push(`| 结果 | ${report.passed ? "✅ 通过" : "❌ 未通过"} |`);
  lines.push("");

  lines.push("## 按规范条目扣分汇总");
  lines.push("");
  lines.push("| 规范编号 | 规则 | 次数 | 扣分 |");
  lines.push("|----------|------|------|------|");
  for (const [ruleId, stat] of Object.entries(report.byRule).sort((a, b) => b[1].deduction - a[1].deduction)) {
    lines.push(`| ${stat.specRef} | ${stat.title} | ${stat.count} | -${stat.deduction} |`);
  }
  lines.push("");

  lines.push("## 违规明细");
  lines.push("");
  for (const v of report.violations) {
    lines.push(`### ${v.file}:${v.line} — ${v.title} (-${v.deduction}分)`);
    lines.push("");
    lines.push(`- **规范编号**: ${v.specRef}`);
    lines.push(`- **类别**: ${v.category}`);
    lines.push(`- **严重级别**: ${v.severity}`);
    lines.push(`- **问题**: ${v.message}`);
    lines.push(`- **规范说明**: ${v.description}`);
    lines.push("");
    lines.push("```java");
    for (const b of v.contextBefore ?? []) lines.push(b);
    lines.push(`>>> ${v.snippet}`);
    for (const a of v.contextAfter ?? []) lines.push(a);
    lines.push("```");
    lines.push("");
  }

  return lines.join("\n");
}
