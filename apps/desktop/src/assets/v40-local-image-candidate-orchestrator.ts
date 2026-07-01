import {
  V40_NO_WEBUI_ACTION_IDS,
  runV40NoWebUIClaimScan,
  runV40NoWebUISecurityScan,
  sanitizeV40NoWebUIRelativeRef,
  sanitizeV40NoWebUISafeId,
  type V40ContractScanResult,
  type V40NoWebUIActionId
} from "./v40-no-webui-workflow-contract";
import type { DirectDiffusersFrameRunner } from "./v40-direct-local-image-model";

export type V40PredevAuditDecision = "passed scoped" | "blocked" | "failed";
export type V40SampleKind = "tested_cat" | "negative_or_blocked";
export type V40SourceLicenseStatus = "usable" | "blocked" | "missing";

export type SourceAndLicenseRecord = {
  sampleId: string;
  sampleKind: V40SampleKind;
  sourceRef: string | null;
  baselineV39Ref: string | null;
  consentBoundary: "public_sample" | "explicit_local_user_sample";
  licenseStatus: V40SourceLicenseStatus;
  retentionRule: "safe_relative_refs_only";
  reasonCodes: string[];
};

export type SubjectMaskAndCropPlan = {
  sampleId: string;
  cropStrategy: "subject_centered_square_crop" | "blocked";
  maskStrategy: "subject_silhouette_or_alpha_hint" | "blocked";
  safePreviewRef: string | null;
  reasonCodes: string[];
};

export type IdentityAnchorPack = {
  sampleId: string;
  anchors: string[];
  sameCatRequirement: true;
  reasonCodes: string[];
};

export type ActionPoseConditionPack = {
  actionId: V40NoWebUIActionId;
  poseIntent: string;
  forbiddenFallback: "whole_image_transform";
  reasonCodes: string[];
};

export type ProductStateActionMapping = Record<
  "idle" | "thinking" | "running" | "success" | "warning" | "error" | "need_input" | "sleeping",
  V40NoWebUIActionId
>;

export type CandidateQualityReviewRubric = {
  rejectPhotoCardOutput: true;
  rejectIdentityDrift: true;
  rejectWeakActionSemantics: true;
  rejectUnsafeArtifacts: true;
  requireDesktopScaleReadability: true;
  requirePreferenceOverV39: true;
};

export type LocalImageCandidateOrchestratorInput = {
  selectedRoute: "new_direct_runner_route_allowed";
  samples: SourceAndLicenseRecord[];
  maskCropPlans: SubjectMaskAndCropPlan[];
  identityAnchorPacks: IdentityAnchorPack[];
  actionPoseConditionPacks: ActionPoseConditionPack[];
  actionNameMapping: ProductStateActionMapping;
  runner: DirectDiffusersFrameRunner;
  visualReviewRubric: CandidateQualityReviewRubric;
};

export type LocalImageCandidateOrchestrator = {
  orchestratorId: "v40_local_image_candidate_orchestrator";
  selectedRoute: "new_direct_runner_route_allowed";
  sampleMatrix: SourceAndLicenseRecord[];
  maskCropPlans: SubjectMaskAndCropPlan[];
  identityAnchorPacks: IdentityAnchorPack[];
  actionPoseConditionPacks: ActionPoseConditionPack[];
  actionNameMapping: ProductStateActionMapping;
  runner: DirectDiffusersFrameRunner;
  visualReviewRubric: CandidateQualityReviewRubric;
  generationMayStart: boolean;
  decision: V40PredevAuditDecision;
  claimScan: V40ContractScanResult;
  securityScan: V40ContractScanResult;
  reasonCodes: string[];
};

export const V40_DEFAULT_PRODUCT_STATE_ACTION_MAPPING: ProductStateActionMapping = {
  idle: "idle",
  thinking: "alert",
  running: "walk",
  success: "celebrate",
  warning: "alert",
  error: "alert",
  need_input: "alert",
  sleeping: "sleep"
};

export function createLocalImageCandidateOrchestrator(input: LocalImageCandidateOrchestratorInput): LocalImageCandidateOrchestrator {
  const reasonCodes = new Set<string>();
  const testedSamples = input.samples.filter((sample) => sample.sampleKind === "tested_cat");
  const blockedOrNegativeSamples = input.samples.filter((sample) => sample.sampleKind === "negative_or_blocked");

  if (input.selectedRoute !== "new_direct_runner_route_allowed") reasonCodes.add("selected_route_invalid");
  if (testedSamples.length < 2) reasonCodes.add("tested_cat_sample_count_insufficient");
  if (blockedOrNegativeSamples.length < 1) reasonCodes.add("blocked_or_negative_sample_missing");

  for (const sample of input.samples) validateSourceAndLicenseRecord(sample, reasonCodes);
  for (const sample of testedSamples) {
    if (!input.maskCropPlans.some((plan) => plan.sampleId === sample.sampleId && plan.cropStrategy !== "blocked" && plan.maskStrategy !== "blocked")) {
      reasonCodes.add("subject_mask_crop_plan_missing");
    }
    if (!input.identityAnchorPacks.some((pack) => pack.sampleId === sample.sampleId && pack.anchors.length >= 3)) {
      reasonCodes.add("identity_anchor_pack_missing");
    }
  }
  if (!sameActionSet(input.actionPoseConditionPacks.map((pack) => pack.actionId))) {
    reasonCodes.add("action_pose_condition_pack_incomplete");
  }
  if (!validProductStateMapping(input.actionNameMapping)) {
    reasonCodes.add("action_name_mapping_invalid");
  }
  if (!input.runner.generationAllowed) reasonCodes.add("direct_runner_predev_blocked");
  if (input.runner.claimScan.status !== "passed") reasonCodes.add("positive_forbidden_claim_detected");
  if (input.runner.securityScan.status !== "passed") reasonCodes.add("sensitive_value_leak_detected");

  const generationMayStart = reasonCodes.size === 0;
  const draft: Omit<LocalImageCandidateOrchestrator, "claimScan" | "securityScan" | "decision" | "reasonCodes"> = {
    orchestratorId: "v40_local_image_candidate_orchestrator",
    selectedRoute: input.selectedRoute,
    sampleMatrix: input.samples,
    maskCropPlans: input.maskCropPlans,
    identityAnchorPacks: input.identityAnchorPacks,
    actionPoseConditionPacks: input.actionPoseConditionPacks,
    actionNameMapping: input.actionNameMapping,
    runner: input.runner,
    visualReviewRubric: input.visualReviewRubric,
    generationMayStart
  };
  const claimScan = runV40NoWebUIClaimScan(draft);
  const securityScan = runV40NoWebUISecurityScan(draft);
  if (claimScan.status !== "passed") reasonCodes.add("positive_forbidden_claim_detected");
  if (securityScan.status !== "passed") reasonCodes.add("sensitive_value_leak_detected");

  const sortedReasonCodes = [...reasonCodes].sort();
  return {
    ...draft,
    generationMayStart: sortedReasonCodes.length === 0,
    decision: decide(sortedReasonCodes),
    claimScan,
    securityScan,
    reasonCodes: sortedReasonCodes.length === 0 ? ["v40_3r5_predev_audit_passed_scoped"] : sortedReasonCodes
  };
}

function validateSourceAndLicenseRecord(sample: SourceAndLicenseRecord, reasonCodes: Set<string>) {
  if (!sanitizeV40NoWebUISafeId(sample.sampleId)) reasonCodes.add("sample_binding_missing");
  if (sample.sampleKind === "tested_cat") {
    if (sample.licenseStatus !== "usable") reasonCodes.add("sample_source_license_missing");
    if (!sanitizeV40NoWebUIRelativeRef(sample.sourceRef)) reasonCodes.add("source_ref_invalid");
    if (!sanitizeV40NoWebUIRelativeRef(sample.baselineV39Ref)) reasonCodes.add("baseline_ref_invalid");
  }
}

function sameActionSet(actionSet: readonly string[]) {
  return actionSet.length === V40_NO_WEBUI_ACTION_IDS.length
    && V40_NO_WEBUI_ACTION_IDS.every((actionId) => actionSet.includes(actionId));
}

function validProductStateMapping(actionNameMapping: ProductStateActionMapping) {
  return ["idle", "thinking", "running", "success", "warning", "error", "need_input", "sleeping"].every((state) => {
    const mapped = actionNameMapping[state as keyof ProductStateActionMapping];
    return V40_NO_WEBUI_ACTION_IDS.includes(mapped);
  });
}

function decide(reasonCodes: string[]): V40PredevAuditDecision {
  if (reasonCodes.length === 0) return "passed scoped";
  if (reasonCodes.some((code) => code.includes("leak") || code.includes("forbidden") || code.includes("invalid"))) {
    return "failed";
  }
  return "blocked";
}
