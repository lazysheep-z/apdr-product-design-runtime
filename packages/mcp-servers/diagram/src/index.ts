#!/usr/bin/env node
/**
 * APDR Diagram MCP — render Mermaid, sitemap, and sequence diagrams to SVG.
 *
 * Tools:
 *   render_mermaid  — convert Mermaid markup string to SVG
 *   render_sitemap  — render IA sitemap tree into a visual diagram
 *   render_sequence — render step sequence as a Mermaid sequence diagram
 *
 * Stub: Install mermaid-cli (mmdc) or @mermaid-js/mermaid-cli for real rendering.
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
  { name: "apdr-diagram", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "render_mermaid",
      description: "Convert Mermaid markup string to SVG. Saves to projects/{id}/diagram/. Returns file path.",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "Project ID for output directory" },
          diagram_id: { type: "string", description: "Slug identifier (e.g., user-flow-checkout)" },
          markup: { type: "string", description: "Mermaid markup string (flowchart, sequence, class, etc.)" },
        },
        required: ["project_id", "diagram_id", "markup"],
      },
    },
    {
      name: "render_sitemap",
      description: "Render an IA sitemap tree (IANode[]) into a Mermaid flowchart diagram SVG",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string", description: "Project ID for output" },
          diagram_id: { type: "string", description: "Slug identifier" },
          nodes: {
            type: "array",
            description: "Array of IA nodes with id, label, children",
            items: { type: "object" },
          },
        },
        required: ["project_id", "diagram_id", "nodes"],
      },
    },
    {
      name: "render_sequence",
      description: "Render a list of step objects as a Mermaid sequence diagram SVG",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          diagram_id: { type: "string" },
          participants: { type: "array", items: { type: "string" }, description: "e.g. User, System, API" },
          steps: {
            type: "array",
            description: "Steps: [{from, to, label}]",
            items: {
              type: "object",
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                label: { type: "string" },
              },
              required: ["from", "to", "label"],
            },
          },
        },
        required: ["project_id", "diagram_id", "participants", "steps"],
      },
    },
  ],
}));

/** Convert an IANode tree into a Mermaid flowchart string */
interface IANode {
  id: string;
  label: string;
  children?: IANode[];
}
function treeToMermaid(nodes: IANode[], parentId?: string): string[] {
  const lines: string[] = [];
  for (const node of nodes) {
    const quotedLabel = `["${node.label.replace(/"/g, "'")}"]`;
    if (parentId) {
      lines.push(`    ${parentId} --> ${node.id}${quotedLabel}`);
    }
    if (node.children?.length) {
      lines.push(...treeToMermaid(node.children, node.id));
    }
  }
  return lines;
}

/** Save a Mermaid string to a markdown file with embedded diagram */
async function saveMermaid(
  projectId: string,
  diagramId: string,
  mermaid: string
): Promise<string> {
  const dir = path.join(resolveProjectsRoot(), projectId, "diagram");
  await fs.mkdir(dir, { recursive: true });
  const mdPath = path.join(dir, `${diagramId}.mmd`);
  await fs.writeFile(mdPath, mermaid, "utf-8");
  return mdPath;
}

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  // ─── render_mermaid ────────────────────────────────
  if (req.params.name === "render_mermaid") {
    const { project_id, diagram_id, markup } = req.params.arguments as {
      project_id: string;
      diagram_id: string;
      markup: string;
    };
    const mdPath = await saveMermaid(project_id, diagram_id, markup);
    return textResult(
      JSON.stringify(
        {
          saved: true,
          path: mdPath,
          diagram_id,
          project_id,
          note: "Install mermaid-cli (mmdc) for SVG/PNG rendering, or use baoyu-diagram.",
          markup,
        },
        null,
        2
      )
    );
  }

  // ─── render_sitemap ────────────────────────────────
  if (req.params.name === "render_sitemap") {
    const { project_id, diagram_id, nodes } = req.params.arguments as {
      project_id: string;
      diagram_id: string;
      nodes: IANode[];
    };
    const mermaid = [
      "graph TD",
      ...treeToMermaid(nodes),
    ].join("\n");
    const mdPath = await saveMermaid(project_id, diagram_id, mermaid);
    return textResult(
      JSON.stringify(
        {
          saved: true,
          path: mdPath,
          diagram_id,
          project_id,
          mermaid,
        },
        null,
        2
      )
    );
  }

  // ─── render_sequence ───────────────────────────────
  if (req.params.name === "render_sequence") {
    const args = req.params.arguments as {
      project_id: string;
      diagram_id: string;
      participants: string[];
      steps: Array<{ from: string; to: string; label: string }>;
    };
    const mermaid = [
      "sequenceDiagram",
      ...args.participants.map((p) => `    participant ${p}`),
      "",
      ...args.steps.map((s) => `    ${s.from}->>${s.to}: ${s.label}`),
    ].join("\n");
    const mdPath = await saveMermaid(args.project_id, args.diagram_id, mermaid);
    return textResult(
      JSON.stringify(
        {
          saved: true,
          path: mdPath,
          diagram_id: args.diagram_id,
          project_id: args.project_id,
          mermaid,
        },
        null,
        2
      )
    );
  }

  return textResult(`Unknown tool: ${req.params.name}`, true);
});

const transport = new StdioServerTransport();
await server.connect(transport);
