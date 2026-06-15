import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CORE_ACTION_IDS, type AssetManifest } from "./asset-manifest";
import { classifyGltfClipCoverage, resolveAnimationCoverage } from "./animation-coverage";
import { SPRITE_V3_ANIMATED_ASSET_MANIFEST } from "./bundled-packs/sprite-v3-animated.manifest";

describe("animation coverage model", () => {
  test("labels sprite-v3 core actions as animated", () => {
    for (const actionId of CORE_ACTION_IDS) {
      const coverage = resolveAnimationCoverage(SPRITE_V3_ANIMATED_ASSET_MANIFEST, actionId);
      assert.equal(coverage.coverageState, "animated");
      assert.equal(coverage.reasonCode, "action_frames_present");
      assert.equal(coverage.rendererKind, "sprite");
      assert.ok((coverage.frameCount ?? 0) >= 3);
    }
  });

  test("labels missing action as visible idle fallback", () => {
    const partialManifest: AssetManifest = {
      ...SPRITE_V3_ANIMATED_ASSET_MANIFEST,
      actions: {
        idle: SPRITE_V3_ANIMATED_ASSET_MANIFEST.actions.idle
      }
    };

    const coverage = resolveAnimationCoverage(partialManifest, "running");
    assert.equal(coverage.coverageState, "fallback");
    assert.equal(coverage.reasonCode, "action_missing_fallback_idle");
    assert.equal(coverage.fallbackActionId, "idle");
  });

  test("classifies GLTF clip names with allowlisted core actions only", () => {
    const full = classifyGltfClipCoverage(CORE_ACTION_IDS);
    assert.equal(full.coverageState, "animated");
    assert.equal(full.reasonCode, "gltf_clip_present");
    assert.equal(full.ignoredClipCount, 0);

    const partial = classifyGltfClipCoverage(["idle", "walk-cycle", "thinking"]);
    assert.equal(partial.coverageState, "fallback");
    assert.equal(partial.reasonCode, "gltf_clip_missing");
    assert.deepEqual(partial.acceptedClips, ["idle", "thinking"]);
    assert.equal(partial.ignoredClipCount, 1);

    const staticGltf = classifyGltfClipCoverage([]);
    assert.equal(staticGltf.coverageState, "static");
    assert.equal(staticGltf.reasonCode, "gltf_static_or_partial");
  });
});
