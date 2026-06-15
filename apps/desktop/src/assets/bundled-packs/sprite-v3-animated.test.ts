import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CORE_ACTION_IDS, type CoreActionId } from "../asset-manifest";
import { SPRITE_V3_ANIMATED_ASSET_MANIFEST } from "./sprite-v3-animated.manifest";
import { SPRITE_V3_ANIMATED_ACTIONS, renderAnimatedSpriteFrame } from "./sprite-v3-animated";

const REQUIRED_MINIMUM_FRAMES = {
  idle: 6,
  thinking: 6,
  running: 6,
  success: 3,
  warning: 3,
  error: 3,
  need_input: 3,
  sleeping: 6
};

const LOOP_ACTIONS = new Set<CoreActionId>(["idle", "thinking", "running", "sleeping"]);

describe("sprite-v3-animated bundled pack", () => {
  test("covers all core actions with V10 minimum frame counts", () => {
    assert.equal(SPRITE_V3_ANIMATED_ASSET_MANIFEST.packId, "sprite-v3-animated");
    assert.equal(SPRITE_V3_ANIMATED_ASSET_MANIFEST.rendererKind, "sprite");

    for (const actionId of CORE_ACTION_IDS) {
      const action = SPRITE_V3_ANIMATED_ACTIONS[actionId];
      assert.ok(action, `${actionId} action exists`);
      assert.ok(action.frames.length >= REQUIRED_MINIMUM_FRAMES[actionId], `${actionId} frame count`);
      assert.equal(SPRITE_V3_ANIMATED_ASSET_MANIFEST.actions[actionId]?.assetId, actionId);
      assert.equal(SPRITE_V3_ANIMATED_ASSET_MANIFEST.assets[actionId]?.frameFiles?.length, action.frames.length);
    }
  });

  test("SVG frames are controlled, nonblank, and visually distinct", () => {
    for (const actionId of CORE_ACTION_IDS) {
      const svgFrames = SPRITE_V3_ANIMATED_ACTIONS[actionId].frames.map(renderAnimatedSpriteFrame);
      const uniqueFrameCount = new Set(svgFrames).size;
      assert.ok(uniqueFrameCount >= (["success", "warning", "error", "need_input"].includes(actionId) ? 2 : 3), `${actionId} unique frames`);

      for (const svg of svgFrames) {
        assert.match(svg, /^<svg /);
        assert.match(svg, /<ellipse|<path|<rect|<circle|<text/);
        assert.doesNotMatch(svg, /<script\b/i);
        assert.doesNotMatch(svg, /<foreignObject\b/i);
        assert.doesNotMatch(svg, /\s(?:href|xlink:href)=/i);
        assert.doesNotMatch(svg, /\son[a-z]+\s*=/i);
        assert.doesNotMatch(svg, /https?:|file:|javascript:|data:/i);
      }
    }
  });

  test("loop actions are closed with identical first and final rendered frames", () => {
    for (const actionId of LOOP_ACTIONS) {
      const svgFrames = SPRITE_V3_ANIMATED_ACTIONS[actionId].frames.map(renderAnimatedSpriteFrame);
      assert.ok(svgFrames.length >= 2, `${actionId} has multiple frames`);
      assert.equal(svgFrames[svgFrames.length - 1], svgFrames[0], `${actionId} first/final frame closure`);
    }
  });
});
