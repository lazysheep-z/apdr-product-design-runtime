import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { CodeIntelligenceReportContent } from "@apdr/core";

const CODEGRAPH_CMD = process.env.APDR_CODEGRAPH_CMD ?? "codegraph";

/**
 * @returns {boolean} Whether the CodeGraph CLI is available on PATH.
 */
export function isCodegraphInstalled(): boolean {
  const r = spawnSync(CODEGRAPH_CMD, ["version"], {
    encoding: "utf-8",
    timeout: 8000,
  });
  return r.status === 0;
}

/**
 * @param {string} cmd
 * @returns {string | undefined}
 */
function readVersion(cmd: string): string | undefined {
  const r = spawnSync(cmd, ["version"], { encoding: "utf-8", timeout: 8000 });
  if (r.status !== 0) return undefined;
  return (r.stdout ?? "").trim() || undefined;
}

/**
 * @param {string[]} args
 * @param {string} cwd
 * @returns {{ ok: boolean; stdout: string; stderr: string }}
 */
export function runCodegraph(
  args: string[],
  cwd: string
): { ok: boolean; stdout: string; stderr: string } {
  const r = spawnSync(CODEGRAPH_CMD, args, {
    cwd,
    encoding: "utf-8",
    timeout: 120_000,
    maxBuffer: 10 * 1024 * 1024,
  });
  return {
    ok: r.status === 0,
    stdout: (r.stdout ?? "").trim(),
    stderr: (r.stderr ?? r.error?.message ?? "").trim(),
  };
}

/**
 * @param {unknown} raw
 * @returns {string[] | undefined}
 */
function parseJsonFileList(raw: string): string[] | undefined {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === "string");
    }
    if (parsed && typeof parsed === "object" && "files" in parsed) {
      const files = (parsed as { files: unknown }).files;
      if (Array.isArray(files)) {
        return files.filter((x): x is string => typeof x === "string");
      }
    }
  } catch {
    /* fall through */
  }
  return undefined;
}

/**
 * @param {string} codeRoot
 * @returns {string[]}
 */
function walkSourceFiles(codeRoot: string): string[] {
  const out: string[] = [];
  const skip = new Set(["node_modules", ".git", "dist", "build", ".codegraph"]);
  const exts = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".vue",
    ".svelte",
    ".html",
    ".css",
  ]);

  /** @param {string} dir @param {string} prefix */
  function walk(dir: string, prefix = ""): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (skip.has(entry.name)) continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, rel);
      } else if (exts.has(path.extname(entry.name))) {
        out.push(rel);
      }
    }
  }

  walk(codeRoot);
  return out.sort();
}

/**
 * @param {string[]} files
 * @param {string} codeRoot
 * @returns {Array<{ name: string; file: string }>}
 */
function inferComponentsFromFiles(
  files: string[],
  codeRoot: string
): Array<{ name: string; file: string }> {
  const components: Array<{ name: string; file: string }> = [];
  const seen = new Set<string>();

  for (const rel of files) {
    const base = path.basename(rel, path.extname(rel));
    const isComponent =
      /(?:^|[/\\])components[/\\]/i.test(rel) ||
      /^[A-Z]/.test(base) ||
      rel.endsWith(".tsx") ||
      rel.endsWith(".jsx");
    if (!isComponent || seen.has(rel)) continue;
    seen.add(rel);
    try {
      const stat = fs.statSync(path.join(codeRoot, rel));
      if (stat.size === 0) continue;
    } catch {
      continue;
    }
    components.push({ name: base, file: rel });
  }

  return components.slice(0, 200);
}

/**
 * @param {string[]} bundleRoutes
 * @param {string[]} files
 * @returns {Array<{ path: string; handler: string; file?: string }>}
 */
function inferRoutes(
  bundleRoutes: string[],
  files: string[]
): Array<{ path: string; handler: string; file?: string }> {
  const routes: Array<{ path: string; handler: string; file?: string }> = [];

  for (const r of bundleRoutes) {
    routes.push({ path: r, handler: "CodeBundle", file: undefined });
  }

  const routeFile = files.find(
    (f) =>
      /routes?[/\\]/i.test(f) ||
      f.endsWith("App.tsx") ||
      f.endsWith("router.tsx") ||
      f.endsWith("router.ts")
  );
  if (routeFile) {
    routes.push({
      path: "(from router file)",
      handler: path.basename(routeFile),
      file: routeFile,
    });
  }

  return routes;
}

export interface BuildCodeIntelligenceInput {
  projectId: string;
  codeRoot: string;
  bundleRoutes?: string[];
}

/**
 * Fully automated CodeGraph indexing + structured report for APDR pipeline.
 *
 * @param {BuildCodeIntelligenceInput} input
 * @returns {CodeIntelligenceReportContent}
 */
export function buildCodeIntelligenceReport(
  input: BuildCodeIntelligenceInput
): CodeIntelligenceReportContent {
  const { projectId, codeRoot, bundleRoutes = [] } = input;
  const indexedAt = new Date().toISOString();
  const indexPath = path.join(codeRoot, ".codegraph");
  const warnings: string[] = [];

  if (!fs.existsSync(codeRoot)) {
    return {
      indexed: false,
      indexPath,
      codeRoot,
      routes: [],
      components: [],
      entryPoints: [],
      indexedAt,
      warnings: [`Code root not found: ${codeRoot}`],
    };
  }

  const version = readVersion(CODEGRAPH_CMD);
  if (!version) {
    warnings.push(
      "CodeGraph CLI not found. Install: bash scripts/install-codegraph.sh"
    );
    const files = walkSourceFiles(codeRoot);
    return {
      indexed: false,
      indexPath,
      codeRoot,
      fileCount: files.length,
      fileTree: files.slice(0, 100),
      routes: inferRoutes(bundleRoutes, files),
      components: inferComponentsFromFiles(files, codeRoot),
      entryPoints: files
        .filter((f) => /main\.(tsx?|jsx?)$/.test(f) || /index\.(tsx?|jsx?)$/.test(f))
        .slice(0, 10)
        .map((f) => ({ symbol: path.basename(f), file: f })),
      indexedAt,
      warnings,
    };
  }

  const init = runCodegraph(["init", codeRoot], process.cwd());
  if (!init.ok) {
    warnings.push(`codegraph init: ${init.stderr || init.stdout}`);
  }

  const status = runCodegraph(["status", codeRoot], process.cwd());
  if (!status.ok) {
    warnings.push(`codegraph status: ${status.stderr || status.stdout}`);
  }

  const filesResult = runCodegraph(
    ["files", codeRoot, "--format", "flat", "--json"],
    process.cwd()
  );
  let fileTree = parseJsonFileList(filesResult.stdout);
  if (!fileTree?.length) {
    fileTree = walkSourceFiles(codeRoot);
  }

  const exploreQueries = [
    "routes and page components",
    "React components exported from this project",
    "application entry points and main render",
  ];
  const exploreChunks: string[] = [];
  for (const q of exploreQueries) {
    const res = runCodegraph(
      ["explore", q, "--projectPath", codeRoot],
      process.cwd()
    );
    if (res.ok && res.stdout) {
      exploreChunks.push(`## ${q}\n${res.stdout.slice(0, 4000)}`);
    } else if (res.stderr) {
      warnings.push(`explore "${q}": ${res.stderr.slice(0, 200)}`);
    }
  }

  const symbolMatch = status.stdout.match(/(\d+)\s+symbols?/i);
  const fileMatch = status.stdout.match(/(\d+)\s+files?/i);

  const components = inferComponentsFromFiles(fileTree, codeRoot);
  const routes = inferRoutes(bundleRoutes, fileTree);
  const entryPoints = fileTree
    .filter((f) => /main\.(tsx?|jsx?)$/.test(f) || /index\.(tsx?|jsx?)$/.test(f))
    .slice(0, 10)
    .map((f) => ({ symbol: path.basename(f, path.extname(f)), file: f }));

  const indexed = fs.existsSync(path.join(indexPath, "codegraph.db")) || init.ok;

  return {
    indexed,
    indexPath,
    codeRoot,
    symbolCount: symbolMatch ? Number(symbolMatch[1]) : undefined,
    fileCount: fileMatch ? Number(fileMatch[1]) : fileTree.length,
    routes,
    components,
    entryPoints,
    fileTree: fileTree.slice(0, 150),
    exploreNotes: exploreChunks.join("\n\n").slice(0, 12000) || undefined,
    statusOutput: status.stdout || undefined,
    codegraphVersion: version,
    indexedAt,
    warnings: [
      ...warnings,
      ...(indexed ? [] : [`Project ${projectId}: index may be incomplete`]),
    ],
  };
}
