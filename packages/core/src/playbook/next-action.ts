import { agentForStage } from "../agents/definitions.js";
import type { PipelineStage, HumanGate } from "../types.js";
import {
  deliveryChecklist,
  type OperatorPreference,
} from "../operator-preference.js";
import { getStagePlaybook, workflowStepForStage } from "./stages.js";
import { localToolGuidance, localEvidenceRules, type ToolGuidance } from "./local-capabilities.js";

export type ConversationPhase =
  | "setup"
  | "execute"
  | "review"
  | "blocked"
  | "advance_ready"
  | "complete";

export interface NextAction {
  phase: ConversationPhase;
  projectId: string;
  stage: PipelineStage;
  stepIndex: number;
  totalSteps: number;
  stageTitle: string;
  stageTitleZh: string;
  agentId: string | null;
  skillPath: string;
  outputArtifact: string;
  humanGate: HumanGate;
  blockers: string[];
  canAdvance: boolean;
  staleDownstream: PipelineStage[];
  playbook: ReturnType<typeof getStagePlaybook>;
  suggestedUserMessage: string;
  mcpSequence: string[];
  operatorPreference?: OperatorPreference;
  deliveryChecklist?: string[];
  routeHints?: string[];
  toolGuidance: ToolGuidance[];
  evidenceRules: string[];
}

export interface NextActionInput {
  projectId: string;
  currentStage: PipelineStage;
  stepIndex: number;
  totalSteps: number;
  artifacts: Array<{ type: string; id: string; status: string }>;
  staleDownstream: PipelineStage[];
  blockers: string[];
  canAdvance: boolean;
  operatorPreference?: OperatorPreference;
}

export function buildNextAction(input: NextActionInput): NextAction {
  const basePlaybook = getStagePlaybook(input.currentStage);
  const playbook = { ...basePlaybook, externalSkills: [...basePlaybook.externalSkills] };
  const wfStep = workflowStepForStage(input.currentStage);
  const agent = agentForStage(input.currentStage);
  const prefs = input.operatorPreference;
  if (["design_review", "frontend_codegen"].includes(input.currentStage)) {
    playbook.externalSkills.push({id:"webapp-testing",vendorPath:"vendor/anthropic-skills/webapp-testing/SKILL.md"});
  }
  playbook.externalSkills = playbook.externalSkills.filter((skill, index, all) => all.findIndex(x => x.vendorPath === skill.vendorPath) === index);
  if (prefs?.deliveryTarget === "feishu-doc" || prefs?.taskMode === "copy_only") {
    playbook.externalSkills = playbook.externalSkills.filter(skill => !["webapp-testing", "browser-testing-with-devtools", "agent-browser"].includes(skill.id));
  }
  const latestOutput = input.artifacts
    .filter((a) => a.type === playbook.outputArtifact)
    .sort((a, b) => b.id.localeCompare(a.id))[0];
  const outputApproved = latestOutput?.status === "approved";
  const outputExists = Boolean(latestOutput);

  let phase: ConversationPhase = "execute";
  let suggestedUserMessage = `请完成当前阶段：${playbook.titleZh}`;

  if (input.currentStage === "quality_eval" && outputApproved) {
    phase = "complete";
    suggestedUserMessage = "流水线已完成。可打开 preview 或继续迭代某一阶段。";
  } else if (input.currentStage === "backend_codegen") {
    suggestedUserMessage =
      "若本项目需要后端：按 skills/backend-engineer 生成 BackendCodeBundle；若不需要后端请确认 ProjectBrief.includeBackend=false 后 advance 跳过。";
    if (input.blockers.length > 0) {
      phase = "blocked";
      suggestedUserMessage = `先补齐上游产物：${input.blockers.join(", ")}`;
    } else if (
      outputExists &&
      !outputApproved &&
      (wfStep?.humanGate === "required" || wfStep?.humanGate === "optional")
    ) {
      phase = "review";
      suggestedUserMessage =
        `已生成 ${playbook.outputArtifact}。回复「批准」进入下一阶段，或提出修改。`;
    } else if (input.canAdvance && outputExists) {
      phase = "advance_ready";
      suggestedUserMessage = "上游已满足。调用 advance_pipeline 进入下一阶段。";
    } else if (!outputExists) {
      phase = "execute";
    }
  } else if (input.blockers.length > 0) {
    phase = "blocked";
    suggestedUserMessage = `先补齐上游产物：${input.blockers.join(", ")}`;
  } else if (
    outputExists &&
    !outputApproved &&
    (wfStep?.humanGate === "required" || wfStep?.humanGate === "optional")
  ) {
    phase = "review";
    suggestedUserMessage =
      prefs?.gateStyle === "strict" || wfStep?.humanGate === "required"
        ? `请审阅 ${playbook.outputArtifact}。满意后回复「批准」或「继续」。`
        : `已生成 ${playbook.outputArtifact}。回复「批准」进入下一阶段，或提出修改。`;
  } else if (input.canAdvance && outputExists) {
    phase = "advance_ready";
    suggestedUserMessage = "上游已满足。调用 advance_pipeline 进入下一阶段。";
  } else if (!outputExists) {
    phase = "execute";
    if (prefs?.taskMode === "copy_only") {
      suggestedUserMessage =
        "文案护栏模式：只改说明/文案，不改字段名、口径、交互。先列改动点，再改代码或文档。";
    } else if (
      prefs?.prototypeMode === "incremental" &&
      input.currentStage === "frontend_codegen"
    ) {
      suggestedUserMessage =
        "增量改造：在既有应用上改；完成后按交付清单做预览/离线 HTML 校验。";
    } else if (
      prefs?.deliveryTarget === "feishu-doc" &&
      input.currentStage === "handoff"
    ) {
      suggestedUserMessage =
        "文档交付模式：整理交接/飞书发布要点；凭证仅本机，不写入仓库。";
    } else {
      suggestedUserMessage = `开始${playbook.titleZh}：${playbook.objective}`;
    }
  }

  const mcpSequence: string[] = [
    "get_operator_preference",
    "get_next_action",
  ];
  if (phase === "execute") {
    mcpSequence.push(
      "get_latest_artifact (upstream)",
      "write_artifact",
      "get_next_action"
    );
  } else if (phase === "review") {
    mcpSequence.push("approve_latest_artifact", "advance_pipeline", "get_next_action");
  } else if (phase === "advance_ready") {
    mcpSequence.push("advance_pipeline", "get_next_action");
  }

  const routeHints: string[] = [];
  if (prefs) {
    routeHints.push(
      `route: deliveryTarget=${prefs.deliveryTarget}, prototypeMode=${prefs.prototypeMode}, taskMode=${prefs.taskMode}`
    );
  }
  const checklist = prefs ? deliveryChecklist(prefs) : [];

  return {
    phase,
    projectId: input.projectId,
    stage: input.currentStage,
    stepIndex: input.stepIndex,
    totalSteps: input.totalSteps,
    stageTitle: playbook.title,
    stageTitleZh: playbook.titleZh,
    agentId: agent?.id ?? playbook.agentId,
    skillPath: agent?.skillPath ?? playbook.skillPath,
    outputArtifact: playbook.outputArtifact,
    humanGate: wfStep?.humanGate ?? playbook.humanGate,
    blockers: input.blockers,
    canAdvance: input.canAdvance,
    staleDownstream: input.staleDownstream,
    playbook,
    suggestedUserMessage,
    mcpSequence,
    operatorPreference: prefs,
    deliveryChecklist: checklist,
    routeHints,
    toolGuidance: phase === "execute" ? localToolGuidance(input.currentStage, prefs) : [],
    evidenceRules: [...localEvidenceRules],
  };
}

export function formatNextActionMarkdown(action: NextAction): string {
  const lines = [
    `# APDR · ${action.stageTitleZh} (${action.stepIndex}/${action.totalSteps})`,
    ``,
    `**阶段**: \`${action.stage}\` · **Agent**: \`${action.agentId}\``,
    `**状态**: ${action.phase}`,
    `**产出物**: \`${action.outputArtifact}\` · **人工门禁**: ${action.humanGate}`,
    ``,
    `## 你对用户说`,
    action.suggestedUserMessage,
    ``,
    `## 目标`,
    action.playbook.objective,
    ``,
    `## 执行步骤`,
    ...action.playbook.steps.map((s, i) => `${i + 1}. ${s}`),
    ``,
    `## 必读 Skill`,
    `\`${action.skillPath}\``,
  ];

  if (action.routeHints?.length) {
    lines.push(``, `## 路线`, ...action.routeHints.map((h) => `- ${h}`));
  }
  if (action.deliveryChecklist?.length) {
    lines.push(
      ``,
      `## 交付护栏`,
      ...action.deliveryChecklist.map((c) => `- ${c}`)
    );
  }

  if (action.playbook.externalSkills.length) {
    lines.push(``, `## 外部 Skills`);
    for (const s of action.playbook.externalSkills) {
      lines.push(
        `- **${s.id}**${s.slashCommand ? ` (${s.slashCommand})` : ""} → \`${s.vendorPath}\``
      );
    }
  }

  if (action.toolGuidance.length) {
    lines.push("", "## 本阶段可执行工具（按条件使用，不新增门禁）");
    for (const tool of action.toolGuidance) lines.push(`- ${tool.server}.${tool.tool}：${tool.when} 证据：${tool.evidence}`);
  }
  lines.push("", "## 证据与技能边界", ...action.evidenceRules.map(rule => `- ${rule}`));

  if (action.blockers.length) {
    lines.push(``, `## 阻塞`, action.blockers.map((b) => `- ${b}`).join("\n"));
  }
  if (action.staleDownstream.length) {
    lines.push(
      ``,
      `## 下游已过期`,
      action.staleDownstream.map((s) => `- ${s}`).join("\n")
    );
  }

  lines.push(``, `## MCP 调用顺序`, ...action.mcpSequence.map((s) => `- \`${s}\``));

  lines.push(
    ``,
    `## 用户可说的指令`,
    action.playbook.userTriggers.map((t) => `- 「${t}」`).join("\n")
  );

  return lines.join("\n");
}
