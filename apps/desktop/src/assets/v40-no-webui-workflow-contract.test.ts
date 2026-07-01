import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  V40_NO_WEBUI_ACTION_IDS,
  runV40NoWebUIClaimScan,
  runV40NoWebUISecurityScan,
  sanitizeV40NoWebUIRelativeRef,
  sanitizeV40NoWebUISafeId,
  validateV40CandidateVisualReview,
  validateV40HybridCandidateSummary,
  validateV40NoWebUIRunRequest,
  validateV40ProductGateSummary
} from "./v40-no-webui-workflow-contract";

const actionCoverage = Object.fromEntries(V40_NO_WEBUI_ACTION_IDS.map((actionId) => [actionId, true])) as Record<(typeof V40_NO_WEBUI_ACTION_IDS)[number], boolean>;

describe("V40.2 no-WebUI workflow contract", () => {
  it("accepts safe direct-runner run requests", () => {
    const result = validateV40NoWebUIRunRequest({
      sampleId: "v38-a-cat-public",
      sourceRef: "docs/V38.x/evidence/assets/v38-a-cat-public/sanitized.png",
      baselineV39Ref: "/v39/v38_a_cat_public/contact-sheet.svg",
      route: "direct_local_runner_no_webui",
      actionSet: [...V40_NO_WEBUI_ACTION_IDS],
      consentBoundary: "public_sample"
    });

    assert.equal(result.status, "accepted");
    assert.deepEqual(result.reasonCodes, ["v40_no_webui_contract_passed"]);
  });

  it("rejects unsafe paths, remote URLs, and raw prompt or payload content", () => {
    assert.equal(sanitizeV40NoWebUISafeId("V38 A Cat Public"), "v38-a-cat-public");
    assert.equal(sanitizeV40NoWebUIRelativeRef("docs/V40.x/evidence/assets/candidate.png"), "docs/V40.x/evidence/assets/candidate.png");
    assert.equal(sanitizeV40NoWebUIRelativeRef("https://example.com/cat.png"), null);
    assert.equal(sanitizeV40NoWebUIRelativeRef("/mnt/c/workspace/codexpat/cat.png"), null);

    const result = validateV40NoWebUIRunRequest({
      sampleId: "bad sample",
      sourceRef: "https://example.com/cat.png",
      baselineV39Ref: "/mnt/c/workspace/codexpat/v39.svg",
      route: "direct_local_runner_no_webui",
      actionSet: ["idle"],
      consentBoundary: "public_sample"
    });

    assert.equal(result.status, "failed");
    assert.equal(result.reasonCodes.includes("remote_url_rejected"), true);
    assert.equal(result.reasonCodes.includes("raw_path_leak_detected"), true);
    assert.equal(result.reasonCodes.includes("action_set_invalid"), true);
    assert.equal(runV40NoWebUISecurityScan("raw prompt: draw this cat").status, "failed");
    assert.equal(runV40NoWebUISecurityScan("raw runner payload: {}").status, "failed");
  });

  it("validates candidate summaries before later phases can review them", () => {
    const accepted = validateV40HybridCandidateSummary({
      candidateId: "v40-candidate-a",
      sampleId: "v38-a-cat-public",
      status: "generated",
      route: "direct_local_runner_no_webui",
      characterRef: "docs/V40.x/evidence/assets/v40-direct-runner-candidates/v40-candidate-a-character.png",
      contactSheetRef: "docs/V40.x/evidence/assets/v40-direct-runner-candidates/v40-candidate-a-contact.png",
      animatedPreviewRef: "docs/V40.x/evidence/assets/v40-direct-runner-candidates/v40-candidate-a-preview.gif",
      actionCoverage,
      identityScore: "warn",
      visualPreference: "not_reviewed",
      reasonCodes: ["candidate_generated"]
    });

    assert.equal(accepted.status, "accepted");

    const blocked = validateV40HybridCandidateSummary({
      candidateId: "v40-candidate-b",
      sampleId: "v38-a-cat-public",
      status: "generated",
      route: "direct_local_runner_no_webui",
      characterRef: "docs/V40.x/evidence/assets/v40-direct-runner-candidates/v40-candidate-b-character.png",
      contactSheetRef: null,
      animatedPreviewRef: null,
      actionCoverage: { ...actionCoverage, play: undefined as unknown as boolean },
      identityScore: "warn",
      visualPreference: "not_reviewed",
      reasonCodes: ["candidate_generated"]
    });
    assert.equal(blocked.status, "blocked");
    assert.equal(blocked.reasonCodes.includes("action_coverage_invalid"), true);
  });

  it("validates product gate summaries and forbidden claims", () => {
    assert.equal(validateV40ProductGateSummary({
      previewReady: true,
      targetOnlyApplyReady: true,
      rollbackReady: true,
      activePackPreservedOnFailure: true,
      blockedReason: null
    }).status, "accepted");

    assert.equal(validateV40ProductGateSummary({
      previewReady: false,
      targetOnlyApplyReady: false,
      rollbackReady: false,
      activePackPreservedOnFailure: true,
      blockedReason: "candidate_not_ready"
    }).status, "blocked");

    assert.equal(runV40NoWebUIClaimScan("V40.2 contract passed scoped").status, "passed");
    assert.equal(runV40NoWebUIClaimScan("Petdex parity achieved").status, "failed");
  });

  it("fails generated candidates that do not pass visual target-experience review", () => {
    const passed = validateV40CandidateVisualReview({
      candidateId: "v40-candidate-good",
      status: "passed",
      observations: ["single quadruped cat per action", "no text artifacts", "action semantics readable"],
      reasonCodes: []
    });
    assert.equal(passed.status, "accepted");
    assert.deepEqual(passed.reasonCodes, ["v40_visual_review_passed"]);

    const failed = validateV40CandidateVisualReview({
      candidateId: "v40-candidate-bad",
      status: "failed",
      observations: ["multiple cats in one action frame", "humanoid clothing artifact", "action semantics unclear"],
      reasonCodes: ["multi_subject_artifact", "humanoid_or_clothing_artifact", "action_semantics_unclear", "target_experience_quality_failed"]
    });
    assert.equal(failed.status, "failed");
    assert.equal(failed.reasonCodes.includes("visual_review_failed"), true);
    assert.equal(failed.reasonCodes.includes("target_experience_quality_failed"), true);
  });
});
