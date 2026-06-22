import type { V24RouteId } from "./multi-route-generation-orchestrator";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V27FailureReasonCode =
  | "photo_low_resolution"
  | "photo_blurry"
  | "cat_cropped"
  | "cat_occluded"
  | "multi_cat_ambiguous"
  | "background_too_complex"
  | "route_output_missing"
  | "route_output_rejected"
  | "action_coverage_incomplete"
  | "same_cat_score_too_low"
  | "motion_amplitude_too_low"
  | "frame_delta_too_large"
  | "loop_closure_failed"
  | "provider_unavailable";

export type V27ReasonCode =
  | "retry_allowed"
  | "retry_budget_exhausted"
  | "total_budget_exhausted"
  | "repeated_reason_requires_repair"
  | "alternate_route_recommended"
  | "better_photo_required"
  | "provider_credential_missing"
  | "provider_consent_required"
  | "provider_cost_disclosure_required"
  | "provider_privacy_disclosure_required"
  | "provider_retention_disclosure_required"
  | "provider_license_disclosure_required"
  | "provider_execution_blocked"
  | "cost_time_disclosure_ready"
  | "previous_pack_preserved"
  | "live_pet_unchanged"
  | "stop_and_keep_current_pet"
  | "unsafe_field_detected";

export type V27NextAction =
  | "upload_clearer_photo"
  | "crop_less_tightly"
  | "use_single_cat_photo"
  | "use_simpler_background"
  | "repair_generation_strategy"
  | "switch_route"
  | "review_provider_terms"
  | "add_provider_credential"
  | "stop_keep_current_pet";

export type V27AttemptRecord = {
  routeId: V24RouteId;
  reasonCode: V27FailureReasonCode;
  repairApplied?: boolean;
};

export type V27ProviderGate = {
  isProviderRoute?: boolean;
  credentialRequired?: boolean;
  credentialPresent?: boolean;
  consentRequired?: boolean;
  consentAccepted?: boolean;
  costDisclosureShown?: boolean;
  privacyDisclosureShown?: boolean;
  retentionDisclosureShown?: boolean;
  licenseDisclosureShown?: boolean;
};

export type V27RetryGuidanceResult = {
  status: "retry_allowed" | "repair_required" | "route_switch_recommended" | "budget_exhausted" | "provider_blocked" | "failed";
  routeId: V24RouteId;
  reasonCodes: V27ReasonCode[];
  nextActions: V27NextAction[];
  attemptBudget: {
    routeAttempts: number;
    routeLimit: number;
    totalAttempts: number;
    totalLimit: number;
  };
  disclosure: {
    providerRoute: boolean;
    credentialReady: boolean;
    consentReady: boolean;
    costReady: boolean;
    privacyReady: boolean;
    retentionReady: boolean;
    licenseReady: boolean;
  };
  providerExecutionStarted: false;
  providerExecutionAllowed: boolean;
  previousPackPreserved: true;
  livePetMutationAttempted: false;
};

export function createV27RetryCostFailureGuidance(options: {
  routeId: V24RouteId;
  failureReason: V27FailureReasonCode;
  attemptHistory: V27AttemptRecord[];
  providerGate?: V27ProviderGate;
  routeAttemptLimit?: number;
  totalAttemptLimit?: number;
}): V27RetryGuidanceResult {
  const routeLimit = Math.max(1, Math.floor(options.routeAttemptLimit ?? 2));
  const totalLimit = Math.max(routeLimit, Math.floor(options.totalAttemptLimit ?? 6));
  const routeAttempts = options.attemptHistory.filter((attempt) => attempt.routeId === options.routeId).length;
  const totalAttempts = options.attemptHistory.length;
  const reasonCodes = new Set<V27ReasonCode>(["previous_pack_preserved", "live_pet_unchanged"]);
  const nextActions = new Set<V27NextAction>();
  const providerGate = options.providerGate ?? {};
  const providerRoute = providerGate.isProviderRoute === true;
  const disclosure = buildDisclosure(providerGate);

  addPhotoGuidance(options.failureReason, nextActions, reasonCodes);

  const repeatedSameReason = options.attemptHistory.filter(
    (attempt) => attempt.routeId === options.routeId && attempt.reasonCode === options.failureReason
  );
  const latestRepeatedAttempt = repeatedSameReason[repeatedSameReason.length - 1];
  const repeatedNeedsRepair = repeatedSameReason.length >= 2 && latestRepeatedAttempt?.repairApplied !== true;

  if (providerRoute) {
    addProviderGateFailures(disclosure, reasonCodes, nextActions);
  }

  if (routeAttempts >= routeLimit) {
    reasonCodes.add("retry_budget_exhausted");
    reasonCodes.add("alternate_route_recommended");
    reasonCodes.add("stop_and_keep_current_pet");
    nextActions.add("switch_route");
    nextActions.add("stop_keep_current_pet");
  }

  if (totalAttempts >= totalLimit) {
    reasonCodes.add("total_budget_exhausted");
    reasonCodes.add("stop_and_keep_current_pet");
    nextActions.add("stop_keep_current_pet");
  }

  if (repeatedNeedsRepair) {
    reasonCodes.add("repeated_reason_requires_repair");
    nextActions.add("repair_generation_strategy");
  }

  if (!providerRoute || providerReady(disclosure)) {
    reasonCodes.add("cost_time_disclosure_ready");
  }

  if (options.failureReason === "route_output_missing" || options.failureReason === "route_output_rejected" || options.failureReason === "provider_unavailable") {
    reasonCodes.add("alternate_route_recommended");
    nextActions.add("switch_route");
  }

  const failed = v27RetryGuidanceHasForbiddenContent({ options, nextActions: Array.from(nextActions), reasonCodes: Array.from(reasonCodes) });
  if (failed) {
    reasonCodes.add("unsafe_field_detected");
  }

  const budgetExhausted = reasonCodes.has("retry_budget_exhausted") || reasonCodes.has("total_budget_exhausted");
  const providerBlocked = providerRoute && !providerReady(disclosure);
  const repairRequired = repeatedNeedsRepair;
  const routeSwitch = reasonCodes.has("alternate_route_recommended");
  if (!budgetExhausted && !providerBlocked && !repairRequired && !routeSwitch && !failed) {
    reasonCodes.add("retry_allowed");
  }

  return {
    status: failed
      ? "failed"
      : budgetExhausted
        ? "budget_exhausted"
        : providerBlocked
          ? "provider_blocked"
          : repairRequired
            ? "repair_required"
            : routeSwitch
              ? "route_switch_recommended"
              : "retry_allowed",
    routeId: options.routeId,
    reasonCodes: Array.from(reasonCodes).sort(),
    nextActions: Array.from(nextActions).sort(),
    attemptBudget: {
      routeAttempts,
      routeLimit,
      totalAttempts,
      totalLimit
    },
    disclosure,
    providerExecutionStarted: false,
    providerExecutionAllowed: providerRoute && providerReady(disclosure) && !budgetExhausted,
    previousPackPreserved: true,
    livePetMutationAttempted: false
  };
}

export function buildV27RetryGuidanceEvidenceSnapshot(result: V27RetryGuidanceResult) {
  return {
    status: result.status,
    routeId: result.routeId,
    reasonCodes: result.reasonCodes,
    nextActions: result.nextActions,
    attemptBudget: result.attemptBudget,
    disclosure: result.disclosure,
    providerExecutionStarted: result.providerExecutionStarted,
    providerExecutionAllowed: result.providerExecutionAllowed,
    previousPackPreserved: result.previousPackPreserved,
    livePetMutationAttempted: result.livePetMutationAttempted
  };
}

export function v27RetryGuidanceHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function buildDisclosure(gate: V27ProviderGate): V27RetryGuidanceResult["disclosure"] {
  const providerRoute = gate.isProviderRoute === true;
  return {
    providerRoute,
    credentialReady: !providerRoute || gate.credentialRequired !== true || gate.credentialPresent === true,
    consentReady: !providerRoute || gate.consentRequired !== true || gate.consentAccepted === true,
    costReady: !providerRoute || gate.costDisclosureShown === true,
    privacyReady: !providerRoute || gate.privacyDisclosureShown === true,
    retentionReady: !providerRoute || gate.retentionDisclosureShown === true,
    licenseReady: !providerRoute || gate.licenseDisclosureShown === true
  };
}

function providerReady(disclosure: V27RetryGuidanceResult["disclosure"]) {
  return disclosure.credentialReady
    && disclosure.consentReady
    && disclosure.costReady
    && disclosure.privacyReady
    && disclosure.retentionReady
    && disclosure.licenseReady;
}

function addProviderGateFailures(
  disclosure: V27RetryGuidanceResult["disclosure"],
  reasonCodes: Set<V27ReasonCode>,
  nextActions: Set<V27NextAction>
) {
  if (!disclosure.credentialReady) {
    reasonCodes.add("provider_credential_missing");
    reasonCodes.add("provider_execution_blocked");
    nextActions.add("add_provider_credential");
  }
  if (!disclosure.consentReady) {
    reasonCodes.add("provider_consent_required");
    reasonCodes.add("provider_execution_blocked");
    nextActions.add("review_provider_terms");
  }
  if (!disclosure.costReady) {
    reasonCodes.add("provider_cost_disclosure_required");
    reasonCodes.add("provider_execution_blocked");
    nextActions.add("review_provider_terms");
  }
  if (!disclosure.privacyReady) {
    reasonCodes.add("provider_privacy_disclosure_required");
    reasonCodes.add("provider_execution_blocked");
    nextActions.add("review_provider_terms");
  }
  if (!disclosure.retentionReady) {
    reasonCodes.add("provider_retention_disclosure_required");
    reasonCodes.add("provider_execution_blocked");
    nextActions.add("review_provider_terms");
  }
  if (!disclosure.licenseReady) {
    reasonCodes.add("provider_license_disclosure_required");
    reasonCodes.add("provider_execution_blocked");
    nextActions.add("review_provider_terms");
  }
}

function addPhotoGuidance(
  reason: V27FailureReasonCode,
  nextActions: Set<V27NextAction>,
  reasonCodes: Set<V27ReasonCode>
) {
  if (reason === "photo_low_resolution" || reason === "photo_blurry") {
    reasonCodes.add("better_photo_required");
    nextActions.add("upload_clearer_photo");
  }
  if (reason === "cat_cropped" || reason === "cat_occluded") {
    reasonCodes.add("better_photo_required");
    nextActions.add("crop_less_tightly");
  }
  if (reason === "multi_cat_ambiguous") {
    reasonCodes.add("better_photo_required");
    nextActions.add("use_single_cat_photo");
  }
  if (reason === "background_too_complex") {
    reasonCodes.add("better_photo_required");
    nextActions.add("use_simpler_background");
  }
  if (reason === "same_cat_score_too_low" || reason === "motion_amplitude_too_low" || reason === "frame_delta_too_large" || reason === "loop_closure_failed") {
    nextActions.add("repair_generation_strategy");
  }
}
