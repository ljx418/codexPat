import { CORE_ACTION_IDS, type CoreActionId, type RendererKind } from "./asset-manifest";

const FORBIDDEN_PATTERN = /Authorization|api-token\.json|raw payload|raw provider response|raw photo bytes|raw HTTP payload|EXIF|GPS|private filename|full local path|workspace path|config path|prompt private text|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\/|sk-[A-Za-z0-9_-]{8,}|\.\./i;
const SAFE_ID_PATTERN = /^[A-Za-z0-9._-]{1,96}$/;
const LOOP_ACTIONS = new Set<CoreActionId>(["idle", "thinking", "running", "sleeping"]);
const MOTION_REQUIRED_ACTIONS = new Set<CoreActionId>(["running", "success", "warning", "error", "need_input"]);

export const V22_CANDIDATE_STATUSES = [
  "generated",
  "normalized",
  "technical_failed",
  "motion_failed",
  "visual_review_required",
  "visual_rejected",
  "approved",
  "applied",
  "rollback_available"
] as const;

export type V22CandidateStatus = (typeof V22_CANDIDATE_STATUSES)[number];

export const V22_REASON_CODES = [
  "quality_passed",
  "missing_core_action",
  "blank_frame_detected",
  "transparent_frame_detected",
  "off_canvas_frame_detected",
  "background_not_removed",
  "watermark_detected",
  "loop_closure_failed",
  "frame_delta_too_large",
  "motion_amplitude_too_low",
  "identity_drift_detected",
  "style_inconsistent",
  "cat_not_cute_enough",
  "candidate_not_reviewed",
  "candidate_rejected",
  "provider_output_unusable",
  "retry_budget_exceeded",
  "better_photo_required",
  "alternate_route_recommended",
  "unsafe_field_detected",
  "apply_blocked_non_approved_candidate",
  "previous_pack_preserved"
] as const;

export type V22ReasonCode = (typeof V22_REASON_CODES)[number];

export type V22SourceRoute =
  | "provider_key_pose"
  | "alternate_provider"
  | "local_rig"
  | "image_to_video"
  | "motion_sheet"
  | "manual_fixture";

export type V22CandidateActionMetrics = {
  actionId: CoreActionId;
  frameCount: number;
  visiblePixelRatio: number;
  offCanvas: boolean;
  hasBackground: boolean;
  hasWatermark: boolean;
  loopClosed: boolean;
  maxAdjacentDelta: number;
  anchorDrift: number;
  motionAmplitude: number;
  identityConsistent: boolean;
  humanReadable: boolean;
  staticLike?: boolean;
};

export type V22CandidateAsset = {
  candidateId: string;
  sourceRoute: V22SourceRoute;
  safePackId: string;
  rendererKind: Extract<RendererKind, "sprite">;
  status: V22CandidateStatus;
  actions: V22CandidateActionMetrics[];
  retryCount: number;
  reasonCodes: V22ReasonCode[];
  guidance: string[];
};

export type V22GateResult = {
  status: V22CandidateStatus;
  reasonCodes: V22ReasonCode[];
  guidance: string[];
  actionResults: Array<{
    actionId: CoreActionId;
    status: "passed" | "failed";
    reasonCodes: V22ReasonCode[];
  }>;
};

export type V22ReviewDecision = "approve" | "reject" | "request_retry" | "switch_route" | "ask_better_photo";

export type V22VisualReviewInput = {
  reviewerKind: "operator" | "user" | "automated-assisted";
  decision: V22ReviewDecision;
  reasonCodes: V22ReasonCode[];
  commentSummary: string;
  reviewedAt: string;
};

export type V22PetInstanceAssignment = {
  instanceId: string;
  activePackId: string;
  isDefault?: boolean;
};

export type V22ApplyResult =
  | {
    status: "applied";
    reasonCode: "quality_passed";
    candidateId: string;
    targetInstanceId: string;
    afterAssignments: Record<string, string>;
    defaultPetUnchanged: boolean;
    unrelatedPetsUnchanged: boolean;
    rollbackAvailable: true;
  }
  | {
    status: "blocked";
    reasonCode: "apply_blocked_non_approved_candidate" | "previous_pack_preserved";
    candidateId: string;
    targetInstanceId: string;
    afterAssignments: Record<string, string>;
    previousPackPreserved: true;
  };

export function createV22CandidateAsset(input: {
  candidateId: string;
  sourceRoute: V22SourceRoute;
  safePackId: string;
  actions: V22CandidateActionMetrics[];
  retryCount?: number;
}): V22CandidateAsset {
  const rawInputHadForbiddenContent = assetQualityReviewHasForbiddenContent(input);
  const candidate: V22CandidateAsset = {
    candidateId: safeId(input.candidateId, "candidate"),
    sourceRoute: input.sourceRoute,
    safePackId: safeId(input.safePackId, "pack"),
    rendererKind: "sprite",
    status: "generated",
    actions: input.actions,
    retryCount: input.retryCount ?? 0,
    reasonCodes: [],
    guidance: []
  };

  if (rawInputHadForbiddenContent || assetQualityReviewHasForbiddenContent(candidate)) {
    return withGateResult(candidate, {
      status: "technical_failed",
      reasonCodes: ["unsafe_field_detected"],
      guidance: guidanceFor(["unsafe_field_detected"]),
      actionResults: []
    });
  }

  return candidate;
}

export function runV22TechnicalQAGate(candidate: V22CandidateAsset): V22CandidateAsset {
  const actionMap = new Map(candidate.actions.map((action) => [action.actionId, action]));
  const actionResults: V22GateResult["actionResults"] = [];
  const reasonCodes = new Set<V22ReasonCode>();

  for (const actionId of CORE_ACTION_IDS) {
    const action = actionMap.get(actionId);
    const actionReasons: V22ReasonCode[] = [];
    const minFrames = LOOP_ACTIONS.has(actionId) ? 6 : 3;

    if (!action || action.frameCount < minFrames) {
      actionReasons.push("missing_core_action");
    }
    if (action && action.visiblePixelRatio <= 0) {
      actionReasons.push("blank_frame_detected");
    }
    if (action && action.visiblePixelRatio < 0.01) {
      actionReasons.push("transparent_frame_detected");
    }
    if (action?.offCanvas) {
      actionReasons.push("off_canvas_frame_detected");
    }
    if (action?.hasBackground) {
      actionReasons.push("background_not_removed");
    }
    if (action?.hasWatermark) {
      actionReasons.push("watermark_detected");
    }
    if (action && LOOP_ACTIONS.has(actionId) && !action.loopClosed) {
      actionReasons.push("loop_closure_failed");
    }

    actionReasons.forEach((code) => reasonCodes.add(code));
    actionResults.push({
      actionId,
      status: actionReasons.length === 0 ? "passed" : "failed",
      reasonCodes: actionReasons
    });
  }

  if (assetQualityReviewHasForbiddenContent(candidate)) {
    reasonCodes.add("unsafe_field_detected");
  }

  const codes = Array.from(reasonCodes);
  return withGateResult(candidate, {
    status: codes.length > 0 ? "technical_failed" : "normalized",
    reasonCodes: codes,
    guidance: guidanceFor(codes),
    actionResults
  });
}

export function runV22MotionQAGate(candidate: V22CandidateAsset): V22CandidateAsset {
  if (candidate.status === "technical_failed") {
    return candidate;
  }

  const actionResults: V22GateResult["actionResults"] = [];
  const reasonCodes = new Set<V22ReasonCode>();
  let staticLikeCount = 0;

  for (const action of candidate.actions) {
    const actionReasons: V22ReasonCode[] = [];
    if (MOTION_REQUIRED_ACTIONS.has(action.actionId) && action.motionAmplitude < 0.18) {
      actionReasons.push("motion_amplitude_too_low");
    }
    if (action.staticLike || action.motionAmplitude < 0.06) {
      staticLikeCount += 1;
    }
    if (action.maxAdjacentDelta > 0.42 || action.anchorDrift > 0.18) {
      actionReasons.push("frame_delta_too_large");
    }
    if (!action.identityConsistent) {
      actionReasons.push("identity_drift_detected");
    }
    if (!action.humanReadable && MOTION_REQUIRED_ACTIONS.has(action.actionId)) {
      actionReasons.push("motion_amplitude_too_low");
    }
    if (LOOP_ACTIONS.has(action.actionId) && !action.loopClosed) {
      actionReasons.push("loop_closure_failed");
    }
    actionReasons.forEach((code) => reasonCodes.add(code));
    actionResults.push({
      actionId: action.actionId,
      status: actionReasons.length === 0 ? "passed" : "failed",
      reasonCodes: actionReasons
    });
  }

  if (staticLikeCount / CORE_ACTION_IDS.length > 0.25) {
    reasonCodes.add("motion_amplitude_too_low");
  }

  const codes = Array.from(reasonCodes);
  return withGateResult(candidate, {
    status: codes.length > 0 ? "motion_failed" : "visual_review_required",
    reasonCodes: codes,
    guidance: guidanceFor(codes),
    actionResults
  });
}

export function submitV22VisualReview(candidate: V22CandidateAsset, review: V22VisualReviewInput): V22CandidateAsset {
  if (candidate.status !== "visual_review_required" && candidate.status !== "visual_rejected" && candidate.status !== "approved") {
    return withStatus(candidate, candidate.status, ["candidate_not_reviewed"]);
  }
  if (assetQualityReviewHasForbiddenContent(review)) {
    return withStatus(candidate, "visual_rejected", ["unsafe_field_detected"]);
  }

  if (review.decision === "approve") {
    return {
      ...candidate,
      status: "approved",
      reasonCodes: ["quality_passed"],
      guidance: []
    };
  }

  const codes: V22ReasonCode[] = review.reasonCodes.length > 0 ? review.reasonCodes : ["candidate_rejected"];
  return {
    ...candidate,
    status: "visual_rejected",
    reasonCodes: Array.from(new Set(codes)),
    guidance: guidanceFor(codes)
  };
}

export function buildV22RetryGuidance(candidate: V22CandidateAsset): {
  status: "retry_allowed" | "repair_required" | "route_switch_recommended" | "budget_exhausted";
  reasonCodes: V22ReasonCode[];
  guidance: string[];
} {
  const reasonCodes = candidate.reasonCodes;
  if (candidate.retryCount >= 6) {
    return {
      status: "budget_exhausted",
      reasonCodes: ["retry_budget_exceeded", ...reasonCodes],
      guidance: guidanceFor(["retry_budget_exceeded", ...reasonCodes])
    };
  }
  if (reasonCodes.includes("provider_output_unusable") || reasonCodes.includes("cat_not_cute_enough")) {
    return {
      status: "route_switch_recommended",
      reasonCodes: ["alternate_route_recommended", ...reasonCodes],
      guidance: guidanceFor(["alternate_route_recommended", ...reasonCodes])
    };
  }
  if (candidate.retryCount >= 2 || reasonCodes.length > 0) {
    return {
      status: "repair_required",
      reasonCodes,
      guidance: guidanceFor(reasonCodes)
    };
  }
  return {
    status: "retry_allowed",
    reasonCodes,
    guidance: guidanceFor(reasonCodes)
  };
}

export function applyV22ApprovedCandidateToTarget(options: {
  candidate: V22CandidateAsset;
  targetInstanceId: string;
  instances: V22PetInstanceAssignment[];
}): V22ApplyResult {
  const beforeAssignments = assignmentMap(options.instances);
  if (options.candidate.status !== "approved") {
    return {
      status: "blocked",
      reasonCode: "apply_blocked_non_approved_candidate",
      candidateId: options.candidate.candidateId,
      targetInstanceId: safeId(options.targetInstanceId, "target"),
      afterAssignments: beforeAssignments,
      previousPackPreserved: true
    };
  }

  const targetExists = options.instances.some((item) => item.instanceId === options.targetInstanceId);
  if (!targetExists) {
    return {
      status: "blocked",
      reasonCode: "previous_pack_preserved",
      candidateId: options.candidate.candidateId,
      targetInstanceId: safeId(options.targetInstanceId, "target"),
      afterAssignments: beforeAssignments,
      previousPackPreserved: true
    };
  }

  const afterAssignments = { ...beforeAssignments, [options.targetInstanceId]: options.candidate.safePackId };
  return {
    status: "applied",
    reasonCode: "quality_passed",
    candidateId: options.candidate.candidateId,
    targetInstanceId: options.targetInstanceId,
    afterAssignments,
    defaultPetUnchanged: beforeAssignments.default === afterAssignments.default,
    unrelatedPetsUnchanged: unrelatedPetsUnchanged(beforeAssignments, afterAssignments, options.targetInstanceId),
    rollbackAvailable: true
  };
}

export function buildV22QualityEvidenceSnapshot(candidate: V22CandidateAsset, applyResult?: V22ApplyResult) {
  return {
    candidateId: candidate.candidateId,
    sourceRoute: candidate.sourceRoute,
    safePackId: candidate.safePackId,
    rendererKind: candidate.rendererKind,
    status: candidate.status,
    actionCoverage: CORE_ACTION_IDS.map((actionId) => ({
      actionId,
      present: candidate.actions.some((action) => action.actionId === actionId)
    })),
    reasonCodes: candidate.reasonCodes,
    guidance: candidate.guidance,
    retryCount: candidate.retryCount,
    safeRendererInputFields: [
      "safeActionId",
      "rendererKind",
      "safePackId",
      "playbackIntent",
      "scale",
      "visibility"
    ],
    applyStatus: applyResult?.status ?? "not-run",
    applyReasonCode: applyResult?.reasonCode ?? "not-run",
    defaultPetUnchanged: applyResult?.status === "applied" ? applyResult.defaultPetUnchanged : true,
    unrelatedPetsUnchanged: applyResult?.status === "applied" ? applyResult.unrelatedPetsUnchanged : true
  };
}

export function assetQualityReviewHasForbiddenContent(value: unknown): boolean {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function withGateResult(candidate: V22CandidateAsset, result: V22GateResult): V22CandidateAsset {
  return {
    ...candidate,
    status: result.status,
    reasonCodes: result.reasonCodes,
    guidance: result.guidance
  };
}

function withStatus(
  candidate: V22CandidateAsset,
  status: V22CandidateStatus,
  reasonCodes: V22ReasonCode[]
): V22CandidateAsset {
  return {
    ...candidate,
    status,
    reasonCodes: Array.from(new Set(reasonCodes)),
    guidance: guidanceFor(reasonCodes)
  };
}

function guidanceFor(reasonCodes: readonly V22ReasonCode[]) {
  const messages = new Set<string>();
  for (const code of reasonCodes) {
    if (code === "motion_amplitude_too_low") {
      messages.add("动作幅度太小：请尝试更强动作提示，或切换到 motion sheet / local rig 路线。");
    } else if (code === "identity_drift_detected") {
      messages.add("同猫一致性不足：请降低动作复杂度，或先生成统一角色母版。");
    } else if (code === "background_not_removed" || code === "watermark_detected") {
      messages.add("背景或水印不合格：请使用更干净的照片，或切换到背景清理路线。");
    } else if (code === "cat_not_cute_enough" || code === "style_inconsistent") {
      messages.add("视觉吸引力不足：请换风格模板、换路线，或重新选择更清晰的猫图。");
    } else if (code === "provider_output_unusable" || code === "alternate_route_recommended") {
      messages.add("当前 provider 输出不可用：建议切换 provider、local rig 或 motion sheet 路线。");
    } else if (code === "retry_budget_exceeded" || code === "better_photo_required") {
      messages.add("多次失败：请上传单猫、正脸、清晰、无遮挡、背景简单的照片。");
    } else if (code === "unsafe_field_detected") {
      messages.add("候选资产包含不安全字段，已拒绝。");
    } else if (code === "missing_core_action") {
      messages.add("动作覆盖不完整：必须补齐 8 个核心动作。");
    } else if (code === "blank_frame_detected" || code === "transparent_frame_detected" || code === "off_canvas_frame_detected") {
      messages.add("帧可见性失败：请修复空白、透明或出框帧。");
    } else if (code === "loop_closure_failed" || code === "frame_delta_too_large") {
      messages.add("动画连续性失败：请修复首尾闭合、跳帧或整体漂移。");
    } else if (code === "candidate_rejected" || code === "candidate_not_reviewed") {
      messages.add("候选资产尚未通过视觉审核，不能应用。");
    }
  }
  return Array.from(messages);
}

function assignmentMap(instances: V22PetInstanceAssignment[]) {
  return Object.fromEntries(instances.map((instance) => [instance.instanceId, instance.activePackId]));
}

function unrelatedPetsUnchanged(before: Record<string, string>, after: Record<string, string>, targetInstanceId: string) {
  return Object.entries(before)
    .filter(([instanceId]) => instanceId !== targetInstanceId)
    .every(([instanceId, packId]) => after[instanceId] === packId);
}

function safeId(value: string, fallback: string) {
  const normalized = value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 96);
  return SAFE_ID_PATTERN.test(normalized) ? normalized : fallback;
}
