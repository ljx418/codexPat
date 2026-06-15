import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { CoreActionId } from "../asset-manifest";
import { CORE_ACTION_IDS } from "../asset-manifest";
import { validateAssetManifest } from "../asset-pack-validator";
import { SPRITE_V3_ANIMATED_ACTIONS, renderAnimatedSpriteFrame } from "./sprite-v3-animated";
import { WORK_CAT_V1_ASSET_MANIFEST } from "./work-cat-v1.manifest";
import { WORK_CAT_V1_ACTIONS, renderWorkCatFrame } from "./work-cat-v1";

const LOOP_ACTIONS = new Set<CoreActionId>(["idle", "thinking", "running", "sleeping"]);
const TRANSIENT_ACTIONS = new Set(["success", "warning", "error", "need_input"]);

describe("work-cat-v1 bundled pack", () => {
  test("covers all core actions with V10.7 minimum frame counts", () => {
    assert.equal(WORK_CAT_V1_ASSET_MANIFEST.packId, "work-cat-v1");
    assert.equal(WORK_CAT_V1_ASSET_MANIFEST.rendererKind, "sprite");
    assert.equal(validateAssetManifest(WORK_CAT_V1_ASSET_MANIFEST).ok, true);

    for (const actionId of CORE_ACTION_IDS) {
      const action = WORK_CAT_V1_ACTIONS[actionId];
      assert.ok(action, `${actionId} action exists`);
      assert.equal(WORK_CAT_V1_ASSET_MANIFEST.actions[actionId]?.assetId, actionId);
      assert.equal(WORK_CAT_V1_ASSET_MANIFEST.assets[actionId]?.frameFiles?.length, action.frames.length);
      assert.ok(action.frames.length >= (LOOP_ACTIONS.has(actionId) ? 8 : 4), `${actionId} frame count`);
      assert.equal(action.loop, LOOP_ACTIONS.has(actionId));
    }
  });

  test("SVG frames are controlled, nonblank, and visually distinct", () => {
    for (const actionId of CORE_ACTION_IDS) {
      const svgFrames = WORK_CAT_V1_ACTIONS[actionId].frames.map(renderWorkCatFrame);
      const uniqueFrameCount = new Set(svgFrames).size;
      assert.ok(uniqueFrameCount >= (TRANSIENT_ACTIONS.has(actionId) ? 3 : 4), `${actionId} unique frames`);

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
  });

  test("loop actions are closed with identical first and final rendered frames", () => {
    for (const actionId of LOOP_ACTIONS) {
      const svgFrames = WORK_CAT_V1_ACTIONS[actionId].frames.map(renderWorkCatFrame);
      assert.ok(svgFrames.length >= 2, `${actionId} has multiple frames`);
      assert.equal(svgFrames[svgFrames.length - 1], svgFrames[0], `${actionId} first/final frame closure`);
    }
  });

  test("is visibly richer than sprite-v3 baseline by frame and geometry signals", () => {
    for (const actionId of CORE_ACTION_IDS) {
      const workCatFrames = WORK_CAT_V1_ACTIONS[actionId].frames.map(renderWorkCatFrame);
      const baselineFrames = SPRITE_V3_ANIMATED_ACTIONS[actionId].frames;
      assert.ok(workCatFrames.length >= baselineFrames.length, `${actionId} frame count not lower than baseline`);

      const averageWorkCatGeometry = averageTagCount(workCatFrames);
      const averageBaselineGeometry = averageTagCount(baselineFrames.map(renderAnimatedBaselineFrame));
      assert.ok(averageWorkCatGeometry >= 26, `${actionId} work-cat absolute geometry richness`);
      assert.ok(averageWorkCatGeometry >= averageBaselineGeometry * 1.45, `${actionId} work-cat relative geometry richness`);
    }
  });
});

function averageTagCount(frames: string[]) {
  const total = frames.reduce((sum, svg) => sum + (svg.match(/<(ellipse|path|circle|g)\b/g) ?? []).length, 0);
  return total / frames.length;
}

function renderAnimatedBaselineFrame(frame: (typeof SPRITE_V3_ANIMATED_ACTIONS)[CoreActionId]["frames"][number]) {
  return renderAnimatedSpriteFrame(frame);
}
