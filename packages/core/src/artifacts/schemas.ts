import type {
  ArtifactEnvelope,
  ArtifactType,
  ProjectMeta,
} from "../types.js";

export interface ProjectBriefContent {
  title: string;
  problemStatement: string;
  goals: string[];
  nonGoals: string[];
  personas: Array<{ name: string; description: string }>;
  constraints: string[];
  references: string[];
}

export interface RequirementsAnalysisContent {
  problems: string[];
  jobsToBeDone: string[];
  assumptions: string[];
  risks: string[];
  openQuestions: string[];
  summary: string;
}

export interface PRDFeature {
  id: string;
  name: string;
  description: string;
  priority: "must" | "should" | "could" | "wont";
  userStories: string[];
  acceptanceCriteria: string[];
}

export interface PRDContent {
  version: string;
  overview: string;
  features: PRDFeature[];
  successMetrics: string[];
}

export interface UserFlowStep {
  id: string;
  label: string;
  type: "action" | "decision" | "system" | "error";
  next?: string[];
}

export interface UserFlowContent {
  taskId: string;
  taskName: string;
  mermaid?: string;
  steps: UserFlowStep[];
}

export interface UserFlowsArtifactContent {
  flows: UserFlowContent[];
}

export interface IANode {
  id: string;
  label: string;
  path?: string;
  children?: IANode[];
  contentTypes?: string[];
}

export interface InformationArchitectureContent {
  sitemap: IANode[];
  navigation: string[];
  urlMap: Record<string, string>;
}

export interface WireframePage {
  id: string;
  name: string;
  path: string;
  regions: Array<{ id: string; label: string; description: string }>;
  interactions: string[];
  htmlPath?: string;
}

export interface WireframesContent {
  pages: WireframePage[];
}

export interface DesignToken {
  name: string;
  value: string;
  category: "color" | "spacing" | "typography" | "radius" | "shadow";
}

export interface UIDesignSpecContent {
  tokens: DesignToken[];
  components: Array<{ name: string; variants: string[]; usage: string }>;
  screens: Array<{ id: string; name: string; reference?: string }>;
}

export interface CodeBundleContent {
  stack: "react-vite" | "next" | "html";
  rootPath: string;
  routes: string[];
  previewUrl?: string;
}

export const ARTIFACT_STAGE_MAP: Record<ArtifactType, string> = {
  ProjectBrief: "intake",
  RequirementsAnalysis: "requirements_analysis",
  PRD: "prd",
  UserFlows: "user_flows",
  InformationArchitecture: "information_architecture",
  Wireframes: "wireframes",
  UIDesignSpec: "ui_design",
  CodeBundle: "frontend_codegen",
};

export function createEmptyBrief(
  project: ProjectMeta
): ArtifactEnvelope<ProjectBriefContent> {
  const now = new Date().toISOString();
  return {
    id: `${project.id}:brief:v1`,
    type: "ProjectBrief",
    projectId: project.id,
    version: 1,
    status: "draft",
    upstream: [],
    content: {
      title: project.title,
      problemStatement: project.description ?? "",
      goals: [],
      nonGoals: [],
      personas: [],
      constraints: project.constraints ?? [],
      references: [],
    },
    provenance: { agent: "system", notes: "initialized" },
    createdAt: now,
    updatedAt: now,
  };
}
