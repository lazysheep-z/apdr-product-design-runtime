import type { FileReviewResult, ReviewOptions, ReviewReport, RulesFile } from "../types.js";
import { runChecker } from "../checkers/index.js";
import { collectJavaFiles, readSource, relPath } from "./files.js";
import { getChangedJavaFiles, getChangedLineNumbers } from "../git/diff.js";
import { loadRules } from "../rules/load-rules.js";

export function runReview(options: ReviewOptions): ReviewReport {
  const repoRoot = options.repoRoot ?? process.cwd();
  const rules = loadRules(options.rulesPath);

  let files: string[];
  if (options.changedOnly) {
    files = getChangedJavaFiles(repoRoot, options.baseRef);
  } else {
    files = collectJavaFiles(options.paths, repoRoot);
  }

  const diffLinesOnly = Boolean(options.changedOnly);
  const baseRef = options.baseRef ?? "origin/main";
  const fileResults: FileReviewResult[] = [];
  const allViolations = [];
  let linesChecked = 0;

  for (const filePath of files) {
    const lines = readSource(filePath);
    const content = lines.map((l) => l.text).join("\n");
    const ctx = {
      filePath,
      relFile: relPath(filePath, repoRoot),
      lines,
      content,
    };
    let violations = [];
    for (const rule of rules.rules) {
      violations.push(...runChecker(rule, ctx));
    }
    if (diffLinesOnly) {
      const changedLines = getChangedLineNumbers(repoRoot, baseRef, filePath);
      linesChecked += changedLines?.size ?? 0;
      if (changedLines) {
        violations = violations.filter((v) => changedLines.has(v.line));
      }
    } else {
      linesChecked += lines.length;
    }
    const deduction = violations.reduce((sum, v) => sum + v.deduction, 0);
    fileResults.push({ file: ctx.relFile, violations, deduction });
    allViolations.push(...violations);
  }

  const totalDeduction = allViolations.reduce((sum, v) => sum + v.deduction, 0);
  const finalScore = Math.max(0, rules.baseScore - totalDeduction);
  // 通过标准：有任何扣分即为未通过（不以分数及格线为准）
  const passed = totalDeduction === 0;

  const byCategory: ReviewReport["byCategory"] = {};
  const byRule: ReviewReport["byRule"] = {};
  for (const v of allViolations) {
    byCategory[v.category] ??= { count: 0, deduction: 0 };
    byCategory[v.category].count++;
    byCategory[v.category].deduction += v.deduction;

    byRule[v.ruleId] ??= {
      count: 0,
      deduction: 0,
      title: v.title,
      specRef: v.specRef,
    };
    byRule[v.ruleId].count++;
    byRule[v.ruleId].deduction += v.deduction;
  }

  return {
    generatedAt: new Date().toISOString(),
    baseScore: rules.baseScore,
    minPassScore: rules.minPassScore,
    totalDeduction,
    finalScore,
    passed: passed,
    filesScanned: files.length,
    linesChecked,
    diffLinesOnly,
    baseRef: diffLinesOnly ? baseRef : undefined,
    violationCount: allViolations.length,
    byCategory,
    byRule,
    files: fileResults,
    violations: allViolations.sort((a, b) =>
      a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)
    ),
  };
}

export { loadRules };
export type { RulesFile };
