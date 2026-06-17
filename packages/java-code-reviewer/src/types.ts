export type CheckerType =
  | "regex"
  | "line-length"
  | "naming-class"
  | "naming-method"
  | "naming-constant"
  | "naming-variable"
  | "missing-javadoc-class"
  | "missing-javadoc-public-method"
  | "wildcard-import"
  | "empty-catch"
  | "system-out"
  | "magic-number"
  | "todo-without-issue"
  | "public-field"
  // 团队规范专用（后端日常开发检查评估准则）
  | "controller-layer-violation"
  | "concrete-injection"
  | "controller-business-logic"
  | "static-mutable-field"
  | "new-in-loop"
  | "silent-catch"
  | "unsafe-collection-access"
  | "sql-injection"
  | "executors-abuse"
  | "thread-local-leak"
  | "resource-leak"
  | "hardcoded-config"
  | "method-too-long"
  | "log-concat"
  | "jdbc-direct"
  | "vector-usage"
  | "field-injection"
  | "catch-too-broad"
  | "equals-npe-risk"
  | "raw-generic"
  | "too-many-params";

export interface RuleDefinition {
  id: string;
  category: string;
  /** 规范原文条目编号，如「3.2.1」 */
  specRef: string;
  title: string;
  description: string;
  deduction: number;
  severity: "error" | "warning" | "info";
  checker: CheckerType;
  /** checker 专用参数 */
  config?: Record<string, unknown>;
  enabled?: boolean;
}

export interface RulesFile {
  version: string;
  baseScore: number;
  minPassScore: number;
  rules: RuleDefinition[];
}

export interface Violation {
  ruleId: string;
  specRef: string;
  category: string;
  title: string;
  description: string;
  deduction: number;
  severity: "error" | "warning" | "info";
  file: string;
  line: number;
  column?: number;
  message: string;
  snippet: string;
  contextBefore?: string[];
  contextAfter?: string[];
}

export interface FileReviewResult {
  file: string;
  violations: Violation[];
  deduction: number;
}

export interface ReviewReport {
  generatedAt: string;
  baseScore: number;
  minPassScore: number;
  totalDeduction: number;
  finalScore: number;
  passed: boolean;
  filesScanned: number;
  /** 实际纳入规范检查统计的代码行数 */
  linesChecked: number;
  /** 变更行模式：仅统计 git diff 中新增/修改的行 */
  diffLinesOnly?: boolean;
  baseRef?: string;
  violationCount: number;
  byCategory: Record<string, { count: number; deduction: number }>;
  byRule: Record<string, { count: number; deduction: number; title: string; specRef: string }>;
  files: FileReviewResult[];
  violations: Violation[];
}

export interface ReviewOptions {
  paths: string[];
  rulesPath: string;
  baseRef?: string;
  changedOnly?: boolean;
  format: Array<"json" | "html" | "console" | "markdown">;
  outDir?: string;
  repoRoot?: string;
}
