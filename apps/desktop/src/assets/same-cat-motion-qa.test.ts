import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";
import {
  buildV25QAEvidenceSnapshot,
  runV25SameCatMotionQA,
  sameCatMotionQAHasForbiddenContent
} from "./same-cat-motion-qa";

describe("V25 same-cat and motion QA", () => {
  it("accepts a technically valid moving same-cat candidate for V22 visual review", () => {
    const result = runV25SameCatMotionQA({
      candidateId: "v25_candidate_good",
      safePackId: "v25_pack_good",
      sourceRoute: "local_rig",
      sameCatConsistencyScore: 0.9,
      traitMismatchCount: 0,
      actions: validActions()
    });
    const evidence = buildV25QAEvidenceSnapshot(result);

    assert.equal(result.status, "accepted_for_v22_review");
    assert.equal(result.proceedsToV22VisualReview, true);
    assert.equal(result.v22Status, "visual_review_required");
    assert.ok(result.reasonCodes.includes("same_cat_qa_passed"));
    assert.ok(result.reasonCodes.includes("v22_visual_review_ready"));
    assert.equal(sameCatMotionQAHasForbiddenContent({ result, evidence }), false);
  });

  it("rejects identity drift before visual review", () => {
    const result = runV25SameCatMotionQA({
      candidateId: "v25_candidate_drift",
      safePackId: "v25_pack_drift",
      sourceRoute: "provider_key_pose",
      sameCatConsistencyScore: 0.5,
      traitMismatchCount: 2,
      actions: validActions()
    });

    assert.equal(result.status, "rejected");
    assert.equal(result.proceedsToV22VisualReview, false);
    assert.ok(result.reasonCodes.includes("identity_drift_detected"));
    assert.ok(result.reasonCodes.includes("same_cat_score_too_low"));
  });

  it("rejects weak motion", () => {
    const actions = validActions().map((action) => action.actionId === "running"
      ? { ...action, motionAmplitude: 0.02, staticLike: true, humanReadable: false }
      : action);
    const result = runV25SameCatMotionQA({
      candidateId: "v25_candidate_weak_motion",
      safePackId: "v25_pack_weak_motion",
      sourceRoute: "local_rig",
      sameCatConsistencyScore: 0.9,
      actions
    });

    assert.equal(result.status, "rejected");
    assert.ok(result.reasonCodes.includes("motion_amplitude_too_low"));
  });

  it("rejects large adjacent delta and loop closure failure", () => {
    const actions = validActions().map((action) => {
      if (action.actionId === "thinking") {
        return { ...action, loopClosed: false };
      }
      if (action.actionId === "need_input") {
        return { ...action, maxAdjacentDelta: 0.8 };
      }
      return action;
    });
    const result = runV25SameCatMotionQA({
      candidateId: "v25_candidate_jumpy",
      safePackId: "v25_pack_jumpy",
      sourceRoute: "provider_key_pose",
      sameCatConsistencyScore: 0.9,
      actions
    });

    assert.equal(result.status, "rejected");
    assert.ok(result.reasonCodes.includes("frame_delta_too_large"));
    assert.ok(result.reasonCodes.includes("loop_closure_failed"));
  });

  it("rejects off-canvas, blank, transparent, and missing action conditions", () => {
    const actions = validActions()
      .filter((action) => action.actionId !== "sleeping")
      .map((action) => {
        if (action.actionId === "error") {
          return { ...action, visiblePixelRatio: 0, offCanvas: true };
        }
        if (action.actionId === "warning") {
          return { ...action, visiblePixelRatio: 0.005 };
        }
        return action;
      });
    const result = runV25SameCatMotionQA({
      candidateId: "v25_candidate_technical_bad",
      safePackId: "v25_pack_technical_bad",
      sourceRoute: "manual_fixture",
      sameCatConsistencyScore: 0.9,
      actions
    });

    assert.equal(result.status, "rejected");
    assert.ok(result.reasonCodes.includes("blank_frame_detected"));
    assert.ok(result.reasonCodes.includes("transparent_frame_detected"));
    assert.ok(result.reasonCodes.includes("off_canvas_frame_detected"));
    assert.ok(result.reasonCodes.includes("missing_core_action"));
  });

  it("detects forbidden diagnostics", () => {
    assert.equal(sameCatMotionQAHasForbiddenContent({ note: "/Users/example/private" }), true);
  });
});

function validActions() {
  return CORE_ACTION_IDS.map((actionId) => action(actionId));
}

function action(actionId: CoreActionId) {
  const loopAction = actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping";
  return {
    actionId,
    frameCount: loopAction ? 6 : 3,
    visiblePixelRatio: 0.28,
    offCanvas: false,
    hasBackground: false,
    hasWatermark: false,
    loopClosed: loopAction ? true : true,
    maxAdjacentDelta: 0.18,
    anchorDrift: 0.05,
    motionAmplitude: actionId === "idle" ? 0.08 : 0.28,
    identityConsistent: true,
    humanReadable: true,
    staticLike: false
  };
}
