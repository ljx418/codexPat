import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

const LOOP_ACTIONS = new Set<CoreActionId>(["idle", "thinking", "running", "sleeping"]);
const ACTIVE_ACTIONS = new Set<CoreActionId>(["running", "success", "warning", "error", "need_input"]);

export type V32QualityStatus = "passed" | "blocked" | "failed";

export type V32QualityReasonCode =
  | "v32_quality_rescue_passed"
  | "source_asset_missing"
  | "license_boundary_missing"
  | "visual_evidence_missing"
  | "core_action_missing"
  | "frame_count_too_low"
  | "visible_pixels_too_low"
  | "duplicate_frames_too_high"
  | "motion_delta_too_low"
  | "motion_delta_too_high"
  | "loop_closure_failed"
  | "background_not_transparent"
  | "off_canvas_frame"
  | "whole_image_transform_rejected"
  | "local_part_motion_too_low"
  | "visual_detail_too_low"
  | "small_scale_readability_failed"
  | "unsafe_field_detected";

export type V32MeasuredActionMetrics = {
  actionId: CoreActionId;
  frameCount: number;
  visiblePixelRatio: number;
  duplicateFrameRatio: number;
  meanAdjacentDelta: number;
  maxAdjacentDelta: number;
  loopClosureDelta: number;
  transparentBackground: boolean;
  offCanvas: boolean;
  wholeImageTransformOnly: boolean;
  localPartMotionScore: number;
  visualDetailScore: number;
  readableAt1x: boolean;
  readableAt075x: boolean;
};

export type V32QualityRescueCandidate = {
  candidateId: string;
  safePackId: string;
  routeKind: "local_layered_rig" | "local_frame_sequence" | "photo_trait_local_rig" | "negative_baseline";
  sourceAvailable: boolean;
  licenseBoundaryOk: boolean;
  hasVisualEvidence: boolean;
  actions: V32MeasuredActionMetrics[];
};

export type V32QualityRescueResult = {
  status: V32QualityStatus;
  candidateId: string;
  safePackId: string;
  routeKind: V32QualityRescueCandidate["routeKind"];
  reasonCodes: V32QualityReasonCode[];
  actionCoverage: Record<CoreActionId, boolean>;
  actionSummaries: Record<CoreActionId, {
    frameCount: number;
    motionBucket: "low" | "medium" | "high";
    localMotionBucket: "low" | "medium" | "high";
    visualDetailBucket: "low" | "medium" | "high";
    duplicateFrameRatio: number;
  }>;
  scoreBuckets: {
    motion: "low" | "medium" | "high";
    localMotion: "low" | "medium" | "high";
    visualDetail: "low" | "medium" | "high";
  };
};

export function runV32QualityRescueGate(candidate: V32QualityRescueCandidate): V32QualityRescueResult {
  const reasonCodes = new Set<V32QualityReasonCode>();
  if (!candidate.sourceAvailable) reasonCodes.add("source_asset_missing");
  if (!candidate.licenseBoundaryOk) reasonCodes.add("license_boundary_missing");
  if (!candidate.hasVisualEvidence) reasonCodes.add("visual_evidence_missing");

  const actionCoverage = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    candidate.actions.some((action) => action.actionId === actionId)
  ])) as Record<CoreActionId, boolean>;
  for (const actionId of CORE_ACTION_IDS) {
    if (!actionCoverage[actionId]) reasonCodes.add("core_action_missing");
  }

  const actionSummaries = {} as V32QualityRescueResult["actionSummaries"];
  for (const action of candidate.actions) {
    const isLoop = LOOP_ACTIONS.has(action.actionId);
    const isActive = ACTIVE_ACTIONS.has(action.actionId);
    const minFrames = isLoop ? 12 : 8;
    const minMotion = minMeanMotionFor(action.actionId);
    const minLocalMotion = isActive ? 0.32 : action.actionId === "idle" || action.actionId === "sleeping" ? 0.08 : 0.18;

    if (action.frameCount < minFrames) reasonCodes.add("frame_count_too_low");
    if (action.visiblePixelRatio < 0.035) reasonCodes.add("visible_pixels_too_low");
    if (action.duplicateFrameRatio > 0.18) reasonCodes.add("duplicate_frames_too_high");
    if (action.meanAdjacentDelta < minMotion) reasonCodes.add("motion_delta_too_low");
    if (action.maxAdjacentDelta > 0.62) reasonCodes.add("motion_delta_too_high");
    if (isLoop && action.loopClosureDelta > 0.2) reasonCodes.add("loop_closure_failed");
    if (!action.transparentBackground) reasonCodes.add("background_not_transparent");
    if (action.offCanvas) reasonCodes.add("off_canvas_frame");
    if (action.wholeImageTransformOnly) reasonCodes.add("whole_image_transform_rejected");
    if (action.localPartMotionScore < minLocalMotion) reasonCodes.add("local_part_motion_too_low");
    if (action.visualDetailScore < 0.58) reasonCodes.add("visual_detail_too_low");
    if (!action.readableAt1x || !action.readableAt075x) reasonCodes.add("small_scale_readability_failed");

    actionSummaries[action.actionId] = {
      frameCount: action.frameCount,
      motionBucket: bucket(action.meanAdjacentDelta / Math.max(minMotion, 0.001)),
      localMotionBucket: bucket(action.localPartMotionScore),
      visualDetailBucket: bucket(action.visualDetailScore),
      duplicateFrameRatio: round(action.duplicateFrameRatio)
    };
  }

  if (v32QualityRescueHasForbiddenContent(candidate)) reasonCodes.add("unsafe_field_detected");
  if (reasonCodes.size === 0) reasonCodes.add("v32_quality_rescue_passed");

  const blocked = reasonCodes.has("source_asset_missing") || reasonCodes.has("license_boundary_missing") || reasonCodes.has("visual_evidence_missing");
  const failed = Array.from(reasonCodes).some((code) => code !== "v32_quality_rescue_passed");
  const aggregate = aggregateScores(candidate.actions);

  return {
    status: blocked ? "blocked" : failed ? "failed" : "passed",
    candidateId: safeId(candidate.candidateId, "v32_candidate"),
    safePackId: safeId(candidate.safePackId, "v32_pack"),
    routeKind: candidate.routeKind,
    reasonCodes: Array.from(reasonCodes).sort(),
    actionCoverage,
    actionSummaries,
    scoreBuckets: {
      motion: bucket(aggregate.motion),
      localMotion: bucket(aggregate.localMotion),
      visualDetail: bucket(aggregate.visualDetail)
    }
  };
}

export function buildV32QualityRescueEvidenceSnapshot(result: V32QualityRescueResult) {
  return {
    status: result.status,
    candidateId: result.candidateId,
    safePackId: result.safePackId,
    routeKind: result.routeKind,
    reasonCodes: result.reasonCodes,
    actionCoverage: result.actionCoverage,
    actionSummaries: result.actionSummaries,
    scoreBuckets: result.scoreBuckets
  };
}

export function v32QualityRescueHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function aggregateScores(actions: V32MeasuredActionMetrics[]) {
  const actionCount = Math.max(1, actions.length);
  return {
    motion: actions.reduce((sum, action) => sum + clampScore(action.meanAdjacentDelta / minMeanMotionFor(action.actionId)), 0) / actionCount,
    localMotion: actions.reduce((sum, action) => sum + clampScore(action.localPartMotionScore), 0) / actionCount,
    visualDetail: actions.reduce((sum, action) => sum + clampScore(action.visualDetailScore), 0) / actionCount
  };
}

function minMeanMotionFor(actionId: CoreActionId) {
  switch (actionId) {
    case "idle":
    case "sleeping":
      return 0.009;
    case "thinking":
      return 0.014;
    case "running":
      return 0.035;
    case "success":
      return 0.045;
    case "warning":
      return 0.03;
    case "error":
      return 0.02;
    case "need_input":
      return 0.025;
  }
}

function bucket(value: number): "low" | "medium" | "high" {
  if (value >= 0.76) return "high";
  if (value >= 0.48) return "medium";
  return "low";
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function round(value: number) {
  return Math.round(clampScore(value) * 1000) / 1000;
}

function safeId(value: string, fallback: string) {
  const normalized = value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 96);
  return /^[A-Za-z0-9._-]{1,96}$/.test(normalized) ? normalized : fallback;
}
