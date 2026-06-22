import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CORE_ACTION_IDS } from "./asset-manifest";
import {
  buildV29QualityGateEvidenceSnapshot,
  runV29QualityGateV2,
  v29AcceptedActionMetrics
} from "./quality-gate-v2";

describe("V29 Quality Gate V2", () => {
  it("accepts a complete same-cat visible motion candidate and ranks it", () => {
    const result = runV29QualityGateV2({
      candidateId: "candidate_good",
      safePackId: "pack_good",
      actions: v29AcceptedActionMetrics()
    });

    assert.equal(result.status, "accepted");
    assert.equal(result.hardRejected, false);
    assert.equal(result.reasonCodes.includes("quality_gate_passed"), true);
    assert.equal(result.reasonCodes.includes("candidate_ranked"), true);
    assert.equal(result.rank, "A");
    assert.equal(CORE_ACTION_IDS.every((actionId) => result.actionCoverage[actionId]), true);
    assert.equal(JSON.stringify(buildV29QualityGateEvidenceSnapshot(result)).includes("/Users/"), false);
  });

  it("rejects missing action coverage", () => {
    const result = runV29QualityGateV2({
      candidateId: "candidate_missing",
      safePackId: "pack_missing",
      actions: v29AcceptedActionMetrics().filter((action) => action.actionId !== "need_input")
    });

    assert.equal(result.status, "rejected");
    assert.equal(result.reasonCodes.includes("action_coverage_incomplete"), true);
    assert.equal(result.hardRejected, true);
    assert.equal(result.rank, "rejected");
  });

  it("rejects weak motion even with good same-cat and aesthetic scores", () => {
    const result = runV29QualityGateV2({
      candidateId: "candidate_weak_motion",
      safePackId: "pack_weak_motion",
      actions: v29AcceptedActionMetrics({ motionAmplitude: 0.03, aestheticScore: 0.95, sameCatScore: 0.95 })
    });

    assert.equal(result.status, "rejected");
    assert.equal(result.reasonCodes.includes("motion_amplitude_too_low"), true);
    assert.equal(result.hardRejected, true);
  });

  it("rejects identity drift and unsafe visual frames", () => {
    const result = runV29QualityGateV2({
      candidateId: "candidate_bad_visual",
      safePackId: "pack_bad_visual",
      actions: v29AcceptedActionMetrics({
        sameCatScore: 0.5,
        backgroundClean: false,
        offCanvas: true,
        visiblePixelRatio: 0,
        maxAdjacentDelta: 0.8,
        loopClosed: false,
        readableAt075x: false
      })
    });

    assert.equal(result.status, "rejected");
    assert.equal(result.reasonCodes.includes("same_cat_score_too_low"), true);
    assert.equal(result.reasonCodes.includes("background_not_clean"), true);
    assert.equal(result.reasonCodes.includes("off_canvas_frame"), true);
    assert.equal(result.reasonCodes.includes("blank_or_transparent_frame"), true);
    assert.equal(result.reasonCodes.includes("frame_delta_too_large"), true);
    assert.equal(result.reasonCodes.includes("loop_closure_failed"), true);
    assert.equal(result.reasonCodes.includes("readability_failed"), true);
  });

  it("does not let aesthetic ranking override hard QA failures", () => {
    const result = runV29QualityGateV2({
      candidateId: "candidate_pretty_bad",
      safePackId: "pack_pretty_bad",
      actions: v29AcceptedActionMetrics({ aestheticScore: 1, sameCatScore: 0.4 })
    });

    assert.equal(result.status, "rejected");
    assert.equal(result.hardRejected, true);
    assert.equal(result.rank, "rejected");
    assert.equal(result.reasonCodes.includes("candidate_ranked"), false);
  });

  it("sanitizes unsafe candidate and pack IDs", () => {
    const result = runV29QualityGateV2({
      candidateId: "../candidate",
      safePackId: "/Users/private-pack",
      actions: v29AcceptedActionMetrics()
    });

    assert.equal(result.status, "rejected");
    assert.equal(result.candidateId, "v29_candidate");
    assert.equal(result.safePackId, "v29_pack");
    assert.equal(result.reasonCodes.includes("unsafe_field_detected"), true);
  });
});
