#!/usr/bin/env node
/**
 * APDR Repo MCP v2 — template scaffolding and git state inspection.
 *
 * Tools:
 *   scaffold_frontend   — copy template files into projects/{id}/app/
 *   list_templates      — list available scaffolding templates
 *   template_info       — show details about a specific template
 *   check_git_status    — show current git status for a project directory
 *   index_codebase      — CodeGraph init for projects/{id}/app/
 *   build_code_intelligence_report — automated code_intelligence stage output
 *   codegraph_explore   — run codegraph explore query
 *   codegraph_status    — CLI + index diagnostics
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import { resolveProjectsRoot, textResult, buildCodeIntelligenceReport, isCodegraphInstalled, runCodegraph } from "@apdr/mcp-shared";

const REPO_ROOT = path.resolve(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  "../../../.."
);
const TEMPLATES_DIR = path.join(REPO_ROOT, "templates");

async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

const server = new Server(
  { name: "apdr-repo", version: "0.2.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "scaffold_frontend",
      description: "Copy template files into a project's app/ directory",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          stack: {
            type: "string",
            description: "Template name (e.g., react-vite, html, wireframe)",
            default: "react-vite",
          },
        },
        required: ["project_id", "stack"],
      },
    },
    {
      name: "list_templates",
      description: "List available scaffolding templates under templates/",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "template_info",
      description: "Show details about a specific template (files, structure)",
      inputSchema: {
        type: "object",
        properties: {
          template: { type: "string", description: "Template name" },
        },
        required: ["template"],
      },
    },
    {
      name: "check_git_status",
      description: "Check git status summary for a project directory",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
        },
        required: ["project_id"],
      },
    },
    {
      name: "index_codebase",
      description:
        "Initialize or refresh CodeGraph index for a project's app/ directory (codegraph init)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          code_root: {
            type: "string",
            description: "Optional override; defaults to projects/{id}/app",
          },
        },
        required: ["project_id"],
      },
    },
    {
      name: "codegraph_explore",
      description: "Run codegraph explore against an indexed project app directory",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          query: { type: "string" },
          code_root: { type: "string" },
        },
        required: ["project_id", "query"],
      },
    },
    {
      name: "codegraph_status",
      description: "Check CodeGraph CLI availability and index status for a project",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          code_root: { type: "string" },
        },
        required: ["project_id"],
      },
    },
    {
      name: "build_code_intelligence_report",
      description:
        "APDR code_intelligence stage — fully automated CodeGraph init + analysis → CodeIntelligenceReport JSON",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          code_root: {
            type: "string",
            description: "Optional; defaults to projects/{id}/app or CodeBundle.rootPath",
          },
          bundle_routes: {
            type: "array",
            items: { type: "string" },
            description: "Optional route hints from CodeBundle",
          },
        },
        required: ["project_id"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  // ─── scaffold_frontend ─────────────────────────────
  if (req.params.name === "scaffold_frontend") {
    const { project_id, stack } = req.params.arguments as {
      project_id: string;
      stack: string;
    };
    const templateDir = path.join(TEMPLATES_DIR, stack);
    const appDir = path.join(resolveProjectsRoot(), project_id, "app");
    try {
      await fs.access(templateDir);
    } catch {
      return textResult(
        `Template "${stack}" not found at ${templateDir}. Use list_templates to see available.`,
        true
      );
    }
    await copyDir(templateDir, appDir);
    return textResult(
      JSON.stringify(
        {
          scaffolded: true,
          stack,
          project_id,
          app_dir: appDir,
          message: `Copied template "${stack}" to ${appDir}.`,
        },
        null,
        2
      )
    );
  }

  // ─── list_templates ────────────────────────────────
  if (req.params.name === "list_templates") {
    try {
      const entries = await fs.readdir(TEMPLATES_DIR, { withFileTypes: true });
      const templates = entries
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .map((name) => ({ name }));
      return textResult(
        JSON.stringify(
          { template_root: TEMPLATES_DIR, templates },
          null,
          2
        )
      );
    } catch {
      return textResult(
        JSON.stringify({ template_root: TEMPLATES_DIR, templates: [] }, null, 2)
      );
    }
  }

  // ─── template_info ─────────────────────────────────
  if (req.params.name === "template_info") {
    const { template } = req.params.arguments as { template: string };
    const templateDir = path.join(TEMPLATES_DIR, template);
    try {
      await fs.access(templateDir);
      const entries: string[] = [];
      async function walk(dir: string, prefix = ""): Promise<void> {
        const items = await fs.readdir(dir, { withFileTypes: true });
        for (const item of items) {
          const full = path.join(dir, item.name);
          if (item.isDirectory()) {
            await walk(full, `${prefix}${item.name}/`);
          } else {
            entries.push(`${prefix}${item.name}`);
          }
        }
      }
      await walk(templateDir);
      return textResult(
        JSON.stringify({ template, files: entries }, null, 2)
      );
    } catch {
      return textResult(`Template "${template}" not found.`, true);
    }
  }

  // ─── check_git_status ──────────────────────────────
  if (req.params.name === "check_git_status") {
    const { project_id } = req.params.arguments as { project_id: string };
    const projectDir = path.join(resolveProjectsRoot(), project_id);
    try {
      const output = execSync("git status --short", {
        cwd: projectDir,
        encoding: "utf-8",
        timeout: 5000,
      });
      const lines = output.trim().split("\n").filter(Boolean);
      return textResult(
        JSON.stringify(
          {
            project_id,
            clean: lines.length === 0,
            changes: lines.map((l) => ({
              status: l.slice(0, 2).trim(),
              file: l.slice(3),
            })),
          },
          null,
          2
        )
      );
    } catch (err) {
      return textResult(
        JSON.stringify(
          {
            project_id,
            error: `Git status failed (not a git repo?): ${err instanceof Error ? err.message : err}`,
          },
          null,
          2
        )
      );
    }
  }

  /** @param {string} projectId @param {string | undefined} codeRootOverride */
  function resolveAppRoot(projectId: string, codeRootOverride?: string): string {
    if (codeRootOverride) {
      return path.isAbsolute(codeRootOverride)
        ? codeRootOverride
        : path.join(resolveProjectsRoot(), projectId, codeRootOverride);
    }
    return path.join(resolveProjectsRoot(), projectId, "app");
  }

  // ─── index_codebase ────────────────────────────────
  if (req.params.name === "index_codebase") {
    const { project_id, code_root } = req.params.arguments as {
      project_id: string;
      code_root?: string;
    };
    const appRoot = resolveAppRoot(project_id, code_root);
    if (!isCodegraphInstalled()) {
      return textResult(
        JSON.stringify(
          {
            indexed: false,
            error: "CodeGraph CLI not installed. Run: bash scripts/install-codegraph.sh",
            code_root: appRoot,
          },
          null,
          2
        ),
        true
      );
    }
    const result = runCodegraph(["init", appRoot], process.cwd());
    return textResult(
      JSON.stringify(
        {
          indexed: result.ok,
          project_id,
          code_root: appRoot,
          stdout: result.stdout,
          stderr: result.stderr || undefined,
        },
        null,
        2
      ),
      !result.ok
    );
  }

  // ─── codegraph_explore ─────────────────────────────
  if (req.params.name === "codegraph_explore") {
    const { project_id, query, code_root } = req.params.arguments as {
      project_id: string;
      query: string;
      code_root?: string;
    };
    const appRoot = resolveAppRoot(project_id, code_root);
    const result = runCodegraph(["explore", query, "--projectPath", appRoot], process.cwd());
    return textResult(
      JSON.stringify(
        {
          project_id,
          query,
          code_root: appRoot,
          ok: result.ok,
          output: result.stdout || result.stderr,
        },
        null,
        2
      ),
      !result.ok
    );
  }

  // ─── codegraph_status ──────────────────────────────
  if (req.params.name === "codegraph_status") {
    const { project_id, code_root } = req.params.arguments as {
      project_id: string;
      code_root?: string;
    };
    const appRoot = resolveAppRoot(project_id, code_root);
    const installed = isCodegraphInstalled();
    const status = installed
      ? runCodegraph(["status", appRoot], process.cwd())
      : { ok: false, stdout: "", stderr: "CodeGraph CLI not installed" };
    return textResult(
      JSON.stringify(
        {
          project_id,
          code_root: appRoot,
          cli_installed: installed,
          index_exists: await fs
            .access(path.join(appRoot, ".codegraph", "codegraph.db"))
            .then(() => true)
            .catch(() => false),
          status: status.stdout || status.stderr,
        },
        null,
        2
      )
    );
  }

  // ─── build_code_intelligence_report ────────────────
  if (req.params.name === "build_code_intelligence_report") {
    const { project_id, code_root, bundle_routes } = req.params.arguments as {
      project_id: string;
      code_root?: string;
      bundle_routes?: string[];
    };
    const appRoot = resolveAppRoot(project_id, code_root);
    const report = buildCodeIntelligenceReport({
      projectId: project_id,
      codeRoot: appRoot,
      bundleRoutes: bundle_routes ?? [],
    });
    return textResult(JSON.stringify(report, null, 2));
  }

  return textResult(`Unknown tool: ${req.params.name}`, true);
});

const transport = new StdioServerTransport();
await server.connect(transport);
