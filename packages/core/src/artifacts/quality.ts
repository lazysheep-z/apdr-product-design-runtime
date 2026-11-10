/** Structural approval checks. Evidence contents still require a real review. */
export interface QualityVerification {
  sourceSha256: string;
  testedSha256: string;
  scope: string;
  checks: Array<{
    id: string;
    required: boolean;
    status: "passed" | "failed" | "blocked" | "not_executed" | "not_applicable";
    evidence?: string[];
    reason?: string;
  }>;
  issues: Array<{
    id: string;
    severity: "critical" | "major" | "minor" | "info";
    status: "open" | "fixed" | "verified";
  }>;
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const nonempty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const relativeEvidence = (value: unknown): boolean => nonempty(value) &&
  !/^(?:[a-z][a-z\d+.-]*:|\/|\\)/i.test(value) &&
  !value.includes("\\") && !value.split("/").some(part => part === ".." || part === "." || part === "") &&
  !/[\x00-\x1f]/.test(value);

export function reviewApprovalBlockers(type: string, content: unknown): string[] {
  if (type !== "DesignReviewReport" && type !== "QualityReport") return [];
  if (!record(content) || content.passed !== true) return ["Review must explicitly have passed=true before approval."];
  if (!("verification" in content)) return []; // Legacy reports remain compatible.
  const v = content.verification;
  if (!record(v)) return ["verification must be an object."];
  const errors: string[] = [];
  if (!nonempty(v.sourceSha256) || !/^[a-f\d]{64}$/i.test(v.sourceSha256) || v.sourceSha256 !== v.testedSha256)
    errors.push("Evidence must match the current source SHA-256.");
  if (!nonempty(v.scope)) errors.push("Verification scope is required.");
  if (!Array.isArray(v.checks) || v.checks.length === 0) errors.push("Verification checks must not be empty.");
  else {
    const ids = new Set<string>();
    for (const c of v.checks) {
      if (!record(c) || !nonempty(c.id) || typeof c.required !== "boolean" ||
          !["passed", "failed", "blocked", "not_executed", "not_applicable"].includes(String(c.status))) {
        errors.push("Malformed verification check."); continue;
      }
      if (ids.has(c.id)) errors.push(`Duplicate check: ${c.id}`);
      ids.add(c.id);
      if (c.required && c.status !== "passed") errors.push(`Required check did not pass: ${c.id}`);
      if (c.status === "passed" && (!Array.isArray(c.evidence) || c.evidence.length === 0 || !c.evidence.every(relativeEvidence)))
        errors.push(`Passed check needs project-relative evidence: ${c.id}`);
      if (c.status === "not_applicable" && !nonempty(c.reason)) errors.push(`Not-applicable check needs a reason: ${c.id}`);
      if (c.status === "failed") errors.push(`Failed check remains in scope: ${c.id}`);
    }
  }
  if (!Array.isArray(v.issues)) errors.push("Verification issues must be an array (empty is allowed).");
  else for (const issue of v.issues) {
    if (!record(issue) || !nonempty(issue.id) || !["critical", "major", "minor", "info"].includes(String(issue.severity)) ||
        !["open", "fixed", "verified"].includes(String(issue.status))) errors.push("Malformed verification issue.");
    else if (["critical", "major"].includes(String(issue.severity)) && issue.status !== "verified")
      errors.push(`Serious issue requires a verified retest: ${issue.id}`);
  }
  return errors;
}
