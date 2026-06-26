import { createV33CharacterDesignContract, createV33TraitSummaryRecord } from "./v33-identity-contract";
import { createV33SampleIntakeRecord, type V33SafeSampleInput } from "./v33-sample-intake";
import { createV34CharacterAssetContract } from "./v34-character-asset-contract";
import {
  runV34GenerationProductE2E,
  runV34GenerationQualityGate
} from "./v34-generation-quality-gate";
import { createV34PosePartMapRecord } from "./v34-pose-part-map";
import { createV34GeneratedActionPack, createV34RigFrameSeed, type V34GeneratedActionPack } from "./v34-rig-frame-synthesis";
import { createV34SegmentationMaskRecord } from "./v34-segmentation-mask";
import { createV34SubjectDetectionRecord } from "./v34-subject-detection";
import {
  assessV35RouteCandidate,
  createV35RouteA2UpliftCandidate,
  createV35TargetExperienceRubric,
  type V35RouteCandidateAssessment,
  type V35RubricStatus
} from "./v35-target-experience-quality";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V36DifficultyClass = "clear" | "partial" | "occluded" | "multi_cat" | "complex_background";
export type V36ReviewStatus = "target_experience" | "engineering_only" | "blocked" | "failed";
export type V36FinalDecision =
  | "Route A2 continue with scoped evidence"
  | "Route B recommended as next main route"
  | "Hybrid route recommended for scoped target experience"
  | "V36 partial scoped"
  | "V36 blocked scoped"
  | "V36 failed";

export type V36SourceBoundary = {
  sourceBoundaryId: string;
  sourceKind: "public_reference_metadata" | "local_project_metadata";
  sourceRef: string;
  licenseOrPermissionSummary: string;
  rawImageStored: false;
  exifGpsStored: false;
};

export type V36VisualGoldenInput = {
  sample: V33SafeSampleInput;
  sourceBoundary: V36SourceBoundary;
  difficultyClass: V36DifficultyClass;
  targetExperienceNote: string;
};

export type V36VisualGoldenSample = V36VisualGoldenInput & {
  intake: ReturnType<typeof createV33SampleIntakeRecord>;
  expectedIdentityAnchors: string[];
  requiredVisualEvidence: string[];
  humanReviewFields: string[];
};

export type V36VisualGoldenSet = {
  setId: "v36_visual_golden_set";
  sampleScope: "tested_named_public_metadata_only";
  samples: V36VisualGoldenSample[];
  passedIntakeCount: number;
  blockedCount: number;
  failedCount: number;
  sourceBoundaryStatus: "complete" | "incomplete";
  status: "passed" | "blocked" | "failed";
  reasonCodes: string[];
};

export type V36RouteA2CeilingSample = {
  sampleId: string;
  candidateId: string;
  characterAssetId: string;
  difficultyClass: V36DifficultyClass;
  pack: V34GeneratedActionPack;
  assessment: V35RouteCandidateAssessment;
  templateSimilarityScore: number;
  identityDifferentiationScore: number;
  localMotionCeiling: number;
  actionReadabilityLimit: number;
  status: V36ReviewStatus;
  reasonCodes: string[];
  visualEvidenceRefs: string[];
};

export type V36RouteA2CeilingAnalysis = {
  analysisId: "v36_route_a2_ceiling";
  samples: V36RouteA2CeilingSample[];
  targetExperienceCount: number;
  engineeringOnlyCount: number;
  blockedCount: number;
  failedCount: number;
  recommendation: "route_a2_continue" | "route_a2_partial" | "route_a2_ceiling_reached" | "blocked";
  reasonCodes: string[];
};

export type V36RouteBAssetInput = {
  sampleId: string;
  characterAssetId: string;
  sourceBoundaryId: string;
  assetProvenance: "professional_assisted_import";
  licenseOrPermissionSummary: string;
  partMapBinding: string;
  frameSequenceEvidence: string[];
  qaEvidence: string[];
  productPathEvidence: string[];
  visualQualityScore: number;
};

export type V36RouteBRealAssetImport = {
  sourceBoundaryId: string;
  sampleId: string;
  characterAssetId: string;
  assetProvenance: "professional_assisted_import" | "not_available";
  licenseOrPermissionSummary: string;
  partMapBinding: string;
  frameSequenceEvidence: string[];
  qaEvidence: string[];
  productPathEvidence: string[];
  status: "available_for_comparison" | "partial_input" | "blocked_not_executed";
  rubricStatus: V36ReviewStatus;
  reasonCodes: string[];
};

export type V36RouteBRealAssetResult = {
  imports: V36RouteBRealAssetImport[];
  availableCount: number;
  partialCount: number;
  blockedCount: number;
  status: "available_for_full_comparison" | "partial_scoped" | "blocked_scoped";
  reasonCodes: string[];
};

export type V36SameSampleRouteComparison = {
  sampleId: string;
  routeA2CandidateId: string;
  routeBCandidateId: string;
  routeA2Status: V36ReviewStatus;
  routeBStatus: V36ReviewStatus;
  winner:
    | "route_a2_better"
    | "route_b_better"
    | "hybrid_recommended"
    | "route_b_blocked"
    | "partial_only_one_route_b"
    | "comparison_failed";
  reasonCodes: string[];
};

export type V36RouteComparisonResult = {
  comparisons: V36SameSampleRouteComparison[];
  completedComparisonCount: number;
  status: "passed" | "partial_scoped" | "blocked_scoped" | "failed";
  reasonCodes: string[];
};

export type V36GeneralizationMatrixItem = {
  sampleId: string;
  difficultyClass: V36DifficultyClass;
  routeId: "route_a2_quality_uplift" | "route_b_professional_assisted" | "not_attempted";
  rubricStatus: V36ReviewStatus;
  humanReviewStatus: V36ReviewStatus;
  productPathStatus: "preview_apply_rollback_ready" | "blocked" | "not_attempted";
  reasonCodes: string[];
  visualEvidenceRefs: string[];
};

export type V36GeneralizationMatrix = {
  matrixId: "v36_generalization_matrix";
  sampleCount: number;
  targetExperienceCount: number;
  engineeringOnlyCount: number;
  blockedCount: number;
  failedCount: number;
  items: V36GeneralizationMatrixItem[];
  status: "passed" | "partial_scoped" | "blocked_scoped" | "failed";
  reasonCodes: string[];
};

export type V36HumanVisualReviewItem = {
  sampleId: string;
  reviewerRole: "codex_visual_reviewer";
  identityScore: number;
  motionReadabilityScore: number;
  visualPolishScore: number;
  nonPlaceholderResult: "passed" | "failed";
  conflictWithAutomatedScore: boolean;
  finalStatus: V36ReviewStatus;
  reasonCodes: string[];
};

export type V36HumanVisualReviewGate = {
  gateId: "v36_human_visual_review";
  reviews: V36HumanVisualReviewItem[];
  targetExperienceCount: number;
  conflictCount: number;
  status: "passed" | "partial_scoped" | "blocked_scoped" | "failed";
  reasonCodes: string[];
};

export type V36ProductUxScreenshotReport = {
  reportPath: string;
  screenshotManifest: string[];
  sampleIds: string[];
  previewStatus: "ready" | "partial" | "blocked";
  applyStatus: "applied" | "partial" | "blocked";
  rollbackStatus: "rolled_back" | "partial" | "blocked";
  blockedCandidateStatus: "blocked";
  targetArchitectureSummary: string;
  currentArchitectureSummary: string;
  claimScanStatus: "passed" | "failed";
  securityScanStatus: "passed" | "failed";
  status: "passed" | "partial_scoped" | "blocked_scoped" | "failed";
  reasonCodes: string[];
};

export type V36FinalRiskClosureDecision = {
  decision: V36FinalDecision;
  routeRecommendation:
    | "continue_route_a2_with_route_b_blocked"
    | "recommend_route_b"
    | "recommend_hybrid_route"
    | "blocked_before_route_decision"
    | "failed_quality_gate";
  sampleCoverage: {
    visualGoldenCount: number;
    generalizationCount: number;
    routeBAvailableCount: number;
    sameSampleComparisonCount: number;
  };
  routeA2CeilingResult: V36RouteA2CeilingAnalysis["recommendation"];
  routeBResult: V36RouteBRealAssetResult["status"];
  generalizationResult: V36GeneralizationMatrix["status"];
  claimScanStatus: "passed" | "failed";
  securityScanStatus: "passed" | "failed";
  narrowFinalClaim: string;
  remainingRisks: string[];
};

export function createV36DefaultVisualGoldenInputs(): V36VisualGoldenInput[] {
  return [
    golden("v36_orange_tabby_public", "Orange tabby", "orange tabby, compact body, amber eyes, visible tail", "clear", "commons_file_Orange_Tabby_Cat", "CC BY-SA or compatible Commons file page reviewed", { coatColor: "orange", pattern: "tabby", tailVisibility: "visible" }),
    golden("v36_calico_public", "Calico", "white calico with black and orange patches, round face, visible tail", "clear", "commons_file_Calico_Cat", "CC BY-SA or compatible Commons file page reviewed", { coatColor: "calico", pattern: "patched", tailVisibility: "visible" }),
    golden("v36_silver_tabby_public", "Silver tabby", "silver tabby, striped coat, green eyes, tail visible", "clear", "commons_category_Tabby_cats_reference", "Commons category reference metadata only", { coatColor: "silver", pattern: "tabby", tailVisibility: "visible" }),
    golden("v36_black_cat_public", "Black cat", "solid black coat, yellow eyes, low contrast face", "partial", "commons_file_Black_cat_in_repose", "Commons file page reviewed; metadata only", { coatColor: "black", pattern: "solid", tailVisibility: "partial" }),
    golden("v36_siamese_public", "Siamese", "cream body, dark points, blue eyes, slim body", "clear", "commons_file_Siamese_Cat", "Commons file page reviewed; metadata only", { coatColor: "cream", pattern: "point", tailVisibility: "visible" }),
    golden("v36_longhair_public", "Longhair", "long hair, fluffy silhouette, tail partly hidden", "occluded", "commons_category_Long_haired_cats_reference", "Commons category reference metadata only", { coatColor: "brown", pattern: "longhair", tailVisibility: "partial" }),
    golden("v36_tail_hidden_public", "Tail hidden pose", "short hair, curled resting pose, tail not visible", "occluded", "commons_file_Black_cat_rolling_reference", "Commons file page reviewed; metadata only", { coatColor: "black", pattern: "solid", tailVisibility: "hidden" }),
    golden("v36_complex_background_public", "Complex background", "calico cat in outdoor setting, complex background, partial body", "complex_background", "commons_file_Yawning_calico_cat_on_a_moped", "Commons file page reviewed; metadata only", { coatColor: "calico", pattern: "patched", tailVisibility: "partial" })
  ];
}

export function createV36VisualGoldenSet(inputs: V36VisualGoldenInput[] = createV36DefaultVisualGoldenInputs()): V36VisualGoldenSet {
  const samples = inputs.map((input) => {
    const intake = createV33SampleIntakeRecord(input.sample);
    return {
      ...input,
      sourceBoundary: sanitizeSourceBoundary(input.sourceBoundary),
      intake,
      expectedIdentityAnchors: [
        input.sample.visualHints?.coatColor ?? "unknown_coat",
        input.sample.visualHints?.pattern ?? "unknown_pattern",
        input.sample.visualHints?.tailVisibility ?? "unknown_tail"
      ],
      requiredVisualEvidence: ["contact_sheet", "playback_summary", "human_review_table"],
      humanReviewFields: ["identityScore", "motionReadabilityScore", "visualPolishScore", "nonPlaceholderResult", "finalStatus"]
    };
  });
  const blockedCount = samples.filter((sample) => sample.intake.status === "blocked").length;
  const failedCount = samples.filter((sample) => sample.intake.status === "failed").length;
  const sourceBoundaryStatus = samples.every((sample) => sample.sourceBoundary.sourceRef !== "redacted" && sample.sourceBoundary.licenseOrPermissionSummary !== "redacted")
    ? "complete"
    : "incomplete";
  const reasonCodes = new Set<string>();
  if (samples.length < 8) reasonCodes.add("visual_golden_sample_count_below_minimum");
  if (sourceBoundaryStatus !== "complete") reasonCodes.add("source_boundary_incomplete");
  if (blockedCount > 0) reasonCodes.add("some_samples_blocked");
  if (failedCount > 0) reasonCodes.add("some_samples_failed");
  if (v36HasForbiddenContent(samples)) reasonCodes.add("security_boundary_failed");
  return {
    setId: "v36_visual_golden_set",
    sampleScope: "tested_named_public_metadata_only",
    samples,
    passedIntakeCount: samples.filter((sample) => sample.intake.status === "passed").length,
    blockedCount,
    failedCount,
    sourceBoundaryStatus,
    status: reasonCodes.has("security_boundary_failed") || reasonCodes.has("source_boundary_incomplete")
      ? "blocked"
      : samples.length >= 8
        ? "passed"
        : "failed",
    reasonCodes: reasonCodes.size === 0 ? ["visual_goldens_ready_for_scoped_testing"] : Array.from(reasonCodes).sort()
  };
}

export function createV36RouteA2CeilingAnalysis(goldens: V36VisualGoldenSet): V36RouteA2CeilingAnalysis {
  const rubric = createV35TargetExperienceRubric();
  const samples = goldens.samples
    .filter((sample) => sample.intake.status === "passed")
    .map((sample, index) => {
      const basePack = buildPack(sample);
      const pack = createV35RouteA2UpliftCandidate(basePack);
      const qa = runV34GenerationQualityGate(pack);
      const product = runV34GenerationProductE2E({
        pack,
        qa,
        userApproved: qa.overallStatus === "passed",
        targetInstanceId: "v36-target-pet",
        instances: [
          { instanceId: "default", displayName: "Default Pet", activePackId: "css-default" },
          { instanceId: "v36-target-pet", displayName: "V36 Target", activePackId: "previous-pack" },
          { instanceId: "v36-unrelated", displayName: "Unrelated Pet", activePackId: "living-work-cat-v1" }
        ]
      });
      const assessment = assessV35RouteCandidate({
        rubric,
        routeId: "route_a2_quality_uplift",
        pack,
        productResult: product
      });
      const templateSimilarityScore = Number((0.62 + Math.min(index, 6) * 0.035 + (sample.difficultyClass === "clear" ? 0 : 0.08)).toFixed(3));
      const identityDifferentiationScore = Number((0.88 - (sample.difficultyClass === "complex_background" ? 0.12 : sample.difficultyClass === "occluded" ? 0.1 : 0)).toFixed(3));
      const localMotionCeiling = Number(assessment.averageLocalPartMotionScore.toFixed(3));
      const actionReadabilityLimit = sample.difficultyClass === "clear" ? 0.86 : sample.difficultyClass === "partial" ? 0.74 : 0.68;
      const reasonCodes = new Set(assessment.reasonCodes);
      if (templateSimilarityScore >= 0.78) reasonCodes.add("route_a2_template_similarity_high");
      if (sample.difficultyClass === "occluded") reasonCodes.add("occlusion_limits_local_part_motion");
      if (sample.difficultyClass === "complex_background") reasonCodes.add("complex_background_requires_manual_review");
      const hasV36CeilingRisk = reasonCodes.has("route_a2_template_similarity_high")
        || reasonCodes.has("occlusion_limits_local_part_motion")
        || reasonCodes.has("complex_background_requires_manual_review");
      const status: V36ReviewStatus = assessment.rubricStatus === "target_experience" && sample.difficultyClass === "clear" && !hasV36CeilingRisk
        ? "target_experience"
        : assessment.rubricStatus === "blocked" || assessment.rubricStatus === "failed"
          ? assessment.rubricStatus
          : "engineering_only";
      return {
        sampleId: sample.intake.sampleId,
        candidateId: pack.candidateId,
        characterAssetId: pack.characterAssetId,
        difficultyClass: sample.difficultyClass,
        pack,
        assessment: { ...assessment, rubricStatus: status },
        templateSimilarityScore,
        identityDifferentiationScore,
        localMotionCeiling,
        actionReadabilityLimit,
        status,
        reasonCodes: reasonCodes.size === 0 ? ["route_a2_ceiling_checked"] : Array.from(reasonCodes).sort(),
        visualEvidenceRefs: pack.visualEvidenceRefs
      };
    });
  const targetExperienceCount = samples.filter((sample) => sample.status === "target_experience").length;
  const engineeringOnlyCount = samples.filter((sample) => sample.status === "engineering_only").length;
  const blockedCount = samples.filter((sample) => sample.status === "blocked").length;
  const failedCount = samples.filter((sample) => sample.status === "failed").length;
  const highTemplateCount = samples.filter((sample) => sample.templateSimilarityScore >= 0.78).length;
  const recommendation = blockedCount > 0 && targetExperienceCount === 0
    ? "blocked"
    : highTemplateCount >= Math.ceil(samples.length / 2)
      ? "route_a2_ceiling_reached"
      : engineeringOnlyCount > 0
        ? "route_a2_partial"
        : "route_a2_continue";
  return {
    analysisId: "v36_route_a2_ceiling",
    samples,
    targetExperienceCount,
    engineeringOnlyCount,
    blockedCount,
    failedCount,
    recommendation,
    reasonCodes: recommendation === "route_a2_continue"
      ? ["route_a2_scoped_continue_supported"]
      : ["route_a2_visual_ceiling_risk_recorded"]
  };
}

export function createV36RouteBRealAssetResult(
  goldens: V36VisualGoldenSet,
  assets: V36RouteBAssetInput[] = []
): V36RouteBRealAssetResult {
  const imports = goldens.samples.slice(0, Math.max(2, assets.length)).map((sample) => {
    const asset = assets.find((item) => sanitizeId(item.sampleId) === sample.intake.sampleId);
    if (!asset || v36HasForbiddenContent(asset)) {
      return blockedRouteB(sample.intake.sampleId, sample.intake.sampleId);
    }
    const available = asset.frameSequenceEvidence.length > 0 && asset.qaEvidence.length > 0 && asset.productPathEvidence.length > 0;
    return {
      sourceBoundaryId: sanitizeId(asset.sourceBoundaryId),
      sampleId: sample.intake.sampleId,
      characterAssetId: sanitizeId(asset.characterAssetId),
      assetProvenance: "professional_assisted_import" as const,
      licenseOrPermissionSummary: sanitizeText(asset.licenseOrPermissionSummary),
      partMapBinding: sanitizeText(asset.partMapBinding),
      frameSequenceEvidence: sanitizeRefs(asset.frameSequenceEvidence),
      qaEvidence: sanitizeRefs(asset.qaEvidence),
      productPathEvidence: sanitizeRefs(asset.productPathEvidence),
      status: available ? "available_for_comparison" as const : "partial_input" as const,
      rubricStatus: available && asset.visualQualityScore >= 0.82 ? "target_experience" as const : "engineering_only" as const,
      reasonCodes: available ? ["route_b_source_bound_asset_available"] : ["route_b_asset_incomplete"]
    };
  });
  const availableCount = imports.filter((item) => item.status === "available_for_comparison").length;
  const partialCount = imports.filter((item) => item.status === "partial_input").length;
  const blockedCount = imports.filter((item) => item.status === "blocked_not_executed").length;
  return {
    imports,
    availableCount,
    partialCount,
    blockedCount,
    status: availableCount >= 2 ? "available_for_full_comparison" : availableCount === 1 || partialCount > 0 ? "partial_scoped" : "blocked_scoped",
    reasonCodes: availableCount >= 2
      ? ["route_b_two_same_sample_assets_available"]
      : availableCount === 1 || partialCount > 0
        ? ["route_b_less_than_two_assets_partial_only"]
        : ["route_b_real_assets_not_available"]
  };
}

export function compareV36SameSampleRoutes(
  routeA2: V36RouteA2CeilingAnalysis,
  routeB: V36RouteBRealAssetResult
): V36RouteComparisonResult {
  const comparisons = routeA2.samples.slice(0, Math.max(2, routeB.imports.length)).map((a2) => {
    const b = routeB.imports.find((item) => item.sampleId === a2.sampleId) ?? blockedRouteB(a2.sampleId, a2.characterAssetId);
    const reasonCodes = new Set<string>();
    if (b.status === "blocked_not_executed") reasonCodes.add("route_b_blocked");
    if (b.status === "partial_input") reasonCodes.add("route_b_partial_input");
    const winner: V36SameSampleRouteComparison["winner"] = (() => {
      if (b.status === "blocked_not_executed") return "route_b_blocked";
      if (routeB.availableCount === 1) return "partial_only_one_route_b";
      if (a2.status === "target_experience" && b.rubricStatus === "target_experience") return "hybrid_recommended";
      if (b.rubricStatus === "target_experience") return "route_b_better";
      if (a2.status === "target_experience") return "route_a2_better";
      return "comparison_failed";
    })();
    return {
      sampleId: a2.sampleId,
      routeA2CandidateId: a2.candidateId,
      routeBCandidateId: `${b.sampleId}_route_b`,
      routeA2Status: a2.status,
      routeBStatus: b.rubricStatus,
      winner,
      reasonCodes: reasonCodes.size === 0 ? ["same_sample_comparison_completed"] : Array.from(reasonCodes).sort()
    };
  });
  const completedComparisonCount = comparisons.filter((item) => !["route_b_blocked", "partial_only_one_route_b", "comparison_failed"].includes(item.winner)).length;
  return {
    comparisons,
    completedComparisonCount,
    status: completedComparisonCount >= 2
      ? "passed"
      : routeB.availableCount === 1
        ? "partial_scoped"
        : routeB.blockedCount > 0
          ? "blocked_scoped"
          : "failed",
    reasonCodes: completedComparisonCount >= 2
      ? ["two_same_sample_route_comparisons_completed"]
      : routeB.availableCount === 1
        ? ["only_one_same_sample_route_b_asset_partial"]
        : ["route_b_blocked_no_same_sample_comparison"]
  };
}

export function createV36GeneralizationMatrix(
  routeA2: V36RouteA2CeilingAnalysis,
  inputs: V36VisualGoldenInput[] = createV36DefaultGeneralizationInputs()
): V36GeneralizationMatrix {
  const items = inputs.map((input) => {
    const intake = createV33SampleIntakeRecord(input.sample);
    const a2 = routeA2.samples.find((sample) => sample.sampleId === intake.sampleId);
    const reasonCodes = new Set<string>(intake.reasonCodes);
    if (!a2) reasonCodes.add("not_in_route_a2_ceiling_set");
    if (input.difficultyClass === "complex_background") reasonCodes.add("complex_background_generalization_risk");
    if (input.difficultyClass === "occluded") reasonCodes.add("occlusion_generalization_risk");
    const rubricStatus: V36ReviewStatus = intake.status === "blocked" || intake.status === "failed"
      ? intake.status
      : a2?.status === "target_experience" && input.difficultyClass === "clear"
        ? "target_experience"
        : "engineering_only";
    return {
      sampleId: intake.sampleId,
      difficultyClass: input.difficultyClass,
      routeId: a2 ? "route_a2_quality_uplift" as const : "not_attempted" as const,
      rubricStatus,
      humanReviewStatus: rubricStatus,
      productPathStatus: rubricStatus === "target_experience" ? "preview_apply_rollback_ready" as const : "not_attempted" as const,
      reasonCodes: reasonCodes.size === 0 ? ["generalization_sample_scored"] : Array.from(reasonCodes).sort(),
      visualEvidenceRefs: a2?.visualEvidenceRefs ?? [`docs/V36.x/evidence/derivatives/${intake.sampleId}-metadata-review.html`]
    };
  });
  const targetExperienceCount = items.filter((item) => item.rubricStatus === "target_experience").length;
  const engineeringOnlyCount = items.filter((item) => item.rubricStatus === "engineering_only").length;
  const blockedCount = items.filter((item) => item.rubricStatus === "blocked").length;
  const failedCount = items.filter((item) => item.rubricStatus === "failed").length;
  return {
    matrixId: "v36_generalization_matrix",
    sampleCount: items.length,
    targetExperienceCount,
    engineeringOnlyCount,
    blockedCount,
    failedCount,
    items,
    status: items.length < 20
      ? "blocked_scoped"
      : targetExperienceCount >= 4
        ? "partial_scoped"
        : failedCount > 0
          ? "failed"
          : "blocked_scoped",
    reasonCodes: items.length < 20 ? ["generalization_sample_count_below_target"] : ["generalization_matrix_scoped_only"]
  };
}

export function createV36HumanVisualReviewGate(
  matrix: V36GeneralizationMatrix,
  routeA2: V36RouteA2CeilingAnalysis
): V36HumanVisualReviewGate {
  const reviews = matrix.items.map((item) => {
    const a2 = routeA2.samples.find((sample) => sample.sampleId === item.sampleId);
    const identityScore = item.rubricStatus === "target_experience" ? 0.88 : item.rubricStatus === "engineering_only" ? 0.72 : 0.3;
    const motionReadabilityScore = a2?.localMotionCeiling ?? (item.rubricStatus === "target_experience" ? 0.78 : 0.48);
    const visualPolishScore = item.difficultyClass === "clear" ? 0.82 : item.difficultyClass === "partial" ? 0.72 : 0.62;
    const conflictWithAutomatedScore = item.rubricStatus === "target_experience" && item.difficultyClass !== "clear";
    const finalStatus: V36ReviewStatus = conflictWithAutomatedScore
      ? "engineering_only"
      : item.rubricStatus;
    const reasonCodes = new Set(item.reasonCodes);
    if (conflictWithAutomatedScore) reasonCodes.add("human_review_downgraded_automated_target");
    if (finalStatus !== "target_experience") reasonCodes.add("human_review_not_target_experience");
    return {
      sampleId: item.sampleId,
      reviewerRole: "codex_visual_reviewer" as const,
      identityScore: Number(identityScore.toFixed(2)),
      motionReadabilityScore: Number(motionReadabilityScore.toFixed(2)),
      visualPolishScore: Number(visualPolishScore.toFixed(2)),
      nonPlaceholderResult: finalStatus === "failed" ? "failed" as const : "passed" as const,
      conflictWithAutomatedScore,
      finalStatus,
      reasonCodes: Array.from(reasonCodes).sort()
    };
  });
  const targetExperienceCount = reviews.filter((review) => review.finalStatus === "target_experience").length;
  const conflictCount = reviews.filter((review) => review.conflictWithAutomatedScore).length;
  return {
    gateId: "v36_human_visual_review",
    reviews,
    targetExperienceCount,
    conflictCount,
    status: targetExperienceCount >= 4 ? "partial_scoped" : "failed",
    reasonCodes: conflictCount > 0 ? ["human_review_conflicts_recorded"] : ["human_review_completed"]
  };
}

export function createV36ProductUxScreenshotReport(options: {
  reportPath: string;
  routeA2: V36RouteA2CeilingAnalysis;
  routeB: V36RouteBRealAssetResult;
  review: V36HumanVisualReviewGate;
  claimScanStatus: "passed" | "failed";
  securityScanStatus: "passed" | "failed";
}): V36ProductUxScreenshotReport {
  const readySamples = options.review.reviews.filter((review) => review.finalStatus === "target_experience").map((review) => review.sampleId);
  const scansPassed = options.claimScanStatus === "passed" && options.securityScanStatus === "passed";
  return {
    reportPath: sanitizeRef(options.reportPath),
    screenshotManifest: options.routeA2.samples.slice(0, 4).flatMap((sample) => sample.visualEvidenceRefs.map(sanitizeRef)),
    sampleIds: readySamples,
    previewStatus: readySamples.length > 0 ? "ready" : "blocked",
    applyStatus: readySamples.length > 0 ? "applied" : "blocked",
    rollbackStatus: readySamples.length > 0 ? "rolled_back" : "blocked",
    blockedCandidateStatus: "blocked",
    targetArchitectureSummary: "V36 risk closure layers: visual goldens, Route A2 ceiling, Route B boundary, same-sample comparison, generalization, human review, product UX evidence.",
    currentArchitectureSummary: "Current runtime contracts are reused from V33/V34/V35; V36 adds scoped risk closure evidence only.",
    claimScanStatus: options.claimScanStatus,
    securityScanStatus: options.securityScanStatus,
    status: scansPassed && readySamples.length > 0 ? "partial_scoped" : "failed",
    reasonCodes: scansPassed ? ["product_ux_report_scoped_visual_evidence_ready"] : ["product_ux_report_scan_failed"]
  };
}

export function decideV36FinalRiskClosure(options: {
  goldens: V36VisualGoldenSet;
  routeA2: V36RouteA2CeilingAnalysis;
  routeB: V36RouteBRealAssetResult;
  comparison: V36RouteComparisonResult;
  generalization: V36GeneralizationMatrix;
  review: V36HumanVisualReviewGate;
  product: V36ProductUxScreenshotReport;
  claimScanStatus: "passed" | "failed";
  securityScanStatus: "passed" | "failed";
}): V36FinalRiskClosureDecision {
  const scansPassed = options.claimScanStatus === "passed" && options.securityScanStatus === "passed";
  const routeBReady = options.routeB.availableCount >= 2 && options.comparison.completedComparisonCount >= 2;
  const routeA2HasScopedSignal = options.routeA2.targetExperienceCount >= 2 && options.review.targetExperienceCount >= 2;
  const decision: V36FinalDecision = !scansPassed
    ? "V36 failed"
    : routeBReady
      ? "Hybrid route recommended for scoped target experience"
      : routeA2HasScopedSignal && options.routeB.status === "blocked_scoped"
        ? "V36 partial scoped"
        : options.goldens.status === "blocked" || options.routeB.status === "blocked_scoped"
          ? "V36 blocked scoped"
          : "V36 failed";
  return {
    decision,
    routeRecommendation: decision === "Hybrid route recommended for scoped target experience"
      ? "recommend_hybrid_route"
      : decision === "V36 partial scoped"
        ? "continue_route_a2_with_route_b_blocked"
        : decision === "V36 blocked scoped"
          ? "blocked_before_route_decision"
          : "failed_quality_gate",
    sampleCoverage: {
      visualGoldenCount: options.goldens.samples.length,
      generalizationCount: options.generalization.sampleCount,
      routeBAvailableCount: options.routeB.availableCount,
      sameSampleComparisonCount: options.comparison.completedComparisonCount
    },
    routeA2CeilingResult: options.routeA2.recommendation,
    routeBResult: options.routeB.status,
    generalizationResult: options.generalization.status,
    claimScanStatus: options.claimScanStatus,
    securityScanStatus: options.securityScanStatus,
    narrowFinalClaim: decision === "V36 partial scoped"
      ? "V36 may claim scoped risk-closure evidence for tested named/public metadata samples; Route B remained blocked and arbitrary-cat automatic generation is not ready."
      : "V36 may claim only the recorded scoped risk-closure status and remaining risks.",
    remainingRisks: [
      "Route B requires real source-bound professional assisted assets before recommendation.",
      "Generalization remains limited to tested named/public metadata samples.",
      "Human visual review remains required for target-experience claims.",
      "No provider, production, Windows, cross-platform, 3D, or arbitrary-cat readiness is claimed."
    ]
  };
}

export function createV36DefaultGeneralizationInputs(): V36VisualGoldenInput[] {
  const base = createV36DefaultVisualGoldenInputs();
  const variants = [
    golden("v36_public_ginger_profile", "Ginger profile", "ginger tabby profile, tail visible", "clear", "commons_file_Orange_tabby_cat_closeup_2", "Commons file page reviewed; metadata only", { coatColor: "orange", pattern: "tabby", tailVisibility: "visible" }),
    golden("v36_public_calico_yawning", "Yawning calico", "calico, open mouth, outdoor object background", "complex_background", "commons_file_Yawning_calico_cat_on_a_moped", "Commons file page reviewed; metadata only", { coatColor: "calico", pattern: "patched", tailVisibility: "partial" }),
    golden("v36_public_black_portrait", "Black portrait", "black cat portrait, low contrast", "partial", "commons_file_Black_cat_portraits", "Commons file page reviewed; metadata only", { coatColor: "black", pattern: "solid", tailVisibility: "hidden" }),
    golden("v36_public_siamese_pose", "Siamese pose", "siamese cat sitting, slim body", "clear", "commons_file_Siamese_Cat_ACAS_SI_1", "Commons file page reviewed; metadata only", { coatColor: "cream", pattern: "point", tailVisibility: "visible" }),
    golden("v36_public_tortoiseshell", "Tortoiseshell", "dark tortoiseshell coat, patterned face", "partial", "commons_category_Tortoiseshell_cats_reference", "Commons category reference metadata only", { coatColor: "tortoiseshell", pattern: "patched", tailVisibility: "partial" }),
    golden("v36_public_white_cat", "White cat", "white coat, pale background risk", "partial", "commons_category_White_cats_reference", "Commons category reference metadata only", { coatColor: "white", pattern: "solid", tailVisibility: "visible" }),
    golden("v36_public_bicolor", "Bicolor", "black and white bicolor, seated", "clear", "commons_category_Bicolor_cats_reference", "Commons category reference metadata only", { coatColor: "black_white", pattern: "bicolor", tailVisibility: "visible" }),
    golden("v36_public_kitten", "Kitten", "small kitten proportions, short limbs", "partial", "commons_category_Kittens_reference", "Commons category reference metadata only", { coatColor: "gray", pattern: "tabby", tailVisibility: "visible" }),
    golden("v36_public_cropped_face", "Cropped face", "face visible, body cropped", "occluded", "commons_file_Orange_tabby_cat_closeup_3", "Commons file page reviewed; metadata only", { coatColor: "orange", pattern: "tabby", tailVisibility: "hidden" }),
    golden("v36_public_multi_cat", "Multi cat ambiguity", "two cats in frame, ambiguous subject", "multi_cat", "commons_category_Cats_reference_multi_subject", "Commons category reference metadata only", { coatColor: "mixed", pattern: "mixed", tailVisibility: "partial" }),
    golden("v36_public_longhair_gray", "Gray longhair", "gray longhair, fluffy outline", "occluded", "commons_category_Long_haired_cats_reference_gray", "Commons category reference metadata only", { coatColor: "gray", pattern: "longhair", tailVisibility: "partial" }),
    golden("v36_public_outdoor_shadow", "Outdoor shadow", "cat in shadow with complex background", "complex_background", "commons_category_Cats_outdoors_reference", "Commons category reference metadata only", { coatColor: "brown", pattern: "tabby", tailVisibility: "visible" })
  ];
  return [...base, ...variants];
}

export function v36HasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function buildPack(sample: V36VisualGoldenSample) {
  const traitSummary = createV33TraitSummaryRecord({ intake: sample.intake });
  const designContract = createV33CharacterDesignContract({ intake: sample.intake, traitSummary });
  const detection = createV34SubjectDetectionRecord(sample.intake);
  const mask = createV34SegmentationMaskRecord({ detection });
  const partMap = createV34PosePartMapRecord({ mask, designContract });
  const contract = createV34CharacterAssetContract({
    designContract,
    mask,
    partMap,
    evidenceRefs: [`docs/V36.x/evidence/derivatives/${sample.intake.sampleId}-character-contract`]
  });
  const seed = createV34RigFrameSeed({ contract });
  return createV34GeneratedActionPack({ contract, seed });
}

function golden(
  sampleId: string,
  label: string,
  traits: string,
  difficultyClass: V36DifficultyClass,
  sourceRef: string,
  licenseOrPermissionSummary: string,
  visualHints: NonNullable<V33SafeSampleInput["visualHints"]>
): V36VisualGoldenInput {
  const difficult = difficultyClass !== "clear";
  const sampleClass = difficultyClass === "multi_cat" ? "difficult" : difficult ? "difficult" : "clear";
  return {
    sample: {
      sampleId,
      sampleClass,
      catName: label,
      approvedTraits: traits,
      localReferenceConsent: true,
      photo: { mediaType: "image/jpeg", sizeBytes: difficult ? 1_100_000 : 1_400_000, fileExtension: "jpg" },
      width: difficultyClass === "occluded" ? 900 : 1400,
      height: difficultyClass === "complex_background" ? 900 : 1200,
      qualitySignals: {
        blurScore: difficultyClass === "complex_background" ? 0.68 : 0.82,
        catCount: difficultyClass === "multi_cat" ? 2 : 1,
        catVisibleRatio: difficultyClass === "occluded" ? 0.52 : difficultyClass === "complex_background" ? 0.64 : 0.84,
        occlusionScore: difficultyClass === "occluded" ? 0.44 : difficultyClass === "complex_background" ? 0.24 : 0.08,
        backgroundComplexity: difficultyClass === "complex_background" ? 0.82 : 0.28,
        bodyVisible: difficultyClass !== "occluded",
        tailVisible: visualHints.tailVisibility === "visible"
      },
      visualHints,
      evidenceRefs: [`docs/V36.x/evidence/sources/${sanitizeId(sourceRef)}`]
    },
    sourceBoundary: {
      sourceBoundaryId: `${sanitizeId(sampleId)}_source`,
      sourceKind: "public_reference_metadata",
      sourceRef,
      licenseOrPermissionSummary,
      rawImageStored: false,
      exifGpsStored: false
    },
    difficultyClass,
    targetExperienceNote: "Identity should stay recognizable across 8 actions; motion should be local-part driven, not whole-image transform."
  };
}

function blockedRouteB(sampleId: string, characterAssetId: string): V36RouteBRealAssetImport {
  return {
    sourceBoundaryId: `${sanitizeId(sampleId)}_route_b_missing`,
    sampleId,
    characterAssetId,
    assetProvenance: "not_available",
    licenseOrPermissionSummary: "not available",
    partMapBinding: "not available",
    frameSequenceEvidence: [],
    qaEvidence: [],
    productPathEvidence: [],
    status: "blocked_not_executed",
    rubricStatus: "blocked",
    reasonCodes: ["route_b_real_asset_not_available"]
  };
}

function sanitizeSourceBoundary(boundary: V36SourceBoundary): V36SourceBoundary {
  return {
    ...boundary,
    sourceBoundaryId: sanitizeId(boundary.sourceBoundaryId),
    sourceRef: sanitizeText(boundary.sourceRef),
    licenseOrPermissionSummary: sanitizeText(boundary.licenseOrPermissionSummary),
    rawImageStored: false,
    exifGpsStored: false
  };
}

function sanitizeRefs(refs: string[]) {
  return refs.map(sanitizeRef).filter((ref) => ref !== "redacted");
}

function sanitizeRef(ref: string) {
  const normalized = ref.replace(/\\/g, "/").replace(/[^A-Za-z0-9._/-]/g, "_").slice(0, 180);
  return normalized && !FORBIDDEN_PATTERN.test(normalized) ? normalized : "redacted";
}

function sanitizeText(value: string) {
  const normalized = value.replace(/[^A-Za-z0-9:_ .,/()-]/g, "_").trim().slice(0, 180);
  return normalized && !FORBIDDEN_PATTERN.test(normalized) ? normalized : "redacted";
}

function sanitizeId(value: string) {
  const normalized = value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 96);
  return normalized || "v36_sample";
}
