import { agentForStage } from "../agents/definitions.js";
import type { PipelineStage, HumanGate } from "../types.js";
import { getStagePlaybook, workflowStepForStage } from "./stages.js";

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
}

export function buildNextAction(input: NextActionInput): NextAction {
  const playbook = getStagePlaybook(input.currentStage);
  const wfStep = workflowStepForStage(input.currentStage);
  const agent = agentForStage(input.currentStage);
  const latestOutput = input.artifacts
    .filter((a) => a.type === playbook.outputArtifact)
    .sort((a, b) => b.id.localeCompare(a.id))[0];
  const outputApproved = latestOutput?.status === "approved";
  const outputExists = Boolean(latestOutput);

  let phase: ConversationPhase = "execute";
  let suggestedUserMessage = `请完成当前阶段：${playbook.titleZh}`;

  if (input.currentStage === "frontend_codegen" && outputApproved) {
    phase = "complete";
    suggestedUserMessage = "流水线已完成。可打开 preview 或继续迭代某一阶段。";
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
      wfStep?.humanGate === "required"
        ? `请审阅 ${playbook.outputArtifact}。满意后回复「批准」或「继续」。`
        : `已生成 ${playbook.outputArtifact}。回复「批准」进入下一阶段，或提出修改。`;
  } else if (input.canAdvance && outputExists) {
    phase = "advance_ready";
    suggestedUserMessage = "上游已满足。调用 advance_pipeline 进入下一阶段。";
  } else if (!outputExists) {
    phase = "execute";
    suggestedUserMessage = `开始${playbook.titleZh}：${playbook.objective}`;
  }

  const mcpSequence: string[] = ["get_next_action"];
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

  if (action.playbook.externalSkills.length) {
    lines.push(``, `## 外部 Skills`);
    for (const s of action.playbook.externalSkills) {
      lines.push(
        `- **${s.id}**${s.slashCommand ? ` (${s.slashCommand})` : ""} → \`${s.vendorPath}\``
      );
    }
  }

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
