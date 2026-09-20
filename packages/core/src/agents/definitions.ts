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
    skillPath: "skills/apdr-runtime/SKILL.md",
    externalSkills: [
      {
        id: "operator-preference",
        source: "apdr",
        vendorPath: "skills/operator-preference/SKILL.md",
      },
      {
        id: "verification-before-completion",
        source: "superpowers",
        vendorPath: "vendor/superpowers/skills/verification-before-completion/SKILL.md",
      },
    ],
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
        id: "operator-preference",
        source: "apdr",
        vendorPath: "skills/operator-preference/SKILL.md",
      },
      {
        id: "document-io",
        source: "apdr",
        vendorPath: "skills/document-io/SKILL.md",
      },
      {
        id: "feishu-lark",
        source: "apdr",
        vendorPath: "skills/feishu-lark/SKILL.md",
      },
      {
        id: "idea-refine",
        source: "addy-agent-skills",
        vendorPath: "vendor/addy-agent-skills/idea-refine/SKILL.md",
      },
      {
        id: "grill-me",
        source: "mattpocock",
        vendorPath: "vendor/mattpocock-skills/grilling/SKILL.md",
        slashCommand: "/grill-me",
      },
      {
        id: "grill-with-docs",
        source: "mattpocock",
        vendorPath: "vendor/mattpocock-skills/grill-with-docs/SKILL.md",
        slashCommand: "/grill-with-docs",
      },
      {
        id: "competitive-research",
        source: "apdr",
        vendorPath: "skills/competitive-research/SKILL.md",
      },
      {
        id: "mattpocock-research",
        source: "mattpocock",
        vendorPath: "vendor/mattpocock-skills/research/SKILL.md",
        slashCommand: "/research",
      },
      {
        id: "competitor-profiling",
        source: "marketing-skills",
        vendorPath: "vendor/marketing-skills/competitor-profiling/SKILL.md",
      },
      {
        id: "customer-research",
        source: "marketing-skills",
        vendorPath: "vendor/marketing-skills/customer-research/SKILL.md",
      },
      {
        id: "pm-competitor-analysis",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-market-research/skills/competitor-analysis/SKILL.md",
      },
      {
        id: "pm-market-sizing",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-market-research/skills/market-sizing/SKILL.md",
      },
      {
        id: "pm-swot-analysis",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-product-strategy/skills/swot-analysis/SKILL.md",
      },
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
        id: "pm-competitor-analysis",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-market-research/skills/competitor-analysis/SKILL.md",
      },
      {
        id: "pm-user-personas",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-market-research/skills/user-personas/SKILL.md",
      },
      {
        id: "lark-doc",
        source: "larksuite",
        vendorPath: "vendor/larksuite-cli/lark-doc/SKILL.md",
      },
      {
        id: "anthropic-docx",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/docx/SKILL.md",
      },
      {
        id: "anthropic-pdf",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/pdf/SKILL.md",
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
        id: "spec-driven-development",
        source: "addy-agent-skills",
        vendorPath: "vendor/addy-agent-skills/spec-driven-development/SKILL.md",
      },
      {
        id: "grill-with-docs",
        source: "mattpocock",
        vendorPath: "vendor/mattpocock-skills/grill-with-docs/SKILL.md",
        slashCommand: "/grill-with-docs",
      },
      {
        id: "competitive-research",
        source: "apdr",
        vendorPath: "skills/competitive-research/SKILL.md",
      },
      {
        id: "pm-swot-analysis",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-product-strategy/skills/swot-analysis/SKILL.md",
      },
      {
        id: "doc-coauthoring",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/doc-coauthoring/SKILL.md",
      },
      {
        id: "document-io",
        source: "apdr",
        vendorPath: "skills/document-io/SKILL.md",
      },
      {
        id: "feishu-lark",
        source: "apdr",
        vendorPath: "skills/feishu-lark/SKILL.md",
      },
      {
        id: "lark-doc",
        source: "larksuite",
        vendorPath: "vendor/larksuite-cli/lark-doc/SKILL.md",
      },
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
        id: "pm-product-strategy",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-product-strategy/skills/product-strategy/SKILL.md",
        slashCommand: "/strategy",
      },
      {
        id: "pm-lean-canvas",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-product-strategy/skills/lean-canvas/SKILL.md",
      },
      {
        id: "anthropic-docx",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/docx/SKILL.md",
      },
      {
        id: "anthropic-pptx",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/pptx/SKILL.md",
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
    mcpServers: ["design-artifacts", "diagram"],
    skillPath: "skills/ux-flow/SKILL.md",
    externalSkills: [
      {
        id: "baoyu-diagram",
        source: "baoyu",
        vendorPath: "vendor/baoyu-skills/skills/baoyu-diagram/SKILL.md",
        slashCommand: "/baoyu-diagram",
      },
      {
        id: "pm-customer-journey-map",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-market-research/skills/customer-journey-map/SKILL.md",
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
    mcpServers: ["design-artifacts", "diagram"],
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
    externalSkills: [
      {
        id: "web-artifacts-builder",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/web-artifacts-builder/SKILL.md",
      },
    ],
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
        id: "frontend-design",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/frontend-design/SKILL.md",
      },
      {
        id: "design-taste-frontend",
        source: "taste-skill",
        vendorPath: "vendor/taste-skill/design-taste-frontend/SKILL.md",
      },
      {
        id: "theme-factory",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/theme-factory/SKILL.md",
      },
      {
        id: "design-system-agentic",
        source: "awesome-design-skills",
        vendorPath: "vendor/awesome-design-skills/agentic/SKILL.md",
      },
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
      {
        id: "operator-preference",
        source: "apdr",
        vendorPath: "skills/operator-preference/SKILL.md",
      },
      {
        id: "document-io",
        source: "apdr",
        vendorPath: "skills/document-io/SKILL.md",
      },
      {
        id: "feishu-lark",
        source: "apdr",
        vendorPath: "skills/feishu-lark/SKILL.md",
      },
      {
        id: "idea-refine",
        source: "addy-agent-skills",
        vendorPath: "vendor/addy-agent-skills/idea-refine/SKILL.md",
      },
      {
        id: "grill-me",
        source: "mattpocock",
        vendorPath: "vendor/mattpocock-skills/grilling/SKILL.md",
        slashCommand: "/grill-me",
      },
      {
        id: "competitive-research",
        source: "apdr",
        vendorPath: "skills/competitive-research/SKILL.md",
      },
      {
        id: "mattpocock-research",
        source: "mattpocock",
        vendorPath: "vendor/mattpocock-skills/research/SKILL.md",
        slashCommand: "/research",
      },
      {
        id: "pm-skills-discover",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-product-discovery",
        slashCommand: "/discover",
      },
      {
        id: "pm-skills-strategy",
        source: "pm-skills",
        vendorPath: "vendor/pm-skills/pm-product-strategy",
        slashCommand: "/strategy",
      },
      {
        id: "brainstorming",
        source: "superpowers",
        vendorPath: "vendor/superpowers/skills/brainstorming/SKILL.md",
      },
      {
        id: "lark-doc",
        source: "larksuite",
        vendorPath: "vendor/larksuite-cli/lark-doc/SKILL.md",
      },
      {
        id: "anthropic-docx",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/docx/SKILL.md",
      },
      {
        id: "anthropic-pdf",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/pdf/SKILL.md",
      },
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
    externalSkills: [
      {
        id: "frontend-design",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/frontend-design/SKILL.md",
      },
      {
        id: "design-taste-frontend",
        source: "taste-skill",
        vendorPath: "vendor/taste-skill/design-taste-frontend/SKILL.md",
      },
      {
        id: "design-system-agentic",
        source: "awesome-design-skills",
        vendorPath: "vendor/awesome-design-skills/agentic/SKILL.md",
      },
      {
        id: "web-design-guidelines",
        source: "vercel",
        vendorPath: "vendor/vercel-agent-skills/web-design-guidelines/SKILL.md",
      },
      {
        id: "agent-browser",
        source: "vercel",
        vendorPath: "skills/agent-browser/SKILL.md",
      },
    ],
    exitArtifactType: "DesignReviewReport",
  },
  {
    id: "code_intelligence_analyst",
    name: "Code Intelligence Analyst",
    stage: "code_intelligence",
    description:
      "Indexes generated frontend with CodeGraph and produces CodeIntelligenceReport for automated handoff",
    capabilityIds: ["code.intelligence.index", "code.intelligence.analyze"],
    mcpServers: ["design-artifacts", "repo"],
    skillPath: "skills/code-intelligence/SKILL.md",
    externalSkills: [
      {
        id: "codegraph",
        source: "codegraph",
        vendorPath: "https://github.com/colbymchenry/codegraph",
      },
      {
        id: "improve-codebase-architecture",
        source: "mattpocock",
        vendorPath: "vendor/mattpocock-skills/improve-codebase-architecture/SKILL.md",
        slashCommand: "/improve-codebase-architecture",
      },
      {
        id: "codebase-design",
        source: "mattpocock",
        vendorPath: "vendor/mattpocock-skills/codebase-design/SKILL.md",
      },
    ],
    exitArtifactType: "CodeIntelligenceReport",
  },
  {
    id: "handoff_specialist",
    name: "Handoff Specialist",
    stage: "handoff",
    description: "Generates developer handoff documentation: component docs, build instructions, API contracts, deployment guide",
    capabilityIds: ["govern.artifact.list"],
    mcpServers: ["design-artifacts", "repo"],
    skillPath: "skills/handoff/SKILL.md",
    externalSkills: [
      {
        id: "documentation-and-adrs",
        source: "addy-agent-skills",
        vendorPath: "vendor/addy-agent-skills/documentation-and-adrs/SKILL.md",
      },
      {
        id: "mattpocock-handoff",
        source: "mattpocock",
        vendorPath: "vendor/mattpocock-skills/handoff/SKILL.md",
        slashCommand: "/handoff",
      },
      {
        id: "document-io",
        source: "apdr",
        vendorPath: "skills/document-io/SKILL.md",
      },
      {
        id: "feishu-lark",
        source: "apdr",
        vendorPath: "skills/feishu-lark/SKILL.md",
      },
      {
        id: "lark-doc",
        source: "larksuite",
        vendorPath: "vendor/larksuite-cli/lark-doc/SKILL.md",
      },
      {
        id: "lark-wiki",
        source: "larksuite",
        vendorPath: "vendor/larksuite-cli/lark-wiki/SKILL.md",
      },
      {
        id: "anthropic-docx",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/docx/SKILL.md",
      },
      {
        id: "doc-coauthoring",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/doc-coauthoring/SKILL.md",
      },
    ],
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
        id: "planning-and-task-breakdown",
        source: "addy-agent-skills",
        vendorPath: "vendor/addy-agent-skills/planning-and-task-breakdown/SKILL.md",
      },
      {
        id: "frontend-ui-engineering",
        source: "addy-agent-skills",
        vendorPath: "vendor/addy-agent-skills/frontend-ui-engineering/SKILL.md",
      },
      {
        id: "frontend-design",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/frontend-design/SKILL.md",
      },
      {
        id: "design-taste-frontend",
        source: "taste-skill",
        vendorPath: "vendor/taste-skill/design-taste-frontend/SKILL.md",
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
        id: "mattpocock-tdd",
        source: "mattpocock",
        vendorPath: "vendor/mattpocock-skills/tdd/SKILL.md",
        slashCommand: "/tdd",
      },
      {
        id: "vercel-react-best-practices",
        source: "vercel",
        vendorPath: "vendor/vercel-agent-skills/react-best-practices/SKILL.md",
      },
      {
        id: "using-git-worktrees",
        source: "superpowers",
        vendorPath: "vendor/superpowers/skills/using-git-worktrees/SKILL.md",
      },
      {
        id: "code-review-and-quality",
        source: "addy-agent-skills",
        vendorPath: "vendor/addy-agent-skills/code-review-and-quality/SKILL.md",
      },
    ],
    exitArtifactType: "CodeBundle",
  },
  {
    id: "backend_engineer",
    name: "Backend Engineer",
    stage: "backend_codegen",
    description:
      "Optional API/service codegen from PRD + CodeBundle; skipped when includeBackend is false",
    capabilityIds: ["code.backend.api.generate", "code.backend.scaffold"],
    mcpServers: ["design-artifacts", "repo"],
    skillPath: "skills/backend-engineer/SKILL.md",
    externalSkills: [
      {
        id: "writing-plans",
        source: "superpowers",
        vendorPath: "vendor/superpowers/skills/writing-plans/SKILL.md",
      },
      {
        id: "test-driven-development",
        source: "superpowers",
        vendorPath: "vendor/superpowers/skills/test-driven-development/SKILL.md",
      },
      {
        id: "mattpocock-tdd",
        source: "mattpocock",
        vendorPath: "vendor/mattpocock-skills/tdd/SKILL.md",
        slashCommand: "/tdd",
      },
      {
        id: "documentation-and-adrs",
        source: "addy-agent-skills",
        vendorPath: "vendor/addy-agent-skills/documentation-and-adrs/SKILL.md",
      },
      {
        id: "backend-skills-dropin",
        source: "apdr",
        vendorPath: "skills/backend-skills/README.md",
      },
    ],
    exitArtifactType: "BackendCodeBundle",
  },
  {
    id: "quality_evaluator",
    name: "Quality Evaluator",
    stage: "quality_eval",
    description: "Final quality gate: runs artifact quality checks and feature-flow coverage validation",
    capabilityIds: ["eval.artifact.quality", "eval.coverage.feature_flow"],
    mcpServers: ["design-artifacts", "repo"],
    skillPath: "skills/quality-evaluator/SKILL.md",
    externalSkills: [
      {
        id: "verification-before-completion",
        source: "superpowers",
        vendorPath: "vendor/superpowers/skills/verification-before-completion/SKILL.md",
      },
      {
        id: "browser-testing-with-devtools",
        source: "addy-agent-skills",
        vendorPath: "vendor/addy-agent-skills/browser-testing-with-devtools/SKILL.md",
      },
      {
        id: "webapp-testing",
        source: "anthropic-skills",
        vendorPath: "vendor/anthropic-skills/webapp-testing/SKILL.md",
      },
      {
        id: "web-design-guidelines",
        source: "vercel",
        vendorPath: "vendor/vercel-agent-skills/web-design-guidelines/SKILL.md",
      },
      {
        id: "vercel-react-best-practices",
        source: "vercel",
        vendorPath: "vendor/vercel-agent-skills/react-best-practices/SKILL.md",
      },
      {
        id: "agent-browser",
        source: "vercel",
        vendorPath: "skills/agent-browser/SKILL.md",
      },
    ],
    exitArtifactType: "QualityReport",
  },
];

export function getAgent(id: string): AgentDefinition | undefined {
  return AGENT_REGISTRY.find((a) => a.id === id);
}

export function agentForStage(stage: string): AgentDefinition | undefined {
  return AGENT_REGISTRY.find((a) => a.stage === stage);
}
