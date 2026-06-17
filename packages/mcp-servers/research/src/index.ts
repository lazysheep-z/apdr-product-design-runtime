#!/usr/bin/env node
/**
 * APDR Research MCP v2 — web search, URL fetch, and research note storage.
 *
 * Tools:
 *   search_web         — search the internet for competitive/domain intelligence
 *   fetch_url          — fetch a URL and convert to clean markdown
 *   research_note      — store a structured research note under projects/{id}/research/
 *   list_research_notes — list all saved research notes for a project
 *
 * Future: Integrate SerpAPI, Bing Search, or @mozilla/readability for real content.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { resolveProjectsRoot, textResult } from "@apdr/mcp-shared";

const server = new Server(
  { name: "apdr-research", version: "0.2.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_web",
      description: "Search the web for competitive intelligence or domain research. Returns structured results with title, snippet, URL.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query string" },
          max_results: { type: "number", description: "Max results to return (default 5)", default: 5 },
        },
        required: ["query"],
      },
    },
    {
      name: "fetch_url",
      description: "Fetch a URL and convert its content to markdown for reference capture",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "Full URL including protocol" },
          project_id: { type: "string", description: "Optional: save result to projects/{id}/research/" },
        },
        required: ["url"],
      },
    },
    {
      name: "research_note",
      description: "Store a structured research note for a project under projects/{id}/research/ as markdown",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          query: { type: "string", description: "The research question or topic" },
          summary: { type: "string" },
          source_url: { type: "string", description: "Optional source URL for attribution" },
          tags: { type: "array", items: { type: "string" }, description: "Optional categorization tags" },
        },
        required: ["project_id", "query", "summary"],
      },
    },
    {
      name: "list_research_notes",
      description: "List all saved research notes for a project",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
        },
        required: ["project_id"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  // ─── research_note ─────────────────────────────────
  if (req.params.name === "research_note") {
    const args = req.params.arguments as {
      project_id: string;
      query: string;
      summary: string;
      source_url?: string;
      tags?: string[];
    };
    try {
      const researchDir = path.join(resolveProjectsRoot(), args.project_id, "research");
      await fs.mkdir(researchDir, { recursive: true });
      const slug = args.query
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);
      const notePath = path.join(researchDir, `${slug}.md`);
      const note = [
        `# ${args.query}`,
        ``,
        `**Date**: ${new Date().toISOString().slice(0, 10)}`,
        args.source_url ? `**Source**: ${args.source_url}` : null,
        args.tags?.length ? `**Tags**: ${args.tags.join(", ")}` : null,
        ``,
        args.summary,
        ``,
      ]
        .filter(Boolean)
        .join("\n");
      await fs.writeFile(notePath, note, "utf-8");
      return textResult(
        JSON.stringify({ saved: true, path: notePath, query: args.query }, null, 2)
      );
    } catch (err) {
      return textResult(`Error saving research note: ${err}`, true);
    }
  }

  // ─── list_research_notes ───────────────────────────
  if (req.params.name === "list_research_notes") {
    const { project_id } = req.params.arguments as { project_id: string };
    const researchDir = path.join(resolveProjectsRoot(), project_id, "research");
    try {
      const files = await fs.readdir(researchDir);
      const notes = files.filter((f) => f.endsWith(".md")).map((f) => ({
        filename: f,
        path: path.join(researchDir, f),
      }));
      return textResult(JSON.stringify({ project_id, notes }, null, 2));
    } catch {
      return textResult(JSON.stringify({ project_id, notes: [] }, null, 2));
    }
  }

  // ─── search_web ────────────────────────────────────
  if (req.params.name === "search_web") {
    const { query, max_results } = req.params.arguments as {
      query: string;
      max_results?: number;
    };
    // Stub: integrate real search (SerpAPI / Bing / Tavily) in M1
    return textResult(
      JSON.stringify(
        {
          note: "Web search stub — integrate SerpAPI/Bing/Tavily for real results.",
          query,
          max_results: max_results ?? 5,
          results: [
            {
              title: "Agent-inferred or user-provided context",
              snippet: `Search query: "${query}". Use browser or baoyu-url-to-markdown for deeper research.`,
              url: null,
            },
          ],
        },
        null,
        2
      )
    );
  }

  // ─── fetch_url ─────────────────────────────────────
  if (req.params.name === "fetch_url") {
    const { url, project_id } = req.params.arguments as {
      url: string;
      project_id?: string;
    };
    // Stub: use @mozilla/readability or headless browser for real conversion
    const result: Record<string, unknown> = {
      note: "URL fetch stub — use baoyu-url-to-markdown or fetch+Turndown for real content.",
      url,
    };
    if (project_id) {
      result.project_id = project_id;
      try {
        const researchDir = path.join(resolveProjectsRoot(), project_id, "research");
        await fs.mkdir(researchDir, { recursive: true });
        const safeName = url.replace(/https?:\/\//, "").replace(/[^a-z0-9]+/g, "-").slice(0, 60);
        await fs.writeFile(
          path.join(researchDir, `${safeName}.md`),
          `# Fetched: ${url}\n\n> Placeholder — replace with real content.\n\n**Source**: ${url}\n\n`,
          "utf-8"
        );
      } catch { /* silent */ }
    }
    return textResult(JSON.stringify(result, null, 2));
  }

  return textResult(`Unknown tool: ${req.params.name}`, true);
});

const transport = new StdioServerTransport();
await server.connect(transport);
