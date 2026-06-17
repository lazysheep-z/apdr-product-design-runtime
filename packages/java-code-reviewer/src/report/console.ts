import type { ReviewReport } from "../types.js";

export function formatConsoleReport(report: ReviewReport): string {
  const lines: string[] = [];
  lines.push("═".repeat(60));
  lines.push("  Java 代码规范检查报告");
  lines.push("═".repeat(60));
  lines.push(`生成时间: ${report.generatedAt}`);
  lines.push(`扫描文件: ${report.filesScanned} 个`);
  lines.push(`检查行数: ${report.linesChecked} 行`);
  if (report.diffLinesOnly) {
    lines.push(`统计范围: 仅 git diff 新增/修改行 (基线 ${report.baseRef ?? "HEAD~1"})`);
  }
  lines.push(`违规项数: ${report.violationCount} 项`);
  lines.push("");
  lines.push(`基础分: ${report.baseScore}`);
  lines.push(`总扣分: -${report.totalDeduction}`);
  lines.push(`最终得分: ${report.finalScore} / ${report.baseScore}`);
  lines.push(`通过标准: 零扣分（有任何扣分项即为未通过）`);
  lines.push(`结果: ${report.passed ? "✅ 通过" : "❌ 未通过"}`);
  lines.push("");

  if (Object.keys(report.byCategory).length) {
    lines.push("── 按类别扣分 ──");
    for (const [cat, stat] of Object.entries(report.byCategory).sort((a, b) => b[1].deduction - a[1].deduction)) {
      lines.push(`  ${cat}: ${stat.count} 项, -${stat.deduction} 分`);
    }
    lines.push("");
  }

  if (report.violations.length) {
    lines.push("── 违规明细 ──");
    for (const v of report.violations) {
      lines.push("");
      lines.push(`[${v.severity.toUpperCase()}] ${v.file}:${v.line}  (-${v.deduction}分)`);
      lines.push(`  规范: ${v.specRef} ${v.title}`);
      lines.push(`  说明: ${v.message}`);
      lines.push(`  代码: ${v.snippet.trim() || "(空行)"}`);
    }
  } else {
    lines.push("未发现违规项 🎉");
  }

  lines.push("");
  lines.push("═".repeat(60));
  return lines.join("\n");
}
