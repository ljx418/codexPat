import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";
import { assemblePhoto2DContinuityPack, type Photo2DActionFrameSet } from "./photo-to-2d-continuity-assembler";
import {
  applyPhoto2DGeneratedPackToTarget,
  buildPhoto2DPreviewApplyEvidenceSnapshot,
  createPhoto2DGeneratedPackPreviewFlow,
  photo2DPreviewApplyHasForbiddenContent
} from "./photo-to-2d-preview-apply-flow";

describe("V15.13 photo-guided 2D preview and apply flow", () => {
  test("previews all core actions without mutating runtime state", () => {
    const assembly = acceptedAssembly();
    const flow = createPhoto2DGeneratedPackPreviewFlow({
      assembly,
      targetInstanceId: "codex_2",
      instances: instances()
    });

    assert.equal(flow.status, "ready");
    assert.equal(flow.reasonCode, "preview_apply_ready");
    assert.equal(flow.previewActions.length, 8);
    assert.deepEqual(flow.previewActions.map((action) => action.actionId), CORE_ACTION_IDS);
    assert.equal(flow.previewSafety.acceptedPetEvents, 0);
    assert.equal(flow.previewSafety.callsNotify, false);
    assert.equal(flow.previewSafety.writesCatStateMachine, false);
    assert.equal(flow.previewSafety.mutatesLivePetInstance, false);
    assert.deepEqual(flow.beforeAssignments, {
      default: "flagship-work-cat-v2",
      codex_1: "living-work-cat-v1",
      codex_2: "previous-silver-pack"
    });
    assert.equal(photo2DPreviewApplyHasForbiddenContent(flow), false);
  });

  test("applies generated pack only to selected target pet", () => {
    const flow = createPhoto2DGeneratedPackPreviewFlow({
      assembly: acceptedAssembly(),
      targetInstanceId: "codex_2",
      instances: instances()
    });
    const applied = applyPhoto2DGeneratedPackToTarget(flow);

    assert.equal(applied.status, "applied");
    assert.equal(applied.reasonCode, "target_pack_applied");
    assert.equal(applied.afterAssignments.codex_2, "photo-2d-orange-tabby-v1");
    assert.equal(applied.afterAssignments.default, "flagship-work-cat-v2");
    assert.equal(applied.afterAssignments.codex_1, "living-work-cat-v1");
    assert.equal(applied.defaultPetUnchanged, true);
    assert.equal(applied.unrelatedPetsUnchanged, true);
    assert.equal(applied.acceptedPetEvents, 0);
    assert.equal(applied.callsNotify, false);
    assert.equal(applied.writesCatStateMachine, false);
    assert.equal(photo2DPreviewApplyHasForbiddenContent(applied), false);
  });

  test("builds sanitized evidence snapshot with safe fields only", () => {
    const flow = createPhoto2DGeneratedPackPreviewFlow({
      assembly: acceptedAssembly(),
      targetInstanceId: "codex_2",
      instances: instances()
    });
    const applied = applyPhoto2DGeneratedPackToTarget(flow);
    const snapshot = buildPhoto2DPreviewApplyEvidenceSnapshot(flow, applied);

    assert.equal(snapshot.previewStatus, "ready");
    assert.equal(snapshot.previewActionCount, 8);
    assert.equal(snapshot.applyStatus, "applied");
    assert.equal(snapshot.defaultPetUnchanged, true);
    assert.equal(snapshot.unrelatedPetsUnchanged, true);
    assert.deepEqual(snapshot.safeRendererInputFields, [
      "safeActionId",
      "rendererKind",
      "safePackId",
      "playbackIntent",
      "scale",
      "visibility"
    ]);
    assert.equal(photo2DPreviewApplyHasForbiddenContent(snapshot), false);
  });

  test("blocks preview when assembly was rejected and preserves previous pack", () => {
    const rejected = assemblePhoto2DContinuityPack({
      generatedPackId: "photo-2d-orange-tabby-v1",
      displayName: "Photo 2D Orange",
      actionFrames: validFrameSets().filter((set) => set.actionId !== "sleeping")
    });
    const flow = createPhoto2DGeneratedPackPreviewFlow({
      assembly: rejected,
      targetInstanceId: "codex_2",
      instances: instances()
    });
    const applied = applyPhoto2DGeneratedPackToTarget(flow);

    assert.equal(flow.status, "blocked");
    assert.equal(flow.reasonCode, "generated_pack_not_accepted");
    assert.equal(applied.status, "blocked");
    assert.equal(applied.reasonCode, "generated_pack_not_accepted");
    assert.equal(applied.previousPackPreserved, true);
  });

  test("blocks unsafe target and unknown target before apply", () => {
    const unsafeTarget = createPhoto2DGeneratedPackPreviewFlow({
      assembly: acceptedAssembly(),
      targetInstanceId: "../codex_2",
      instances: instances()
    });
    assert.equal(unsafeTarget.status, "blocked");
    assert.equal(unsafeTarget.reasonCode, "target_instance_required");

    const unknownTarget = createPhoto2DGeneratedPackPreviewFlow({
      assembly: acceptedAssembly(),
      targetInstanceId: "codex_404",
      instances: instances()
    });
    assert.equal(unknownTarget.status, "blocked");
    assert.equal(unknownTarget.reasonCode, "target_instance_not_found");
  });
});

function acceptedAssembly() {
  return assemblePhoto2DContinuityPack({
    generatedPackId: "photo-2d-orange-tabby-v1",
    displayName: "Photo 2D Orange",
    actionFrames: validFrameSets()
  });
}

function instances() {
  return [
    { instanceId: "default", displayName: "Default", activePackId: "flagship-work-cat-v2", isDefault: true },
    { instanceId: "codex_1", displayName: "Work Cat", activePackId: "living-work-cat-v1" },
    { instanceId: "codex_2", displayName: "Generated Target", activePackId: "previous-silver-pack" }
  ];
}

function validFrameSets(): Photo2DActionFrameSet[] {
  return CORE_ACTION_IDS.map((actionId) => {
    const count = loopAction(actionId) ? 6 : 3;
    return {
      actionId,
      fps: 8,
      frames: framesForAction(actionId, count)
    };
  });
}

function framesForAction(actionId: CoreActionId, count: number) {
  const phases = count >= 6 ? [0, 1, 2, 1, 0, 0] : [0, 1, 0];
  return Array.from({ length: count }, (_, index) => {
    const phase = phases[index] ?? 0;
    return {
      fileName: `${actionId}-frame-${String(index + 1).padStart(3, "0")}.png`,
      poseSignature: phase === 0 ? "closed" : `pose-${phase}`,
      bodyY: phase === 0 ? 0 : phase * 2,
      headY: phase === 0 ? 0 : phase * 2,
      silhouetteWidth: phase === 0 ? 100 : 100 + phase,
      alphaCoverage: 0.8,
      offCanvas: false
    };
  });
}

function loopAction(actionId: CoreActionId) {
  return actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping";
}
