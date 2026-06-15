import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CORE_ACTION_IDS, type CoreActionId } from "../asset-manifest";
import { validateAssetManifest } from "../asset-pack-validator";
import {
  FLAGSHIP_WORK_CAT_V2_ACTIONS,
  FLAGSHIP_WORK_CAT_V2_PACK,
  renderFlagshipWorkCatV2Frame
} from "./flagship-work-cat-v2";
import { LIVING_WORK_CAT_OPTIONAL_ACTION_IDS } from "./living-work-cat-v1";
import { validateWorkCatContinuity } from "./work-cat-animation-continuity";

const LOOP_ACTIONS = [
  "idle",
  "thinking",
  "running",
  "sleeping",
  "idle_tail_sway",
  "idle_nap",
  "dragging"
] as const satisfies readonly (keyof typeof FLAGSHIP_WORK_CAT_V2_ACTIONS)[];
const TRANSIENT_ACTIONS = new Set<CoreActionId>(["success", "warning", "error", "need_input"]);

describe("V14.1 flagship-work-cat-v2 bundled pack", () => {
  test("has a valid bundled sprite manifest with core and living actions", () => {
    assert.equal(FLAGSHIP_WORK_CAT_V2_PACK.packId, "flagship-work-cat-v2");
    assert.equal(FLAGSHIP_WORK_CAT_V2_PACK.manifest.rendererKind, "sprite");
    assert.equal(validateAssetManifest(FLAGSHIP_WORK_CAT_V2_PACK.manifest).ok, true);
    for (const actionId of CORE_ACTION_IDS) {
      assert.ok(FLAGSHIP_WORK_CAT_V2_PACK.manifest.actions[actionId], actionId);
    }
    for (const actionId of LIVING_WORK_CAT_OPTIONAL_ACTION_IDS) {
      assert.ok(FLAGSHIP_WORK_CAT_V2_PACK.manifest.actions[actionId], actionId);
    }
  });

  test("meets V14 frame and distinct-pose thresholds", () => {
    for (const actionId of CORE_ACTION_IDS) {
      const action = FLAGSHIP_WORK_CAT_V2_ACTIONS[actionId];
      assert.ok(action.frames.length >= (TRANSIENT_ACTIONS.has(actionId) ? 4 : 8), `${actionId} frame count`);
      assert.ok(new Set(action.frames.map((frame) => JSON.stringify(frame))).size >= (TRANSIENT_ACTIONS.has(actionId) ? 3 : 4), `${actionId} unique poses`);
    }
    for (const actionId of LIVING_WORK_CAT_OPTIONAL_ACTION_IDS) {
      assert.ok(FLAGSHIP_WORK_CAT_V2_ACTIONS[actionId].frames.length >= 4, `${actionId} frame count`);
    }
  });

  test("renders controlled nonblank SVG frames without unsafe content", () => {
    for (const action of Object.values(FLAGSHIP_WORK_CAT_V2_ACTIONS)) {
      for (const frame of action.frames) {
        const svg = renderFlagshipWorkCatV2Frame(frame);
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
      const action = FLAGSHIP_WORK_CAT_V2_ACTIONS[actionId];
      const svgFrames = action.frames.map(renderFlagshipWorkCatV2Frame);
      assert.equal(svgFrames[svgFrames.length - 1], svgFrames[0], `${actionId} first/final frame closure`);
    }
  });

  test("core actions pass 2D continuity guard without jumpy adjacent frames", () => {
    for (const actionId of CORE_ACTION_IDS) {
      const action = FLAGSHIP_WORK_CAT_V2_ACTIONS[actionId];
      const svgFrames = action.frames.map(renderFlagshipWorkCatV2Frame);
      const result = validateWorkCatContinuity(action);
      assert.equal(svgFrames[svgFrames.length - 1], svgFrames[0], `${actionId} first/final rendered closure`);
      assert.equal(result.ok, true, `${actionId} continuity issues: ${JSON.stringify(result.issues)}`);
      assert.ok(result.maxAdjacentDelta <= 20, `${actionId} max delta ${result.maxAdjacentDelta}`);
    }
  });
});
