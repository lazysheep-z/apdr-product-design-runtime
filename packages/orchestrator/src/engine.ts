import {
  ARTIFACT_STAGE_MAP,
  ArtifactStore,
  STAGE_ORDER,
  agentForStage,
  canAdvanceStage,
  mergeOperatorPreference,
  nextStage,
  stagesSkippedByPreference,
  type ArtifactEnvelope,
  type OperatorPreference,
  type PipelineStage,
  type ProjectMeta,
} from "@apdr/core";

export interface PipelineStatus {
  project: ProjectMeta;
  currentStage: PipelineStage;
  stepIndex: number;
  totalSteps: number;
  currentAgent: string | null;
  artifacts: Array<{
    type: string;
    id: string;
    status: string;
  }>;
  staleDownstream: PipelineStage[];
  canAdvance: boolean;
  blockers: string[];
  nextRecommended: PipelineStage | null;
}

export class PipelineEngine {
  readonly store: ArtifactStore;

  constructor(projectsRoot: string) {
    this.store = new ArtifactStore(projectsRoot);
  }

  async initProject(opts: {
    id: string;
    title: string;
    description?: string;
    constraints?: string[];
    includeBackend?: boolean;
    deliveryTarget?: ProjectMeta["deliveryTarget"];
    prototypeMode?: ProjectMeta["prototypeMode"];
    taskMode?: ProjectMeta["taskMode"];
  }): Promise<ProjectMeta> {
    const now = new Date().toISOString();
    const meta: ProjectMeta = {
      id: opts.id,
      title: opts.title,
      description: opts.description,
      createdAt: now,
      updatedAt: now,
      currentStage: "intake",
      constraints: opts.constraints,
      includeBackend: opts.includeBackend,
      deliveryTarget: opts.deliveryTarget,
      prototypeMode: opts.prototypeMode,
      taskMode: opts.taskMode,
    };
    await this.store.ensureProject(meta);
    if (
      opts.deliveryTarget ||
      opts.prototypeMode ||
      opts.taskMode ||
      typeof opts.includeBackend === "boolean"
    ) {
      await this.store.setOperatorPreference(opts.id, {
        ...(opts.deliveryTarget ? { deliveryTarget: opts.deliveryTarget } : {}),
        ...(opts.prototypeMode ? { prototypeMode: opts.prototypeMode } : {}),
        ...(opts.taskMode ? { taskMode: opts.taskMode } : {}),
      });
    }
    return meta;
  }

  async resolvePreference(projectId: string): Promise<OperatorPreference> {
    const prefs = await this.store.getOperatorPreference(projectId);
    const meta = await this.store.getProjectMeta(projectId);
    return mergeOperatorPreference({
      ...prefs,
      ...(meta.deliveryTarget ? { deliveryTarget: meta.deliveryTarget } : {}),
      ...(meta.prototypeMode ? { prototypeMode: meta.prototypeMode } : {}),
      ...(meta.taskMode ? { taskMode: meta.taskMode } : {}),
    });
  }

  /**
   * Resolve whether backend_codegen should run.
   * Prefer ProjectMeta.includeBackend; fall back to ProjectBrief.content.includeBackend.
   * Default: false (skip) until intake explicitly sets true.
   */
  async wantsBackend(projectId: string): Promise<boolean> {
    const project = await this.store.getProjectMeta(projectId);
    if (typeof project.includeBackend === "boolean") {
      return project.includeBackend;
    }
    const brief = await this.store.getLatestByType(projectId, "ProjectBrief");
    const content = brief?.content as { includeBackend?: boolean } | undefined;
    return content?.includeBackend === true;
  }

  /**
   * Next stage, skipping backend_codegen and route shortcuts (doc-only / incremental / feishu).
   */
  async resolveNextStage(
    projectId: string,
    from: PipelineStage
  ): Promise<PipelineStage | null> {
    const prefs = await this.resolvePreference(projectId);
    const skip = stagesSkippedByPreference(prefs);
    let n = nextStage(from);
    while (n) {
      if (n === "backend_codegen" && !(await this.wantsBackend(projectId))) {
        n = nextStage("backend_codegen");
        continue;
      }
      if (skip.has(n)) {
        n = nextStage(n);
        continue;
      }
      break;
    }
    return n;
  }

  async getStatus(projectId: string): Promise<PipelineStatus> {
    const project = await this.store.getProjectMeta(projectId);
    const prefs = await this.resolvePreference(projectId);
    const skip = stagesSkippedByPreference(prefs);
    let runtime = await this.store.loadRuntime(projectId);

    // Auto-skip current stage when route prefs say so (or backend opted out)
    let guard = 0;
    while (
      guard++ < STAGE_ORDER.length &&
      (skip.has(runtime.currentStage) ||
        (runtime.currentStage === "backend_codegen" &&
          !(await this.wantsBackend(projectId))))
    ) {
      const skipped = await this.resolveNextStage(
        projectId,
        runtime.currentStage
      );
      if (!skipped || skipped === runtime.currentStage) break;
      runtime.currentStage = skipped;
      await this.store.saveRuntime(runtime);
      await this.store.updateProjectMeta(projectId, { currentStage: skipped });
    }

    runtime = await this.store.loadRuntime(projectId);
    const listed = await this.store.listArtifacts(projectId);
    const approved = new Set(
      listed.filter((a) => a.status === "approved").map((a) => a.type)
    );
    const { ok, missing } = canAdvanceStage(
      runtime.currentStage,
      approved,
      prefs
    );
    const agent = agentForStage(runtime.currentStage);

    return {
      project,
      currentStage: runtime.currentStage,
      stepIndex: STAGE_ORDER.indexOf(runtime.currentStage) + 1,
      totalSteps: STAGE_ORDER.length,
      currentAgent: agent?.id ?? null,
      artifacts: listed.map((a) => ({
        type: a.type,
        id: a.id,
        status: a.status,
      })),
      staleDownstream: runtime.staleDownstream,
      canAdvance: ok,
      blockers: missing,
      nextRecommended: await this.resolveNextStage(projectId, runtime.currentStage),
    };
  }

  async advanceStage(projectId: string): Promise<PipelineStatus> {
    const prefs = await this.resolvePreference(projectId);
    const runtime = await this.store.loadRuntime(projectId);
    const listed = await this.store.listArtifacts(projectId);
    const approved = new Set(
      listed.filter((a) => a.status === "approved").map((a) => a.type)
    );
    const { ok, missing } = canAdvanceStage(
      runtime.currentStage,
      approved,
      prefs
    );
    if (!ok) {
      throw new Error(
        `Cannot advance from ${runtime.currentStage}. Missing approved: ${missing.join(", ")}`
      );
    }
    // If somehow sitting on backend_codegen without opt-in, skip forward
    if (
      runtime.currentStage === "backend_codegen" &&
      !(await this.wantsBackend(projectId))
    ) {
      const skipped = await this.resolveNextStage(projectId, "frontend_codegen");
      if (!skipped) throw new Error("Already at final stage");
      runtime.currentStage = skipped;
      await this.store.saveRuntime(runtime);
      await this.store.updateProjectMeta(projectId, { currentStage: skipped });
      return this.getStatus(projectId);
    }
    const n = await this.resolveNextStage(projectId, runtime.currentStage);
    if (!n) {
      throw new Error("Already at final stage");
    }
    runtime.currentStage = n;
    await this.store.saveRuntime(runtime);
    await this.store.updateProjectMeta(projectId, { currentStage: n });
    return this.getStatus(projectId);
  }

  async approveLatest(
    projectId: string,
    artifactType: string
  ): Promise<ArtifactEnvelope> {
    const latest = await this.store.getLatestByType(projectId, artifactType as ArtifactEnvelope["type"]);
    if (!latest) {
      throw new Error(`No artifact of type ${artifactType}`);
    }
    const approved = await this.store.approveArtifact(projectId, latest.id);
    const runtime = await this.store.loadRuntime(projectId);
    const fromStage = ARTIFACT_STAGE_MAP[approved.type] ?? runtime.currentStage;
    await this.store.markDownstreamStale(projectId, fromStage);
    return approved;
  }
  /**
   * Roll the pipeline back to a previous stage, clearing stale state.
   * Does NOT revert artifacts — they remain in filesystem for reference.
   */
  async rollbackStage(projectId: string, targetStage: PipelineStage): Promise<PipelineStatus> {
    const targetIdx = STAGE_ORDER.indexOf(targetStage);
    if (targetIdx < 0) {
      throw new Error(`Unknown target stage: ${targetStage}`);
    }
    const runtime = await this.store.loadRuntime(projectId);
    const currentIdx = STAGE_ORDER.indexOf(runtime.currentStage);
    if (currentIdx <= targetIdx) {
      throw new Error(
        `Cannot rollback: current stage "${runtime.currentStage}" is at or before target "${targetStage}". Use advance_pipeline instead.`
      );
    }
    // Reset current stage to target
    runtime.currentStage = targetStage;
    // Clear stale artifacts that were downstream of the target
    runtime.staleDownstream = runtime.staleDownstream.filter(
      (s) => STAGE_ORDER.indexOf(s) <= targetIdx
    );
    await this.store.saveRuntime(runtime);
    await this.store.updateProjectMeta(projectId, { currentStage: targetStage });
    return this.getStatus(projectId);
  }

  /**
   * Get list of stale artifacts (downstream stages affected by upstream changes).
   */
  async getStaleDownstream(projectId: string): Promise<{
    staleStages: PipelineStage[];
    staleArtifacts: Array<{ type: string; id: string }>;
  }> {
    const runtime = await this.store.loadRuntime(projectId);
    const listed = await this.store.listArtifacts(projectId);
    const staleArtifacts = listed
      .filter((a) => a.status === "stale")
      .map((a) => ({ type: a.type, id: a.id }));
    return { staleStages: runtime.staleDownstream, staleArtifacts };
  }

  /**
   * Revise an artifact: write a new version, mark it draft, and mark downstream stale.
   */
  async reviseArtifact(
    projectId: string,
    artifactType: string,
    content: Record<string, unknown>,
    provenance?: Record<string, unknown>
  ): Promise<ArtifactEnvelope> {
    const latest = await this.store.getLatestByType(projectId, artifactType as ArtifactEnvelope["type"]);
    const version = latest ? latest.version + 1 : 1;
    const now = new Date().toISOString();
    const revised: ArtifactEnvelope = {
      id: latest ? `${projectId}:${artifactType}:v${version}` : `${projectId}:${artifactType}:v1`,
      type: artifactType as ArtifactEnvelope["type"],
      projectId,
      version,
      status: "draft",
      upstream: latest ? [latest.id] : [],
      content,
      provenance: { agent: "apdr-runtime", ...(provenance ?? {}), notes: "revised" },
      createdAt: latest?.createdAt ?? now,
      updatedAt: now,
    };
    await this.store.writeArtifact(revised);
    const fromStage = ARTIFACT_STAGE_MAP[revised.type];
    if (fromStage) {
      await this.store.markDownstreamStale(projectId, fromStage);
    }
    return revised;
  }

  printStatus(status: PipelineStatus): string {
    const lines = [
      `# Project: ${status.project.title} (${status.project.id})`,
      ``,
      `Stage: ${status.currentStage} (${status.stepIndex}/${status.totalSteps})`,
      `Agent: ${status.currentAgent ?? "—"}`,
      `Can advance: ${status.canAdvance ? "yes" : "no"}`,
    ];
    if (status.blockers.length) {
      lines.push(`Blockers: ${status.blockers.join(", ")}`);
    }
    if (status.staleDownstream.length) {
      lines.push(`Stale downstream: ${status.staleDownstream.join(", ")}`);
    }
    lines.push("", "## Artifacts");
    for (const a of status.artifacts) {
      lines.push(`- ${a.type}: ${a.id} [${a.status}]`);
    }
    if (status.nextRecommended) {
      lines.push("", `Next stage: ${status.nextRecommended}`);
    }
    return lines.join("\n");
  }
}
