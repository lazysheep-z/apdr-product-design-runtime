import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runReview } from "./engine/runner.js";
import type { ReviewOptions } from "./types.js";
import { formatConsoleReport } from "./report/console.js";
import { formatHtmlReport } from "./report/html.js";
import { formatMarkdownReport } from "./report/markdown.js";

export { runReview } from "./engine/runner.js";
export type { ReviewReport, ReviewOptions, RulesFile, Violation } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_RULES = join(__dirname, "..", "rules", "default-rules.yaml");

export function writeReports(
  report: Awaited<ReturnType<typeof runReview>>,
  formats: ReviewOptions["format"],
  outDir: string
): void {
  mkdirSync(outDir, { recursive: true });
  if (formats.includes("json")) {
    writeFileSync(join(outDir, "review-report.json"), JSON.stringify(report, null, 2), "utf8");
  }
  if (formats.includes("html")) {
    writeFileSync(join(outDir, "review-report.html"), formatHtmlReport(report), "utf8");
  }
  if (formats.includes("markdown")) {
    writeFileSync(join(outDir, "review-report.md"), formatMarkdownReport(report), "utf8");
  }
}

export function reviewAndReport(options: ReviewOptions) {
  const report = runReview(options);
  if (options.format.includes("console")) {
    console.log(formatConsoleReport(report));
  }
  if (options.outDir) {
    writeReports(report, options.format, resolve(options.outDir));
  }
  return report;
}
