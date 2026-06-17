import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export function collectJavaFiles(paths: string[], repoRoot: string): string[] {
  const result = new Set<string>();
  for (const input of paths) {
    walk(input, repoRoot, result);
  }
  return [...result].sort();
}

function walk(current: string, repoRoot: string, out: Set<string>): void {
  let stat;
  try {
    stat = statSync(current);
  } catch {
    return;
  }
  if (stat.isFile()) {
    if (current.endsWith(".java")) out.add(current);
    return;
  }
  if (!stat.isDirectory()) return;
  for (const entry of readdirSync(current)) {
    if (entry === "node_modules" || entry === ".git" || entry === "target" || entry === "build") {
      continue;
    }
    walk(join(current, entry), repoRoot, out);
  }
}

export interface SourceLine {
  number: number;
  text: string;
}

export function readSource(filePath: string): SourceLine[] {
  const content = readFileSync(filePath, "utf8");
  return content.split(/\r?\n/).map((text, index) => ({ number: index + 1, text }));
}

export function makeSnippet(
  lines: SourceLine[],
  lineNumber: number,
  context = 2
): { snippet: string; contextBefore: string[]; contextAfter: string[] } {
  const idx = lineNumber - 1;
  const before = lines.slice(Math.max(0, idx - context), idx).map((l) => l.text);
  const after = lines.slice(idx + 1, idx + 1 + context).map((l) => l.text);
  const current = lines[idx]?.text ?? "";
  return {
    snippet: current,
    contextBefore: before,
    contextAfter: after,
  };
}

export function relPath(filePath: string, repoRoot: string): string {
  return relative(repoRoot, filePath).replace(/\\/g, "/");
}
