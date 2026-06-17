import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";

/** 解析 git diff，返回新文件中本次 commit 新增/修改的行号（+ 行） */
export function getChangedLineNumbers(
  repoRoot: string,
  baseRef: string,
  filePath: string
): Set<number> | null {
  const relPath = relative(repoRoot, filePath).split("\\").join("/");
  const quoted = relPath.includes(" ") ? `"${relPath}"` : relPath;
  let diffOutput = "";
  for (const range of [`${baseRef}..HEAD`, `${baseRef}...HEAD`]) {
    try {
      diffOutput = execSync(`git diff -U0 ${range} -- ${quoted}`, {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      if (diffOutput.trim()) break;
    } catch {
      // try next range syntax
    }
  }
  if (!diffOutput.trim()) return null;

  const changed = new Set<number>();
  let newLine = 0;
  for (const raw of diffOutput.split(/\r?\n/)) {
    const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (hunk) {
      newLine = Number(hunk[1]);
      continue;
    }
    if (raw.startsWith("+++") || raw.startsWith("---") || raw.startsWith("diff ")) continue;
    if (raw.startsWith("+")) {
      changed.add(newLine);
      newLine++;
    } else if (raw.startsWith("-")) {
      // 仅从旧文件删除，新文件行号不变
    } else if (raw.startsWith(" ") || raw.startsWith("\t")) {
      newLine++;
    }
  }
  return changed.size > 0 ? changed : null;
}

export function getChangedJavaFiles(repoRoot: string, baseRef = "origin/main"): string[] {
  if (!isGitRepo(repoRoot)) {
  throw new Error("Not a git repository. Use --path instead of --changed-only.");
  }
  const refs = [baseRef, "HEAD~1", "main", "master"];
  let diffOutput = "";
  for (const ref of refs) {
    try {
      diffOutput = execSync(`git diff --name-only --diff-filter=ACMRT ${ref}...HEAD`, {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      if (diffOutput.trim()) break;
    } catch {
      // try next ref
    }
  }
  if (!diffOutput.trim()) {
    try {
      diffOutput = execSync("git diff --name-only --diff-filter=ACMRT HEAD", {
        cwd: repoRoot,
        encoding: "utf8",
      });
    } catch {
      return [];
    }
  }
  return diffOutput
    .split(/\r?\n/)
    .map((p) => p.trim())
    .filter((p) => p.endsWith(".java"))
    .map((p) => (p.startsWith("/") ? p : join(repoRoot, p)));
}

function isGitRepo(root: string): boolean {
  return existsSync(join(root, ".git"));
}
