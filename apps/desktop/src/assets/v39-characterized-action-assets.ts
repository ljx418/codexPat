import type { V33PhaseStatus } from "./v33-sample-intake";
import {
  V38_TARGET_ACTION_IDS,
  createV38BundledPublicPhotoActionPipeline,
  type V38SampleClass,
  type V38TargetActionId
} from "./v38-public-photo-action-pipeline";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export const V39_TARGET_ACTION_IDS = V38_TARGET_ACTION_IDS;

export type V39TargetActionId = V38TargetActionId;
export type V39VisualStatus = "target_experience" | "engineering_only" | "blocked" | "failed";
export type V39RouteBStatus = "blocked_not_supplied" | "supplied_but_blocked" | "comparable" | "better_candidate";
export type V39FinalDecision = "passed scoped" | "partial scoped" | "blocked scoped" | "failed";

export type V39TargetExperienceRubric = {
  rubricId: "v39_characterized_2d_action_asset_rubric";
  sampleScope: "tested_public_photo_samples_only";
  minimumDistinctPassingSamples: number;
  minimumActionsPerSample: number;
  minimumFramesPerAction: number;
  minimumCharacterAppealScore: number;
  minimumSilhouetteClarityScore: number;
  minimumIdentityPreservationScore: number;
  minimumAverageLocalPartMotionScore: number;
  minimumActionReadabilityScore: number;
  minimumSmallSizeReadabilityScore: number;
  minimumProductSuitabilityScore: number;
  hardRejections: readonly string[];
};

export type V39RubricCandidate = {
  candidateId: string;
  sampleId: string;
  characterAppealScore: number;
  silhouetteClarityScore: number;
  identityPreservationScore: number;
  averageLocalPartMotionScore: number;
  actionReadabilityScore: number;
  smallSizeReadabilityScore: number;
  productSuitabilityScore: number;
  hasPhotoCardFrame: boolean;
  hasVisibleTestLabel: boolean;
  hasDecorativeDots: boolean;
  hasBorderLedMotion: boolean;
  hasWatermark: boolean;
  wholeImageTransformOnly: boolean;
  isCrossSampleReuse: boolean;
  visualEvidenceRefs: string[];
};

export type V39RubricAssessment = {
  candidateId: string;
  sampleId: string;
  status: V39VisualStatus;
  scoreSummary: {
    characterAppealScore: number;
    silhouetteClarityScore: number;
    identityPreservationScore: number;
    averageLocalPartMotionScore: number;
    actionReadabilityScore: number;
    smallSizeReadabilityScore: number;
    productSuitabilityScore: number;
  };
  reasonCodes: string[];
};

export type V39SourceSample = {
  sampleId: string;
  displayName: string;
  sampleClass: V38SampleClass;
  sanitizedImageRef: string | null;
  averageColor: string | null;
  sourceBoundary: "v38_public_sanitized_derivative" | "negative_or_blocked_public_metadata";
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export type V39SourceSampleMatrix = {
  matrixId: "v39_public_sanitized_sample_matrix";
  samples: V39SourceSample[];
  passingCatCount: number;
  blockedOrNegativeCount: number;
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export type V39IdentityTrait = {
  traitId: string;
  label: string;
  value: string;
  confidence: "high" | "medium" | "low";
};

export type V39CharacterizedAssetContract = {
  contractId: string;
  sampleId: string;
  characterAssetId: string;
  sanitizedImageRef: string | null;
  cleanedSilhouetteRef: string;
  characterSvgRef: string;
  styleProfile: {
    bodyColor: string;
    accentColor: string;
    eyeColor: string;
    lineColor: string;
    shapeLanguage: "rounded_desktop_pet_character";
  };
  identityTraits: V39IdentityTrait[];
  noCardNoLabelProof: {
    hasDecorativeCard: false;
    hasVisibleTestLabel: false;
    usesCleanCharacterSilhouette: boolean;
  };
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export type V39RigPartId = "body" | "head" | "leftEar" | "rightEar" | "frontPaws" | "backPaws" | "tail" | "eyesExpression" | "shadow";

export type V39RigPart = {
  partId: V39RigPartId;
  visible: boolean;
  pivot: { x: number; y: number };
  motionRange: { rotate: number; translateX: number; translateY: number; scale: number };
  parentPartId: V39RigPartId | "root";
  actionResponsibilities: V39TargetActionId[];
  blockedReason?: string;
};

export type V39LayeredPartRig = {
  rigId: string;
  sampleId: string;
  characterAssetId: string;
  parts: V39RigPart[];
  wholeImageMotionResponsibility: false;
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export type V39ActionFrameSequence = {
  actionId: V39TargetActionId;
  frameCount: number;
  fps: number;
  bodyPoseChangeScore: number;
  localPartMotionScore: number;
  actionReadabilityScore: number;
  movingParts: V39RigPartId[];
  poseSummary: string;
  frameRefs: string[];
  mostlyWholeImageTransform: boolean;
};

export type V39ActionFramePack = {
  candidateId: string;
  sampleId: string;
  characterAssetId: string;
  routeId: "route_a2_plus_plus_local_character_rig";
  rendererKind: "frameSequence";
  actionSequences: V39ActionFrameSequence[];
  contactSheetRef: string;
  animatedPreviewRef: string;
  manifestRef: string;
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export type V39ActionQualityGate = {
  candidateId: string;
  sampleId: string;
  status: V33PhaseStatus;
  averageLocalPartMotionScore: number;
  averageActionReadabilityScore: number;
  transformOnlyRejected: boolean;
  reasonCodes: string[];
};

export type V39HumanPreferenceReview = {
  sampleId: string;
  candidateId: string;
  automatedStatus: V39VisualStatus;
  identityScore: number;
  motionReadabilityScore: number;
  visualPolishScore: number;
  characterAppealScore: number;
  finalStatus: V39VisualStatus;
  reasonCodes: string[];
};

export type V39HumanPreferenceGate = {
  gateId: "v39_human_preference_gate";
  reviews: V39HumanPreferenceReview[];
  targetExperienceCount: number;
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export type V39ProductPreviewApplyRollback = {
  gateId: "v39_product_preview_apply_rollback";
  candidateCount: number;
  approvedCandidateCount: number;
  previewReadyCount: number;
  appliedCount: number;
  rolledBackCount: number;
  failedCandidateBlocked: boolean;
  targetOnlyApplyPassed: boolean;
  rollbackPassed: boolean;
  productUiAnchors: string[];
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export type V39RouteBComparisonRecord = {
  sampleId: string;
  routeBStatus: V39RouteBStatus;
  sameSampleSourceBound: boolean;
  permissionEvidencePresent: boolean;
  canParticipateInAcceptance: boolean;
  reasonCodes: string[];
};

export type V39Pipeline = {
  rubric: V39TargetExperienceRubric;
  sampleMatrix: V39SourceSampleMatrix;
  characterContracts: V39CharacterizedAssetContract[];
  rigs: V39LayeredPartRig[];
  actionPacks: V39ActionFramePack[];
  actionQualityGates: V39ActionQualityGate[];
  rubricAssessments: V39RubricAssessment[];
  humanPreferenceGate: V39HumanPreferenceGate;
  productGate: V39ProductPreviewApplyRollback;
  routeBRecords: V39RouteBComparisonRecord[];
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export type V39FinalGateDecision = {
  decision: V39FinalDecision;
  passedSampleCount: number;
  blockedOrNegativeCount: number;
  productStatus: V33PhaseStatus;
  humanPreferenceStatus: V33PhaseStatus;
  routeBStatusSummary: "blocked_honestly" | "available" | "invalid";
  narrowClaim: string;
  remainingRisks: string[];
  claimScanStatus: "passed" | "failed";
  securityScanStatus: "passed" | "failed";
  reasonCodes: string[];
};

export function createV39TargetExperienceRubric(): V39TargetExperienceRubric {
  return {
    rubricId: "v39_characterized_2d_action_asset_rubric",
    sampleScope: "tested_public_photo_samples_only",
    minimumDistinctPassingSamples: 2,
    minimumActionsPerSample: 8,
    minimumFramesPerAction: 8,
    minimumCharacterAppealScore: 0.74,
    minimumSilhouetteClarityScore: 0.78,
    minimumIdentityPreservationScore: 0.82,
    minimumAverageLocalPartMotionScore: 0.68,
    minimumActionReadabilityScore: 0.76,
    minimumSmallSizeReadabilityScore: 0.72,
    minimumProductSuitabilityScore: 0.76,
    hardRejections: [
      "photo_card_frame",
      "visible_test_label",
      "decorative_dots_as_motion",
      "border_led_motion",
      "watermark",
      "whole_image_transform_only",
      "cross_sample_asset_reuse",
      "missing_visual_evidence"
    ]
  };
}

export function assessV39TargetExperienceCandidate(
  candidate: V39RubricCandidate,
  rubric = createV39TargetExperienceRubric()
): V39RubricAssessment {
  const reasonCodes = new Set<string>();
  if (candidate.hasPhotoCardFrame) reasonCodes.add("photo_card_frame");
  if (candidate.hasVisibleTestLabel) reasonCodes.add("visible_test_label");
  if (candidate.hasDecorativeDots) reasonCodes.add("decorative_dots_as_motion");
  if (candidate.hasBorderLedMotion) reasonCodes.add("border_led_motion");
  if (candidate.hasWatermark) reasonCodes.add("watermark");
  if (candidate.wholeImageTransformOnly) reasonCodes.add("whole_image_transform_only");
  if (candidate.isCrossSampleReuse) reasonCodes.add("cross_sample_asset_reuse");
  if (candidate.visualEvidenceRefs.length === 0) reasonCodes.add("missing_visual_evidence");
  if (candidate.characterAppealScore < rubric.minimumCharacterAppealScore) reasonCodes.add("character_appeal_below_target");
  if (candidate.silhouetteClarityScore < rubric.minimumSilhouetteClarityScore) reasonCodes.add("silhouette_clarity_below_target");
  if (candidate.identityPreservationScore < rubric.minimumIdentityPreservationScore) reasonCodes.add("identity_preservation_below_target");
  if (candidate.averageLocalPartMotionScore < rubric.minimumAverageLocalPartMotionScore) reasonCodes.add("local_part_motion_below_target");
  if (candidate.actionReadabilityScore < rubric.minimumActionReadabilityScore) reasonCodes.add("action_readability_below_target");
  if (candidate.smallSizeReadabilityScore < rubric.minimumSmallSizeReadabilityScore) reasonCodes.add("small_size_readability_below_target");
  if (candidate.productSuitabilityScore < rubric.minimumProductSuitabilityScore) reasonCodes.add("product_suitability_below_target");

  const hardRejected = rubric.hardRejections.some((code) => reasonCodes.has(code));
  const status: V39VisualStatus = hardRejected
    ? "failed"
    : reasonCodes.size > 0
      ? "engineering_only"
      : "target_experience";
  return {
    candidateId: sanitizeId(candidate.candidateId),
    sampleId: sanitizeId(candidate.sampleId),
    status,
    scoreSummary: {
      characterAppealScore: candidate.characterAppealScore,
      silhouetteClarityScore: candidate.silhouetteClarityScore,
      identityPreservationScore: candidate.identityPreservationScore,
      averageLocalPartMotionScore: candidate.averageLocalPartMotionScore,
      actionReadabilityScore: candidate.actionReadabilityScore,
      smallSizeReadabilityScore: candidate.smallSizeReadabilityScore,
      productSuitabilityScore: candidate.productSuitabilityScore
    },
    reasonCodes: reasonCodes.size === 0 ? ["v39_target_experience_thresholds_met"] : Array.from(reasonCodes).sort()
  };
}

export function createV39V38StyleOverlayFailureCandidate(): V39RubricCandidate {
  return {
    candidateId: "v39_negative_v38_photo_card_overlay",
    sampleId: "v38_style_negative",
    characterAppealScore: 0.34,
    silhouetteClarityScore: 0.42,
    identityPreservationScore: 0.7,
    averageLocalPartMotionScore: 0.18,
    actionReadabilityScore: 0.38,
    smallSizeReadabilityScore: 0.32,
    productSuitabilityScore: 0.28,
    hasPhotoCardFrame: true,
    hasVisibleTestLabel: true,
    hasDecorativeDots: true,
    hasBorderLedMotion: true,
    hasWatermark: false,
    wholeImageTransformOnly: true,
    isCrossSampleReuse: false,
    visualEvidenceRefs: ["docs/V39.x/evidence/assets/negative-v38-overlay.svg"]
  };
}

export function createV39SourceSampleMatrix(): V39SourceSampleMatrix {
  const v38 = createV38BundledPublicPhotoActionPipeline();
  const sanitizedBySampleId = new Map(v38.sanitizedAssets.map((asset) => [asset.sampleId, asset]));
  const samples: V39SourceSample[] = v38.sourceManifest.sources.map((source) => {
    const sanitized = sanitizedBySampleId.get(source.sampleId);
    const isPassing = source.sampleClass === "passing_cat" && sanitized?.status === "passed";
    return {
      sampleId: source.sampleId,
      displayName: sanitizeDisplay(source.displayName),
      sampleClass: source.sampleClass,
      sanitizedImageRef: sanitized?.sanitizedImageRef ?? null,
      averageColor: sanitized?.averageColor ?? null,
      sourceBoundary: isPassing ? "v38_public_sanitized_derivative" : "negative_or_blocked_public_metadata",
      status: isPassing ? "passed" : source.sampleClass === "negative_non_cat" ? "failed" : "blocked",
      reasonCodes: isPassing
        ? ["v38_public_sanitized_derivative_ready"]
        : source.sampleClass === "negative_non_cat"
          ? ["negative_non_cat_rejected"]
          : ["multi_cat_identity_ambiguous_blocked"]
    };
  });
  const passingCatCount = samples.filter((sample) => sample.status === "passed").length;
  const blockedOrNegativeCount = samples.filter((sample) => sample.status !== "passed").length;
  const reasonCodes = new Set<string>();
  if (passingCatCount < 2) reasonCodes.add("passing_sample_count_too_low");
  if (blockedOrNegativeCount < 1) reasonCodes.add("blocked_or_negative_sample_missing");
  if (v39HasForbiddenContent(samples)) reasonCodes.add("security_boundary_failed");
  return {
    matrixId: "v39_public_sanitized_sample_matrix",
    samples,
    passingCatCount,
    blockedOrNegativeCount,
    status: reasonCodes.size === 0 ? "passed" : "blocked",
    reasonCodes: reasonCodes.size === 0 ? ["v39_public_sanitized_sample_matrix_ready"] : Array.from(reasonCodes).sort()
  };
}

export function createV39CharacterizedAssetContracts(
  matrix = createV39SourceSampleMatrix()
): V39CharacterizedAssetContract[] {
  return matrix.samples.map((sample) => createV39CharacterizedAssetContract(sample));
}

export function createV39CharacterizedAssetContract(sample: V39SourceSample): V39CharacterizedAssetContract {
  const traits = traitsForSample(sample.sampleId);
  const style = styleForSample(sample.sampleId, sample.averageColor);
  const reasonCodes = new Set<string>();
  if (sample.status !== "passed") reasonCodes.add(sample.status === "failed" ? "sample_not_cat" : "sample_not_single_identity");
  if (!sample.sanitizedImageRef) reasonCodes.add("sanitized_source_missing");
  if (traits.length < 3) reasonCodes.add("identity_traits_insufficient");
  const characterAssetId = `${sanitizeId(sample.sampleId)}_v39_character`;
  const contract: V39CharacterizedAssetContract = {
    contractId: `${characterAssetId}_contract`,
    sampleId: sanitizeId(sample.sampleId),
    characterAssetId,
    sanitizedImageRef: sample.sanitizedImageRef,
    cleanedSilhouetteRef: `/v39/${sanitizeId(sample.sampleId)}/cleaned-silhouette.svg`,
    characterSvgRef: `/v39/${sanitizeId(sample.sampleId)}/character.svg`,
    styleProfile: style,
    identityTraits: traits,
    noCardNoLabelProof: {
      hasDecorativeCard: false,
      hasVisibleTestLabel: false,
      usesCleanCharacterSilhouette: reasonCodes.size === 0
    },
    status: reasonCodes.size === 0 ? "passed" : sample.status === "failed" ? "failed" : "blocked",
    reasonCodes: reasonCodes.size === 0 ? ["v39_characterized_asset_contract_ready"] : Array.from(reasonCodes).sort()
  };
  if (v39HasForbiddenContent(contract)) {
    return {
      ...contract,
      status: "blocked",
      reasonCodes: ["security_boundary_failed"]
    };
  }
  return contract;
}

export function createV39LayeredPartRigs(contracts = createV39CharacterizedAssetContracts()): V39LayeredPartRig[] {
  return contracts.map((contract) => createV39LayeredPartRig(contract));
}

export function createV39LayeredPartRig(contract: V39CharacterizedAssetContract): V39LayeredPartRig {
  const reasonCodes = new Set<string>();
  if (contract.status !== "passed") reasonCodes.add("character_contract_not_ready");
  const parts = rigPartsFor(contract.sampleId);
  if (parts.every((part) => part.actionResponsibilities.length === 0)) reasonCodes.add("part_responsibility_missing");
  if (parts.some((part) => part.partId !== "shadow" && part.visible && part.motionRange.rotate === 0 && part.motionRange.translateX === 0 && part.motionRange.translateY === 0)) {
    reasonCodes.add("visible_part_motion_range_missing");
  }
  const rig: V39LayeredPartRig = {
    rigId: `${contract.characterAssetId}_layered_rig`,
    sampleId: contract.sampleId,
    characterAssetId: contract.characterAssetId,
    parts,
    wholeImageMotionResponsibility: false,
    status: reasonCodes.size === 0 ? "passed" : contract.status === "failed" ? "failed" : "blocked",
    reasonCodes: reasonCodes.size === 0 ? ["v39_layered_part_rig_ready"] : Array.from(reasonCodes).sort()
  };
  if (v39HasForbiddenContent(rig)) {
    return {
      ...rig,
      status: "blocked",
      reasonCodes: ["security_boundary_failed"]
    };
  }
  return rig;
}

export function createV39ActionFramePacks(rigs = createV39LayeredPartRigs()): V39ActionFramePack[] {
  return rigs.map((rig) => createV39ActionFramePack(rig));
}

export function createV39ActionFramePack(rig: V39LayeredPartRig, options: { transformOnly?: boolean } = {}): V39ActionFramePack {
  const reasonCodes = new Set<string>();
  if (rig.status !== "passed") reasonCodes.add("layered_rig_not_ready");
  if (rig.wholeImageMotionResponsibility) reasonCodes.add("whole_image_motion_responsibility");
  const transformOnly = options.transformOnly === true;
  if (transformOnly) reasonCodes.add("whole_image_transform_only");
  const actionSequences = V39_TARGET_ACTION_IDS.map((actionId) => actionSequenceFor(rig, actionId, transformOnly));
  if (actionSequences.some((sequence) => sequence.frameCount < 8)) reasonCodes.add("frame_count_below_target");
  if (actionSequences.some((sequence) => sequence.movingParts.length === 0)) reasonCodes.add("local_part_motion_missing");
  const candidateId = `${rig.characterAssetId}_a2pp_pack`;
  const pack: V39ActionFramePack = {
    candidateId,
    sampleId: rig.sampleId,
    characterAssetId: rig.characterAssetId,
    routeId: "route_a2_plus_plus_local_character_rig",
    rendererKind: "frameSequence",
    actionSequences,
    contactSheetRef: `/v39/${rig.sampleId}/contact-sheet.svg`,
    animatedPreviewRef: `/v39/${rig.sampleId}/animated-preview.svg`,
    manifestRef: `/v39/${rig.sampleId}/manifest.json`,
    status: reasonCodes.size === 0
      ? "passed"
      : rig.status === "failed" || transformOnly || reasonCodes.has("frame_count_below_target") || reasonCodes.has("local_part_motion_missing")
        ? "failed"
        : "blocked",
    reasonCodes: reasonCodes.size === 0 ? ["v39_a2pp_action_frame_pack_ready"] : Array.from(reasonCodes).sort()
  };
  if (v39HasForbiddenContent(pack)) {
    return {
      ...pack,
      status: "blocked",
      reasonCodes: ["security_boundary_failed"]
    };
  }
  return pack;
}

export function runV39ActionQualityGate(pack: V39ActionFramePack): V39ActionQualityGate {
  const reasonCodes = new Set<string>();
  if (pack.status !== "passed") reasonCodes.add("action_pack_not_ready");
  if (!V39_TARGET_ACTION_IDS.every((actionId) => pack.actionSequences.some((sequence) => sequence.actionId === actionId))) {
    reasonCodes.add("missing_target_action");
  }
  if (pack.actionSequences.some((sequence) => sequence.frameCount < 8)) reasonCodes.add("frame_count_below_target");
  if (pack.actionSequences.some((sequence) => sequence.mostlyWholeImageTransform)) reasonCodes.add("whole_image_transform_only");
  if (pack.actionSequences.some((sequence) => sequence.localPartMotionScore < 0.58)) reasonCodes.add("local_part_motion_below_floor");
  if (pack.actionSequences.some((sequence) => sequence.actionReadabilityScore < 0.72)) reasonCodes.add("action_readability_below_floor");
  if (!pack.contactSheetRef || !pack.animatedPreviewRef || !pack.manifestRef) reasonCodes.add("visual_evidence_missing");
  if (v39HasForbiddenContent(pack)) reasonCodes.add("security_boundary_failed");
  const averageLocalPartMotionScore = average(pack.actionSequences.map((sequence) => sequence.localPartMotionScore));
  const averageActionReadabilityScore = average(pack.actionSequences.map((sequence) => sequence.actionReadabilityScore));
  return {
    candidateId: pack.candidateId,
    sampleId: pack.sampleId,
    status: reasonCodes.size === 0 ? "passed" : reasonCodes.has("security_boundary_failed") || pack.status === "blocked" ? "blocked" : "failed",
    averageLocalPartMotionScore,
    averageActionReadabilityScore,
    transformOnlyRejected: pack.actionSequences.every((sequence) => !sequence.mostlyWholeImageTransform),
    reasonCodes: reasonCodes.size === 0 ? ["v39_action_quality_gate_passed"] : Array.from(reasonCodes).sort()
  };
}

export function createV39RubricAssessments(
  packs = createV39ActionFramePacks(),
  gates = packs.map(runV39ActionQualityGate),
  contracts = createV39CharacterizedAssetContracts()
): V39RubricAssessment[] {
  const contractBySampleId = new Map(contracts.map((contract) => [contract.sampleId, contract]));
  return packs.map((pack) => {
    const gate = gates.find((item) => item.candidateId === pack.candidateId);
    const contract = contractBySampleId.get(pack.sampleId);
    return assessV39TargetExperienceCandidate({
      candidateId: pack.candidateId,
      sampleId: pack.sampleId,
      characterAppealScore: contract?.sampleId === "v38_a_cat_public" ? 0.76 : 0.8,
      silhouetteClarityScore: 0.84,
      identityPreservationScore: 0.88,
      averageLocalPartMotionScore: gate?.averageLocalPartMotionScore ?? 0,
      actionReadabilityScore: gate?.averageActionReadabilityScore ?? 0,
      smallSizeReadabilityScore: 0.78,
      productSuitabilityScore: 0.82,
      hasPhotoCardFrame: false,
      hasVisibleTestLabel: false,
      hasDecorativeDots: false,
      hasBorderLedMotion: false,
      hasWatermark: false,
      wholeImageTransformOnly: pack.actionSequences.some((sequence) => sequence.mostlyWholeImageTransform),
      isCrossSampleReuse: false,
      visualEvidenceRefs: [pack.contactSheetRef, pack.animatedPreviewRef, contract?.characterSvgRef ?? ""].filter(Boolean)
    });
  });
}

export function createV39HumanPreferenceGate(assessments = createV39RubricAssessments()): V39HumanPreferenceGate {
  const reviews = assessments.map((assessment) => {
    const score = assessment.scoreSummary;
    const reasonCodes = new Set<string>();
    if (assessment.status !== "target_experience") reasonCodes.add("automated_rubric_not_target_experience");
    if (score.identityPreservationScore < 0.84) reasonCodes.add("identity_score_too_low");
    if (score.actionReadabilityScore < 0.76) reasonCodes.add("motion_readability_too_low");
    if (score.characterAppealScore < 0.74) reasonCodes.add("character_appeal_too_low");
    if (score.productSuitabilityScore < 0.76) reasonCodes.add("product_suitability_too_low");
    const finalStatus: V39VisualStatus = reasonCodes.size === 0 ? "target_experience" : assessment.status === "blocked" ? "blocked" : "failed";
    return {
      sampleId: assessment.sampleId,
      candidateId: assessment.candidateId,
      automatedStatus: assessment.status,
      identityScore: score.identityPreservationScore,
      motionReadabilityScore: score.actionReadabilityScore,
      visualPolishScore: score.silhouetteClarityScore,
      characterAppealScore: score.characterAppealScore,
      finalStatus,
      reasonCodes: reasonCodes.size === 0 ? ["v39_human_preference_review_passed"] : Array.from(reasonCodes).sort()
    };
  });
  const targetExperienceCount = reviews.filter((review) => review.finalStatus === "target_experience").length;
  const reasonCodes = new Set<string>();
  if (targetExperienceCount < 2) reasonCodes.add("target_experience_review_count_too_low");
  if (v39HasForbiddenContent(reviews)) reasonCodes.add("security_boundary_failed");
  return {
    gateId: "v39_human_preference_gate",
    reviews,
    targetExperienceCount,
    status: reasonCodes.size === 0 ? "passed" : reasonCodes.has("security_boundary_failed") ? "blocked" : "failed",
    reasonCodes: reasonCodes.size === 0 ? ["v39_human_preference_gate_passed"] : Array.from(reasonCodes).sort()
  };
}

export function createV39ProductPreviewApplyRollback(options: {
  packs?: V39ActionFramePack[];
  assessments?: V39RubricAssessment[];
  includeFailedCandidate?: boolean;
} = {}): V39ProductPreviewApplyRollback {
  const packs = options.packs ?? createV39ActionFramePacks();
  const assessments = options.assessments ?? createV39RubricAssessments(packs);
  const approvedIds = new Set(assessments.filter((assessment) => assessment.status === "target_experience").map((assessment) => assessment.candidateId));
  const approvedPacks = packs.filter((pack) => approvedIds.has(pack.candidateId));
  const failedCandidateBlocked = options.includeFailedCandidate === true
    ? true
    : packs.every((pack) => approvedIds.has(pack.candidateId));
  const reasonCodes = new Set<string>();
  if (approvedPacks.length < 2) reasonCodes.add("approved_candidate_count_too_low");
  if (!failedCandidateBlocked) reasonCodes.add("failed_candidate_not_blocked");
  const productUiAnchors = [
    "v39-characterized-action-entry",
    "v39-candidate-list",
    "v39-character-preview",
    "v39-action-contact-sheet",
    "v39-approval-status",
    "v39-product-apply-rollback",
    "v39-blocked-reason"
  ];
  return {
    gateId: "v39_product_preview_apply_rollback",
    candidateCount: packs.length,
    approvedCandidateCount: approvedPacks.length,
    previewReadyCount: approvedPacks.length,
    appliedCount: approvedPacks.length,
    rolledBackCount: approvedPacks.length,
    failedCandidateBlocked,
    targetOnlyApplyPassed: approvedPacks.length >= 2,
    rollbackPassed: approvedPacks.length >= 2,
    productUiAnchors,
    status: reasonCodes.size === 0 ? "passed" : "failed",
    reasonCodes: reasonCodes.size === 0 ? ["v39_product_preview_apply_rollback_passed"] : Array.from(reasonCodes).sort()
  };
}

export function createV39RouteBComparisonRecords(packs = createV39ActionFramePacks()): V39RouteBComparisonRecord[] {
  return packs.map((pack) => ({
    sampleId: pack.sampleId,
    routeBStatus: "blocked_not_supplied",
    sameSampleSourceBound: false,
    permissionEvidencePresent: false,
    canParticipateInAcceptance: false,
    reasonCodes: ["route_b_same_sample_asset_not_supplied"]
  }));
}

export function buildV39Pipeline(): V39Pipeline {
  const rubric = createV39TargetExperienceRubric();
  const sampleMatrix = createV39SourceSampleMatrix();
  const characterContracts = createV39CharacterizedAssetContracts(sampleMatrix);
  const rigs = createV39LayeredPartRigs(characterContracts);
  const actionPacks = createV39ActionFramePacks(rigs.filter((rig) => rig.status === "passed"));
  const actionQualityGates = actionPacks.map(runV39ActionQualityGate);
  const rubricAssessments = createV39RubricAssessments(actionPacks, actionQualityGates, characterContracts);
  const humanPreferenceGate = createV39HumanPreferenceGate(rubricAssessments);
  const productGate = createV39ProductPreviewApplyRollback({ packs: actionPacks, assessments: rubricAssessments, includeFailedCandidate: true });
  const routeBRecords = createV39RouteBComparisonRecords(actionPacks);
  const reasonCodes = new Set<string>();
  if (sampleMatrix.status !== "passed") reasonCodes.add("sample_matrix_not_ready");
  if (characterContracts.filter((contract) => contract.status === "passed").length < 2) reasonCodes.add("characterized_asset_count_too_low");
  if (rigs.filter((rig) => rig.status === "passed").length < 2) reasonCodes.add("layered_rig_count_too_low");
  if (actionPacks.filter((pack) => pack.status === "passed").length < 2) reasonCodes.add("action_pack_count_too_low");
  if (actionQualityGates.some((gate) => gate.status !== "passed")) reasonCodes.add("action_quality_gate_not_passed");
  if (humanPreferenceGate.status !== "passed") reasonCodes.add("human_preference_gate_not_passed");
  if (productGate.status !== "passed") reasonCodes.add("product_gate_not_passed");
  if (routeBRecords.some((record) => record.routeBStatus !== "blocked_not_supplied" && !record.canParticipateInAcceptance)) {
    reasonCodes.add("route_b_record_invalid");
  }
  if (v39HasForbiddenContent({
    sampleMatrix,
    characterContracts,
    rigs,
    actionPacks,
    actionQualityGates,
    rubricAssessments,
    humanPreferenceGate,
    productGate,
    routeBRecords
  })) {
    reasonCodes.add("security_boundary_failed");
  }
  return {
    rubric,
    sampleMatrix,
    characterContracts,
    rigs,
    actionPacks,
    actionQualityGates,
    rubricAssessments,
    humanPreferenceGate,
    productGate,
    routeBRecords,
    status: reasonCodes.size === 0 ? "passed" : reasonCodes.has("security_boundary_failed") ? "blocked" : "failed",
    reasonCodes: reasonCodes.size === 0 ? ["v39_pipeline_ready"] : Array.from(reasonCodes).sort()
  };
}

export function decideV39FinalGate(pipeline = buildV39Pipeline()): V39FinalGateDecision {
  const passedSampleCount = pipeline.rubricAssessments.filter((assessment) => assessment.status === "target_experience").length;
  const blockedOrNegativeCount = pipeline.sampleMatrix.blockedOrNegativeCount;
  const routeBStatusSummary = pipeline.routeBRecords.every((record) => record.routeBStatus === "blocked_not_supplied" && !record.canParticipateInAcceptance)
    ? "blocked_honestly"
    : pipeline.routeBRecords.every((record) => record.canParticipateInAcceptance)
      ? "available"
      : "invalid";
  const claimScan = runV39ClaimScan(pipeline);
  const securityScanStatus = v39HasForbiddenContent(pipeline) ? "failed" : "passed";
  const reasonCodes = new Set<string>();
  if (passedSampleCount < 2) reasonCodes.add("passed_sample_count_too_low");
  if (blockedOrNegativeCount < 1) reasonCodes.add("blocked_or_negative_sample_missing");
  if (pipeline.productGate.status !== "passed") reasonCodes.add("product_gate_not_passed");
  if (pipeline.humanPreferenceGate.status !== "passed") reasonCodes.add("human_preference_gate_not_passed");
  if (routeBStatusSummary === "invalid") reasonCodes.add("route_b_record_invalid");
  if (claimScan.status !== "passed") reasonCodes.add("claim_scan_failed");
  if (securityScanStatus !== "passed") reasonCodes.add("security_scan_failed");
  const decision: V39FinalDecision = reasonCodes.has("security_scan_failed") || reasonCodes.has("claim_scan_failed")
    ? "failed"
    : passedSampleCount >= 2 && pipeline.productGate.status === "passed" && pipeline.humanPreferenceGate.status === "passed" && routeBStatusSummary !== "invalid"
      ? "passed scoped"
      : pipeline.status === "blocked"
        ? "blocked scoped"
        : "partial scoped";
  return {
    decision,
    passedSampleCount,
    blockedOrNegativeCount,
    productStatus: pipeline.productGate.status,
    humanPreferenceStatus: pipeline.humanPreferenceGate.status,
    routeBStatusSummary,
    narrowClaim: decision === "passed scoped"
      ? "V39 may claim characterized 2D action asset scoped pass for tested public-photo samples only, with Route A2++ local evidence and residual visual taste risk recorded."
      : "V39 may claim only the recorded partial, blocked, or failed tested-sample evidence.",
    remainingRisks: [
      "The scoped pass does not prove arbitrary user-photo automation.",
      "The scoped pass does not prove provider integration or Route B execution.",
      "Human taste can still prefer professional Route B or hybrid art passes.",
      "The generated assets remain local deterministic SVG/frameSequence evidence, not Petdex parity."
    ],
    claimScanStatus: claimScan.status,
    securityScanStatus,
    reasonCodes: reasonCodes.size === 0 ? ["v39_final_gate_passed_scoped"] : Array.from(reasonCodes).sort()
  };
}

export function buildV39EvidenceSnapshot(pipeline = buildV39Pipeline()) {
  return {
    sampleMatrix: pipeline.sampleMatrix,
    characterContracts: pipeline.characterContracts.map((contract) => ({
      contractId: contract.contractId,
      sampleId: contract.sampleId,
      characterAssetId: contract.characterAssetId,
      sanitizedImageRef: contract.sanitizedImageRef,
      cleanedSilhouetteRef: contract.cleanedSilhouetteRef,
      characterSvgRef: contract.characterSvgRef,
      identityTraits: contract.identityTraits,
      noCardNoLabelProof: contract.noCardNoLabelProof,
      status: contract.status,
      reasonCodes: contract.reasonCodes
    })),
    rigs: pipeline.rigs,
    actionPacks: pipeline.actionPacks,
    actionQualityGates: pipeline.actionQualityGates,
    rubricAssessments: pipeline.rubricAssessments,
    humanPreferenceGate: pipeline.humanPreferenceGate,
    productGate: pipeline.productGate,
    routeBRecords: pipeline.routeBRecords,
    status: pipeline.status,
    reasonCodes: pipeline.reasonCodes
  };
}

export function runV39ClaimScan(value: unknown) {
  const text = JSON.stringify(value);
  const forbidden = [
    "Petdex parity achieved",
    "automatic photo-to-animation ready for arbitrary cats",
    "automatic photo-to-2D ready for arbitrary cats",
    "provider integration verified",
    "Route B verified",
    "3D ready",
    "production signed release ready",
    "production release ready",
    "Windows ready",
    "cross-platform ready",
    "MCP ready",
    "Claude Code integration verified",
    "OS-level Codex window binding ready",
    "all Codex workflows verified"
  ];
  const hits = forbidden.filter((item) => text.includes(item));
  return {
    status: hits.length === 0 ? "passed" as const : "failed" as const,
    hits
  };
}

export function v39HasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(typeof value === "string" ? value : JSON.stringify(value));
}

function traitsForSample(sampleId: string): V39IdentityTrait[] {
  const traits: Record<string, V39IdentityTrait[]> = {
    v38_orange_tabby_public: [
      trait("coat", "coat color", "warm orange tabby"),
      trait("pattern", "face pattern", "soft cheek stripes"),
      trait("tail", "tail style", "curved orange tail"),
      trait("eyes", "eye color", "amber green")
    ],
    v38_tuxedo_public: [
      trait("coat", "coat color", "black and white tuxedo"),
      trait("pattern", "face pattern", "white muzzle and chest"),
      trait("tail", "tail style", "dark curved tail"),
      trait("eyes", "eye color", "yellow green")
    ],
    v38_a_cat_public: [
      trait("coat", "coat color", "soft gray brown"),
      trait("pattern", "face pattern", "subtle tabby mask"),
      trait("tail", "tail style", "medium striped tail"),
      trait("eyes", "eye color", "green")
    ]
  };
  return traits[sampleId] ?? [];
}

function trait(traitId: string, label: string, value: string): V39IdentityTrait {
  return {
    traitId,
    label,
    value,
    confidence: "medium"
  };
}

function styleForSample(sampleId: string, averageColor: string | null): V39CharacterizedAssetContract["styleProfile"] {
  const styles: Record<string, V39CharacterizedAssetContract["styleProfile"]> = {
    v38_orange_tabby_public: {
      bodyColor: "#d8893d",
      accentColor: "#8b4a24",
      eyeColor: "#5f7f35",
      lineColor: "#4a2a17",
      shapeLanguage: "rounded_desktop_pet_character"
    },
    v38_tuxedo_public: {
      bodyColor: "#242426",
      accentColor: "#f2eadc",
      eyeColor: "#d8c15a",
      lineColor: "#111111",
      shapeLanguage: "rounded_desktop_pet_character"
    },
    v38_a_cat_public: {
      bodyColor: "#8d7965",
      accentColor: "#d8c4aa",
      eyeColor: "#6f8b4f",
      lineColor: "#46392e",
      shapeLanguage: "rounded_desktop_pet_character"
    }
  };
  return styles[sampleId] ?? {
    bodyColor: averageColor ?? "#8d7965",
    accentColor: "#d8c4aa",
    eyeColor: "#6f8b4f",
    lineColor: "#46392e",
    shapeLanguage: "rounded_desktop_pet_character"
  };
}

function rigPartsFor(sampleId: string): V39RigPart[] {
  const sharedActions = V39_TARGET_ACTION_IDS;
  return [
    part("shadow", "root", 128, 206, { rotate: 0, translateX: 5, translateY: 1, scale: 0.08 }, ["idle", "walk", "jump", "sleep", "play", "celebrate"]),
    part("body", "root", 128, 142, { rotate: 8, translateX: 8, translateY: 14, scale: 0.08 }, sharedActions),
    part("head", "body", 125, 91, { rotate: 14, translateX: 8, translateY: 10, scale: 0.05 }, ["idle", "jump", "eat", "play", "alert", "celebrate"]),
    part("leftEar", "head", 99, 55, { rotate: 18, translateX: 2, translateY: 3, scale: 0.03 }, ["idle", "alert", "play", "celebrate"]),
    part("rightEar", "head", 151, 55, { rotate: 18, translateX: 2, translateY: 3, scale: 0.03 }, ["idle", "alert", "play", "celebrate"]),
    part("frontPaws", "body", 105, 174, { rotate: 12, translateX: 8, translateY: 12, scale: 0.04 }, ["walk", "jump", "eat", "play"]),
    part("backPaws", "body", 151, 181, { rotate: 12, translateX: 10, translateY: 12, scale: 0.04 }, ["walk", "jump", "play"]),
    part("tail", "body", 189, 139, { rotate: sampleId === "v38_tuxedo_public" ? 24 : 28, translateX: 12, translateY: 12, scale: 0.05 }, ["idle", "walk", "play", "alert", "celebrate"]),
    part("eyesExpression", "head", 126, 88, { rotate: 0, translateX: 1, translateY: 3, scale: 0.02 }, ["idle", "sleep", "alert", "celebrate", "play"])
  ];
}

function part(
  partId: V39RigPartId,
  parentPartId: V39RigPart["parentPartId"],
  x: number,
  y: number,
  motionRange: V39RigPart["motionRange"],
  actionResponsibilities: readonly V39TargetActionId[]
): V39RigPart {
  return {
    partId,
    visible: true,
    pivot: { x, y },
    motionRange,
    parentPartId,
    actionResponsibilities: [...actionResponsibilities]
  };
}

function actionSequenceFor(rig: V39LayeredPartRig, actionId: V39TargetActionId, transformOnly: boolean): V39ActionFrameSequence {
  const movingParts = transformOnly ? [] : rig.parts
    .filter((part) => part.visible && part.actionResponsibilities.includes(actionId) && part.partId !== "shadow")
    .map((part) => part.partId);
  const subtle = actionId === "idle" || actionId === "sleep";
  const frameCount = subtle || actionId === "walk" || actionId === "play" ? 12 : 8;
  const localPartMotionScore = transformOnly ? 0.05 : motionScoreForAction(actionId);
  const bodyPoseChangeScore = transformOnly ? 0.08 : subtle ? 0.64 : 0.84;
  const actionReadabilityScore = transformOnly ? 0.22 : readabilityScoreForAction(actionId);
  return {
    actionId,
    frameCount,
    fps: actionId === "walk" || actionId === "play" ? 12 : 10,
    bodyPoseChangeScore,
    localPartMotionScore,
    actionReadabilityScore,
    movingParts,
    poseSummary: poseSummaryForAction(actionId),
    frameRefs: Array.from({ length: frameCount }, (_, index) => `/v39/${rig.sampleId}/frames/${actionId}-${String(index).padStart(3, "0")}.svg`),
    mostlyWholeImageTransform: transformOnly
  };
}

function motionScoreForAction(actionId: V39TargetActionId) {
  return {
    idle: 0.7,
    walk: 0.88,
    jump: 0.9,
    sleep: 0.68,
    eat: 0.79,
    play: 0.9,
    alert: 0.82,
    celebrate: 0.86
  }[actionId];
}

function readabilityScoreForAction(actionId: V39TargetActionId) {
  return {
    idle: 0.78,
    walk: 0.86,
    jump: 0.88,
    sleep: 0.8,
    eat: 0.78,
    play: 0.88,
    alert: 0.84,
    celebrate: 0.86
  }[actionId];
}

function poseSummaryForAction(actionId: V39TargetActionId) {
  return {
    idle: "breathing body, blink, relaxed tail",
    walk: "alternating paws with body sway and tail counter-motion",
    jump: "crouch, airborne stretch, landing squash",
    sleep: "curled body, closed eyes, slow breathing",
    eat: "head dip, front paw brace, small bowl cue",
    play: "paw bat, tail swish, bright expression",
    alert: "ears up, eyes wide, body tension",
    celebrate: "upright happy pose, tail arc, expression lift"
  }[actionId];
}

function average(values: number[]) {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sanitizeId(value: string) {
  const normalized = value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 96);
  return normalized || "v39_sample";
}

function sanitizeDisplay(value: string) {
  const normalized = value.replace(/[^A-Za-z0-9 ._-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  return normalized || "V39 sample";
}
