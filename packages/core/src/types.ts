/** Artifact lifecycle status */
export type ArtifactStatus = "draft" | "review" | "approved" | "stale";

/** Design pipeline stages */
export type PipelineStage =
  | "intake"
  | "requirements_analysis"
  | "prd"
  | "user_flows"
  | "information_architecture"
  | "wireframes"
  | "ui_design"
  | "design_review"
  | "frontend_codegen"
  | "quality_eval"
  | "handoff";

export type ArtifactType =
  | "ProjectBrief"
  | "RequirementsAnalysis"
  | "PRD"
  | "UserFlows"
  | "InformationArchitecture"
  | "Wireframes"
  | "UIDesignSpec"
  | "DesignReviewReport"
  | "CodeBundle"
  | "QualityReport"
  | "HandoffDoc";

export interface Provenance {
  agent?: string;
  model?: string;
  tools?: string[];
  notes?: string;
}

export interface ArtifactEnvelope<T = Record<string, unknown>> {
  id: string;
  type: ArtifactType;
  projectId: string;
  version: number;
  status: ArtifactStatus;
  upstream: string[];
  content: T;
  provenance: Provenance;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMeta {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  currentStage: PipelineStage;
  constraints?: string[];
}

export interface RuntimeState {
  projectId: string;
  currentStage: PipelineStage;
  artifacts: Record<string, string>;
  gates: Partial<Record<PipelineStage, ArtifactStatus>>;
  staleDownstream: PipelineStage[];
}

export type CapabilityLayer = "atomic" | "composite";

export type HumanGate = "required" | "optional" | "none";

export interface CapabilityDefinition {
  id: string;
  layer: CapabilityLayer;
  domain: string;
  description: string;
  inputs: string[];
  outputs: string[];
  sideEffects: "none" | "read_artifact" | "write_artifact";
  mcpTool: string | null;
  humanGate: HumanGate;
  stage?: PipelineStage;
}

export interface ExternalSkillRef {
  /** e.g. baoyu-diagram, brainstorming */
  id: string;
  source: "baoyu" | "superpowers" | "pm-skills";
  /** Repo-relative path to upstream SKILL.md when vendored */
  vendorPath?: string;
  /** Cursor slash command if plugin installed */
  slashCommand?: string;
}

export interface AgentDefinition {
  id: string;
  name: string;
  stage: PipelineStage;
  description: string;
  capabilityIds: string[];
  mcpServers: string[];
  skillPath?: string;
  externalSkills?: ExternalSkillRef[];
  exitArtifactType: ArtifactType;
}

export type WorkflowState =
  | "pending"
  | "running"
  | "awaiting_human"
  | "completed"
  | "failed"
  | "blocked";

export interface WorkflowStep {
  id: string;
  stage: PipelineStage;
  agentId: string;
  requiredUpstream: ArtifactType[];
  outputArtifactType: ArtifactType;
  humanGate: HumanGate;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}
