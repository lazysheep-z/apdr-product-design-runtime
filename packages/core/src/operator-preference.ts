import type { ArtifactType, PipelineStage } from "./types.js";

/** Collaboration + delivery preferences for the human operator (not product personas). */
export interface OperatorPreference {
  communicationDensity: "concise" | "balanced" | "thorough";
  clarifyFirst: boolean;
  gateStyle: "strict" | "default" | "fast-forward-optional";
  feedbackStyle: "summary-only" | "inline-comments" | "rewrite-whole";
  language: "zh" | "en";
  wireframeFidelity: "low" | "mid";
  revisionMode: "patch" | "restage";
  /** New product vs patch existing prototype/app */
  prototypeMode: "greenfield" | "incremental";
  /** Copy/docs-only edits must not change fields, metrics, or interactions */
  docOnlyGuard: boolean;
  /** How to ship frontend preview */
  deliveryMode: "preview" | "offline-html" | "both" | "none";
  /** What the pipeline should ultimately deliver */
  deliveryTarget: "code" | "feishu-doc" | "both";
  /**
   * Task intensity:
   * - full: normal stage path (still may skip via deliveryTarget/prototypeMode)
   * - copy_only: docs/copy patch on existing UI — skip design stages
   * - patch_ui: incremental UI/code patch — skip optional UX stages when possible
   */
  taskMode: "full" | "copy_only" | "patch_ui";
  /** Fixed LAN preview port when set (e.g. 5180) */
  previewPort?: number;
  /** Prefer host:true / LAN access; do not force localhost-only */
  previewHostLan?: boolean;
  notes: string[];
}

export const DEFAULT_OPERATOR_PREFERENCE: OperatorPreference = {
  communicationDensity: "concise",
  clarifyFirst: true,
  gateStyle: "strict",
  feedbackStyle: "summary-only",
  language: "zh",
  wireframeFidelity: "mid",
  revisionMode: "patch",
  prototypeMode: "incremental",
  docOnlyGuard: true,
  deliveryMode: "both",
  deliveryTarget: "code",
  taskMode: "full",
  previewHostLan: true,
  notes: [],
};

const SENSITIVE =
  /(\b[\w.+-]+@[\w.-]+\.\w+\b)|(\/Users\/[^\s"']+)|(mingzhe\.feishu\.cn)|(open_id|app_secret|appsecret|ghp_[A-Za-z0-9]+)/gi;

/**
 * Strip personal identifiers from preference notes before persist.
 */
export function sanitizePreferenceNotes(notes: string[]): string[] {
  return notes
    .map((n) => n.replace(SENSITIVE, "[redacted]").trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function mergeOperatorPreference(
  partial?: Partial<OperatorPreference> | null
): OperatorPreference {
  const base = { ...DEFAULT_OPERATOR_PREFERENCE, ...(partial ?? {}) };
  base.notes = sanitizePreferenceNotes(base.notes ?? []);
  return base;
}

/** Stages skipped for a given preference profile. */
export function stagesSkippedByPreference(
  prefs: OperatorPreference
): Set<PipelineStage> {
  const skip = new Set<PipelineStage>();

  if (prefs.deliveryTarget === "feishu-doc") {
    for (const s of [
      "user_flows",
      "information_architecture",
      "wireframes",
      "ui_design",
      "design_review",
      "frontend_codegen",
      "backend_codegen",
      "code_intelligence",
    ] as PipelineStage[]) {
      skip.add(s);
    }
    return skip;
  }

  if (prefs.taskMode === "copy_only") {
    for (const s of [
      "user_flows",
      "information_architecture",
      "wireframes",
      "ui_design",
      "design_review",
      "backend_codegen",
      "code_intelligence",
    ] as PipelineStage[]) {
      skip.add(s);
    }
    return skip;
  }

  if (
    prefs.prototypeMode === "incremental" ||
    prefs.taskMode === "patch_ui"
  ) {
    for (const s of [
      "user_flows",
      "information_architecture",
      "wireframes",
      "ui_design",
      "design_review",
    ] as PipelineStage[]) {
      skip.add(s);
    }
  }

  return skip;
}

/**
 * Upstream gate overrides when using a shortened route.
 * Returns null to use the workflow default.
 */
export function upstreamOverrideForStage(
  stage: PipelineStage,
  prefs: OperatorPreference
): ArtifactType[] | null {
  if (prefs.deliveryTarget === "feishu-doc") {
    if (stage === "handoff") return ["PRD"];
    if (stage === "quality_eval") return ["HandoffDoc"];
  }

  if (prefs.taskMode === "copy_only") {
    if (stage === "frontend_codegen") return ["ProjectBrief"];
    if (stage === "handoff") return ["CodeBundle"];
    if (stage === "quality_eval") return ["HandoffDoc"];
  }

  if (
    prefs.prototypeMode === "incremental" ||
    prefs.taskMode === "patch_ui"
  ) {
    if (stage === "frontend_codegen") return ["PRD"];
    if (stage === "handoff") return ["CodeBundle"];
    if (stage === "quality_eval") return ["HandoffDoc"];
  }

  return null;
}

export function deliveryChecklist(prefs: OperatorPreference): string[] {
  const items: string[] = [];
  if (prefs.docOnlyGuard || prefs.taskMode === "copy_only") {
    items.push(
      "文案护栏：只改说明文案；不改字段名、指标口径、页面模块与交互（除非用户确认）"
    );
  }
  if (prefs.deliveryMode === "preview" || prefs.deliveryMode === "both") {
    items.push(
      prefs.previewPort
        ? `预览：保持局域网可访问；端口固定 ${prefs.previewPort}；勿改回 localhost-only`
        : "预览：保持局域网可访问（host true）；勿改回 localhost-only"
    );
  }
  if (prefs.deliveryMode === "offline-html" || prefs.deliveryMode === "both") {
    items.push(
      "离线交付：若项目有 pack:single，只生成桌面单个 HTML；禁止 zip / 多文件 dist 交付"
    );
  }
  if (prefs.deliveryTarget === "feishu-doc") {
    items.push(
      "交付目标：飞书/文档为主；跳过线框→前端代码阶段；凭证仅本机 lark-cli"
    );
  }
  if (prefs.prototypeMode === "incremental") {
    items.push("增量模式：在既有代码/原型上改；禁止无关重构");
  }
  return items;
}
