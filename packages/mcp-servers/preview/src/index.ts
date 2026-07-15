#!/usr/bin/env node
/**
 * APDR Preview MCP v2 — manage local preview servers for wireframes and frontend code.
 *
 * Tools:
 *   register_preview_url — track a known preview URL for a project page
 *   serve_wireframe      — start a static file server for wireframe HTML files
 *   serve_frontend       — start a static file server for generated frontend code
 *   list_previews        — list all tracked preview servers
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "node:child_process";
import path from "node:path";
import { resolveProjectsRoot, textResult } from "@apdr/mcp-shared";

/** In-memory registry of running preview servers */
const servers: Map<string, { pid: number; url: string; type: string; dir: string }> = new Map();
let portCounter = 3000;

function nextPort(): number {
  return portCounter++;
}

const server = new Server(
  { name: "apdr-preview", version: "0.2.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "register_preview_url",
      description: "Register a known preview URL for a project page (manual tracking)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          page_id: { type: "string" },
          url: { type: "string", description: "Full preview URL including protocol" },
          type: { type: "string", enum: ["wireframe", "frontend"], default: "wireframe" },
        },
        required: ["project_id", "page_id", "url"],
      },
    },
    {
      name: "serve_wireframe",
      description: "Start a local static file server for wireframe HTML files",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          port: { type: "number", description: "Port (default auto)", default: 0 },
        },
        required: ["project_id"],
      },
    },
    {
      name: "serve_frontend",
      description: "Start a local static file server for generated frontend code (app/ dir)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          port: { type: "number", description: "Port (default auto)", default: 0 },
        },
        required: ["project_id"],
      },
    },
    {
      name: "list_previews",
      description: "List all tracked preview servers and their URLs",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  // ─── register_preview_url ──────────────────────────
  if (req.params.name === "register_preview_url") {
    const { project_id, page_id, url, type } = req.params.arguments as {
      project_id: string;
      page_id: string;
      url: string;
      type?: string;
    };
    const key = `${project_id}:${page_id}`;
    servers.set(key, { pid: 0, url, type: type ?? "wireframe", dir: "" });
    return textResult(
      JSON.stringify({ registered: true, key, url, type }, null, 2)
    );
  }

  // ─── serve_wireframe ───────────────────────────────
  if (req.params.name === "serve_wireframe") {
    const { project_id, port } = req.params.arguments as {
      project_id: string;
      port?: number;
    };
    const serveDir = path.join(resolveProjectsRoot(), project_id, "wireframes");
    const actualPort = port && port > 0 ? port : nextPort();

    // Start a simple Python HTTP server (available on most systems)
    const child = spawn("python3", ["-m", "http.server", String(actualPort)], {
      cwd: serveDir,
      stdio: "ignore",
      detached: true,
    });
    child.unref();

    const url = `http://localhost:${actualPort}`;
    servers.set(`${project_id}:wireframe`, {
      pid: child.pid ?? 0,
      url,
      type: "wireframe",
      dir: serveDir,
    });

    return textResult(
      JSON.stringify(
        {
          started: true,
          url,
          port: actualPort,
          pid: child.pid,
          dir: serveDir,
          project_id,
        },
        null,
        2
      )
    );
  }

  // ─── serve_frontend ────────────────────────────────
  if (req.params.name === "serve_frontend") {
    const { project_id, port } = req.params.arguments as {
      project_id: string;
      port?: number;
    };
    const serveDir = path.join(resolveProjectsRoot(), project_id, "app");
    const actualPort = port && port > 0 ? port : nextPort();

    const child = spawn("python3", ["-m", "http.server", String(actualPort)], {
      cwd: serveDir,
      stdio: "ignore",
      detached: true,
    });
    child.unref();

    const url = `http://localhost:${actualPort}`;
    servers.set(`${project_id}:frontend`, {
      pid: child.pid ?? 0,
      url,
      type: "frontend",
      dir: serveDir,
    });

    return textResult(
      JSON.stringify(
        {
          started: true,
          url,
          port: actualPort,
          pid: child.pid,
          dir: serveDir,
          project_id,
        },
        null,
        2
      )
    );
  }

  // ─── list_previews ─────────────────────────────────
  if (req.params.name === "list_previews") {
    const previews = Array.from(servers.entries()).map(([key, info]) => ({
      key,
      url: info.url,
      type: info.type,
      pid: info.pid,
      dir: info.dir,
    }));
    return textResult(
      JSON.stringify({ count: previews.length, previews }, null, 2)
    );
  }

  return textResult(`Unknown tool: ${req.params.name}`, true);
});

const transport = new StdioServerTransport();
await server.connect(transport);
