import type { PipelineStage, HumanGate } from "../types.js";
import { DESIGN_PIPELINE_WORKFLOW } from "../workflows/pipeline.js";

export interface StagePlaybook {
  stage: PipelineStage;
  title: string;
  titleZh: string;
  agentId: string;
  skillPath: string;
  outputArtifact: string;
  humanGate: HumanGate;
  upstreamArtifacts: string[];
  externalSkills: Array<{ id: string; slashCommand?: string; vendorPath: string }>;
  objective: string;
  steps: string[];
  userTriggers: string[];
  doneWhen: string;
}

const BASE = "skills";

export const STAGE_PLAYBOOKS: Record<PipelineStage, StagePlaybook> = {
  intake: {
    stage: "intake",
    title: "Project Intake",
    titleZh: "需求录入",
    agentId: "intake_strategist",
    skillPath: "skills/apdr-runtime/SKILL.md",
    outputArtifact: "ProjectBrief",
    humanGate: "optional",
    upstreamArtifacts: [],
    externalSkills: [
      { id: "pm-discovery-discover", slashCommand: "/discover", vendorPath: "vendor/pm-skills/pm-product-discovery" },
      { id: "pm-strategy-ost", slashCommand: "/strategy", vendorPath: "vendor/pm-skills/pm-product-strategy" },
    ],
    objective: "Turn raw product idea into a structured ProjectBrief using PM discovery rigor.",
    steps: [
      "If pm-skills plugin is installed: invoke `/discover` to run the discovery chain (brainstorm ideas → identify assumptions → prioritize assumptions → brainstorm experiments).",
      "If pm-skills plugin is installed: invoke `/strategy` to apply opportunity-solution tree for strategic clarity.",
      "Parse user requirements into title, problem, goals, personas, constraints.",
      "Call MCP `write_artifact` with type `ProjectBrief`.",
      "Show brief summary; ask user to confirm or edit.",
      "Call `approve_latest_artifact` for ProjectBrief, then `advance_pipeline`.",
    ],
    userTriggers: ["开始", "新建项目", "start project", "intake"],
    doneWhen: "ProjectBrief is approved and stage advanced to requirements_analysis.",
  },
  requirements_analysis: {
    stage: "requirements_analysis",
    title: "Requirements Analysis",
    titleZh: "需求分析",
    agentId: "requirements_analyst",
    skillPath: `${BASE}/requirements-analyst/SKILL.md`,
    outputArtifact: "RequirementsAnalysis",
    humanGate: "required",
    upstreamArtifacts: ["ProjectBrief"],
    externalSkills: [
      { id: "brainstorming", vendorPath: "vendor/superpowers/skills/brainstorming/SKILL.md" },
      { id: "baoyu-url-to-markdown", slashCommand: "/baoyu-url-to-markdown", vendorPath: "vendor/baoyu-skills/skills/baoyu-url-to-markdown/SKILL.md" },
      { id: "pm-market-research", vendorPath: "vendor/pm-skills/pm-market-research" },
      { id: "pm-discovery", vendorPath: "vendor/pm-skills/pm-product-discovery" },
    ],
    objective: "Structured problems, JTBD, assumptions, risks from the brief, enriched with market research.",
    steps: [
      "Read `skills/requirements-analyst/SKILL.md` and follow it.",
      "`get_latest_artifact` ProjectBrief; optional competitor research via baoyu.",
      "If pm-skills plugin is installed: invoke `/plan-market-research` to run competitive landscape analysis.",
      "Run superpowers brainstorming for clarification.",
      "`write_artifact` RequirementsAnalysis (status review).",
      "Present summary; on user OK call `approve_latest_artifact` + `advance_pipeline`.",
    ],
    userTriggers: ["需求分析", "analyze requirements", "继续"],
    doneWhen: "RequirementsAnalysis approved.",
  },
  prd: {
    stage: "prd",
    title: "PRD",
    titleZh: "产品需求文档",
    agentId: "product_writer",
    skillPath: `${BASE}/prd-writer/SKILL.md`,
    outputArtifact: "PRD",
    humanGate: "required",
    upstreamArtifacts: ["RequirementsAnalysis"],
    externalSkills: [
      { id: "baoyu-format-markdown", slashCommand: "/baoyu-format-markdown", vendorPath: "vendor/baoyu-skills/skills/baoyu-format-markdown/SKILL.md" },
    ],
    objective: "Full PRD with features, priorities, acceptance criteria.",
    steps: [
      "Read `skills/prd-writer/SKILL.md`.",
      "Load approved RequirementsAnalysis.",
      "Draft PRD JSON; optional slide deck for stakeholders.",
      "`write_artifact` PRD; user review → approve → advance.",
    ],
    userTriggers: ["写PRD", "prd", "产品文档"],
    doneWhen: "PRD approved.",
  },
  user_flows: {
    stage: "user_flows",
    title: "User Flows",
    titleZh: "用户流",
    agentId: "ux_strategist",
    skillPath: `${BASE}/ux-flow/SKILL.md`,
    outputArtifact: "UserFlows",
    humanGate: "optional",
    upstreamArtifacts: ["PRD"],
    externalSkills: [
      { id: "baoyu-diagram", slashCommand: "/baoyu-diagram", vendorPath: "vendor/baoyu-skills/skills/baoyu-diagram/SKILL.md" },
    ],
    objective: "Task flows with Mermaid diagrams per core user journey.",
    steps: [
      "Read `skills/ux-flow/SKILL.md`.",
      "Map PRD features to flows; use baoyu-diagram for visuals.",
      "`write_artifact` UserFlows; confirm with user → approve → advance.",
    ],
    userTriggers: ["用户流", "user flow", "流程图"],
    doneWhen: "UserFlows artifact saved (approve if user wants gate).",
  },
  information_architecture: {
    stage: "information_architecture",
    title: "Information Architecture",
    titleZh: "信息架构",
    agentId: "information_architect",
    skillPath: `${BASE}/information-architect/SKILL.md`,
    outputArtifact: "InformationArchitecture",
    humanGate: "optional",
    upstreamArtifacts: ["PRD", "UserFlows"],
    externalSkills: [
      { id: "baoyu-diagram", slashCommand: "/baoyu-diagram", vendorPath: "vendor/baoyu-skills/skills/baoyu-diagram/SKILL.md" },
    ],
    objective: "Sitemap, navigation, URL map, content types.",
    steps: [
      "Read `skills/information-architect/SKILL.md`.",
      "Synthesize PRD + UserFlows into IA tree.",
      "`write_artifact` InformationArchitecture → approve → advance.",
    ],
    userTriggers: ["信息架构", "ia", "sitemap"],
    doneWhen: "InformationArchitecture artifact saved.",
  },
  wireframes: {
    stage: "wireframes",
    title: "Wireframes",
    titleZh: "低保真原型",
    agentId: "wireframe_designer",
    skillPath: `${BASE}/wireframe-designer/SKILL.md`,
    outputArtifact: "Wireframes",
    humanGate: "optional",
    upstreamArtifacts: ["InformationArchitecture", "UserFlows"],
    externalSkills: [],
    objective: "Low-fi HTML wireframes per page in IA.",
    steps: [
      "Read `skills/wireframe-designer/SKILL.md`.",
      "Generate page list from IA; write HTML under `projects/{id}/wireframes/`.",
      "`write_artifact` Wireframes with htmlPath per page → approve → advance.",
    ],
    userTriggers: ["线框图", "wireframe", "低保真"],
    doneWhen: "Wireframes + HTML files exist.",
  },
  ui_design: {
    stage: "ui_design",
    title: "UI Design",
    titleZh: "UI 设计",
    agentId: "visual_designer",
    skillPath: `${BASE}/visual-designer/SKILL.md`,
    outputArtifact: "UIDesignSpec",
    humanGate: "required",
    upstreamArtifacts: ["Wireframes"],
    externalSkills: [
      { id: "baoyu-imagine", slashCommand: "/baoyu-imagine", vendorPath: "vendor/baoyu-skills/skills/baoyu-imagine/SKILL.md" },
    ],
    objective: "Design tokens, components, screen specs (optional concept images).",
    steps: [
      "Read `skills/visual-designer/SKILL.md`.",
      "Infer tokens from brand/constraints; map wireframe regions to components.",
      "Optional baoyu-imagine for hero screens.",
      "`write_artifact` UIDesignSpec → user must approve → advance.",
    ],
    userTriggers: ["ui设计", "视觉设计", "design system"],
    doneWhen: "UIDesignSpec approved.",
  },
  design_review: {
    stage: "design_review",
    title: "Design Review",
    titleZh: "设计审查",
    agentId: "design_reviewer",
    skillPath: "skills/design-reviewer/SKILL.md",
    outputArtifact: "DesignReviewReport",
    humanGate: "required",
    upstreamArtifacts: ["UIDesignSpec", "Wireframes"],
    externalSkills: [],
    objective: "Verify design quality: token consistency, component coverage, responsive, accessible.",
    steps: [
      "Read skills/design-reviewer/SKILL.md.",
      "get_latest_artifact UIDesignSpec and Wireframes.",
      "Run 4 checks: tokens, components, responsive, a11y.",
      "write_artifact DesignReviewReport.",
      "User must approve before codegen.",
    ],
    userTriggers: ["设计审查", "design review", "quality check"],
    doneWhen: "DesignReviewReport approved and passed.",
  },
  frontend_codegen: {
    stage: "frontend_codegen",
    title: "Frontend Code",
    titleZh: "前端页面生成",
    agentId: "frontend_engineer",
    skillPath: `${BASE}/frontend-engineer/SKILL.md`,
    outputArtifact: "CodeBundle",
    humanGate: "optional",
    upstreamArtifacts: ["UIDesignSpec", "DesignReviewReport"],
    externalSkills: [
      { id: "writing-plans", vendorPath: "vendor/superpowers/skills/writing-plans/SKILL.md" },
      { id: "test-driven-development", vendorPath: "vendor/superpowers/skills/test-driven-development/SKILL.md" },
    ],
    objective: "Runnable frontend (React/Vite or HTML) from UI spec.",
    steps: [
      "Read `skills/frontend-engineer/SKILL.md`.",
      "Superpowers writing-plans → implement under `projects/{id}/app/`.",
      "`write_artifact` CodeBundle with rootPath and previewUrl.",
    ],
    userTriggers: ["生成前端", "写代码", "codegen"],
    doneWhen: "CodeBundle artifact + working preview.",
  },
  handoff: {
    stage: "handoff",
    title: "Handoff Documentation",
    titleZh: "交接文档",
    agentId: "handoff_specialist",
    skillPath: "skills/handoff/SKILL.md",
    outputArtifact: "HandoffDoc",
    humanGate: "optional",
    upstreamArtifacts: ["CodeBundle"],
    externalSkills: [],
    objective: "Generate component docs, build instructions, API contracts, deployment guide.",
    steps: [
      "Read skills/handoff/SKILL.md.",
      "get_latest_artifact CodeBundle, UIDesignSpec, PRD.",
      "Generate component docs, route map, token reference, build instructions, API contracts.",
      "write_artifact HandoffDoc with all docs.",
    ],
    userTriggers: ["handoff", "交接文档", "开发文档"],
    doneWhen: "HandoffDoc saved under projects/{id}/docs/",
  },
  quality_eval: {
    stage: "quality_eval",
    title: "Quality Assessment",
    titleZh: "质量评估",
    agentId: "quality_evaluator",
    skillPath: "skills/quality-evaluator/SKILL.md",
    outputArtifact: "QualityReport",
    humanGate: "optional",
    upstreamArtifacts: ["HandoffDoc"],
    externalSkills: [],
    objective: "Final quality gate: artifact quality assessment and feature-flow coverage validation.",
    steps: [
      "Read skills/quality-evaluator/SKILL.md.",
      "get_latest_artifact all project artifacts for quality checks.",
      "Run eval.artifact.quality: rubric-based scoring per artifact type.",
      "Run eval.coverage.feature_flow: PRD features vs flows vs wireframes vs components.",
      "write_artifact QualityReport with scores, gaps, overall score.",
    ],
    userTriggers: ["质量评估", "quality check", "评估", "coverage"],
    doneWhen: "QualityReport saved and overallScore >= 70.",
  },
};


export function getStagePlaybook(stage: PipelineStage): StagePlaybook {
  return STAGE_PLAYBOOKS[stage];
}

export function workflowStepForStage(stage: PipelineStage) {
  return DESIGN_PIPELINE_WORKFLOW.steps.find((s) => s.stage === stage);
}
