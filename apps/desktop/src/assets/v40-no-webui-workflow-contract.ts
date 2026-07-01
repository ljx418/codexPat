export const V40_NO_WEBUI_ACTION_IDS = ["idle", "walk", "jump", "sleep", "eat", "play", "alert", "celebrate"] as const;

export type V40NoWebUIActionId = (typeof V40_NO_WEBUI_ACTION_IDS)[number];
export type V40NoWebUIRoute = "direct_local_runner_no_webui" | "manual_import_no_webui";
export type V40NoWebUIConsentBoundary = "public_sample" | "explicit_local_user_sample";
export type V40NoWebUIStatus = "accepted" | "blocked" | "failed";
export type V40CandidateSourceDecisionValue =
  | "accepted_manual_import_first"
  | "new_direct_runner_route_allowed"
  | "remain_failed_or_blocked";
export type V40CandidateSourceRoute = V40NoWebUIRoute | "none";
export type V40CandidateSourceV40_4Entry = "allowed_after_visual_acceptance" | "no_go";
export type V40HybridCandidateStatus = "generated" | "imported" | "normalized" | "accepted" | "blocked" | "failed";
export type V40VisualPreference = "better_than_v39" | "similar_to_v39" | "worse_than_v39" | "not_reviewed";
export type V40IdentityScore = "pass" | "warn" | "fail";
export type V40VisualReviewStatus = "passed" | "failed" | "not_reviewed";

export type V40NoWebUIReasonCode =
  | "v40_no_webui_contract_passed"
  | "v40_visual_review_passed"
  | "sample_binding_missing"
  | "source_ref_invalid"
  | "baseline_ref_invalid"
  | "route_invalid"
  | "action_set_invalid"
  | "consent_boundary_invalid"
  | "candidate_id_invalid"
  | "candidate_status_invalid"
  | "candidate_ref_invalid"
  | "action_coverage_invalid"
  | "identity_score_invalid"
  | "visual_preference_invalid"
  | "visual_review_failed"
  | "visual_review_missing"
  | "multi_subject_artifact"
  | "humanoid_or_clothing_artifact"
  | "text_or_logo_artifact"
  | "action_semantics_unclear"
  | "target_experience_quality_failed"
  | "product_preview_not_ready"
  | "target_apply_failed"
  | "rollback_failed"
  | "v40_3r3_candidate_source_decision_ready"
  | "v40_3r3_remain_failed_or_blocked"
  | "manual_import_assets_missing"
  | "manual_import_source_license_missing"
  | "manual_import_visual_acceptance_missing"
  | "new_direct_runner_route_not_materially_different"
  | "v40_3r2_visual_review_failed"
  | "v40_4_no_go"
  | "positive_forbidden_claim_detected"
  | "raw_prompt_leak_detected"
  | "raw_payload_leak_detected"
  | "raw_path_leak_detected"
  | "remote_url_rejected"
  | "sensitive_value_leak_detected";

export type V40NoWebUIRunRequest = {
  sampleId: string;
  sourceRef: string;
  baselineV39Ref: string;
  route: V40NoWebUIRoute;
  actionSet: V40NoWebUIActionId[];
  consentBoundary: V40NoWebUIConsentBoundary;
};

export type V40CandidateSourceDecision = {
  decision: V40CandidateSourceDecisionValue;
  route: V40CandidateSourceRoute;
  sampleSet: string[];
  predevAuditRef: string;
  sourceLicenseEvidenceRef: string | null;
  visualAcceptanceEvidenceRefs: string[];
  materiallyDifferentEvidenceRef: string | null;
  v40_4Entry: V40CandidateSourceV40_4Entry;
  reasonCodes: V40NoWebUIReasonCode[];
};

export type V40HybridCandidateSummary = {
  candidateId: string;
  sampleId: string;
  status: V40HybridCandidateStatus;
  route: V40NoWebUIRoute;
  characterRef: string | null;
  contactSheetRef: string | null;
  animatedPreviewRef: string | null;
  actionCoverage: Record<V40NoWebUIActionId, boolean>;
  identityScore: V40IdentityScore;
  visualPreference: V40VisualPreference;
  reasonCodes: string[];
};

export type V40CandidateVisualReview = {
  candidateId: string;
  status: V40VisualReviewStatus;
  observations: string[];
  reasonCodes: V40NoWebUIReasonCode[];
};

export type V40ProductGateSummary = {
  previewReady: boolean;
  targetOnlyApplyReady: boolean;
  rollbackReady: boolean;
  activePackPreservedOnFailure: boolean;
  blockedReason: string | null;
};

export type V40ContractValidationResult = {
  status: V40NoWebUIStatus;
  reasonCodes: V40NoWebUIReasonCode[];
};

export type V40ContractScanResult = {
  status: "passed" | "failed";
  hits: string[];
};

const SAFE_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{1,79}$/;
const SAFE_REL_REF_PATTERN = /^(?:docs|apps|\/v39|\/v40)\/[A-Za-z0-9._/@+-]+(?:\/[A-Za-z0-9._/@+-]+)*$/;
const RAW_PATH_PATTERN =
  /\b[A-Za-z]:[\\/]|(?:^|[\s"'`])\/(?:mnt|home|Users|private|Volumes|workspace|tmp)\/|file:\/\/|\\\\[A-Za-z0-9_.-]+\\/i;
const REMOTE_URL_PATTERN = /https?:\/\//i;
const SENSITIVE_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|token\s*[:=]|raw prompt|raw runner payload|raw payload|raw generated image bytes|raw photo bytes|EXIF|GPS|latitude|longitude|workspace path|config path|credential path|terminal title|sk-[A-Za-z0-9_-]{8,})\b/i;
const POSITIVE_FORBIDDEN_CLAIM_PATTERN =
  /\b(?:Petdex parity achieved|automatic photo-to-animation ready|automatic photo-to-2D ready|provider integration verified|Route B verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|OS-level Codex window binding ready|all Codex workflows verified|WebUI ready|ComfyUI ready)\b/i;

export function sanitizeV40NoWebUISafeId(value: string): string | null {
  const sanitized = value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return SAFE_ID_PATTERN.test(sanitized) ? sanitized : null;
}

export function sanitizeV40NoWebUIRelativeRef(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().replaceAll("\\", "/");
  if (!normalized || RAW_PATH_PATTERN.test(normalized) || REMOTE_URL_PATTERN.test(normalized) || !SAFE_REL_REF_PATTERN.test(normalized)) {
    return null;
  }
  return normalized;
}

export function runV40NoWebUIClaimScan(value: unknown): V40ContractScanResult {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const hits = POSITIVE_FORBIDDEN_CLAIM_PATTERN.test(text) ? ["positive_forbidden_ready_claim"] : [];
  return { status: hits.length === 0 ? "passed" : "failed", hits };
}

export function runV40NoWebUISecurityScan(value: unknown): V40ContractScanResult {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const hits: string[] = [];
  if (RAW_PATH_PATTERN.test(text)) hits.push("raw_path_leak_detected");
  if (REMOTE_URL_PATTERN.test(text)) hits.push("remote_url_rejected");
  if (SENSITIVE_PATTERN.test(text)) hits.push("sensitive_value_leak_detected");
  return { status: hits.length === 0 ? "passed" : "failed", hits };
}

export function validateV40NoWebUIRunRequest(request: V40NoWebUIRunRequest): V40ContractValidationResult {
  const reasonCodes = new Set<V40NoWebUIReasonCode>();
  if (!sanitizeV40NoWebUISafeId(request.sampleId)) reasonCodes.add("sample_binding_missing");
  if (!sanitizeV40NoWebUIRelativeRef(request.sourceRef)) reasonCodes.add("source_ref_invalid");
  if (!sanitizeV40NoWebUIRelativeRef(request.baselineV39Ref)) reasonCodes.add("baseline_ref_invalid");
  if (!["direct_local_runner_no_webui", "manual_import_no_webui"].includes(request.route)) reasonCodes.add("route_invalid");
  if (!sameActionSet(request.actionSet)) reasonCodes.add("action_set_invalid");
  if (!["public_sample", "explicit_local_user_sample"].includes(request.consentBoundary)) reasonCodes.add("consent_boundary_invalid");
  addScanReasons(reasonCodes, request);
  return resultFrom(reasonCodes);
}

export function validateV40CandidateSourceDecision(decision: V40CandidateSourceDecision): V40ContractValidationResult {
  const reasonCodes = new Set<V40NoWebUIReasonCode>();
  if (!["accepted_manual_import_first", "new_direct_runner_route_allowed", "remain_failed_or_blocked"].includes(decision.decision)) {
    reasonCodes.add("route_invalid");
  }
  if (!["direct_local_runner_no_webui", "manual_import_no_webui", "none"].includes(decision.route)) reasonCodes.add("route_invalid");
  if (!sanitizeV40NoWebUIRelativeRef(decision.predevAuditRef)) reasonCodes.add("baseline_ref_invalid");
  if (!["allowed_after_visual_acceptance", "no_go"].includes(decision.v40_4Entry)) reasonCodes.add("v40_4_no_go");

  for (const sampleId of decision.sampleSet) {
    if (!sanitizeV40NoWebUISafeId(sampleId)) reasonCodes.add("sample_binding_missing");
  }
  for (const ref of decision.visualAcceptanceEvidenceRefs) {
    if (!sanitizeV40NoWebUIRelativeRef(ref)) reasonCodes.add("visual_review_missing");
  }

  if (decision.decision === "accepted_manual_import_first") {
    if (decision.route !== "manual_import_no_webui") reasonCodes.add("route_invalid");
    if (decision.sampleSet.length < 2) reasonCodes.add("manual_import_assets_missing");
    if (!sanitizeV40NoWebUIRelativeRef(decision.sourceLicenseEvidenceRef)) reasonCodes.add("manual_import_source_license_missing");
    if (decision.visualAcceptanceEvidenceRefs.length < 2) reasonCodes.add("manual_import_visual_acceptance_missing");
    if (decision.v40_4Entry !== "allowed_after_visual_acceptance") reasonCodes.add("v40_4_no_go");
  }

  if (decision.decision === "new_direct_runner_route_allowed") {
    if (decision.route !== "direct_local_runner_no_webui") reasonCodes.add("route_invalid");
    if (!sanitizeV40NoWebUIRelativeRef(decision.materiallyDifferentEvidenceRef)) {
      reasonCodes.add("new_direct_runner_route_not_materially_different");
    }
    if (decision.v40_4Entry !== "no_go") reasonCodes.add("v40_4_no_go");
  }

  if (decision.decision === "remain_failed_or_blocked") {
    if (decision.route !== "none") reasonCodes.add("route_invalid");
    if (decision.v40_4Entry !== "no_go") reasonCodes.add("v40_4_no_go");
    reasonCodes.add("v40_3r3_remain_failed_or_blocked");
  }

  for (const code of decision.reasonCodes) reasonCodes.add(code);
  if (runV40NoWebUIClaimScan(decision).status === "failed") reasonCodes.add("positive_forbidden_claim_detected");
  addScanReasons(reasonCodes, decision);

  if (reasonCodes.size === 0) {
    return { status: "accepted", reasonCodes: ["v40_3r3_candidate_source_decision_ready"] };
  }
  return {
    status: hasFailReason(reasonCodes) ? "failed" : "blocked",
    reasonCodes: Array.from(reasonCodes).sort()
  };
}

export function validateV40HybridCandidateSummary(candidate: V40HybridCandidateSummary): V40ContractValidationResult {
  const reasonCodes = new Set<V40NoWebUIReasonCode>();
  if (!sanitizeV40NoWebUISafeId(candidate.candidateId)) reasonCodes.add("candidate_id_invalid");
  if (!sanitizeV40NoWebUISafeId(candidate.sampleId)) reasonCodes.add("sample_binding_missing");
  if (!["generated", "imported", "normalized", "accepted", "blocked", "failed"].includes(candidate.status)) reasonCodes.add("candidate_status_invalid");
  if (!["direct_local_runner_no_webui", "manual_import_no_webui"].includes(candidate.route)) reasonCodes.add("route_invalid");
  for (const ref of [candidate.characterRef, candidate.contactSheetRef, candidate.animatedPreviewRef]) {
    if (ref !== null && !sanitizeV40NoWebUIRelativeRef(ref)) reasonCodes.add("candidate_ref_invalid");
  }
  if (!V40_NO_WEBUI_ACTION_IDS.every((actionId) => typeof candidate.actionCoverage[actionId] === "boolean")) {
    reasonCodes.add("action_coverage_invalid");
  }
  if (!["pass", "warn", "fail"].includes(candidate.identityScore)) reasonCodes.add("identity_score_invalid");
  if (!["better_than_v39", "similar_to_v39", "worse_than_v39", "not_reviewed"].includes(candidate.visualPreference)) {
    reasonCodes.add("visual_preference_invalid");
  }
  addScanReasons(reasonCodes, candidate);
  return resultFrom(reasonCodes);
}

export function validateV40CandidateVisualReview(review: V40CandidateVisualReview): V40ContractValidationResult {
  const reasonCodes = new Set<V40NoWebUIReasonCode>();
  if (!sanitizeV40NoWebUISafeId(review.candidateId)) reasonCodes.add("candidate_id_invalid");
  if (!["passed", "failed", "not_reviewed"].includes(review.status)) reasonCodes.add("visual_review_missing");
  if (review.status === "not_reviewed") reasonCodes.add("visual_review_missing");
  if (review.status === "failed") reasonCodes.add("visual_review_failed");
  for (const code of review.reasonCodes) {
    reasonCodes.add(code);
  }
  addScanReasons(reasonCodes, review);
  return {
    status: reasonCodes.size === 0 ? "accepted" : "failed",
    reasonCodes: reasonCodes.size === 0 ? ["v40_visual_review_passed"] : Array.from(reasonCodes).sort()
  };
}

export function validateV40ProductGateSummary(summary: V40ProductGateSummary): V40ContractValidationResult {
  const reasonCodes = new Set<V40NoWebUIReasonCode>();
  if (!summary.previewReady) reasonCodes.add("product_preview_not_ready");
  if (!summary.targetOnlyApplyReady) reasonCodes.add("target_apply_failed");
  if (!summary.rollbackReady) reasonCodes.add("rollback_failed");
  if (!summary.activePackPreservedOnFailure) reasonCodes.add("rollback_failed");
  addScanReasons(reasonCodes, summary);
  return resultFrom(reasonCodes);
}

function sameActionSet(actionSet: readonly string[]) {
  return actionSet.length === V40_NO_WEBUI_ACTION_IDS.length
    && V40_NO_WEBUI_ACTION_IDS.every((actionId) => actionSet.includes(actionId));
}

function addScanReasons(reasonCodes: Set<V40NoWebUIReasonCode>, value: unknown) {
  for (const hit of runV40NoWebUISecurityScan(value).hits) {
    if (hit === "raw_path_leak_detected") reasonCodes.add("raw_path_leak_detected");
    if (hit === "remote_url_rejected") reasonCodes.add("remote_url_rejected");
    if (hit === "sensitive_value_leak_detected") reasonCodes.add("sensitive_value_leak_detected");
  }
}

function resultFrom(reasonCodes: Set<V40NoWebUIReasonCode>): V40ContractValidationResult {
  return {
    status: reasonCodes.size === 0 ? "accepted" : hasFailReason(reasonCodes) ? "failed" : "blocked",
    reasonCodes: reasonCodes.size === 0 ? ["v40_no_webui_contract_passed"] : Array.from(reasonCodes).sort()
  };
}

function hasFailReason(reasonCodes: Set<V40NoWebUIReasonCode>) {
  return reasonCodes.has("sensitive_value_leak_detected")
    || reasonCodes.has("raw_path_leak_detected")
    || reasonCodes.has("positive_forbidden_claim_detected");
}
