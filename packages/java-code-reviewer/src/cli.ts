#!/usr/bin/env node
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_RULES, reviewAndReport } from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, "..");

function printHelp(): void {
  console.log(`java-review — Java 代码规范检查（含扣分报告）

用法:
  java-review [选项]

选项:
  --path <dir>           扫描目录或单个 .java 文件（可多次指定）
  --rules <file>         规则 YAML 路径（默认: rules/default-rules.yaml）
  --changed-only         仅检查 git 变更的 .java 文件（PR/MR 场景）
  --base <ref>           git 对比基线（默认 origin/main）
  --format <list>        输出格式: console,json,html,markdown（逗号分隔）
  --out <dir>            报告输出目录
  --repo-root <dir>      仓库根目录（默认 cwd）
  --fail-under <score>   低于该分数时 exit 1（默认使用规则文件 minPassScore）
  -h, --help             显示帮助

示例:
  # 检查示例项目并生成 HTML 报告
  java-review --path fixtures/sample-project/src --format html,json,console --out reports

  # MR 场景：只检查相对 main 的变更
  java-review --changed-only --base origin/main --format markdown,json --out reports
`);
}

function parseArgs(argv: string[]) {
  const paths: string[] = [];
  let rulesPath = DEFAULT_RULES;
  let changedOnly = false;
  let baseRef = "origin/main";
  let format: Array<"json" | "html" | "console" | "markdown"> = ["console"];
  let outDir: string | undefined;
  let repoRoot = process.cwd();
  let failUnder: number | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
        break;
      case "--path":
        paths.push(resolve(argv[++i] ?? ""));
        break;
      case "--rules":
        rulesPath = resolve(argv[++i] ?? DEFAULT_RULES);
        break;
      case "--changed-only":
        changedOnly = true;
        break;
      case "--base":
        baseRef = argv[++i] ?? "origin/main";
        break;
      case "--format":
        format = (argv[++i] ?? "console").split(",") as typeof format;
        break;
      case "--out":
        outDir = resolve(argv[++i] ?? "reports");
        break;
      case "--repo-root":
        repoRoot = resolve(argv[++i] ?? process.cwd());
        break;
      case "--fail-under":
        failUnder = Number(argv[++i]);
        break;
      default:
        if (arg.startsWith("-")) {
          console.error(`Unknown option: ${arg}`);
          process.exit(2);
        }
        paths.push(resolve(arg));
    }
  }

  if (!changedOnly && paths.length === 0) {
    paths.push(resolve(repoRoot, "src"));
  }

  if (!rulesPath.includes("/") && !rulesPath.includes("\\")) {
    rulesPath = join(PKG_ROOT, rulesPath);
  }

  return { paths, rulesPath, changedOnly, baseRef, format, outDir, repoRoot, failUnder };
}

const opts = parseArgs(process.argv.slice(2));
const report = reviewAndReport({
  paths: opts.paths,
  rulesPath: opts.rulesPath,
  changedOnly: opts.changedOnly,
  baseRef: opts.baseRef,
  format: opts.format,
  outDir: opts.outDir,
  repoRoot: opts.repoRoot,
});

const threshold = opts.failUnder ?? report.minPassScore;
if (!report.passed || (opts.failUnder != null && report.finalScore < threshold)) {
  process.exit(1);
}
