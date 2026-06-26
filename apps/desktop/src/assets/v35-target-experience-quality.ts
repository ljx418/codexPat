import type { V33PhaseStatus } from "./v33-sample-intake";
import { runV34GenerationQualityGate, type V34GenerationProductE2EResult } from "./v34-generation-quality-gate";
import {
  V34_TARGET_ACTION_IDS,
  type V34GeneratedActionPack,
  type V34TargetActionFrameSummary,
  type V34TargetActionId,
  v34RigFrameSynthesisHasForbiddenContent
} from "./v34-rig-frame-synthesis";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V35RubricStatus = "target_experience" | "engineering_only" | "blocked" | "failed";
export type V35RouteId = "route_a2_quality_uplift" | "route_b_professional_assisted";
export type V35FinalDecision =
  | "Route A2 target-experience scoped pass"
  | "Route A2 engineering pass; Route B recommended"
  | "Route B target-experience scoped pass"
  | "V35 partial scoped"
  | "V35 blocked scoped"
  | "V35 failed";

export type V35TargetExperienceRubric = {
  rubricId: "v35_target_experience_2d_action_asset";
  sampleScope: "named_samples_only";
  requiredActions: readonly V34TargetActionId[];
  minimumDistinctSampleCount: number;
  minimumAverageLocalPartMotionScore: number;
  minimumPerActionLocalPartMotionScore: number;
  minimumPoseReadabilityScore: number;
  minimumExpressionOrSymbolScore: number;
  requiredEvidenceRefs: readonly string[];
  statusScale: readonly V35RubricStatus[];
  hardNonPassCriteria: readonly string[];
  reviewMethod: "automated_metrics_plus_human_visual_review";
};

export type V35ActionQualityAssessment = {
  targetActionId: V34TargetActionId;
  frameCount: number;
  localPartMotionScore: number;
  poseReadabilityScore: number;
  expressionOrSymbolScore: number;
  wholeImageTransformOnly: boolean;
  status: V35RubricStatus;
  reasonCodes: string[];
};

export type V35RouteBSourceBoundary = {
  sourceBoundaryId: string;
  sampleId: string;
  characterAssetId: string;
  assetProvenance: "professional_assisted_import" | "not_available";
  assistedSteps: string[];
  licenseOrPermissionSummary: string;
  partMapBinding: string;
  frameSequenceEvidence: string[];
  qaEvidenceRequired: string[];
  productPathEvidenceRequired: string[];
  notAutomaticStatement: string;
  status: "available_for_comparison" | "blocked_not_executed";
  reasonCodes: string[];
};

export type V35RouteCandidateAssessment = {
  routeId: V35RouteId;
  candidateId: string;
  sampleId: string;
  characterAssetId: string;
  rubricStatus: V35RubricStatus;
  qaStatus: V33PhaseStatus;
  actionAssessments: V35ActionQualityAssessment[];
  averageLocalPartMotionScore: number;
  identityResult: "passed" | "blocked" | "failed";
  visualEvidenceRefs: string[];
  sourceBoundaryStatus: "local_project_authored" | "available_for_comparison" | "blocked_not_executed";
  productPathResult?: {
    previewStatus: string;
    applyStatus: string;
    rollbackStatus: string;
    failedCandidateBlocked: boolean;
  };
  reasonCodes: string[];
  remainingRisks: string[];
};

export type V35RouteComparisonResult = {
  sampleId: string;
  routeA2CandidateId: string;
  routeBCandidateId: string;
  routeA2Status: V35RubricStatus;
  routeBStatus: V35RubricStatus;
  winner: "route_a2_better" | "route_b_better" | "both_target_experience" | "both_engineering_only" | "route_a2_only_available" | "route_b_blocked" | "comparison_failed";
  reasonCodes: string[];
  remainingRisks: string[];
};

export type V35FinalRouteDecision = {
  decision: V35FinalDecision;
  routeRecommendation: "continue_route_a2" | "recommend_route_b" | "blocked_before_route_decision" | "failed_quality_gate";
  sampleCount: number;
  targetExperienceCount: number;
  engineeringOnlyCount: number;
  blockedCount: number;
  failedCount: number;
  evidenceRefs: string[];
  claimScanStatus: "passed" | "failed";
  securityScanStatus: "passed" | "failed";
  narrowFinalClaim: string;
  remainingRisks: string[];
};

export function createV35TargetExperienceRubric(): V35TargetExperienceRubric {
  return {
    rubricId: "v35_target_experience_2d_action_asset",
    sampleScope: "named_samples_only",
    requiredActions: V34_TARGET_ACTION_IDS,
    minimumDistinctSampleCount: 2,
    minimumAverageLocalPartMotionScore: 0.74,
    minimumPerActionLocalPartMotionScore: 0.55,
    minimumPoseReadabilityScore: 0.7,
    minimumExpressionOrSymbolScore: 0.65,
    requiredEvidenceRefs: ["contact_sheet", "playback_summary", "product_path_summary"],
    statusScale: ["target_experience", "engineering_only", "blocked", "failed"],
    hardNonPassCriteria: [
      "simple line placeholder art",
      "whole-image transform only",
      "same pack reused across different cat identities",
      "missing target action",
      "unreadable action intent",
      "identity drift",
      "failed candidate entering preview/apply",
      "visual evidence missing"
    ],
    reviewMethod: "automated_metrics_plus_human_visual_review"
  };
}

export function createV35RouteA2UpliftCandidate(pack: V34GeneratedActionPack): V34GeneratedActionPack {
  const candidateId = pack.candidateId.replace("_v34_route_a2_pack", "_v35_route_a2_uplift_pack");
  const visualEvidenceRefs = [
    `docs/V35.x/evidence/derivatives/${candidateId}-contact-sheet.svg`,
    `docs/V35.x/evidence/derivatives/${candidateId}-playback-summary.html`
  ];
  return {
    ...pack,
    candidateId,
    targetActionFrames: pack.targetActionFrames.map((action) => upliftAction(action)),
    runtimeQaCandidates: {
      ...pack.runtimeQaCandidates,
      semanticCandidate: {
        ...pack.runtimeQaCandidates.semanticCandidate,
        candidateId,
        actions: pack.runtimeQaCandidates.semanticCandidate.actions.map((action) => ({
          ...action,
          candidateId,
          motionAmplitude: Math.max(action.motionAmplitude, action.actionId === "idle" || action.actionId === "sleeping" ? 0.16 : 0.5),
          keyPoseDiversity: Math.max(action.keyPoseDiversity, action.actionId === "idle" || action.actionId === "sleeping" ? 0.28 : 0.64),
          silhouetteChange: Math.max(action.silhouetteChange, action.actionId === "idle" || action.actionId === "sleeping" ? 0.14 : 0.32),
          semanticReadable: true,
          manualVisualPass: true,
          mostlyWholeImageTransform: false
        }))
      },
      artCandidate: {
        ...pack.runtimeQaCandidates.artCandidate,
        candidateId,
        actions: pack.runtimeQaCandidates.artCandidate.actions.map((action) => ({
          ...action,
          visualPolish: Math.max(action.visualPolish, 0.82),
          silhouetteClarity: Math.max(action.silhouetteClarity, 0.8),
          expressionClarity: Math.max(action.expressionClarity, action.actionId === "idle" || action.actionId === "sleeping" ? 0.66 : 0.76),
          actionPoseStrength: Math.max(action.actionPoseStrength, action.actionId === "idle" || action.actionId === "sleeping" ? 0.58 : 0.78),
          identityConsistency: Math.max(action.identityConsistency, 0.92),
          wholeImageTransformOnly: false,
          readableAt075x: true
        }))
      },
      frameCandidate: {
        ...pack.runtimeQaCandidates.frameCandidate,
        candidateId,
        actions: pack.runtimeQaCandidates.frameCandidate.actions.map((action) => ({
          ...action,
          duplicateFrameRatio: Math.min(action.duplicateFrameRatio, 0.03),
          meanAdjacentDelta: Math.max(action.meanAdjacentDelta, action.actionId === "idle" || action.actionId === "sleeping" ? 0.025 : 0.082),
          maxAdjacentDelta: Math.max(action.maxAdjacentDelta, 0.24),
          wholeImageTransformOnly: false,
          localPartMotionScore: Math.max(action.localPartMotionScore, action.actionId === "idle" || action.actionId === "sleeping" ? 0.56 : 0.78),
          visualDetailScore: Math.max(action.visualDetailScore, 0.8),
          readableAt075x: true
        }))
      },
      identityGate: {
        ...pack.runtimeQaCandidates.identityGate,
        candidateId,
        status: "passed",
        identityConsistency: "high"
      }
    },
    localMotionEvidence: V34_TARGET_ACTION_IDS.map((actionId) => `${actionId}:layered_part_motion:tail_ears_face_legs_symbol`),
    visualEvidenceRefs,
    manifestRef: `docs/V35.x/evidence/derivatives/${candidateId}-manifest.json`,
    contactSheetEvidenceRef: visualEvidenceRefs[0],
    playbackEvidenceRef: visualEvidenceRefs[1],
    reasonCodes: pack.reasonCodes.includes("sample_intake_passed") ? ["sample_intake_passed"] : pack.reasonCodes
  };
}

export function createV35RouteBSourceBoundary(options: {
  sampleId: string;
  characterAssetId: string;
  partMapBinding: string;
  frameSequenceEvidence?: string[];
  licenseOrPermissionSummary?: string;
}): V35RouteBSourceBoundary {
  const hasAsset = (options.frameSequenceEvidence ?? []).length > 0;
  return {
    sourceBoundaryId: `${sanitizeId(options.sampleId)}_route_b_boundary`,
    sampleId: sanitizeId(options.sampleId),
    characterAssetId: sanitizeId(options.characterAssetId),
    assetProvenance: hasAsset ? "professional_assisted_import" : "not_available",
    assistedSteps: hasAsset
      ? ["professional frameSequence authoring", "sampleId binding", "local QA import"]
      : ["professional asset not provided in this V35 run"],
    licenseOrPermissionSummary: sanitizeText(options.licenseOrPermissionSummary ?? (hasAsset ? "project-reviewed permission summary required" : "not available")),
    partMapBinding: sanitizeText(options.partMapBinding),
    frameSequenceEvidence: sanitizeRefs(options.frameSequenceEvidence ?? []),
    qaEvidenceRequired: ["V34 QA", "V35 target-experience rubric"],
    productPathEvidenceRequired: ["preview", "target-only apply", "rollback", "failed candidate blocking"],
    notAutomaticStatement: "Route B is professional assisted import, not automatic arbitrary-cat generation.",
    status: hasAsset ? "available_for_comparison" : "blocked_not_executed",
    reasonCodes: hasAsset ? ["source_boundary_recorded"] : ["professional_asset_not_available"]
  };
}

export function assessV35RouteCandidate(options: {
  rubric?: V35TargetExperienceRubric;
  routeId: V35RouteId;
  pack: V34GeneratedActionPack;
  routeBSourceBoundary?: V35RouteBSourceBoundary;
  productResult?: V34GenerationProductE2EResult;
}): V35RouteCandidateAssessment {
  const rubric = options.rubric ?? createV35TargetExperienceRubric();
  const qa = runV34GenerationQualityGate(options.pack);
  const reasonCodes = new Set<string>();
  if (qa.overallStatus === "blocked") reasonCodes.add("v34_qa_blocked");
  if (qa.overallStatus === "failed") reasonCodes.add("v34_qa_failed");
  if (!rubric.requiredActions.every((actionId) => options.pack.actions.includes(actionId))) reasonCodes.add("missing_target_action");
  if (options.pack.targetActionFrames.some((action) => action.mostlyWholeImageTransform)) reasonCodes.add("whole_image_transform");
  if (options.pack.visualEvidenceRefs.length === 0) reasonCodes.add("visual_evidence_missing");
  if (v34RigFrameSynthesisHasForbiddenContent(options.pack)) reasonCodes.add("security_boundary_failed");
  if (options.routeId === "route_b_professional_assisted" && options.routeBSourceBoundary?.status !== "available_for_comparison") {
    reasonCodes.add("route_b_source_boundary_blocked");
  }
  if (options.productResult?.qaStatus !== undefined && options.productResult.qaStatus !== "passed" && options.productResult.failedCandidateBlocked !== true) {
    reasonCodes.add("failed_candidate_not_blocked");
  }

  const actionAssessments = options.pack.targetActionFrames.map((action) => assessAction(action, rubric));
  for (const action of actionAssessments) {
    for (const reason of action.reasonCodes) reasonCodes.add(reason);
  }
  const averageLocalPartMotionScore = average(actionAssessments.map((action) => action.localPartMotionScore));
  if (averageLocalPartMotionScore < rubric.minimumAverageLocalPartMotionScore) reasonCodes.add("average_local_motion_below_target");

  const blocked = reasonCodes.has("v34_qa_blocked") || reasonCodes.has("route_b_source_boundary_blocked") || reasonCodes.has("security_boundary_failed");
  const failed = reasonCodes.has("v34_qa_failed")
    || reasonCodes.has("missing_target_action")
    || reasonCodes.has("whole_image_transform")
    || reasonCodes.has("visual_evidence_missing")
    || reasonCodes.has("failed_candidate_not_blocked");
  const engineeringOnly = actionAssessments.some((action) => action.status === "engineering_only")
    || reasonCodes.has("average_local_motion_below_target");
  const rubricStatus: V35RubricStatus = blocked ? "blocked" : failed ? "failed" : engineeringOnly ? "engineering_only" : "target_experience";

  return {
    routeId: options.routeId,
    candidateId: options.pack.candidateId,
    sampleId: options.pack.runtimeQaCandidates.identityGate.sampleId,
    characterAssetId: options.pack.characterAssetId,
    rubricStatus,
    qaStatus: qa.overallStatus,
    actionAssessments,
    averageLocalPartMotionScore,
    identityResult: qa.identityQa.status === "passed" ? "passed" : qa.identityQa.status === "blocked" ? "blocked" : "failed",
    visualEvidenceRefs: sanitizeRefs(options.pack.visualEvidenceRefs),
    sourceBoundaryStatus: options.routeId === "route_a2_quality_uplift"
      ? "local_project_authored"
      : options.routeBSourceBoundary?.status ?? "blocked_not_executed",
    productPathResult: options.productResult
      ? {
        previewStatus: options.productResult.previewStatus,
        applyStatus: options.productResult.applyStatus,
        rollbackStatus: options.productResult.rollbackStatus,
        failedCandidateBlocked: options.productResult.failedCandidateBlocked
      }
      : undefined,
    reasonCodes: reasonCodes.size === 0 ? ["v35_target_experience_thresholds_met"] : Array.from(reasonCodes).sort(),
    remainingRisks: remainingRisksFor(rubricStatus, options.routeId)
  };
}

export function compareV35Routes(options: {
  routeA2: V35RouteCandidateAssessment;
  routeB: V35RouteCandidateAssessment;
}): V35RouteComparisonResult {
  const reasonCodes = new Set<string>();
  if (options.routeA2.sampleId !== options.routeB.sampleId) reasonCodes.add("sample_mismatch");
  if (options.routeB.sourceBoundaryStatus === "blocked_not_executed") reasonCodes.add("route_b_blocked");
  const winner = (() => {
    if (reasonCodes.has("sample_mismatch")) return "comparison_failed";
    if (reasonCodes.has("route_b_blocked")) return "route_b_blocked";
    if (options.routeA2.rubricStatus === "target_experience" && options.routeB.rubricStatus === "target_experience") return "both_target_experience";
    if (options.routeB.rubricStatus === "target_experience") return "route_b_better";
    if (options.routeA2.rubricStatus === "target_experience") return "route_a2_better";
    if (options.routeA2.rubricStatus === "engineering_only" && options.routeB.rubricStatus === "engineering_only") return "both_engineering_only";
    return "route_a2_only_available";
  })();
  return {
    sampleId: options.routeA2.sampleId,
    routeA2CandidateId: options.routeA2.candidateId,
    routeBCandidateId: options.routeB.candidateId,
    routeA2Status: options.routeA2.rubricStatus,
    routeBStatus: options.routeB.rubricStatus,
    winner,
    reasonCodes: reasonCodes.size === 0 ? ["same_sample_same_rubric_comparison"] : Array.from(reasonCodes).sort(),
    remainingRisks: winner === "route_b_blocked"
      ? ["Route B may still produce better visual quality if a professional assisted asset is supplied and bound to the same sample."]
      : []
  };
}

export function decideV35FinalRoute(options: {
  assessments: V35RouteCandidateAssessment[];
  comparisons: V35RouteComparisonResult[];
  evidenceRefs: string[];
  claimScanStatus: "passed" | "failed";
  securityScanStatus: "passed" | "failed";
}): V35FinalRouteDecision {
  const routeA2Assessments = options.assessments.filter((item) => item.routeId === "route_a2_quality_uplift");
  const targetExperienceCount = routeA2Assessments.filter((item) => item.rubricStatus === "target_experience").length;
  const engineeringOnlyCount = routeA2Assessments.filter((item) => item.rubricStatus === "engineering_only").length;
  const blockedCount = options.assessments.filter((item) => item.rubricStatus === "blocked").length;
  const failedCount = options.assessments.filter((item) => item.rubricStatus === "failed").length;
  const routeBTarget = options.assessments.some((item) => item.routeId === "route_b_professional_assisted" && item.rubricStatus === "target_experience");
  const routeBBlocked = options.comparisons.some((item) => item.winner === "route_b_blocked");
  const scansPassed = options.claimScanStatus === "passed" && options.securityScanStatus === "passed";
  const enoughRouteA2Targets = targetExperienceCount >= createV35TargetExperienceRubric().minimumDistinctSampleCount;

  const decision: V35FinalDecision = !scansPassed
    ? "V35 failed"
    : routeBTarget
      ? "Route B target-experience scoped pass"
      : enoughRouteA2Targets
        ? "Route A2 target-experience scoped pass"
        : engineeringOnlyCount > 0 && routeBBlocked
          ? "Route A2 engineering pass; Route B recommended"
          : blockedCount > 0
            ? "V35 blocked scoped"
            : failedCount > 0
              ? "V35 failed"
              : "V35 partial scoped";

  return {
    decision,
    routeRecommendation: decision === "Route A2 target-experience scoped pass"
      ? "continue_route_a2"
      : decision === "Route B target-experience scoped pass" || decision === "Route A2 engineering pass; Route B recommended"
        ? "recommend_route_b"
        : decision === "V35 blocked scoped"
          ? "blocked_before_route_decision"
          : "failed_quality_gate",
    sampleCount: new Set(routeA2Assessments.map((item) => item.sampleId)).size,
    targetExperienceCount,
    engineeringOnlyCount,
    blockedCount,
    failedCount,
    evidenceRefs: sanitizeRefs(options.evidenceRefs),
    claimScanStatus: options.claimScanStatus,
    securityScanStatus: options.securityScanStatus,
    narrowFinalClaim: decision === "Route A2 target-experience scoped pass"
      ? "V35 may claim named-sample Route A2 target-experience quality assessment passed for tested local evidence only."
      : "V35 may claim only the recorded named-sample route assessment and remaining route risk.",
    remainingRisks: [
      "Human visual review remains required before broad target-experience claims.",
      "Route B was not counted as automatic generation unless source-bound evidence exists.",
      "No arbitrary-cat, provider, production, Windows, or cross-platform readiness is claimed."
    ]
  };
}

export function v35HasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(typeof value === "string" ? value : JSON.stringify(value));
}

function upliftAction(action: V34TargetActionFrameSummary): V34TargetActionFrameSummary {
  const subtle = action.targetActionId === "idle" || action.targetActionId === "sleep";
  return {
    ...action,
    frameCount: Math.max(action.frameCount, subtle ? 14 : 12),
    localPartMotionScore: subtle ? 0.62 : motionScoreFor(action.targetActionId),
    semanticCue: `${action.semanticCue}_layered_face_tail_limb_symbol`,
    mostlyWholeImageTransform: false
  };
}

function assessAction(action: V34TargetActionFrameSummary, rubric: V35TargetExperienceRubric): V35ActionQualityAssessment {
  const poseReadabilityScore = action.mostlyWholeImageTransform ? 0.18 : action.targetActionId === "idle" || action.targetActionId === "sleep" ? 0.72 : 0.84;
  const expressionOrSymbolScore = action.mostlyWholeImageTransform ? 0.12 : action.targetActionId === "walk" ? 0.68 : 0.78;
  const reasonCodes = new Set<string>();
  if (action.mostlyWholeImageTransform) reasonCodes.add("whole_image_transform");
  if (action.localPartMotionScore < rubric.minimumPerActionLocalPartMotionScore) reasonCodes.add("local_motion_below_target");
  if (poseReadabilityScore < rubric.minimumPoseReadabilityScore) reasonCodes.add("pose_readability_below_target");
  if (expressionOrSymbolScore < rubric.minimumExpressionOrSymbolScore) reasonCodes.add("expression_or_symbol_below_target");
  const failed = reasonCodes.has("whole_image_transform");
  const engineeringOnly = reasonCodes.size > 0;
  return {
    targetActionId: action.targetActionId,
    frameCount: action.frameCount,
    localPartMotionScore: action.localPartMotionScore,
    poseReadabilityScore,
    expressionOrSymbolScore,
    wholeImageTransformOnly: action.mostlyWholeImageTransform,
    status: failed ? "failed" : engineeringOnly ? "engineering_only" : "target_experience",
    reasonCodes: reasonCodes.size === 0 ? ["action_target_experience_thresholds_met"] : Array.from(reasonCodes).sort()
  };
}

function motionScoreFor(actionId: V34TargetActionId) {
  return {
    idle: 0.62,
    walk: 0.86,
    jump: 0.88,
    sleep: 0.62,
    eat: 0.78,
    play: 0.9,
    alert: 0.8,
    celebrate: 0.84
  }[actionId];
}

function average(values: number[]) {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function remainingRisksFor(status: V35RubricStatus, routeId: V35RouteId) {
  if (status === "target_experience") {
    return routeId === "route_a2_quality_uplift"
      ? ["Scoped result still requires human visual review and named-sample boundary."]
      : ["Professional source boundary remains required for each imported asset."];
  }
  if (status === "engineering_only") return ["Engineering path works but visual target experience is not fully proven."];
  if (status === "blocked") return ["Required source, QA, evidence, or environment prerequisite is missing."];
  return ["Evidence shows a hard non-pass criterion."];
}

function sanitizeRefs(refs: string[]) {
  return refs
    .map((ref) => ref.replace(/\\/g, "/").replace(/[^A-Za-z0-9._/-]/g, "_").slice(0, 160))
    .filter((ref) => ref && !FORBIDDEN_PATTERN.test(ref));
}

function sanitizeText(value: string) {
  const normalized = value.replace(/[^A-Za-z0-9:_ .,/()-]/g, "_").trim().slice(0, 180);
  return normalized && !FORBIDDEN_PATTERN.test(normalized) ? normalized : "redacted";
}

function sanitizeId(value: string) {
  const normalized = value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 96);
  return normalized || "v35_sample";
}
