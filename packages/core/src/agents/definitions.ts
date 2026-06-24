import type { AgentDefinition } from "../types.js";

/**
 * Agent definitions — bind to skills/ as you provide GitHub links.
 * skillPath is relative to repo root `skills/`.
 */
export const AGENT_REGISTRY: AgentDefinition[] = [
  {
    id: "orchestrator",
    name: "Orchestrator",
    stage: "intake",
    description: "Coordinates pipeline, gates, and artifact versioning",
    capabilityIds: ["govern.artifact.list", "govern.artifact.approve"],
    mcpServers: ["design-artifacts"],
    exitArtifactType: "ProjectBrief",
  },
  {
    id: "requirements_analyst",
    name: "Requirements Analyst",
    stage: "requirements_analysis",
    description: "Analyzes brief into structured requirements",
    capabilityIds: ["analysis.extract.requirements", "research.search.web"],
    mcpServers: ["design-artifacts", "research"],
    skillPath: "skills/requirements-analyst/SKILL.md",
    externalSkills: [
      {
        id: "brainstorming",
        source: "superpowers",
        vendorPath: "vendor/superpowers/skills/brainstorming/SKILL.md",
      },
      {
        id: "baoyu-url-to-markdown",
        source: "baoyu",
        vendorPath: "vendor/baoyu-skills/skills/baoyu-url-to-markdown/SKILL.md",
        slashCommand: "/baoyu-url-to-markdown",
      },
      {
        id: "baoyu-format-markdown",
        source: "baoyu",
        vendorPath: "vendor/baoyu-skills/skills/baoyu-format-markdown/SKILL.md",
        slashCommand: "/baoyu-format-markdown",
      },
      {
        id: "pm-discovery",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-product-discovery",
        slashCommand: "/discover",
      },
      {
        id: "pm-market-research",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-market-research",
        slashCommand: "/plan-market-research",
      },
    ],
    exitArtifactType: "RequirementsAnalysis",
  },
  {
    id: "product_writer",
    name: "Product Writer",
    stage: "prd",
    description: "Drafts PRD with features, priorities, and acceptance criteria",
    capabilityIds: ["spec.prd.generate"],
    mcpServers: ["design-artifacts"],
    skillPath: "skills/prd-writer/SKILL.md",
    externalSkills: [
      {
        id: "baoyu-slide-deck",
        source: "baoyu",
        vendorPath: "vendor/baoyu-skills/skills/baoyu-slide-deck/SKILL.md",
        slashCommand: "/baoyu-slide-deck",
      },
      {
        id: "baoyu-format-markdown",
        source: "baoyu",
        vendorPath: "vendor/baoyu-skills/skills/baoyu-format-markdown/SKILL.md",
        slashCommand: "/baoyu-format-markdown",
      },
      {
        id: "pm-strategy",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-product-strategy",
        slashCommand: "/strategy",
      },
    ],
    exitArtifactType: "PRD",
  },
  {
    id: "ux_strategist",
    name: "UX Strategist",
    stage: "user_flows",
    description: "Designs task flows and interaction paths",
    capabilityIds: ["ux.flow.render"],
    mcpServers: ["design-artifacts"],
    skillPath: "skills/ux-flow/SKILL.md",
    externalSkills: [
      {
        id: "baoyu-diagram",
        source: "baoyu",
        vendorPath: "vendor/baoyu-skills/skills/baoyu-diagram/SKILL.md",
        slashCommand: "/baoyu-diagram",
      },
    ],
    exitArtifactType: "UserFlows",
  },
  {
    id: "information_architect",
    name: "Information Architect",
    stage: "information_architecture",
    description: "Defines sitemap, navigation, and content model",
    capabilityIds: ["ux.ia.generate"],
    mcpServers: ["design-artifacts"],
    skillPath: "skills/information-architect/SKILL.md",
    externalSkills: [
      {
        id: "baoyu-diagram",
        source: "baoyu",
        vendorPath: "vendor/baoyu-skills/skills/baoyu-diagram/SKILL.md",
        slashCommand: "/baoyu-diagram",
      },
    ],
    exitArtifactType: "InformationArchitecture",
  },
  {
    id: "wireframe_designer",
    name: "Wireframe Designer",
    stage: "wireframes",
    description: "Produces low-fidelity HTML wireframes",
    capabilityIds: ["ux.wireframe.generate"],
    mcpServers: ["design-artifacts", "preview"],
    skillPath: "skills/wireframe-designer/SKILL.md",
    exitArtifactType: "Wireframes",
  },
  {
    id: "visual_designer",
    name: "Visual Designer",
    stage: "ui_design",
    description: "Creates UI spec, tokens, and component mapping",
    capabilityIds: ["visual.token.infer"],
    mcpServers: ["design-artifacts"],
    skillPath: "skills/visual-designer/SKILL.md",
    externalSkills: [
      {
        id: "baoyu-imagine",
        source: "baoyu",
        vendorPath: "vendor/baoyu-skills/skills/baoyu-imagine/SKILL.md",
        slashCommand: "/baoyu-imagine",
      },
    ],
    exitArtifactType: "UIDesignSpec",
  },
  {
    id: "intake_specialist",
    name: "Intake Specialist",
    stage: "intake",
    description: "Parses raw requirements into structured ProjectBrief using pm-skills discovery chain",
    capabilityIds: ["intake.parse.brief", "research.search.web", "research.fetch.url"],
    mcpServers: ["design-artifacts", "research"],
    skillPath: "skills/intake/SKILL.md",
    externalSkills: [
      { id: "pm-skills-discover", source: "pm-skills", vendorPath: "vendor/pm-skills/pm-product-discovery", slashCommand: "/discover" },
      { id: "pm-skills-strategy", source: "pm-skills", vendorPath: "vendor/pm-skills/pm-product-strategy", slashCommand: "/strategy" },
    ],
    exitArtifactType: "ProjectBrief",
  },
  {
    id: "design_reviewer",
    name: "Design Reviewer",
    stage: "design_review",
    description: "Design quality gate: checks token consistency, component coverage, responsive behavior, WCAG accessibility",
    capabilityIds: ["govern.artifact.approve"],
    mcpServers: ["design-artifacts"],
    skillPath: "skills/design-reviewer/SKILL.md",
    exitArtifactType: "DesignReviewReport",
  },
  {
    id: "handoff_specialist",
    name: "Handoff Specialist",
    stage: "handoff",
    description: "Generates developer handoff documentation: component docs, build instructions, API contracts, deployment guide",
    capabilityIds: ["govern.artifact.list"],
    mcpServers: ["design-artifacts"],
    skillPath: "skills/handoff/SKILL.md",
    exitArtifactType: "HandoffDoc",
  },
  {
    id: "frontend_engineer",
    name: "Frontend Engineer",
    stage: "frontend_codegen",
    description: "Generates runnable frontend from UI spec",
    capabilityIds: ["code.react.page.generate"],
    mcpServers: ["design-artifacts", "repo", "preview"],
    skillPath: "skills/frontend-engineer/SKILL.md",
    externalSkills: [
      {
        id: "writing-plans",
        source: "superpowers",
        vendorPath: "vendor/superpowers/skills/writing-plans/SKILL.md",
      },
      {
        id: "subagent-driven-development",
        source: "superpowers",
        vendorPath: "vendor/superpowers/skills/subagent-driven-development/SKILL.md",
      },
      {
        id: "test-driven-development",
        source: "superpowers",
        vendorPath: "vendor/superpowers/skills/test-driven-development/SKILL.md",
      },
      {
        id: "using-git-worktrees",
        source: "superpowers",
        vendorPath: "vendor/superpowers/skills/using-git-worktrees/SKILL.md",
      },
    ],
    exitArtifactType: "CodeBundle",
  },
  {
    id: "quality_evaluator",
    name: "Quality Evaluator",
    stage: "quality_eval",
    description: "Final quality gate: runs artifact quality checks and feature-flow coverage validation",
    capabilityIds: ["eval.artifact.quality", "eval.coverage.feature_flow"],
    mcpServers: ["design-artifacts"],
    skillPath: "skills/quality-evaluator/SKILL.md",
    exitArtifactType: "QualityReport",
  },
];

export function getAgent(id: string): AgentDefinition | undefined {
  return AGENT_REGISTRY.find((a) => a.id === id);
}

export function agentForStage(stage: string): AgentDefinition | undefined {
  return AGENT_REGISTRY.find((a) => a.stage === stage);
}
