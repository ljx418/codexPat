import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CORE_ACTION_IDS, type CoreActionId } from "../asset-manifest";
import { validateAssetManifest } from "../asset-pack-validator";
import { PREMIUM_CAT_PACKS, renderPremiumCatFrame } from "./premium-cats-v1";
import { validateWorkCatContinuity } from "./work-cat-animation-continuity";

const LOOP_ACTIONS = new Set<CoreActionId>(["idle", "thinking", "running", "sleeping"]);
const TRANSIENT_ACTIONS = new Set(["success", "warning", "error", "need_input"]);

describe("premium bundled cat library", () => {
  test("contains at least 12 local animated sprite packs", () => {
    assert.ok(PREMIUM_CAT_PACKS.length >= 12);
    assert.equal(new Set(PREMIUM_CAT_PACKS.map((pack) => pack.packId)).size, PREMIUM_CAT_PACKS.length);
    for (const pack of PREMIUM_CAT_PACKS) {
      assert.equal(pack.manifest.rendererKind, "sprite");
      assert.equal(pack.manifest.packId, pack.packId);
      assert.equal(pack.manifest.license.attribution, "Agent Desktop Pet bundled premium work-cat asset");
      assert.equal(validateAssetManifest(pack.manifest).ok, true);
    }
  });

  test("covers all core actions with V10.13 frame counts", () => {
    for (const pack of PREMIUM_CAT_PACKS) {
      for (const actionId of CORE_ACTION_IDS) {
        const action = pack.actions[actionId];
        assert.ok(action, `${pack.packId}:${actionId} exists`);
        assert.equal(pack.manifest.actions[actionId]?.assetId, actionId);
        assert.equal(pack.manifest.assets[actionId]?.frameFiles?.length, action.frames.length);
        assert.ok(action.frames.length >= (LOOP_ACTIONS.has(actionId) ? 8 : 4), `${pack.packId}:${actionId} frame count`);
        assert.equal(action.loop, LOOP_ACTIONS.has(actionId));
      }
    }
  });

  test("frames are controlled SVG and visually distinct", () => {
    for (const pack of PREMIUM_CAT_PACKS) {
      for (const actionId of CORE_ACTION_IDS) {
        const svgFrames = pack.actions[actionId].frames.map(renderPremiumCatFrame);
        const uniqueFrameCount = new Set(svgFrames).size;
        assert.ok(uniqueFrameCount >= (TRANSIENT_ACTIONS.has(actionId) ? 3 : 4), `${pack.packId}:${actionId} unique frames`);
        for (const svg of svgFrames) {
          assert.match(svg, /^<svg /);
          assert.match(svg, /<ellipse|<path|<circle/);
          assert.doesNotMatch(svg, /<script\b/i);
          assert.doesNotMatch(svg, /<foreignObject\b/i);
          assert.doesNotMatch(svg, /\s(?:href|xlink:href)=/i);
          assert.doesNotMatch(svg, /\son[a-z]+\s*=/i);
          assert.doesNotMatch(svg, /https?:|file:|javascript:|data:/i);
          assert.doesNotMatch(svg, /<text\b/i);
        }
      }
    }
  });

  test("loop actions are closed with identical first and final rendered frames", () => {
    for (const pack of PREMIUM_CAT_PACKS) {
      for (const actionId of LOOP_ACTIONS) {
        const svgFrames = pack.actions[actionId].frames.map(renderPremiumCatFrame);
        assert.ok(svgFrames.length >= 2, `${pack.packId}:${actionId} has multiple frames`);
        assert.equal(svgFrames[svgFrames.length - 1], svgFrames[0], `${pack.packId}:${actionId} first/final frame closure`);
      }
    }
  });

  test("all core actions pass 2D continuity guard without jumpy adjacent frames", () => {
    for (const pack of PREMIUM_CAT_PACKS) {
      for (const actionId of CORE_ACTION_IDS) {
        const action = pack.actions[actionId];
        const svgFrames = action.frames.map(renderPremiumCatFrame);
        const result = validateWorkCatContinuity(action);
        assert.equal(svgFrames[svgFrames.length - 1], svgFrames[0], `${pack.packId}:${actionId} first/final rendered closure`);
        assert.equal(result.ok, true, `${pack.packId}:${actionId} continuity issues: ${JSON.stringify(result.issues)}`);
        assert.ok(result.maxAdjacentDelta <= 20, `${pack.packId}:${actionId} max delta ${result.maxAdjacentDelta}`);
      }
    }
  });
});
