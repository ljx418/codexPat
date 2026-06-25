import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V31RouteKind =
  | "professional_frame_pack"
  | "layered_2d_rig"
  | "photo_character_candidate"
  | "provider_key_pose_candidate"
  | "placeholder_reject_baseline";

export type V31QualityStatus = "passed" | "blocked" | "failed";

export type V31ArtQualityReasonCode =
  | "v31_art_quality_passed"
  | "source_asset_missing"
  | "license_boundary_missing"
  | "core_action_missing"
  | "placeholder_line_art_rejected"
  | "whole_image_transform_rejected"
  | "visual_polish_too_low"
  | "silhouette_clarity_too_low"
  | "expression_clarity_too_low"
  | "action_pose_too_weak"
  | "identity_consistency_too_low"
  | "background_not_clean"
  | "overlay_text_detected"
  | "watermark_detected"
  | "loop_or_timing_failed"
  | "small_scale_readability_failed"
  | "text_only_evidence_rejected"
  | "unsafe_field_detected";

export type V31ActionArtMetrics = {
  actionId: CoreActionId;
  frameCount: number;
  visualPolish: number;
  silhouetteClarity: number;
  expressionClarity: number;
  actionPoseStrength: number;
  identityConsistency: number;
  backgroundClean: boolean;
  overlayTextDetected: boolean;
  watermarkDetected: boolean;
  loopOrTimingOk: boolean;
  readableAt1x: boolean;
  readableAt075x: boolean;
  wholeImageTransformOnly: boolean;
};

export type V31ArtQualityCandidate = {
  candidateId: string;
  safePackId: string;
  routeKind: V31RouteKind;
  sourceAvailable: boolean;
  licenseBoundaryOk: boolean;
  placeholderLineArt: boolean;
  hasVisualEvidence: boolean;
  actions: V31ActionArtMetrics[];
};

export type V31ArtQualityResult = {
  status: V31QualityStatus;
  candidateId: string;
  safePackId: string;
  routeKind: V31RouteKind;
  reasonCodes: V31ArtQualityReasonCode[];
  actionCoverage: Record<CoreActionId, boolean>;
  scoreBuckets: {
    visualPolish: "low" | "medium" | "high";
    actionPose: "low" | "medium" | "high";
    identity: "low" | "medium" | "high";
  };
  evidenceMode: "visual" | "text-only";
};

const ACTIVE_ACTIONS = new Set<CoreActionId>(["running", "success", "warning", "error", "need_input"]);
const SUBTLE_ACTIONS = new Set<CoreActionId>(["idle", "sleeping"]);

export function runV31ArtQualityRubric(candidate: V31ArtQualityCandidate): V31ArtQualityResult {
  const reasonCodes = new Set<V31ArtQualityReasonCode>();
  const actionCoverage = Object.fromEntries(CORE_ACTION_IDS.map((actionId) => [
    actionId,
    candidate.actions.some((action) => action.actionId === actionId)
  ])) as Record<CoreActionId, boolean>;

  if (!candidate.sourceAvailable) reasonCodes.add("source_asset_missing");
  if (!candidate.licenseBoundaryOk) reasonCodes.add("license_boundary_missing");
  if (candidate.placeholderLineArt) reasonCodes.add("placeholder_line_art_rejected");
  if (!candidate.hasVisualEvidence) reasonCodes.add("text_only_evidence_rejected");
  for (const actionId of CORE_ACTION_IDS) {
    if (!actionCoverage[actionId]) reasonCodes.add("core_action_missing");
  }

  for (const action of candidate.actions) {
    const active = ACTIVE_ACTIONS.has(action.actionId);
    const subtle = SUBTLE_ACTIONS.has(action.actionId);
    const minFrames = subtle ? 4 : 4;
    const minPose = active ? 0.68 : subtle ? 0.24 : 0.48;
    const minPolish = 0.72;
    const minSilhouette = 0.68;
    const minExpression = subtle ? 0.4 : 0.62;

    if (action.frameCount < minFrames) reasonCodes.add("core_action_missing");
    if (action.wholeImageTransformOnly) reasonCodes.add("whole_image_transform_rejected");
    if (action.visualPolish < minPolish) reasonCodes.add("visual_polish_too_low");
    if (action.silhouetteClarity < minSilhouette) reasonCodes.add("silhouette_clarity_too_low");
    if (action.expressionClarity < minExpression) reasonCodes.add("expression_clarity_too_low");
    if (action.actionPoseStrength < minPose) reasonCodes.add("action_pose_too_weak");
    if (action.identityConsistency < 0.78) reasonCodes.add("identity_consistency_too_low");
    if (!action.backgroundClean) reasonCodes.add("background_not_clean");
    if (action.overlayTextDetected) reasonCodes.add("overlay_text_detected");
    if (action.watermarkDetected) reasonCodes.add("watermark_detected");
    if (!action.loopOrTimingOk) reasonCodes.add("loop_or_timing_failed");
    if (!action.readableAt1x || !action.readableAt075x) reasonCodes.add("small_scale_readability_failed");
  }

  if (v31ArtQualityHasForbiddenContent(candidate)) reasonCodes.add("unsafe_field_detected");
  if (reasonCodes.size === 0) reasonCodes.add("v31_art_quality_passed");

  const blocked = reasonCodes.has("source_asset_missing") || reasonCodes.has("license_boundary_missing");
  const failed = Array.from(reasonCodes).some((code) => code !== "v31_art_quality_passed");
  const aggregate = aggregateScores(candidate.actions);
  return {
    status: blocked ? "blocked" : failed ? "failed" : "passed",
    candidateId: safeId(candidate.candidateId, "v31_candidate"),
    safePackId: safeId(candidate.safePackId, "v31_pack"),
    routeKind: candidate.routeKind,
    reasonCodes: Array.from(reasonCodes).sort(),
    actionCoverage,
    scoreBuckets: {
      visualPolish: bucket(aggregate.visualPolish),
      actionPose: bucket(aggregate.actionPose),
      identity: bucket(aggregate.identity)
    },
    evidenceMode: candidate.hasVisualEvidence ? "visual" : "text-only"
  };
}

export function buildV31ArtQualityEvidenceSnapshot(result: V31ArtQualityResult) {
  return {
    status: result.status,
    candidateId: result.candidateId,
    safePackId: result.safePackId,
    routeKind: result.routeKind,
    reasonCodes: result.reasonCodes,
    actionCoverage: result.actionCoverage,
    scoreBuckets: result.scoreBuckets,
    evidenceMode: result.evidenceMode
  };
}

export function createV31PlaceholderLineArtCandidate(): V31ArtQualityCandidate {
  return {
    candidateId: "v31_placeholder_line_art",
    safePackId: "flagship-work-cat-v2",
    routeKind: "placeholder_reject_baseline",
    sourceAvailable: true,
    licenseBoundaryOk: true,
    placeholderLineArt: true,
    hasVisualEvidence: true,
    actions: CORE_ACTION_IDS.map((actionId) => ({
      actionId,
      frameCount: 4,
      visualPolish: 0.32,
      silhouetteClarity: 0.42,
      expressionClarity: 0.35,
      actionPoseStrength: ACTIVE_ACTIONS.has(actionId) ? 0.38 : 0.2,
      identityConsistency: 0.92,
      backgroundClean: true,
      overlayTextDetected: false,
      watermarkDetected: false,
      loopOrTimingOk: true,
      readableAt1x: true,
      readableAt075x: false,
      wholeImageTransformOnly: false
    }))
  };
}

export function createV31PolishedCandidate(overrides: Partial<V31ActionArtMetrics> = {}): V31ArtQualityCandidate {
  return {
    candidateId: "v31_polished_candidate",
    safePackId: "v31-polished-local-pack",
    routeKind: "professional_frame_pack",
    sourceAvailable: true,
    licenseBoundaryOk: true,
    placeholderLineArt: false,
    hasVisualEvidence: true,
    actions: CORE_ACTION_IDS.map((actionId) => ({
      actionId,
      frameCount: 4,
      visualPolish: 0.84,
      silhouetteClarity: 0.82,
      expressionClarity: SUBTLE_ACTIONS.has(actionId) ? 0.62 : 0.8,
      actionPoseStrength: ACTIVE_ACTIONS.has(actionId) ? 0.76 : SUBTLE_ACTIONS.has(actionId) ? 0.32 : 0.58,
      identityConsistency: 0.88,
      backgroundClean: true,
      overlayTextDetected: false,
      watermarkDetected: false,
      loopOrTimingOk: true,
      readableAt1x: true,
      readableAt075x: true,
      wholeImageTransformOnly: false,
      ...overrides
    }))
  };
}

export function v31ArtQualityHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function aggregateScores(actions: V31ActionArtMetrics[]) {
  const actionCount = Math.max(1, actions.length);
  return {
    visualPolish: actions.reduce((sum, action) => sum + clampScore(action.visualPolish), 0) / actionCount,
    actionPose: actions.reduce((sum, action) => sum + clampScore(action.actionPoseStrength), 0) / actionCount,
    identity: actions.reduce((sum, action) => sum + clampScore(action.identityConsistency), 0) / actionCount
  };
}

function bucket(value: number): "low" | "medium" | "high" {
  if (value >= 0.76) return "high";
  if (value >= 0.58) return "medium";
  return "low";
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function safeId(value: string, fallback: string) {
  const normalized = value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 96);
  return /^[A-Za-z0-9._-]{1,96}$/.test(normalized) ? normalized : fallback;
}
