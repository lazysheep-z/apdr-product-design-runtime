import type { RuleDefinition, Violation } from "../types.js";
import { TEAM_CHECKERS } from "./team-checkers.js";
import { makeSnippet, type SourceLine } from "../engine/files.js";

export interface CheckContext {
  filePath: string;
  relFile: string;
  lines: SourceLine[];
  content: string;
}

export type CheckerFn = (rule: RuleDefinition, ctx: CheckContext) => Violation[];

function baseViolation(
  rule: RuleDefinition,
  ctx: CheckContext,
  line: number,
  message: string
): Violation {
  const { snippet, contextBefore, contextAfter } = makeSnippet(ctx.lines, line);
  return {
    ruleId: rule.id,
    specRef: rule.specRef,
    category: rule.category,
    title: rule.title,
    description: rule.description,
    deduction: rule.deduction,
    severity: rule.severity,
    file: ctx.relFile,
    line,
    message,
    snippet,
    contextBefore,
    contextAfter,
  };
}

export function checkRegex(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const pattern = String(rule.config?.pattern ?? "");
  if (!pattern) return [];
  const flags = String(rule.config?.flags ?? "gm");
  const re = new RegExp(pattern, flags);
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (line.text.trim().startsWith("//") || line.text.trim().startsWith("*")) continue;
    re.lastIndex = 0;
    if (re.test(line.text)) {
      violations.push(
        baseViolation(rule, ctx, line.number, String(rule.config?.message ?? rule.title))
      );
    }
  }
  return violations;
}

export function checkLineLength(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const max = Number(rule.config?.max ?? 120);
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (line.text.length > max) {
      violations.push(
        baseViolation(
          rule,
          ctx,
          line.number,
          `行长度 ${line.text.length} 超过上限 ${max} 字符`
        )
      );
    }
  }
  return violations;
}

export function checkNamingClass(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /^\s*(?:public\s+|private\s+|protected\s+)?(?:abstract\s+|final\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    const m = line.text.match(re);
    if (m && !/^[A-Z][A-Za-z0-9]*$/.test(m[1])) {
      violations.push(
        baseViolation(rule, ctx, line.number, `类名「${m[1]}」应使用 UpperCamelCase`)
      );
    }
  }
  return violations;
}

export function checkNamingMethod(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re =
    /^\s*(?:public|private|protected)\s+(?:static\s+)?(?:final\s+)?(?:[\w<>\[\],?\s]+)\s+([a-zA-Z_][\w]*)\s*\(/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (/^\s*\/\//.test(line.text) || /^\s*\*/.test(line.text)) continue;
    const m = line.text.match(re);
    if (!m) continue;
    const name = m[1];
    if (name === "class" || name === "if" || name === "for") continue;
    if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) {
      violations.push(
        baseViolation(rule, ctx, line.number, `方法名「${name}」应使用 lowerCamelCase`)
      );
    }
  }
  return violations;
}

export function checkNamingConstant(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /^\s*(?:public|private|protected)\s+static\s+final\s+[\w<>\[\],?\s]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    const m = line.text.match(re);
    if (m && !/^[A-Z][A-Z0-9_]*$/.test(m[1])) {
      violations.push(
        baseViolation(rule, ctx, line.number, `常量「${m[1]}」应使用 UPPER_SNAKE_CASE`)
      );
    }
  }
  return violations;
}

export function checkNamingVariable(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /^\s*(?:[\w<>\[\],?\s]+)\s+([a-zA-Z_][A-Za-z0-9_]*)\s*[=;]/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (/^\s*(public|private|protected|class|interface|enum|if|for|while|return)\b/.test(line.text)) {
      continue;
    }
    const m = line.text.match(re);
    if (m && !/^[a-z][a-zA-Z0-9]*$/.test(m[1])) {
      violations.push(
        baseViolation(rule, ctx, line.number, `局部变量「${m[1]}」应使用 lowerCamelCase`)
      );
    }
  }
  return violations;
}

export function checkMissingJavadocClass(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const violations: Violation[] = [];
  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    if (!/^\s*(?:public\s+)?(?:abstract\s+|final\s+)?class\s+\w+/.test(line.text)) continue;
    const prev = ctx.lines[i - 1]?.text.trim() ?? "";
    const prev2 = ctx.lines[i - 2]?.text.trim() ?? "";
    if (!prev.endsWith("*/") && !prev2.endsWith("*/")) {
      violations.push(
        baseViolation(rule, ctx, line.number, "public/顶层类缺少 Javadoc 注释")
      );
    }
  }
  return violations;
}

export function checkMissingJavadocPublicMethod(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /^\s*public\s+(?!class|interface|enum)(?:static\s+)?(?:[\w<>\[\],?\s]+)\s+\w+\s*\(/;
  const violations: Violation[] = [];
  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    if (!re.test(line.text)) continue;
    if (line.text.includes("@Override")) continue;
    const prev = ctx.lines[i - 1]?.text.trim() ?? "";
    const prev2 = ctx.lines[i - 2]?.text.trim() ?? "";
    if (!prev.endsWith("*/") && !prev2.endsWith("*/")) {
      violations.push(
        baseViolation(rule, ctx, line.number, "public 方法缺少 Javadoc 注释")
      );
    }
  }
  return violations;
}

export function checkWildcardImport(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /^\s*import\s+[\w.]+\.\*;/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (re.test(line.text)) {
      violations.push(baseViolation(rule, ctx, line.number, "禁止使用通配符 import（import xxx.*）"));
    }
  }
  return violations;
}

export function checkEmptyCatch(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const violations: Violation[] = [];
  for (let i = 0; i < ctx.lines.length; i++) {
  if (!/catch\s*\([^)]+\)\s*\{\s*\}/.test(ctx.lines[i].text)) continue;
    violations.push(baseViolation(rule, ctx, ctx.lines[i].number, "catch 块为空，必须记录日志或重新抛出"));
  }
  return violations;
}

export function checkSystemOut(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /\bSystem\.(out|err)\.(print|println|printf)\b/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (re.test(line.text)) {
      violations.push(
        baseViolation(rule, ctx, line.number, "禁止使用 System.out/err，应使用日志框架")
      );
    }
  }
  return violations;
}

export function checkMagicNumber(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const allow = new Set((rule.config?.allow as number[]) ?? [0, 1, -1]);
  const re = /(?<![\w.])(\d{2,})(?![\w.])/g;
  const isEnumFile = /(?:public\s+)?enum\s+\w+/.test(ctx.content);
  const isTestFile =
    /[/\\]src[/\\]test[/\\]/.test(ctx.relFile) || /[/\\]test[/\\]java[/\\]/.test(ctx.relFile);
  if (isTestFile) return [];

  const isInsideString = (text: string, index: number): boolean => {
    let inString = false;
    let quote = "";
    for (let i = 0; i < index; i++) {
      const c = text[i];
      if (!inString && (c === '"' || c === "'")) {
        inString = true;
        quote = c;
      } else if (inString && c === quote && text[i - 1] !== "\\") {
        inString = false;
      }
    }
    return inString;
  };

  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    const trimmed = line.text.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
    // 已是命名常量：public static final / static final
    if (/static\s+final/.test(trimmed)) continue;
    // 枚举项定义：CRAWL_ENUM_12(12, "xxx") 或跨行续写 (32, "xxx")
    if (isEnumFile && /\b[A-Z][A-Z0-9_]*\(\s*-?\d+/.test(trimmed)) continue;
    if (isEnumFile && /^\(\s*-?\d+\s*,/.test(trimmed)) continue;
    if (isEnumFile && /\(\s*-?\d+\s*,\s*"/.test(trimmed)) continue;
    if (/\b[A-Z][A-Z0-9_]*\(\s*-?\d+\s*,/.test(trimmed)) continue;
    // 命名常量数组：COMMENT_CRAWL_ARR = new Integer[]{72, 73, ...}
    if (/private\s+final\s+Integer\[\]\s+\w+/.test(trimmed)) continue;
    if (/^\s+\d+\s*,/.test(trimmed)) continue;
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(line.text)) !== null) {
      if (isInsideString(line.text, m.index ?? 0)) continue;
      const num = Number(m[1]);
      if (!allow.has(num)) {
        violations.push(
          baseViolation(rule, ctx, line.number, `魔法数字 ${num} 应提取为命名常量`)
        );
      }
    }
  }
  return violations;
}

export function checkTodoWithoutIssue(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /\/\/.*\bTODO\b(?!.*#\d+)/i;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (re.test(line.text)) {
      violations.push(
        baseViolation(rule, ctx, line.number, "TODO 注释需关联工单号，如 TODO #1234")
      );
    }
  }
  return violations;
}

export function checkPublicField(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /^\s*public\s+(?!static\s+final|class|interface|enum)[\w<>\[\],?\s]+\s+\w+\s*[;=]/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (re.test(line.text)) {
      violations.push(baseViolation(rule, ctx, line.number, "禁止 public 非 final 字段，应使用 private + getter"));
    }
  }
  return violations;
}

const CHECKERS: Record<string, CheckerFn> = {
  regex: checkRegex,
  "line-length": checkLineLength,
  "naming-class": checkNamingClass,
  "naming-method": checkNamingMethod,
  "naming-constant": checkNamingConstant,
  "naming-variable": checkNamingVariable,
  "missing-javadoc-class": checkMissingJavadocClass,
  "missing-javadoc-public-method": checkMissingJavadocPublicMethod,
  "wildcard-import": checkWildcardImport,
  "empty-catch": checkEmptyCatch,
  "system-out": checkSystemOut,
  "magic-number": checkMagicNumber,
  "todo-without-issue": checkTodoWithoutIssue,
  "public-field": checkPublicField,
  ...TEAM_CHECKERS,
};

export function runChecker(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const fn = CHECKERS[rule.checker];
  if (!fn) {
    throw new Error(`Unknown checker type: ${rule.checker} for rule ${rule.id}`);
  }
  return fn(rule, ctx);
}
