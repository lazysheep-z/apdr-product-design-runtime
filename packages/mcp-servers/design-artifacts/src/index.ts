#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { ArtifactEnvelope, ArtifactType } from "@apdr/core";
import {
  buildNextAction,
  formatNextActionMarkdown,
  STAGE_ORDER,
  type ProjectBriefContent,
} from "@apdr/core";
import { PipelineEngine } from "@apdr/orchestrator";
import { createStore, resolveProjectsRoot, textResult } from "@apdr/mcp-shared";

const store = createStore();
const engine = new PipelineEngine(resolveProjectsRoot());

const WriteArtifactSchema = z.object({
  project_id: z.string(),
  type: z.string(),
  content: z.record(z.unknown()),
  upstream: z.array(z.string()).optional(),
  status: z.enum(["draft", "review", "approved", "stale"]).optional(),
  provenance: z
    .object({
      agent: z.string().optional(),
      model: z.string().optional(),
      tools: z.array(z.string()).optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

const server = new Server(
  {
    name: "apdr-design-artifacts",
    version: "0.2.0",
  },
  {
    capabilities: {
      tools: {},
    },
    instructions: `AI Product Design Runtime (APDR) artifact + pipeline MCP.

Conversation entry: call get_next_action after every user turn.
Start new work: start_project → get_next_action → follow skillPath.
Human gates: approve_latest_artifact then advance_pipeline.

Tools: start_project, get_next_action, advance_pipeline, approve_latest_artifact, write_artifact, read_artifact, get_pipeline_status.`,
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_projects",
      description: "List project IDs under the artifacts root",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "get_project_meta",
      description: "Get project metadata (title, stage, etc.)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
        },
        required: ["project_id"],
      },
    },
    {
      name: "list_artifacts",
      description: "List all artifacts for a project",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
        },
        required: ["project_id"],
      },
    },
    {
      name: "read_artifact",
      description: "Read a single artifact by ID",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          artifact_id: { type: "string" },
        },
        required: ["project_id", "artifact_id"],
      },
    },
    {
      name: "get_latest_artifact",
      description: "Get latest artifact of a given type",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          type: { type: "string" },
        },
        required: ["project_id", "type"],
      },
    },
    {
      name: "write_artifact",
      description: "Create or update an artifact envelope",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          type: { type: "string" },
          content: { type: "object" },
          upstream: { type: "array", items: { type: "string" } },
          status: { type: "string" },
          provenance: { type: "object" },
        },
        required: ["project_id", "type", "content"],
      },
    },
    {
      name: "approve_artifact",
      description: "Mark artifact as approved",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          artifact_id: { type: "string" },
        },
        required: ["project_id", "artifact_id"],
      },
    },
    {
      name: "get_pipeline_status",
      description: "Human-readable pipeline status for a project",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
        },
        required: ["project_id"],
      },
    },
    {
      name: "start_project",
      description:
        "Create a new APDR project from natural-language requirements and seed ProjectBrief",
      inputSchema: {
        type: "object",
        properties: {
          project_id: {
            type: "string",
            description: "Slug id, e.g. my-app",
          },
          title: { type: "string" },
          requirements: {
            type: "string",
            description: "Raw product idea / requirements from user",
          },
          constraints: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["project_id", "title", "requirements"],
      },
    },
    {
      name: "get_next_action",
      description:
        "Primary conversation driver: returns what to do next (phase, skill, MCP steps) for the current pipeline stage",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          format: {
            type: "string",
            enum: ["markdown", "json"],
            description: "Default markdown for chat; json for automation",
          },
        },
        required: ["project_id"],
      },
    },
    {
      name: "advance_pipeline",
      description: "Advance project to the next pipeline stage when upstream artifacts are approved",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
        },
        required: ["project_id"],
      },
    },
    {
      name: "approve_latest_artifact",
      description: "Approve the latest artifact of a given type (e.g. PRD, UIDesignSpec)",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          type: { type: "string" },
        },
        required: ["project_id", "type"],
      },
    },
    {
      name: "rollback_artifact",
      description: "Set an approved artifact back to draft, resetting downstream gates",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          artifact_id: { type: "string" },
        },
        required: ["project_id", "artifact_id"],
      },
    },
    {
      name: "rollback_pipeline",
      description: "Roll the pipeline back to a previous stage, clearing downstream stale state",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          target_stage: {
            type: "string",
            description: "Stage to rollback to (e.g., requirements_analysis, prd, wireframes)",
          },
        },
        required: ["project_id", "target_stage"],
      },
    },
    {
      name: "revise_artifact",
      description: "Write a new revision of an artifact, incrementing version and marking downstream stale",
      inputSchema: {
        type: "object",
        properties: {
          project_id: { type: "string" },
          type: { type: "string", description: "ArtifactType to revise" },
          content: { type: "object", description: "New content for the revised artifact" },
          provenance: { type: "object", description: "Optional provenance metadata" },
        },
        required: ["project_id", "type", "content"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_projects": {
        const fs = await import("node:fs/promises");
        const parent = resolveProjectsRoot();
        let entries: string[] = [];
        try {
          entries = await fs.readdir(parent);
        } catch {
          return textResult("[]");
        }
        const ids: string[] = [];
        for (const e of entries) {
          if (e.startsWith(".")) continue;
          try {
            await store.getProjectMeta(e);
            ids.push(e);
          } catch {
            /* not a project */
          }
        }
        return textResult(JSON.stringify(ids, null, 2));
      }

      case "get_project_meta": {
        const projectId = String((args as { project_id: string }).project_id);
        const meta = await store.getProjectMeta(projectId);
        return textResult(JSON.stringify(meta, null, 2));
      }

      case "list_artifacts": {
        const projectId = String((args as { project_id: string }).project_id);
        const list = await store.listArtifacts(projectId);
        return textResult(JSON.stringify(list, null, 2));
      }

      case "read_artifact": {
        const { project_id, artifact_id } = args as {
          project_id: string;
          artifact_id: string;
        };
        const artifact = await store.readArtifact(project_id, artifact_id);
        return textResult(JSON.stringify(artifact, null, 2));
      }

      case "get_latest_artifact": {
        const { project_id, type } = args as {
          project_id: string;
          type: string;
        };
        const artifact = await store.getLatestByType(
          project_id,
          type as ArtifactType
        );
        if (!artifact) {
          return textResult(`No artifact of type ${type}`, true);
        }
        return textResult(JSON.stringify(artifact, null, 2));
      }

      case "write_artifact": {
        const parsed = WriteArtifactSchema.parse(args);
        const existing = await store.getLatestByType(
          parsed.project_id,
          parsed.type as ArtifactType
        );
        const version = existing ? existing.version + 1 : 1;
        const now = new Date().toISOString();
        const artifact: ArtifactEnvelope = {
          id: `${parsed.project_id}:${parsed.type}:v${version}`,
          type: parsed.type as ArtifactType,
          projectId: parsed.project_id,
          version,
          status: parsed.status ?? "draft",
          upstream: parsed.upstream ?? (existing ? [existing.id] : []),
          content: parsed.content,
          provenance: parsed.provenance ?? { agent: "mcp" },
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        await store.writeArtifact(artifact);
        return textResult(JSON.stringify(artifact, null, 2));
      }

      case "approve_artifact": {
        const { project_id, artifact_id } = args as {
          project_id: string;
          artifact_id: string;
        };
        const approved = await store.approveArtifact(project_id, artifact_id);
        return textResult(JSON.stringify(approved, null, 2));
      }

      case "get_pipeline_status": {
        const projectId = String((args as { project_id: string }).project_id);
        const status = await engine.getStatus(projectId);
        return textResult(engine.printStatus(status));
      }

      case "start_project": {
        const { project_id, title, requirements, constraints } = args as {
          project_id: string;
          title: string;
          requirements: string;
          constraints?: string[];
        };
        const meta = await engine.initProject({
          id: project_id,
          title,
          description: requirements,
          constraints,
        });
        const now = new Date().toISOString();
        const briefContent: ProjectBriefContent = {
          title,
          problemStatement: requirements,
          goals: [],
          nonGoals: [],
          personas: [],
          constraints: constraints ?? [],
          references: [],
        };
        const brief: ArtifactEnvelope<ProjectBriefContent> = {
          id: `${project_id}:ProjectBrief:v1`,
          type: "ProjectBrief",
          projectId: project_id,
          version: 1,
          status: "draft",
          upstream: [],
          content: briefContent,
          provenance: { agent: "apdr-runtime", notes: "Seeded from start_project" },
          createdAt: now,
          updatedAt: now,
        };
        await store.writeArtifact(brief);
        const action = buildNextAction({
          projectId: project_id,
          currentStage: meta.currentStage,
          stepIndex: 1,
          totalSteps: STAGE_ORDER.length,
          artifacts: [{ type: "ProjectBrief", id: brief.id, status: "draft" }],
          staleDownstream: [],
          blockers: [],
          canAdvance: true,
        });
        return textResult(
          [
            `Created project **${title}** (\`${project_id}\`).`,
            "",
            formatNextActionMarkdown(action),
          ].join("\n")
        );
      }

      case "get_next_action": {
        const { project_id, format } = args as {
          project_id: string;
          format?: "markdown" | "json";
        };
        const status = await engine.getStatus(project_id);
        const action = buildNextAction({
          projectId: project_id,
          currentStage: status.currentStage,
          stepIndex: status.stepIndex,
          totalSteps: status.totalSteps,
          artifacts: status.artifacts,
          staleDownstream: status.staleDownstream,
          blockers: status.blockers,
          canAdvance: status.canAdvance,
        });
        if (format === "json") {
          return textResult(JSON.stringify(action, null, 2));
        }
        return textResult(formatNextActionMarkdown(action));
      }

      case "advance_pipeline": {
        const projectId = String((args as { project_id: string }).project_id);
        const status = await engine.advanceStage(projectId);
        const action = buildNextAction({
          projectId,
          currentStage: status.currentStage,
          stepIndex: status.stepIndex,
          totalSteps: status.totalSteps,
          artifacts: status.artifacts,
          staleDownstream: status.staleDownstream,
          blockers: status.blockers,
          canAdvance: status.canAdvance,
        });
        return textResult(
          [engine.printStatus(status), "", formatNextActionMarkdown(action)].join(
            "\n"
          )
        );
      }

      case "approve_latest_artifact": {
        const { project_id, type } = args as {
          project_id: string;
          type: string;
        };
        const approved = await engine.approveLatest(project_id, type);
        const status = await engine.getStatus(project_id);
        const action = buildNextAction({
          projectId: project_id,
          currentStage: status.currentStage,
          stepIndex: status.stepIndex,
          totalSteps: status.totalSteps,
          artifacts: status.artifacts,
          staleDownstream: status.staleDownstream,
          blockers: status.blockers,
          canAdvance: status.canAdvance,
        });
        return textResult(
          [
            `Approved \`${approved.id}\`.`,
            "",
            formatNextActionMarkdown(action),
          ].join("\n")
        );
      }

      case "rollback_artifact": {
        const { project_id, artifact_id } = args as {
          project_id: string;
          artifact_id: string;
        };
        const rolledBack = await store.rollbackArtifact(project_id, artifact_id);
        const status = await engine.getStatus(project_id);
        return textResult(
          JSON.stringify(
            {
              rolledBack: true,
              artifact_id: rolledBack.id,
              status: rolledBack.status,
              ...status,
            },
            null,
            2
          )
        );
      }

      case "rollback_pipeline": {
        const { project_id, target_stage } = args as {
          project_id: string;
          target_stage: string;
        };
        const status = await engine.rollbackStage(project_id, target_stage as import("@apdr/core").PipelineStage);
        return textResult(
          [
            `Rolled back to stage: ${target_stage}`,
            "",
            engine.printStatus(status),
          ].join("\n")
        );
      }

      case "revise_artifact": {
        const { project_id, type, content, provenance } = args as {
          project_id: string;
          type: string;
          content: Record<string, unknown>;
          provenance?: Record<string, unknown>;
        };
        const revised = await engine.reviseArtifact(
          project_id,
          type,
          content,
          provenance
        );
        const status = await engine.getStatus(project_id);
        return textResult(
          JSON.stringify(
            {
              revised: true,
              artifact_id: revised.id,
              version: revised.version,
              status: revised.status,
              staleDownstream: status.staleDownstream,
            },
            null,
            2
          )
        );
      }

      default:
        return textResult(`Unknown tool: ${name}`, true);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return textResult(message, true);
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
