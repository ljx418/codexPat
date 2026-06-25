import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";
import {
  runV32QualityRescueGate,
  v32QualityRescueHasForbiddenContent,
  type V32MeasuredActionMetrics,
  type V32QualityRescueCandidate
} from "./v32-quality-rescue";

describe("V32 quality rescue gate", () => {
  it("accepts a measured local layered-rig candidate only when all actions clear the quality bar", () => {
    const result = runV32QualityRescueGate(candidate());

    assert.equal(result.status, "passed");
    assert.deepEqual(result.reasonCodes, ["v32_quality_rescue_passed"]);
    assert.equal(Object.values(result.actionCoverage).every(Boolean), true);
    assert.equal(result.scoreBuckets.localMotion, "medium");
  });

  it("rejects weak repeated frames and whole-image transform-only movement", () => {
    const result = runV32QualityRescueGate(candidate({
      duplicateFrameRatio: 0.75,
      meanAdjacentDelta: 0.01,
      wholeImageTransformOnly: true,
      localPartMotionScore: 0.03
    }));

    assert.equal(result.status, "failed");
    assert.ok(result.reasonCodes.includes("duplicate_frames_too_high"));
    assert.ok(result.reasonCodes.includes("motion_delta_too_low"));
    assert.ok(result.reasonCodes.includes("whole_image_transform_rejected"));
    assert.ok(result.reasonCodes.includes("local_part_motion_too_low"));
  });

  it("rejects low frame count, bad loop closure, dirty background, and small-scale unreadability", () => {
    const result = runV32QualityRescueGate(candidate({
      frameCount: 4,
      loopClosureDelta: 0.4,
      transparentBackground: false,
      readableAt075x: false
    }));

    assert.equal(result.status, "failed");
    assert.ok(result.reasonCodes.includes("frame_count_too_low"));
    assert.ok(result.reasonCodes.includes("loop_closure_failed"));
    assert.ok(result.reasonCodes.includes("background_not_transparent"));
    assert.ok(result.reasonCodes.includes("small_scale_readability_failed"));
  });

  it("blocks missing source/license/evidence instead of pretending to pass", () => {
    const result = runV32QualityRescueGate({
      ...candidate(),
      sourceAvailable: false,
      licenseBoundaryOk: false,
      hasVisualEvidence: false
    });

    assert.equal(result.status, "blocked");
    assert.ok(result.reasonCodes.includes("source_asset_missing"));
    assert.ok(result.reasonCodes.includes("license_boundary_missing"));
    assert.ok(result.reasonCodes.includes("visual_evidence_missing"));
  });

  it("detects unsafe evidence fields", () => {
    assert.equal(v32QualityRescueHasForbiddenContent({ auth: "Authorization Bearer abcdefghi" }), true);
    const result = runV32QualityRescueGate({
      ...candidate(),
      candidateId: "/Users/private/cat"
    });

    assert.equal(result.status, "failed");
    assert.ok(result.reasonCodes.includes("unsafe_field_detected"));
  });
});

function candidate(overrides: Partial<V32MeasuredActionMetrics> = {}): V32QualityRescueCandidate {
  return {
    candidateId: "quality-rescue-tabby-v1",
    safePackId: "quality-rescue-tabby-v1",
    routeKind: "local_layered_rig",
    sourceAvailable: true,
    licenseBoundaryOk: true,
    hasVisualEvidence: true,
    actions: CORE_ACTION_IDS.map((actionId) => actionMetrics(actionId, overrides))
  };
}

function actionMetrics(actionId: CoreActionId, overrides: Partial<V32MeasuredActionMetrics>): V32MeasuredActionMetrics {
  const loop = actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping";
  const subtle = actionId === "idle" || actionId === "sleeping";
  return {
    actionId,
    frameCount: loop ? 12 : 8,
    visiblePixelRatio: 0.28,
    duplicateFrameRatio: 0.02,
    meanAdjacentDelta: subtle ? 0.025 : 0.08,
    maxAdjacentDelta: subtle ? 0.09 : 0.22,
    loopClosureDelta: loop ? 0.02 : 0.24,
    transparentBackground: true,
    offCanvas: false,
    wholeImageTransformOnly: false,
    localPartMotionScore: subtle ? 0.2 : 0.72,
    visualDetailScore: 0.74,
    readableAt1x: true,
    readableAt075x: true,
    ...overrides
  };
}
