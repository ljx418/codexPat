import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CORE_ACTION_IDS } from "./asset-manifest";
import {
  V30_ACTION_STORYBOARDS,
  buildV30EvidenceSnapshot,
  createV30SemanticCandidate,
  createV30WeakTransformCandidate,
  runV30MotionReadabilityQA,
  semanticAnimationHasForbiddenContent,
  validateV30Storyboards
} from "./semantic-animation-quality";

describe("V30 semantic animation quality", () => {
  it("validates 8 action storyboards with key poses", () => {
    const result = validateV30Storyboards();

    assert.equal(result.status, "passed");
    assert.equal(result.storyboardCount, 8);
    assert.equal(CORE_ACTION_IDS.every((actionId) => result.actionCoverage[actionId]), true);
    assert.equal(V30_ACTION_STORYBOARDS.running.keyPoses.length >= 3, true);
    assert.equal(V30_ACTION_STORYBOARDS.success.keyPoses.length >= 3, true);
    assert.equal(V30_ACTION_STORYBOARDS.error.keyPoses.length >= 3, true);
    assert.equal(V30_ACTION_STORYBOARDS.need_input.keyPoses.length >= 3, true);
  });

  it("rejects transform-only weak baseline candidates", () => {
    const result = runV30MotionReadabilityQA(createV30WeakTransformCandidate());

    assert.equal(result.status, "failed");
    assert.ok(result.reasonCodes.includes("whole_image_transform_only"));
    assert.ok(result.reasonCodes.includes("motion_amplitude_too_low"));
    assert.ok(result.reasonCodes.includes("key_pose_diversity_too_low"));
    assert.ok(result.reasonCodes.includes("silhouette_change_too_low"));
    assert.ok(result.reasonCodes.includes("visual_review_rejected"));
    assert.equal(result.transformOnlyScore, "high");
  });

  it("accepts a semantic candidate with readable actions", () => {
    const result = runV30MotionReadabilityQA(createV30SemanticCandidate());
    const evidence = buildV30EvidenceSnapshot(result);

    assert.equal(result.status, "passed");
    assert.ok(result.reasonCodes.includes("semantic_animation_passed"));
    assert.equal(result.semanticChecklistResult, "passed");
    assert.equal(result.loopClosureResult, "passed");
    assert.equal(result.adjacentDeltaResult, "passed");
    assert.equal(result.sameCatResult, "passed");
    assert.equal(semanticAnimationHasForbiddenContent(evidence), false);
  });

  it("rejects unreadable active action even when frame metrics are present", () => {
    const candidate = createV30SemanticCandidate({
      semanticReadable: true,
      manualVisualPass: true
    });
    candidate.actions = candidate.actions.map((action) => action.actionId === "running"
      ? {
        ...action,
        semanticReadable: false,
        motionAmplitude: 0.45,
        keyPoseDiversity: 0.7,
        silhouetteChange: 0.36
      }
      : action);
    const result = runV30MotionReadabilityQA(candidate);

    assert.equal(result.status, "failed");
    assert.ok(result.reasonCodes.includes("action_semantics_unreadable"));
  });

  it("rejects loop, jump, identity, background, and off-canvas failures", () => {
    const candidate = createV30SemanticCandidate();
    candidate.actions = candidate.actions.map((action) => {
      if (action.actionId === "success") return { ...action, maxAdjacentDelta: 0.8 };
      if (action.actionId === "sleeping") return { ...action, loopClosed: false };
      if (action.actionId === "error") return { ...action, sameCatScore: 0.4 };
      if (action.actionId === "warning") return { ...action, backgroundClean: false };
      if (action.actionId === "need_input") return { ...action, offCanvas: true };
      return action;
    });
    const result = runV30MotionReadabilityQA(candidate);

    assert.equal(result.status, "failed");
    assert.ok(result.reasonCodes.includes("adjacent_frame_jump"));
    assert.ok(result.reasonCodes.includes("loop_closure_failed"));
    assert.ok(result.reasonCodes.includes("identity_drift"));
    assert.ok(result.reasonCodes.includes("background_residue"));
    assert.ok(result.reasonCodes.includes("off_canvas_frame"));
  });

  it("detects forbidden diagnostics", () => {
    assert.equal(semanticAnimationHasForbiddenContent({ note: "/Users/example/private" }), true);
  });
});
