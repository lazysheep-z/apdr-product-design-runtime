import type { RuleDefinition, Violation } from "../types.js";
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

function isControllerFile(ctx: CheckContext): boolean {
  return /Controller\.java$/i.test(ctx.filePath) || /@RestController|@Controller/.test(ctx.content);
}

function prevLines(lines: SourceLine[], idx: number, count: number): string {
  return lines
    .slice(Math.max(0, idx - count), idx)
    .map((l) => l.text)
    .join("\n");
}

function isCommentLine(text: string): boolean {
  const t = text.trim();
  return t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.endsWith("*/");
}

/** 一-1 Controller 跨层依赖 Repository/Mapper/Dao */
export function checkControllerLayerViolation(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  if (!isControllerFile(ctx)) return [];
  const patterns = [
    /import\s+[\w.]+\.(?:[\w.]+\.)?(?:Repository|Mapper|Dao)\b/,
    /import\s+[\w.]+\.entity\./,
    /import\s+[\w.]+\.model\./,
  ];
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    for (const re of patterns) {
      if (re.test(line.text)) {
        violations.push(
          baseViolation(rule, ctx, line.number, "Controller 层禁止直接依赖 Repository/Mapper/Entity")
        );
        break;
      }
    }
  }
  return violations;
}

/** 一-2 注入具体实现类而非接口 */
export function checkConcreteInjection(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /@(?:Autowired|Resource)\s*\n?\s*(?:private|protected|public)?\s+(\w+Impl)\s+(\w+)/;
  const violations: Violation[] = [];
  for (let i = 0; i < ctx.lines.length; i++) {
    const block = ctx.lines.slice(i, Math.min(i + 3, ctx.lines.length)).map((l) => l.text).join("\n");
    const m = block.match(re);
    if (m && m[2]) {
      const lineNum = ctx.lines.slice(i, i + 3).find((l) => l.text.includes(m[2]!))?.number ?? ctx.lines[i].number;
      violations.push(
        baseViolation(rule, ctx, lineNum, `禁止直接注入实现类「${m[1]}」，应依赖接口`)
      );
    }
  }
  return violations;
}

/** 一-5 Controller 内出现事务/复杂业务特征 */
export function checkControllerBusinessLogic(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  if (!isControllerFile(ctx)) return [];
  const keywords =
    /@Transactional|\.save\(|\.update\(|\.delete\(|\.insert\(|for\s*\(|while\s*\(|BigDecimal\s+\w+\s*=|\+\s*\w+\s*\*|calculate|compute/i;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (keywords.test(line.text) && !line.text.trim().startsWith("//")) {
      violations.push(
        baseViolation(rule, ctx, line.number, "Controller 层应只做参数校验与返回封装，业务逻辑需下沉 Service")
      );
    }
  }
  return violations;
}

/** 一-6 静态可变字段（非 Logger） */
export function checkStaticMutableField(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /static\s+(?!final)(?!void\b)(?!.*Logger)\S+\s+\w+/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (isCommentLine(line.text)) continue;
    if (/\w+\s*\([^)]*\)/.test(line.text)) continue;
    if (re.test(line.text) && !line.text.includes("Logger") && !line.text.includes("log")) {
      violations.push(
        baseViolation(rule, ctx, line.number, "禁止滥用 static 可变字段存储状态，高并发下会导致请求污染")
      );
    }
  }
  return violations;
}

/** 一-7 循环/高频路径中 new 重型对象 */
export function checkNewInLoop(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const heavy =
    /new\s+(?:\w*(?:Client|Connection|Session|Context|Pool|Factory|Template|Builder|ObjectMapper|RestTemplate|HttpClient)\w*)\s*\(/;
  const loopRe = /^\s*(?:for|while)\s*\(/;
  const violations: Violation[] = [];
  let inLoop = false;
  let braceDepth = 0;
  for (const line of ctx.lines) {
    if (loopRe.test(line.text)) inLoop = true;
    if (inLoop) {
      if (line.text.includes("{")) braceDepth += (line.text.match(/{/g) ?? []).length;
      if (line.text.includes("}")) {
        braceDepth -= (line.text.match(/}/g) ?? []).length;
        if (braceDepth <= 0) inLoop = false;
      }
      if (heavy.test(line.text)) {
        violations.push(
          baseViolation(rule, ctx, line.number, "禁止在循环或高频路径中重复创建 Client/Connection 等重型对象")
        );
      }
    }
  }
  return violations;
}

/** 一-8 / 二-13 异常静默处理 */
export function checkSilentCatch(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const violations: Violation[] = [];
  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i].text;
    if (/catch\s*\([^)]+\)\s*\{\s*\}/.test(line)) {
      violations.push(baseViolation(rule, ctx, ctx.lines[i].number, "catch 块为空，禁止静默失败"));
      continue;
    }
    if (!/catch\s*\(/.test(line)) continue;
    const block = ctx.lines.slice(i, Math.min(i + 8, ctx.lines.length)).map((l) => l.text).join("\n");
    if (/catch\s*\([^)]+\)\s*\{/.test(block)) {
      const hasLog =
        /(?:log|logger|LOG)\.(?:error|warn|info|debug|trace)\s*\(/.test(block) ||
        /printStackTrace\s*\(/.test(block) ||
        /throw\s+new/.test(block);
      if (!hasLog) {
        violations.push(
          baseViolation(rule, ctx, ctx.lines[i].number, "catch 后必须记录日志或重新抛出，禁止静默处理")
        );
      }
    }
  }
  return violations;
}

/** 一-10 集合/数组未判空直接 get(0) 或 [0] */
export function checkUnsafeCollectionAccess(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const violations: Violation[] = [];
  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i].text;
    if (isCommentLine(line)) continue;
    if (!/\.get\s*\(\s*0\s*\)|\[\s*0\s*\]/.test(line)) continue;
    // Selenium executeScript 中 JS 的 arguments[n]，非 Java 集合访问
    if (/arguments\s*\[/.test(line)) continue;
    const context = prevLines(ctx.lines, i, 5) + "\n" + line;
    if (/isEmpty\s*\(\s*\)|size\s*\(\s*\)\s*>\s*0|length\s*>\s*0|Optional|Objects\.requireNonNull/.test(context)) {
      continue;
    }
    // 项目约定：getProxyAuthInfoByType 固定返回 [user, pwd] 二元组
    const arrAssign = line.match(/(\w+)\[\s*0\s*\]/)?.[1];
    if (
      arrAssign &&
      /getProxyAuthInfoByType\s*\(/.test(context) &&
      new RegExp(`String\\[\\]\\s+${arrAssign}\\s*=\\s*[^;]*getProxyAuthInfoByType`).test(context)
    ) {
      continue;
    }
    if (/new String\s*\[\s*\]\s*\{/.test(context) && /\[\s*[01]\s*\]/.test(line)) {
      continue;
    }
    violations.push(
      baseViolation(rule, ctx, ctx.lines[i].number, "集合/数组取值前必须判空或检查长度，禁止直接 get(0)/[0]")
    );
  }
  return violations;
}

/** 一-12 SQL 拼接注入风险 */
export function checkSqlInjection(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const sqlKeywordInString =
    /["'][^"']*\b(?:select|insert|update|delete)\b[^"']*["']\s*\+/i;
  const sqlVarAssign =
    /String\s+\w*sql\w*\s*=.*["'][^"']*(?:select|insert|update|delete)\b[^"']*["']\s*\+/i;
  const jdbcExecConcat = /\.(?:execute(?:Query|Update)|queryFor(?:List|Object|Map))\([^)]*\+[^)]*\)/i;
  const mybatisInterpolation = /\$\{[^}]+\}/;
  const patterns = [sqlKeywordInString, sqlVarAssign, jdbcExecConcat];
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    const text = line.text;
    if (text.trim().startsWith("//")) continue;
    // HTTP URL 拼接（非 SQL）：爬虫/API 请求地址
    if (
      /https?:\/\//.test(text) ||
      /set(?:Task)?Url\s*\(/.test(text) ||
      /URLEncoder\.encode/.test(text) ||
      /HttpGet|HttpPost|RestTemplate|WebClient/.test(text)
    ) {
      continue;
    }
    // Spring @Value("${key}") 是配置注入，不是 MyBatis SQL 插值
    if (/@Value\s*\(\s*["']\$\{/.test(text)) continue;
    for (const re of patterns) {
      if (re.test(text)) {
        violations.push(
          baseViolation(rule, ctx, line.number, "禁止拼接用户输入到 SQL，必须使用参数化查询")
        );
        break;
      }
    }
    if (
      mybatisInterpolation.test(text) &&
      (/\b(?:select|insert|update|delete|where|from)\b/i.test(text) || /\w*sql\w*/i.test(text))
    ) {
      violations.push(
        baseViolation(rule, ctx, line.number, "禁止拼接用户输入到 SQL，必须使用参数化查询")
      );
    }
  }
  return violations;
}

/** 一-15 Java 线程池滥用 */
export function checkExecutorsAbuse(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /Executors\.(?:newCachedThreadPool|newFixedThreadPool|newSingleThreadExecutor|newScheduledThreadPool)/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (re.test(line.text)) {
      violations.push(
        baseViolation(rule, ctx, line.number, "禁止直接使用 Executors 工厂创建线程池，应使用 ThreadPoolExecutor 并配置边界")
      );
    }
  }
  return violations;
}

/** 一-15 ThreadLocal 未 remove */
export function checkThreadLocalLeak(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  if (!/ThreadLocal/.test(ctx.content)) return [];
  if (/\.remove\s*\(\s*\)/.test(ctx.content)) return [];
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (/ThreadLocal/.test(line.text)) {
      violations.push(
        baseViolation(rule, ctx, line.number, "ThreadLocal 使用后必须在 finally 中 remove，防止内存泄漏")
      );
      break;
    }
  }
  return violations;
}

/** 一-15 / 三-37 资源未使用 try-with-resources */
export function checkResourceLeak(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const resourceRe =
    /new\s+(?:FileInputStream|FileOutputStream|BufferedReader|BufferedWriter|Socket|Connection|Statement|ResultSet|InputStream|OutputStream)/;
  const violations: Violation[] = [];
  for (let i = 0; i < ctx.lines.length; i++) {
    if (!resourceRe.test(ctx.lines[i].text)) continue;
    const context = prevLines(ctx.lines, i, 3);
    if (/try\s*\(/.test(context)) continue;
    violations.push(
      baseViolation(rule, ctx, ctx.lines[i].number, "IO/连接资源必须使用 try-with-resources 或在 finally 中关闭")
    );
  }
  return violations;
}

/** 二-4 配置硬编码 IP/超时 */
export function checkHardcodedConfig(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const patterns = [
    /\b\d{1,3}(?:\.\d{1,3}){3}\b/,
    /timeout\s*=\s*\d{3,}/i,
    /http:\/\/[^\s"']+/i,
  ];
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    const trimmed = line.text.trim();
    if (trimmed.startsWith("//") || line.text.includes("@Value")) continue;
    // 已定义为 public static final 常量的 URL/IP 不算硬编码
    if (/public\s+static\s+final/.test(trimmed)) continue;
    for (const re of patterns) {
      if (re.test(line.text)) {
        violations.push(
          baseViolation(rule, ctx, line.number, "环境配置/IP/超时时间禁止硬编码，应放入配置中心")
        );
        break;
      }
    }
  }
  return violations;
}

/** 二-16 方法过长 */
export function checkMethodTooLong(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const max = Number(rule.config?.maxLines ?? 300);
  const methodStart =
    /^\s*(?:public|private|protected)\s+(?:static\s+)?(?:[\w<>\[\],?\s]+)\s+(\w+)\s*\([^)]*\)\s*\{/;
  const violations: Violation[] = [];
  for (let i = 0; i < ctx.lines.length; i++) {
    if (!methodStart.test(ctx.lines[i].text)) continue;
    let depth = 0;
    let started = false;
    let lineCount = 0;
    for (let j = i; j < ctx.lines.length; j++) {
      const t = ctx.lines[j].text;
      if (t.includes("{")) {
        depth += (t.match(/{/g) ?? []).length;
        started = true;
      }
      if (started) lineCount++;
      if (t.includes("}")) depth -= (t.match(/}/g) ?? []).length;
      if (started && depth <= 0) break;
    }
    if (lineCount > max) {
      const m = ctx.lines[i].text.match(methodStart);
      violations.push(
        baseViolation(
          rule,
          ctx,
          ctx.lines[i].number,
          `方法「${m?.[1] ?? "unknown"}」共 ${lineCount} 行，超过上限 ${max} 行，应拆分`
        )
      );
    }
  }
  return violations;
}

/** 二-22 Java 日志字符串拼接 */
export function checkLogConcat(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /log\.(?:trace|debug|info|warn|error)\([^)]*\+[^)]*\)/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (re.test(line.text.replace(/\s+/g, " "))) {
      violations.push(
        baseViolation(rule, ctx, line.number, "日志应使用占位符 {} 而非字符串拼接")
      );
    }
  }
  return violations;
}

/** 二-23 JDBC 直连 */
export function checkJdbcDirect(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /DriverManager\.getConnection/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (re.test(line.text)) {
      violations.push(
        baseViolation(rule, ctx, line.number, "禁止 DriverManager 直连，应使用连接池（如 HikariCP）")
      );
    }
  }
  return violations;
}

/** 二-25 低效 Vector */
export function checkVectorUsage(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /(?:new\s+Vector|import\s+java\.util\.Vector|<\s*Vector\s*<)/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (re.test(line.text)) {
      violations.push(
        baseViolation(rule, ctx, line.number, "禁止使用 Vector，应使用 ArrayList 等现代集合")
      );
    }
  }
  return violations;
}

/** 三-34 字段注入 */
export function checkFieldInjection(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /@Autowired\s*\n?\s*(?:private|protected|public)\s+/;
  const violations: Violation[] = [];
  for (let i = 0; i < ctx.lines.length; i++) {
    const block = ctx.lines.slice(i, Math.min(i + 2, ctx.lines.length)).map((l) => l.text).join("\n");
    if (re.test(block) && !/@RequiredArgsConstructor|constructor/i.test(ctx.content.slice(0, 500))) {
      violations.push(
        baseViolation(rule, ctx, ctx.lines[i].number, "推荐使用构造器注入，避免 @Autowired 字段注入")
      );
    }
  }
  return violations;
}

/** 三-32 捕获 Exception 过宽 */
export function checkCatchTooBroad(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /catch\s*\(\s*Exception\s+\w+\s*\)/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (re.test(line.text)) {
      violations.push(
        baseViolation(rule, ctx, line.number, "避免直接 catch Exception，应捕获具体异常类型")
      );
    }
  }
  return violations;
}

/** 三-36 equals 空指针风险：变量.equals("literal") */
export function checkEqualsNpeRisk(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /\b(\w+)\.equals\s*\(\s*["']/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    const m = line.text.match(re);
    if (m && m[1] !== "Objects" && m[1] !== "String") {
      violations.push(
        baseViolation(rule, ctx, line.number, `建议使用 Objects.equals 或 "literal".equals(${m[1]}) 避免 NPE`)
      );
    }
  }
  return violations;
}

/** 三-39 原始类型泛型 */
export function checkRawGeneric(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const re = /(?:List|Map|Set|Collection|Iterator)\s+\w+\s*[;=]/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    if (re.test(line.text) && !/<\s*\w+/.test(line.text)) {
      violations.push(
        baseViolation(rule, ctx, line.number, "集合声明必须指定泛型参数，禁止使用原始类型")
      );
    }
  }
  return violations;
}

/** 三-40 方法参数过多 */
export function checkTooManyParams(rule: RuleDefinition, ctx: CheckContext): Violation[] {
  const max = Number(rule.config?.max ?? 5);
  const re = /(?:public|private|protected)\s+(?:static\s+)?(?:[\w<>\[\],?\s]+)\s+\w+\s*\(([^)]*)\)/;
  const violations: Violation[] = [];
  for (const line of ctx.lines) {
    const m = line.text.match(re);
    if (!m) continue;
    const params = m[1].split(",").filter((p) => p.trim().length > 0);
    if (params.length > max) {
      violations.push(
        baseViolation(rule, ctx, line.number, `方法参数 ${params.length} 个，超过 ${max} 个，应封装为对象`)
      );
    }
  }
  return violations;
}

export const TEAM_CHECKERS: Record<string, CheckerFn> = {
  "controller-layer-violation": checkControllerLayerViolation,
  "concrete-injection": checkConcreteInjection,
  "controller-business-logic": checkControllerBusinessLogic,
  "static-mutable-field": checkStaticMutableField,
  "new-in-loop": checkNewInLoop,
  "silent-catch": checkSilentCatch,
  "unsafe-collection-access": checkUnsafeCollectionAccess,
  "sql-injection": checkSqlInjection,
  "executors-abuse": checkExecutorsAbuse,
  "thread-local-leak": checkThreadLocalLeak,
  "resource-leak": checkResourceLeak,
  "hardcoded-config": checkHardcodedConfig,
  "method-too-long": checkMethodTooLong,
  "log-concat": checkLogConcat,
  "jdbc-direct": checkJdbcDirect,
  "vector-usage": checkVectorUsage,
  "field-injection": checkFieldInjection,
  "catch-too-broad": checkCatchTooBroad,
  "equals-npe-risk": checkEqualsNpeRisk,
  "raw-generic": checkRawGeneric,
  "too-many-params": checkTooManyParams,
};
