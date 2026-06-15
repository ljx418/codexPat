import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CORE_ACTION_IDS, type CoreActionId } from "./asset-manifest";
import {
  assemblePhoto2DContinuityPack,
  buildPhoto2DContinuityAssemblyEvidenceSnapshot,
  photo2DContinuityAssemblyHasForbiddenContent,
  type Photo2DActionFrameSet,
  type Photo2DFrameMetadata
} from "./photo-to-2d-continuity-assembler";
import { CSS_DEFAULT_ASSET_MANIFEST } from "./bundled-packs/css-default.manifest";

describe("V15.12 photo-to-2D continuity assembler", () => {
  it("assembles accepted 8-action local frame metadata into a safe sprite pack", () => {
    const result = assemblePhoto2DContinuityPack({
      generatedPackId: "photo-2d-orange-tabby-v1",
      displayName: "Photo 2D Orange Tabby V1",
      actionFrames: validFrameSets()
    });
    const evidence = buildPhoto2DContinuityAssemblyEvidenceSnapshot(result);

    assert.equal(result.status, "accepted");
    assert.equal(result.reasonCode, "accepted");
    assert.equal(result.generatedPackId, "photo-2d-orange-tabby-v1");
    assert.equal(result.preservedPreviousActivePack, false);
    assert.equal(result.manifest?.rendererKind, "sprite");
    assert.equal(result.safeRendererOutput?.rendererKind, "sprite");
    assert.deepEqual(evidence.coreActionCoverage, [...CORE_ACTION_IDS]);
    assert.equal(Object.values(result.frameCountTable).every((count) => count >= 3), true);
    assert.equal(Object.values(result.continuityTable).every((item) => item.firstFinalClosed), true);
    assert.equal(photo2DContinuityAssemblyHasForbiddenContent(evidence), false);
  });

  it("rejects first/final mismatch and preserves previous active pack", () => {
    const frames = validFrameSets();
    frames[0].frames[frames[0].frames.length - 1] = {
      ...frames[0].frames[frames[0].frames.length - 1],
      poseSignature: "open-loop",
      bodyY: 7
    };
    const result = assemblePhoto2DContinuityPack({
      generatedPackId: "photo-2d-open-loop",
      displayName: "Photo 2D Open Loop",
      actionFrames: frames,
      previousActiveManifest: CSS_DEFAULT_ASSET_MANIFEST
    });

    assert.equal(result.status, "rejected");
    assert.equal(result.reasonCode, "first_final_mismatch");
    assert.equal(result.preservedPreviousActivePack, true);
  });

  it("rejects adjacent-frame jump", () => {
    const frames = validFrameSets();
    frames[1].frames[2] = {
      ...frames[1].frames[2],
      bodyY: 40
    };
    const result = assemblePhoto2DContinuityPack({
      generatedPackId: "photo-2d-jumpy",
      displayName: "Photo 2D Jumpy",
      actionFrames: frames,
      previousActiveManifest: CSS_DEFAULT_ASSET_MANIFEST
    });

    assert.equal(result.status, "rejected");
    assert.equal(result.reasonCode, "adjacent_delta_exceeded");
    assert.equal(result.preservedPreviousActivePack, true);
  });

  it("rejects unsafe or invisible frames", () => {
    const unsafe = validFrameSets();
    unsafe[0].frames[0] = { ...unsafe[0].frames[0], fileName: "../escape.png" };
    const blank = validFrameSets();
    blank[0].frames[0] = { ...blank[0].frames[0], alphaCoverage: 0 };
    const offCanvas = validFrameSets();
    offCanvas[0].frames[0] = { ...offCanvas[0].frames[0], offCanvas: true };

    assert.equal(assemblePhoto2DContinuityPack({
      generatedPackId: "photo-2d-unsafe",
      displayName: "Photo 2D Unsafe",
      actionFrames: unsafe,
      previousActiveManifest: CSS_DEFAULT_ASSET_MANIFEST
    }).reasonCode, "unsafe_svg_payload");
    assert.equal(assemblePhoto2DContinuityPack({
      generatedPackId: "photo-2d-blank",
      displayName: "Photo 2D Blank",
      actionFrames: blank,
      previousActiveManifest: CSS_DEFAULT_ASSET_MANIFEST
    }).reasonCode, "frame_blank");
    assert.equal(assemblePhoto2DContinuityPack({
      generatedPackId: "photo-2d-offcanvas",
      displayName: "Photo 2D Off Canvas",
      actionFrames: offCanvas,
      previousActiveManifest: CSS_DEFAULT_ASSET_MANIFEST
    }).reasonCode, "frame_off_canvas");
  });
});

function validFrameSets(): Photo2DActionFrameSet[] {
  return CORE_ACTION_IDS.map((actionId) => {
    const count = actionId === "idle" || actionId === "thinking" || actionId === "running" || actionId === "sleeping" ? 6 : 3;
    return {
      actionId,
      fps: 8,
      frames: framesForAction(actionId, count)
    };
  });
}

function framesForAction(actionId: CoreActionId, count: number): Photo2DFrameMetadata[] {
  const phases = count >= 6 ? [0, 1, 2, 1, 0, 0] : [0, 1, 0];
  const frames: Photo2DFrameMetadata[] = [];
  for (let index = 0; index < count; index += 1) {
    const phase = phases[index] ?? 0;
    frames.push({
      fileName: `${actionId}/frame-${String(index + 1).padStart(3, "0")}.png`,
      poseSignature: phase === 0 ? "closed" : `pose-${phase}`,
      bodyY: phase === 0 ? 0 : Math.min(phase * 2, 8),
      headY: phase === 0 ? 0 : Math.min(phase * 2, 8),
      silhouetteWidth: phase === 0 ? 100 : 100 + Math.min(phase, 4),
      alphaCoverage: 0.8,
      offCanvas: false
    });
  }
  return frames;
}
