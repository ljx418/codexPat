import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";
import {
  applyV22ApprovedCandidateToTarget,
  assetQualityReviewHasForbiddenContent,
  buildV22QualityEvidenceSnapshot,
  buildV22RetryGuidance,
  createV22CandidateAsset,
  runV22MotionQAGate,
  runV22TechnicalQAGate,
  submitV22VisualReview,
  type V22CandidateActionMetrics
} from "./asset-quality-review";

describe("V22 asset quality review gate", () => {
  test("V22.1 accepts valid candidate schema with safe evidence snapshot", () => {
    const candidate = createV22CandidateAsset({
      candidateId: "candidate-good",
      sourceRoute: "local_rig",
      safePackId: "approved-pack",
      actions: goodActions()
    });
    const snapshot = buildV22QualityEvidenceSnapshot(candidate);

    assert.equal(candidate.status, "generated");
    assert.equal(candidate.reasonCodes.length, 0);
    assert.equal(snapshot.actionCoverage.length, 8);
    assert.equal(assetQualityReviewHasForbiddenContent(snapshot), false);
  });

  test("V22.2 rejects missing core action and unsafe/blank technical fixtures", () => {
    const missing = runV22TechnicalQAGate(createV22CandidateAsset({
      candidateId: "candidate-missing",
      sourceRoute: "manual_fixture",
      safePackId: "bad-pack",
      actions: goodActions().filter((action) => action.actionId !== "sleeping")
    }));
    assert.equal(missing.status, "technical_failed");
    assert.ok(missing.reasonCodes.includes("missing_core_action"));

    const blank = runV22TechnicalQAGate(createV22CandidateAsset({
      candidateId: "candidate-blank",
      sourceRoute: "manual_fixture",
      safePackId: "bad-pack",
      actions: goodActions({ idle: { visiblePixelRatio: 0 } })
    }));
    assert.equal(blank.status, "technical_failed");
    assert.ok(blank.reasonCodes.includes("blank_frame_detected"));
    assert.ok(blank.reasonCodes.includes("transparent_frame_detected"));

    const unsafe = createV22CandidateAsset({
      candidateId: "candidate-http://bad",
      sourceRoute: "manual_fixture",
      safePackId: "unsafe-pack",
      actions: goodActions()
    });
    assert.equal(unsafe.status, "technical_failed");
    assert.ok(unsafe.reasonCodes.includes("unsafe_field_detected"));
  });

  test("V22.2 rejects off-canvas, background, watermark, and open loop", () => {
    const candidate = runV22TechnicalQAGate(createV22CandidateAsset({
      candidateId: "candidate-technical-failures",
      sourceRoute: "manual_fixture",
      safePackId: "bad-pack",
      actions: goodActions({
        idle: { offCanvas: true },
        thinking: { loopClosed: false },
        running: { hasBackground: true },
        success: { hasWatermark: true }
      })
    }));

    assert.equal(candidate.status, "technical_failed");
    assert.ok(candidate.reasonCodes.includes("off_canvas_frame_detected"));
    assert.ok(candidate.reasonCodes.includes("loop_closure_failed"));
    assert.ok(candidate.reasonCodes.includes("background_not_removed"));
    assert.ok(candidate.reasonCodes.includes("watermark_detected"));
  });

  test("V22.3 rejects weak motion, flicker, and identity drift", () => {
    const normalized = runV22TechnicalQAGate(createV22CandidateAsset({
      candidateId: "candidate-motion-fail",
      sourceRoute: "local_rig",
      safePackId: "weak-motion-pack",
      actions: goodActions({
        running: { motionAmplitude: 0.05 },
        success: { maxAdjacentDelta: 0.9 },
        need_input: { identityConsistent: false }
      })
    }));
    const motion = runV22MotionQAGate(normalized);

    assert.equal(normalized.status, "normalized");
    assert.equal(motion.status, "motion_failed");
    assert.ok(motion.reasonCodes.includes("motion_amplitude_too_low"));
    assert.ok(motion.reasonCodes.includes("frame_delta_too_large"));
    assert.ok(motion.reasonCodes.includes("identity_drift_detected"));
  });

  test("V22.4 rejects visually ugly candidate after technical and motion pass", () => {
    const reviewed = submitV22VisualReview(
      runV22MotionQAGate(runV22TechnicalQAGate(createV22CandidateAsset({
        candidateId: "v21-premium-pixel-failed",
        sourceRoute: "manual_fixture",
        safePackId: "premium-pixel-failed",
        actions: goodActions()
      }))),
      {
        reviewerKind: "operator",
        decision: "reject",
        reasonCodes: ["cat_not_cute_enough", "style_inconsistent"],
        commentSummary: "current cats are visually ugly and not product quality",
        reviewedAt: "2026-06-15T00:00:00.000Z"
      }
    );

    assert.equal(reviewed.status, "visual_rejected");
    assert.ok(reviewed.reasonCodes.includes("cat_not_cute_enough"));
    assert.ok(reviewed.guidance.some((message) => message.includes("视觉吸引力不足")));
  });

  test("V22.4 approves candidate only after visual review", () => {
    const candidate = runV22MotionQAGate(runV22TechnicalQAGate(createV22CandidateAsset({
      candidateId: "candidate-approved",
      sourceRoute: "motion_sheet",
      safePackId: "approved-pack",
      actions: goodActions()
    })));
    assert.equal(candidate.status, "visual_review_required");

    const approved = submitV22VisualReview(candidate, {
      reviewerKind: "operator",
      decision: "approve",
      reasonCodes: [],
      commentSummary: "clear, readable, installable pet",
      reviewedAt: "2026-06-15T00:00:00.000Z"
    });

    assert.equal(approved.status, "approved");
    assert.deepEqual(approved.reasonCodes, ["quality_passed"]);
  });

  test("V22.5 maps repeated failures to actionable retry or route guidance", () => {
    const routeSwitch = buildV22RetryGuidance({
      ...createV22CandidateAsset({
        candidateId: "candidate-provider-bad",
        sourceRoute: "provider_key_pose",
        safePackId: "bad-provider-pack",
        retryCount: 3,
        actions: goodActions()
      }),
      status: "visual_rejected",
      reasonCodes: ["provider_output_unusable", "cat_not_cute_enough"],
      guidance: []
    });
    assert.equal(routeSwitch.status, "route_switch_recommended");
    assert.ok(routeSwitch.reasonCodes.includes("alternate_route_recommended"));

    const exhausted = buildV22RetryGuidance({
      ...createV22CandidateAsset({
        candidateId: "candidate-exhausted",
        sourceRoute: "alternate_provider",
        safePackId: "bad-provider-pack",
        retryCount: 6,
        actions: goodActions()
      }),
      status: "motion_failed",
      reasonCodes: ["motion_amplitude_too_low"],
      guidance: []
    });
    assert.equal(exhausted.status, "budget_exhausted");
    assert.ok(exhausted.reasonCodes.includes("retry_budget_exceeded"));
    assert.ok(exhausted.guidance.some((message) => message.includes("单猫")));
  });

  test("V22.6 blocks unreviewed/rejected candidates and applies only approved candidates target-only", () => {
    const instances = [
      { instanceId: "default", activePackId: "flagship-work-cat-v2", isDefault: true },
      { instanceId: "codex_1", activePackId: "living-work-cat-v1" },
      { instanceId: "codex_2", activePackId: "previous-visible-pack" }
    ];
    const unreviewed = runV22MotionQAGate(runV22TechnicalQAGate(createV22CandidateAsset({
      candidateId: "candidate-unreviewed",
      sourceRoute: "local_rig",
      safePackId: "unreviewed-pack",
      actions: goodActions()
    })));
    const blocked = applyV22ApprovedCandidateToTarget({
      candidate: unreviewed,
      targetInstanceId: "codex_2",
      instances
    });
    assert.equal(blocked.status, "blocked");
    assert.equal(blocked.reasonCode, "apply_blocked_non_approved_candidate");
    assert.equal(blocked.afterAssignments.codex_2, "previous-visible-pack");

    const approved = submitV22VisualReview(unreviewed, {
      reviewerKind: "operator",
      decision: "approve",
      reasonCodes: [],
      commentSummary: "approved",
      reviewedAt: "2026-06-15T00:00:00.000Z"
    });
    const applied = applyV22ApprovedCandidateToTarget({
      candidate: approved,
      targetInstanceId: "codex_2",
      instances
    });

    assert.equal(applied.status, "applied");
    assert.equal(applied.afterAssignments.codex_2, "unreviewed-pack");
    assert.equal(applied.afterAssignments.default, "flagship-work-cat-v2");
    assert.equal(applied.afterAssignments.codex_1, "living-work-cat-v1");
    assert.equal(applied.defaultPetUnchanged, true);
    assert.equal(applied.unrelatedPetsUnchanged, true);
    assert.equal(applied.rollbackAvailable, true);
    assert.equal(assetQualityReviewHasForbiddenContent(buildV22QualityEvidenceSnapshot(approved, applied)), false);
  });
});

function goodActions(overrides: Partial<Record<CoreActionId, Partial<V22CandidateActionMetrics>>> = {}): V22CandidateActionMetrics[] {
  return CORE_ACTION_IDS.map((actionId) => ({
    actionId,
    frameCount: loopAction(actionId) ? 6 : 3,
    visiblePixelRatio: 0.42,
    offCanvas: false,
    hasBackground: false,
    hasWatermark: false,
    loopClosed: true,
    maxAdjacentDelta: 0.16,
    anchorDrift: 0.04,
    motionAmplitude: motionAction(actionId) ? 0.32 : 0.1,
    identityConsistent: true,
    humanReadable: true,
    staticLike: false,
    ...overrides[actionId]
  }));
}

function loopAction(actionId: CoreActionId) {
  return actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping";
}

function motionAction(actionId: CoreActionId) {
  return actionId === "running" || actionId === "success" || actionId === "warning" || actionId === "error" || actionId === "need_input";
}

