import type { PipelineStage, WorkflowDefinition } from "../types.js";

export const DESIGN_PIPELINE_WORKFLOW: WorkflowDefinition = {
  id: "design_pipeline",
  name: "Full Product Design Pipeline",
  description:
    "End-to-end: brief → requirements → PRD → flows → IA → wireframes → UI → design review → code → handoff → quality assessment",
  steps: [
    {
      id: "step_intake",
      stage: "intake",
      agentId: "orchestrator",
      requiredUpstream: [],
      outputArtifactType: "ProjectBrief",
      humanGate: "optional",
    },
    {
      id: "step_requirements",
      stage: "requirements_analysis",
      agentId: "requirements_analyst",
      requiredUpstream: ["ProjectBrief"],
      outputArtifactType: "RequirementsAnalysis",
      humanGate: "required",
    },
    {
      id: "step_prd",
      stage: "prd",
      agentId: "product_writer",
      requiredUpstream: ["RequirementsAnalysis"],
      outputArtifactType: "PRD",
      humanGate: "required",
    },
    {
      id: "step_user_flows",
      stage: "user_flows",
      agentId: "ux_strategist",
      requiredUpstream: ["PRD"],
      outputArtifactType: "UserFlows",
      humanGate: "optional",
    },
    {
      id: "step_ia",
      stage: "information_architecture",
      agentId: "information_architect",
      requiredUpstream: ["PRD", "UserFlows"],
      outputArtifactType: "InformationArchitecture",
      humanGate: "optional",
    },
    {
      id: "step_wireframes",
      stage: "wireframes",
      agentId: "wireframe_designer",
      requiredUpstream: ["InformationArchitecture", "UserFlows"],
      outputArtifactType: "Wireframes",
      humanGate: "optional",
    },
    {
      id: "step_ui",
      stage: "ui_design",
      agentId: "visual_designer",
      requiredUpstream: ["Wireframes"],
      outputArtifactType: "UIDesignSpec",
      humanGate: "required",
    },
    {
      id: "step_design_review",
      stage: "design_review",
      agentId: "design_reviewer",
      requiredUpstream: ["UIDesignSpec", "Wireframes"],
      outputArtifactType: "DesignReviewReport",
      humanGate: "required",
    },
    {
      id: "step_codegen",
      stage: "frontend_codegen",
      agentId: "frontend_engineer",
      requiredUpstream: ["UIDesignSpec", "DesignReviewReport"],
      outputArtifactType: "CodeBundle",
      humanGate: "optional",
    },
    {
      id: "step_code_intelligence",
      stage: "code_intelligence",
      agentId: "code_intelligence_analyst",
      requiredUpstream: ["CodeBundle"],
      outputArtifactType: "CodeIntelligenceReport",
      humanGate: "optional",
    },
    {
      id: "step_handoff",
      stage: "handoff",
      agentId: "handoff_specialist",
      requiredUpstream: ["CodeBundle", "CodeIntelligenceReport"],
      outputArtifactType: "HandoffDoc",
      humanGate: "optional",
    },
    {
      id: "step_quality_eval",
      stage: "quality_eval",
      agentId: "quality_evaluator",
      requiredUpstream: ["HandoffDoc", "CodeIntelligenceReport"],
      outputArtifactType: "QualityReport",
      humanGate: "optional",
    },
  ],
};

export const STAGE_ORDER: PipelineStage[] = DESIGN_PIPELINE_WORKFLOW.steps.map(
  (s) => s.stage
);

export function nextStage(current: PipelineStage): PipelineStage | null {
  const i = STAGE_ORDER.indexOf(current);
  return i >= 0 && i < STAGE_ORDER.length - 1 ? STAGE_ORDER[i + 1]! : null;
}

export function canAdvanceStage(
  stage: PipelineStage,
  approvedTypes: Set<string>
): { ok: boolean; missing: string[] } {
  const step = DESIGN_PIPELINE_WORKFLOW.steps.find((s) => s.stage === stage);
  if (!step) return { ok: false, missing: [] };
  const missing = step.requiredUpstream.filter((t) => !approvedTypes.has(t));
  return { ok: missing.length === 0, missing };
}
