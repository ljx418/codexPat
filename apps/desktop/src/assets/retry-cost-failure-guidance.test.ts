import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildV27RetryGuidanceEvidenceSnapshot,
  createV27RetryCostFailureGuidance,
  v27RetryGuidanceHasForbiddenContent
} from "./retry-cost-failure-guidance";

describe("V27 retry cost failure guidance", () => {
  it("allows a bounded retry when disclosure is ready and no repeated reason exists", () => {
    const result = createV27RetryCostFailureGuidance({
      routeId: "route_c_local_rig",
      failureReason: "motion_amplitude_too_low",
      attemptHistory: [{ routeId: "route_c_local_rig", reasonCode: "motion_amplitude_too_low", repairApplied: true }]
    });
    const evidence = buildV27RetryGuidanceEvidenceSnapshot(result);

    assert.equal(result.status, "retry_allowed");
    assert.ok(result.reasonCodes.includes("retry_allowed"));
    assert.equal(result.providerExecutionStarted, false);
    assert.equal(result.previousPackPreserved, true);
    assert.equal(v27RetryGuidanceHasForbiddenContent({ result, evidence }), false);
  });

  it("requires repair before repeating the same failure reason", () => {
    const result = createV27RetryCostFailureGuidance({
      routeId: "route_a_provider_key_pose",
      failureReason: "same_cat_score_too_low",
      routeAttemptLimit: 3,
      attemptHistory: [
        { routeId: "route_a_provider_key_pose", reasonCode: "same_cat_score_too_low" },
        { routeId: "route_a_provider_key_pose", reasonCode: "same_cat_score_too_low" }
      ]
    });

    assert.equal(result.status, "repair_required");
    assert.ok(result.reasonCodes.includes("repeated_reason_requires_repair"));
    assert.ok(result.nextActions.includes("repair_generation_strategy"));
  });

  it("enforces route and total retry budgets", () => {
    const result = createV27RetryCostFailureGuidance({
      routeId: "route_c_local_rig",
      failureReason: "motion_amplitude_too_low",
      routeAttemptLimit: 2,
      totalAttemptLimit: 3,
      attemptHistory: [
        { routeId: "route_c_local_rig", reasonCode: "motion_amplitude_too_low", repairApplied: true },
        { routeId: "route_c_local_rig", reasonCode: "motion_amplitude_too_low", repairApplied: true },
        { routeId: "route_e_local_fallback_style_pack", reasonCode: "route_output_rejected", repairApplied: true }
      ]
    });

    assert.equal(result.status, "budget_exhausted");
    assert.ok(result.reasonCodes.includes("retry_budget_exhausted"));
    assert.ok(result.reasonCodes.includes("total_budget_exhausted"));
    assert.ok(result.nextActions.includes("stop_keep_current_pet"));
  });

  it("blocks provider route without credential, consent, and disclosure", () => {
    const result = createV27RetryCostFailureGuidance({
      routeId: "route_b_provider_action_sheet",
      failureReason: "provider_unavailable",
      attemptHistory: [],
      providerGate: {
        isProviderRoute: true,
        credentialRequired: true,
        credentialPresent: false,
        consentRequired: true,
        consentAccepted: false,
        costDisclosureShown: false,
        privacyDisclosureShown: false,
        retentionDisclosureShown: false,
        licenseDisclosureShown: false
      }
    });

    assert.equal(result.status, "provider_blocked");
    assert.equal(result.providerExecutionStarted, false);
    assert.equal(result.providerExecutionAllowed, false);
    assert.ok(result.reasonCodes.includes("provider_credential_missing"));
    assert.ok(result.reasonCodes.includes("provider_consent_required"));
    assert.ok(result.reasonCodes.includes("provider_cost_disclosure_required"));
    assert.ok(result.reasonCodes.includes("provider_privacy_disclosure_required"));
    assert.ok(result.reasonCodes.includes("provider_retention_disclosure_required"));
    assert.ok(result.reasonCodes.includes("provider_license_disclosure_required"));
  });

  it("gives photo-specific next actions", () => {
    const result = createV27RetryCostFailureGuidance({
      routeId: "route_e_local_fallback_style_pack",
      failureReason: "multi_cat_ambiguous",
      attemptHistory: []
    });

    assert.equal(result.status, "retry_allowed");
    assert.ok(result.reasonCodes.includes("better_photo_required"));
    assert.ok(result.nextActions.includes("use_single_cat_photo"));
  });

  it("detects forbidden diagnostics", () => {
    assert.equal(v27RetryGuidanceHasForbiddenContent({ note: "Authorization: secret" }), true);
  });
});
