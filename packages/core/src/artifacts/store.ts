import fs from "node:fs/promises";
import path from "node:path";
import type { ArtifactEnvelope, ArtifactType, PipelineStage, ProjectMeta, RuntimeState } from "../types.js";
import { ARTIFACT_STAGE_MAP, createEmptyBrief } from "./schemas.js";

const RUNTIME_FILE = ".runtime-state.json";
const META_FILE = "meta.json";

export class ArtifactStore {
  constructor(private readonly projectsRoot: string) {}

  projectDir(projectId: string): string {
    return path.join(this.projectsRoot, projectId);
  }

  artifactsDir(projectId: string): string {
    return path.join(this.projectDir(projectId), "artifacts");
  }

  async ensureProject(meta: ProjectMeta): Promise<void> {
    const dir = this.projectDir(meta.id);
    await fs.mkdir(path.join(dir, "artifacts"), { recursive: true });
    const metaPath = path.join(dir, META_FILE);
    try {
      await fs.access(metaPath);
    } catch {
      await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), "utf-8");
      const brief = createEmptyBrief(meta);
      await this.saveRuntime({
        projectId: meta.id,
        currentStage: "intake",
        artifacts: {},
        gates: {},
        staleDownstream: [],
      });
      await this.writeArtifact(brief);
    }
  }

  async getProjectMeta(projectId: string): Promise<ProjectMeta> {
    const raw = await fs.readFile(
      path.join(this.projectDir(projectId), META_FILE),
      "utf-8"
    );
    return JSON.parse(raw) as ProjectMeta;
  }

  async updateProjectMeta(
    projectId: string,
    patch: Partial<ProjectMeta>
  ): Promise<ProjectMeta> {
    const meta = await this.getProjectMeta(projectId);
    const updated: ProjectMeta = {
      ...meta,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(
      path.join(this.projectDir(projectId), META_FILE),
      JSON.stringify(updated, null, 2),
      "utf-8"
    );
    return updated;
  }

  async loadRuntime(projectId: string): Promise<RuntimeState> {
    const p = path.join(this.projectDir(projectId), RUNTIME_FILE);
    try {
      const raw = await fs.readFile(p, "utf-8");
      return JSON.parse(raw) as RuntimeState;
    } catch {
      return {
        projectId,
        currentStage: "intake",
        artifacts: {},
        gates: {},
        staleDownstream: [],
      };
    }
  }

  async saveRuntime(state: RuntimeState): Promise<void> {
    await fs.writeFile(
      path.join(this.projectDir(state.projectId), RUNTIME_FILE),
      JSON.stringify(state, null, 2),
      "utf-8"
    );
  }

  artifactPath(projectId: string, artifactId: string): string {
    const safe = artifactId.replace(/:/g, "__");
    return path.join(this.artifactsDir(projectId), `${safe}.json`);
  }

  async writeArtifact<T>(artifact: ArtifactEnvelope<T>): Promise<ArtifactEnvelope<T>> {
    const file = this.artifactPath(artifact.projectId, artifact.id);
    await fs.writeFile(file, JSON.stringify(artifact, null, 2), "utf-8");
    const state = await this.loadRuntime(artifact.projectId);
    state.artifacts[artifact.type] = artifact.id;
    const stage = ARTIFACT_STAGE_MAP[artifact.type] as PipelineStage;
    state.gates[stage] = artifact.status;
    await this.saveRuntime(state);
    return artifact;
  }

  async readArtifact<T = Record<string, unknown>>(
    projectId: string,
    artifactId: string
  ): Promise<ArtifactEnvelope<T>> {
    const raw = await fs.readFile(this.artifactPath(projectId, artifactId), "utf-8");
    return JSON.parse(raw) as ArtifactEnvelope<T>;
  }

  async getLatestByType<T = Record<string, unknown>>(
    projectId: string,
    type: ArtifactType
  ): Promise<ArtifactEnvelope<T> | null> {
    const state = await this.loadRuntime(projectId);
    const id = state.artifacts[type];
    if (!id) return null;
    return this.readArtifact<T>(projectId, id);
  }

  async listArtifacts(projectId: string): Promise<ArtifactEnvelope[]> {
    const dir = this.artifactsDir(projectId);
    let files: string[];
    try {
      files = await fs.readdir(dir);
    } catch {
      return [];
    }
    const out: ArtifactEnvelope[] = [];
    for (const f of files.filter((x) => x.endsWith(".json"))) {
      const raw = await fs.readFile(path.join(dir, f), "utf-8");
      out.push(JSON.parse(raw) as ArtifactEnvelope);
    }
    return out.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async approveArtifact(projectId: string, artifactId: string): Promise<ArtifactEnvelope> {
    const artifact = await this.readArtifact(projectId, artifactId);
    artifact.status = "approved";
    artifact.updatedAt = new Date().toISOString();
    return this.writeArtifact(artifact);
  }

  /**
   * Rollback an artifact from approved/status to draft, resetting downstream gates.
   */
  async rollbackArtifact(projectId: string, artifactId: string): Promise<ArtifactEnvelope> {
    const artifact = await this.readArtifact(projectId, artifactId);
    artifact.status = "draft";
    artifact.updatedAt = new Date().toISOString();
    const updated = await this.writeArtifact(artifact);
    // Mark downstream as stale
    const fromStage = ARTIFACT_STAGE_MAP[updated.type];
    if (fromStage) {
      await this.markDownstreamStale(projectId, fromStage);
    }
    return updated;
  }

  async markDownstreamStale(
    projectId: string,
    fromStage: string
  ): Promise<RuntimeState> {
    const order = [
      "intake",
      "requirements_analysis",
      "prd",
      "user_flows",
      "information_architecture",
      "wireframes",
      "ui_design",
      "design_review",
      "frontend_codegen",
      "handoff",
      "quality_eval",
    ];
    const idx = order.indexOf(fromStage);
    const stale = order.slice(idx + 1) as RuntimeState["staleDownstream"];
    const state = await this.loadRuntime(projectId);
    state.staleDownstream = [...new Set([...state.staleDownstream, ...stale])];
    await this.saveRuntime(state);
    return state;
  }
}
