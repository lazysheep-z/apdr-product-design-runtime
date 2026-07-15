#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PipelineEngine } from "./engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const PROJECTS_ROOT =
  process.env.APDR_PROJECTS_ROOT ?? path.join(REPO_ROOT, "projects");

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = { _: argv[0] ?? "help" };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    }
  }
  return out;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const cmd = String(args._);
  const engine = new PipelineEngine(PROJECTS_ROOT);

  switch (cmd) {
    case "init": {
      const id = String(args.id ?? "demo");
      const title = String(args.title ?? "Untitled Project");
      const description =
        typeof args.description === "string" ? args.description : undefined;
      const meta = await engine.initProject({ id, title, description });
      console.log(`Created project: ${meta.id}`);
      console.log(`Projects root: ${PROJECTS_ROOT}`);
      console.log(engine.printStatus(await engine.getStatus(meta.id)));
      break;
    }
    case "status": {
      const projectId = String(args.project ?? args.id ?? "demo");
      console.log(engine.printStatus(await engine.getStatus(projectId)));
      break;
    }
    case "advance": {
      const projectId = String(args.project ?? "demo");
      const status = await engine.advanceStage(projectId);
      console.log(engine.printStatus(status));
      break;
    }
    case "approve": {
      const projectId = String(args.project ?? "demo");
      const type = String(args.type ?? "ProjectBrief");
      const artifact = await engine.approveLatest(projectId, type);
      console.log(`Approved: ${artifact.id}`);
      console.log(engine.printStatus(await engine.getStatus(projectId)));
      break;
    }
    case "rollback": {
      const projectId = String(args.project ?? "demo");
      const target = String(args.to ?? args.target ?? "intake");
      const status = await engine.rollbackStage(projectId, target as import("@apdr/core").PipelineStage);
      console.log(engine.printStatus(status));
      break;
    }
    case "stale": {
      const projectId = String(args.project ?? "demo");
      const result = await engine.getStaleDownstream(projectId);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "revise": {
      const projectId = String(args.project ?? "demo");
      const type = String(args.type ?? "ProjectBrief");
      const content = args.content
        ? JSON.parse(String(args.content))
        : { note: `Revised at ${new Date().toISOString()}` };
      const artifact = await engine.reviseArtifact(projectId, type, content);
      console.log(`Revised: ${artifact.id} (v${artifact.version}, status: ${artifact.status})`);
      console.log(engine.printStatus(await engine.getStatus(projectId)));
      break;
    }
    case "diff": {
      const projectId = String(args.project ?? "demo");
      const type = String(args.type ?? "ProjectBrief");
      const latest = await engine.store.getLatestByType(projectId, type as import("@apdr/core").ArtifactType);
      if (!latest) {
        console.log(`No artifact of type ${type} found.`);
        break;
      }
      const prevVersion = latest.version > 1
        ? await engine.store.readArtifact(projectId, `${projectId}:${type}:v${latest.version - 1}`)
        : null;
      if (!prevVersion) {
        console.log(`v${latest.version} — No previous version to diff against.`);
        console.log(JSON.stringify(latest.content, null, 2));
      } else {
        console.log(`--- v${prevVersion.version}`);
        console.log(`+++ v${latest.version}`);
        // Simple top-level key diff
        const prevKeys = new Set(Object.keys(prevVersion.content));
        const currKeys = new Set(Object.keys(latest.content));
        for (const k of currKeys) {
          if (!prevKeys.has(k)) {
            console.log(`+ ${k}: added`);
          } else if (JSON.stringify(prevVersion.content[k]) !== JSON.stringify(latest.content[k])) {
            console.log(`~ ${k}: changed`);
          }
        }
        for (const k of prevKeys) {
          if (!currKeys.has(k)) {
            console.log(`- ${k}: removed`);
          }
        }
      }
      break;
    }
    case "help":
    default:
      console.log(`APDR Orchestrator

Usage:
  apdr init --id <id> --title <title> [--description <text>]
  apdr status --project <id>
  apdr advance --project <id>
  apdr approve --project <id> --type <ArtifactType>
  apdr rollback --project <id> --to <stage>
  apdr stale --project <id>
  apdr revise --project <id> --type <ArtifactType> --content <json>
  apdr diff --project <id> --type <ArtifactType>

Environment:
  APDR_PROJECTS_ROOT  default: <repo>/projects
`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
