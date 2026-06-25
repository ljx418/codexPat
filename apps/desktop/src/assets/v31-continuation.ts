import type { V26PackPreviewApplyResult } from "./pack-preview-apply-rollback";
import type { PhotoSuitabilityStatus } from "./photo-suitability-traits";
import type { V30MotionReadabilityResult, V30QAStatus } from "./semantic-animation-quality";
import type { V31ArtQualityResult } from "./v31-art-quality";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V31ContinuationStatus = "passed" | "partial" | "blocked" | "failed";

export type V31ContinuationReasonCode =
  | "repeatable_asset_production_passed"
  | "only_single_high_quality_asset_passed"
  | "no_high_quality_asset_passed"
  | "candidate_failed_quality_gate"
  | "candidate_blocked_source_or_license"
  | "layered_rig_runtime_route_passed"
  | "layered_rig_runtime_payload_missing"
  | "layered_rig_quality_failed"
  | "layered_rig_route_contract_missing"
  | "named_photo_sample_set_passed"
  | "named_photo_sample_set_partial_real_data"
  | "photo_negative_samples_simulated_only"
  | "photo_sample_set_missing"
  | "photo_sample_blocked"
  | "photo_action_closure_passed"
  | "photo_action_closure_partial"
  | "photo_derived_action_frames_missing"
  | "photo_action_quality_failed"
  | "photo_action_preview_apply_failed"
  | "continuation_final_passed_scoped"
  | "continuation_final_partial_scoped"
  | "continuation_final_blocked"
  | "continuation_final_failed"
  | "security_scan_failed";

export type V31RepeatableAssetCandidate = {
  candidateId: string;
  sourceLabel: "real_local_asset" | "fixture_negative" | "route_contract";
  artQuality: V31ArtQualityResult;
  semanticQuality?: V30MotionReadabilityResult;
};

export type V31RepeatableAssetProductionResult = {
  status: V31ContinuationStatus;
  reasonCodes: V31ContinuationReasonCode[];
  candidateCount: number;
  passingCandidateCount: number;
  blockedCandidateCount: number;
  failedCandidateCount: number;
  passingCandidateIds: string[];
  candidateSummaries: Array<{
    candidateId: string;
    sourceLabel: V31RepeatableAssetCandidate["sourceLabel"];
    artStatus: V31ArtQualityResult["status"];
    semanticStatus: V30MotionReadabilityResult["status"] | "not-run";
    reasonCodes: string[];
  }>;
};

export type V31LayeredRigRuntimeRouteResult = {
  status: V31ContinuationStatus;
  reasonCodes: V31ContinuationReasonCode[];
  routeContractPresent: boolean;
  runtimePayloadAvailable: boolean;
  normalizedFramesAvailable: boolean;
  artStatus: V31ArtQualityResult["status"] | "not-run";
  semanticStatus: V30MotionReadabilityResult["status"] | "not-run";
  previewApplyStatus: V26PackPreviewApplyResult["status"] | "not-run";
};

export type V31NamedPhotoSample = {
  safeSampleId: string;
  sampleKind: "real_positive" | "real_difficult" | "simulated_negative" | "simulated_blocked";
  suitabilityStatus: PhotoSuitabilityStatus;
  primaryReasonCode: string;
};

export type V31NamedPhotoSampleSetResult = {
  status: V31ContinuationStatus;
  reasonCodes: V31ContinuationReasonCode[];
  realSampleCount: number;
  realPassingOrRiskCount: number;
  simulatedNegativeCount: number;
  sampleSummaries: V31NamedPhotoSample[];
  boundary: "named_real_samples_only" | "partial_real_data_with_simulated_negative";
};

export type V31PhotoActionClosureResult = {
  status: V31ContinuationStatus;
  reasonCodes: V31ContinuationReasonCode[];
  namedSampleSetStatus: V31ContinuationStatus;
  artStatus: V31ArtQualityResult["status"];
  semanticStatus: V30MotionReadabilityResult["status"];
  previewApplyStatus: V26PackPreviewApplyResult["status"];
  rollbackStatus: V26PackPreviewApplyResult["rollbackResult"]["status"];
  photoDerivedActionFramesAvailable: boolean;
};

export type V31ContinuationFinalGateResult = {
  status: V31ContinuationStatus;
  reasonCodes: V31ContinuationReasonCode[];
  phaseStatuses: Record<string, V31ContinuationStatus>;
  narrowClaim: string;
};

export function runV31RepeatableAssetProductionGate(options: {
  candidates: V31RepeatableAssetCandidate[];
  requiredPassingCandidates?: number;
}): V31RepeatableAssetProductionResult {
  const requiredPassingCandidates = options.requiredPassingCandidates ?? 2;
  const summaries = options.candidates.map((candidate) => {
    const semanticStatus: V30QAStatus | "not-run" = candidate.semanticQuality?.status ?? "not-run";
    return {
      candidateId: safeId(candidate.candidateId, "v31_candidate"),
      sourceLabel: candidate.sourceLabel,
      artStatus: candidate.artQuality.status,
      semanticStatus,
      reasonCodes: [...candidate.artQuality.reasonCodes, ...(candidate.semanticQuality?.reasonCodes ?? [])].map(String).sort()
    };
  });
  const passing = summaries.filter((candidate) => candidate.artStatus === "passed" && (candidate.semanticStatus === "passed" || candidate.semanticStatus === "not-run"));
  const blocked = summaries.filter((candidate) => candidate.artStatus === "blocked");
  const failed = summaries.filter((candidate) => candidate.artStatus === "failed" || candidate.semanticStatus === "failed");
  const reasonCodes = new Set<V31ContinuationReasonCode>();

  if (passing.length >= requiredPassingCandidates) {
    reasonCodes.add("repeatable_asset_production_passed");
  } else if (passing.length === 1) {
    reasonCodes.add("only_single_high_quality_asset_passed");
  } else {
    reasonCodes.add("no_high_quality_asset_passed");
  }
  if (blocked.length > 0) reasonCodes.add("candidate_blocked_source_or_license");
  if (failed.length > 0) reasonCodes.add("candidate_failed_quality_gate");

  const status: V31ContinuationStatus = passing.length >= requiredPassingCandidates
    ? "passed"
    : passing.length === 1
      ? "partial"
      : blocked.length > 0
        ? "blocked"
        : "failed";

  return withSecurityStatus({
    status,
    reasonCodes: Array.from(reasonCodes).sort(),
    candidateCount: summaries.length,
    passingCandidateCount: passing.length,
    blockedCandidateCount: blocked.length,
    failedCandidateCount: failed.length,
    passingCandidateIds: passing.map((candidate) => candidate.candidateId),
    candidateSummaries: summaries
  });
}

export function runV31LayeredRigRuntimeRouteGate(options: {
  routeContractPresent: boolean;
  runtimePayloadAvailable: boolean;
  normalizedFramesAvailable: boolean;
  artQuality?: V31ArtQualityResult;
  semanticQuality?: V30MotionReadabilityResult;
  previewApply?: V26PackPreviewApplyResult;
}): V31LayeredRigRuntimeRouteResult {
  const reasonCodes = new Set<V31ContinuationReasonCode>();
  if (!options.routeContractPresent) reasonCodes.add("layered_rig_route_contract_missing");
  if (!options.runtimePayloadAvailable && !options.normalizedFramesAvailable) reasonCodes.add("layered_rig_runtime_payload_missing");
  if (options.artQuality?.status === "failed" || options.semanticQuality?.status === "failed") reasonCodes.add("layered_rig_quality_failed");

  const passed = options.routeContractPresent
    && (options.runtimePayloadAvailable || options.normalizedFramesAvailable)
    && options.artQuality?.status === "passed"
    && options.semanticQuality?.status === "passed"
    && options.previewApply?.status === "passed";

  if (passed) reasonCodes.add("layered_rig_runtime_route_passed");

  const status: V31ContinuationStatus = passed
    ? "passed"
    : !options.routeContractPresent
      ? "failed"
      : reasonCodes.has("layered_rig_quality_failed")
        ? "failed"
        : "blocked";

  return withSecurityStatus({
    status,
    reasonCodes: Array.from(reasonCodes).sort(),
    routeContractPresent: options.routeContractPresent,
    runtimePayloadAvailable: options.runtimePayloadAvailable,
    normalizedFramesAvailable: options.normalizedFramesAvailable,
    artStatus: options.artQuality?.status ?? "not-run",
    semanticStatus: options.semanticQuality?.status ?? "not-run",
    previewApplyStatus: options.previewApply?.status ?? "not-run"
  });
}

export function runV31NamedPhotoSampleSetGate(samples: V31NamedPhotoSample[]): V31NamedPhotoSampleSetResult {
  const safeSamples = samples.map((sample) => ({
    safeSampleId: safeId(sample.safeSampleId, "v31_photo_sample"),
    sampleKind: sample.sampleKind,
    suitabilityStatus: sample.suitabilityStatus,
    primaryReasonCode: safeReason(sample.primaryReasonCode)
  }));
  const realSamples = safeSamples.filter((sample) => sample.sampleKind === "real_positive" || sample.sampleKind === "real_difficult");
  const realPassingOrRisk = realSamples.filter((sample) => sample.suitabilityStatus === "clear" || sample.suitabilityStatus === "usable_with_risk");
  const realBlocked = realSamples.filter((sample) => sample.suitabilityStatus === "unsuitable");
  const simulatedNegative = safeSamples.filter((sample) => sample.sampleKind === "simulated_negative" || sample.sampleKind === "simulated_blocked");
  const blocked = safeSamples.filter((sample) => sample.suitabilityStatus === "unsuitable");
  const reasonCodes = new Set<V31ContinuationReasonCode>();

  if (safeSamples.length === 0 || realSamples.length === 0) reasonCodes.add("photo_sample_set_missing");
  if (blocked.length > 0) reasonCodes.add("photo_sample_blocked");
  if (simulatedNegative.length > 0) reasonCodes.add("photo_negative_samples_simulated_only");
  if (realPassingOrRisk.length >= 3 && simulatedNegative.length === 0) {
    reasonCodes.add("named_photo_sample_set_passed");
  } else if (realPassingOrRisk.length >= 3 || (realPassingOrRisk.length >= 2 && realBlocked.length > 0)) {
    reasonCodes.add("named_photo_sample_set_partial_real_data");
  }

  const status: V31ContinuationStatus = reasonCodes.has("named_photo_sample_set_passed")
    ? "passed"
    : reasonCodes.has("named_photo_sample_set_partial_real_data")
      ? "partial"
      : realSamples.length === 0
        ? "blocked"
        : "failed";

  return withSecurityStatus({
    status,
    reasonCodes: Array.from(reasonCodes).sort(),
    realSampleCount: realSamples.length,
    realPassingOrRiskCount: realPassingOrRisk.length,
    simulatedNegativeCount: simulatedNegative.length,
    sampleSummaries: safeSamples,
    boundary: simulatedNegative.length > 0 ? "partial_real_data_with_simulated_negative" : "named_real_samples_only"
  });
}

export function runV31PhotoActionClosureGate(options: {
  namedSampleSet: V31NamedPhotoSampleSetResult;
  artQuality: V31ArtQualityResult;
  semanticQuality: V30MotionReadabilityResult;
  previewApply: V26PackPreviewApplyResult;
  photoDerivedActionFramesAvailable?: boolean;
}): V31PhotoActionClosureResult {
  const reasonCodes = new Set<V31ContinuationReasonCode>();
  const photoDerivedActionFramesAvailable = options.photoDerivedActionFramesAvailable === true;
  if (!photoDerivedActionFramesAvailable) reasonCodes.add("photo_derived_action_frames_missing");
  if (options.artQuality.status !== "passed" || options.semanticQuality.status !== "passed") reasonCodes.add("photo_action_quality_failed");
  if (options.previewApply.status !== "passed" || options.previewApply.rollbackResult.status !== "rolled_back") reasonCodes.add("photo_action_preview_apply_failed");

  const qualityClosed = options.artQuality.status === "passed"
    && options.semanticQuality.status === "passed"
    && options.previewApply.status === "passed"
    && options.previewApply.rollbackResult.status === "rolled_back"
    && photoDerivedActionFramesAvailable;
  if (qualityClosed && options.namedSampleSet.status === "passed") {
    reasonCodes.add("photo_action_closure_passed");
  } else if (qualityClosed && options.namedSampleSet.status === "partial") {
    reasonCodes.add("photo_action_closure_partial");
  }

  const status: V31ContinuationStatus = reasonCodes.has("photo_action_closure_passed")
    ? "passed"
    : reasonCodes.has("photo_action_closure_partial")
      ? "partial"
      : !photoDerivedActionFramesAvailable && options.previewApply.status === "passed"
        ? "blocked"
      : options.namedSampleSet.status === "blocked"
        ? "blocked"
        : "failed";

  return withSecurityStatus({
    status,
    reasonCodes: Array.from(reasonCodes).sort(),
    namedSampleSetStatus: options.namedSampleSet.status,
    artStatus: options.artQuality.status,
    semanticStatus: options.semanticQuality.status,
    previewApplyStatus: options.previewApply.status,
    rollbackStatus: options.previewApply.rollbackResult.status,
    photoDerivedActionFramesAvailable
  });
}

export function runV31ContinuationFinalGate(phases: Record<string, V31ContinuationStatus>): V31ContinuationFinalGateResult {
  const statuses = Object.values(phases);
  const reasonCodes = new Set<V31ContinuationReasonCode>();
  const status: V31ContinuationStatus = statuses.includes("failed")
    ? "failed"
    : statuses.includes("blocked")
      ? "blocked"
      : statuses.includes("partial")
        ? "partial"
        : "passed";

  if (status === "passed") reasonCodes.add("continuation_final_passed_scoped");
  if (status === "partial") reasonCodes.add("continuation_final_partial_scoped");
  if (status === "blocked") reasonCodes.add("continuation_final_blocked");
  if (status === "failed") reasonCodes.add("continuation_final_failed");

  return withSecurityStatus({
    status,
    reasonCodes: Array.from(reasonCodes).sort(),
    phaseStatuses: phases,
    narrowClaim: status === "passed"
      ? "V31 continuation passed for tested scoped local 2D action asset and named sample set evidence only."
      : "V31 continuation remains scoped partial/blocked/failed according to phase evidence and does not prove arbitrary-cat automatic animation readiness."
  });
}

export function buildV31ContinuationEvidenceSnapshot(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

export function v31ContinuationHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function withSecurityStatus<T extends { status: V31ContinuationStatus; reasonCodes: V31ContinuationReasonCode[] }>(result: T): T {
  if (!v31ContinuationHasForbiddenContent(result)) return result;
  return {
    ...result,
    status: "failed",
    reasonCodes: [...new Set([...result.reasonCodes, "security_scan_failed"] as V31ContinuationReasonCode[])].sort()
  };
}

function safeId(value: string, fallback: string) {
  const normalized = value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 96);
  return /^[A-Za-z0-9._-]{1,96}$/.test(normalized) ? normalized : fallback;
}

function safeReason(value: string) {
  return safeId(value, "unknown_reason");
}
