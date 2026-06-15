import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CORE_ACTION_IDS, type SafeActionId } from "../asset-manifest";
import { validateAssetManifest } from "../asset-pack-validator";
import {
  LIVING_WORK_CAT_OPTIONAL_ACTION_IDS,
  LIVING_WORK_CAT_V1_ACTIONS,
  LIVING_WORK_CAT_V1_PACK,
  renderLivingWorkCatFrame,
  type LivingWorkCatActionId
} from "./living-work-cat-v1";

const LOOP_ACTIONS = new Set<SafeActionId>(["idle", "thinking", "running", "sleeping", "idle_tail_sway", "idle_nap", "drag", "dragging"]);
const CORE_ACTION_SET = new Set<SafeActionId>(CORE_ACTION_IDS);
const CORE_TRANSIENT_ACTIONS = new Set<SafeActionId>(["success", "warning", "error", "need_input"]);
const POINTER_ACTIONS = new Set<SafeActionId>(["pointer_near", "pointer_leave", "click", "double_click", "drag", "drag_start", "dragging", "drop"]);
const IDLE_MICRO_ACTIONS = new Set<SafeActionId>([
  "idle_blink",
  "idle_look_left",
  "idle_look_right",
  "idle_tail_sway",
  "idle_stretch",
  "idle_settle",
  "idle_nap",
  "idle_wake"
]);

describe("V11.5 living-work-cat-v1 bundled flagship pack", () => {
  test("has a valid bundled sprite manifest with core and V11 optional actions", () => {
    const result = validateAssetManifest(LIVING_WORK_CAT_V1_PACK.manifest);
    assert.equal(result.ok, true);
    assert.equal(result.errors.length, 0);
    assert.equal(LIVING_WORK_CAT_V1_PACK.packId, "living-work-cat-v1");
    assert.equal(LIVING_WORK_CAT_V1_PACK.manifest.rendererKind, "sprite");
    assert.equal(LIVING_WORK_CAT_V1_PACK.manifest.license.attribution, "Agent Desktop Pet bundled flagship living work-cat asset");
    for (const actionId of [...CORE_ACTION_IDS, ...LIVING_WORK_CAT_OPTIONAL_ACTION_IDS]) {
      assert.ok(LIVING_WORK_CAT_V1_PACK.manifest.actions[actionId], `${actionId} action exists`);
      assert.ok(LIVING_WORK_CAT_V1_PACK.manifest.assets[actionId], `${actionId} asset exists`);
    }
  });

  test("meets V11.5 frame-count and unique-pose thresholds", () => {
    for (const actionId of Object.keys(LIVING_WORK_CAT_V1_ACTIONS) as LivingWorkCatActionId[]) {
      const action = LIVING_WORK_CAT_V1_ACTIONS[actionId];
      const svgFrames = action.frames.map(renderLivingWorkCatFrame);
      const minFrames = minimumFrameCount(actionId);
      const minUnique = minimumUniquePoses(actionId);
      assert.ok(action.frames.length >= minFrames, `${actionId} has ${action.frames.length}/${minFrames} frames`);
      assert.ok(new Set(svgFrames).size >= minUnique, `${actionId} has unique visual poses`);
      assert.equal(action.loop, LOOP_ACTIONS.has(actionId));
    }
  });

  test("renders controlled SVG frames without unsafe content", () => {
    for (const actionId of Object.keys(LIVING_WORK_CAT_V1_ACTIONS) as LivingWorkCatActionId[]) {
      for (const svg of LIVING_WORK_CAT_V1_ACTIONS[actionId].frames.map(renderLivingWorkCatFrame)) {
        assert.match(svg, /^<svg viewBox="0 0 256 256"/);
        assert.match(svg, /<ellipse|<path|<circle/);
        assert.doesNotMatch(svg, /<script\b/i);
        assert.doesNotMatch(svg, /<foreignObject\b/i);
        assert.doesNotMatch(svg, /\s(?:href|xlink:href)=/i);
        assert.doesNotMatch(svg, /\son[a-z]+\s*=/i);
        assert.doesNotMatch(svg, /https?:|file:|javascript:|data:/i);
        assert.doesNotMatch(svg, /<text\b/i);
        assert.doesNotMatch(svg, /\/Users\/|Authorization|Bearer|sk-[A-Za-z0-9_-]{8,}/i);
      }
    }
  });

  test("loop actions are closed with identical first and final rendered frames", () => {
    for (const actionId of LOOP_ACTIONS) {
      const action = LIVING_WORK_CAT_V1_ACTIONS[actionId as LivingWorkCatActionId];
      assert.ok(action, `${actionId} action exists`);
      const svgFrames = action.frames.map(renderLivingWorkCatFrame);
      assert.ok(svgFrames.length >= 2, `${actionId} has multiple frames`);
      assert.equal(svgFrames[svgFrames.length - 1], svgFrames[0], `${actionId} first/final frame closure`);
    }
  });
});

function minimumFrameCount(actionId: SafeActionId) {
  if (LOOP_ACTIONS.has(actionId) && CORE_ACTION_SET.has(actionId)) return 8;
  if (CORE_TRANSIENT_ACTIONS.has(actionId)) return 4;
  if (IDLE_MICRO_ACTIONS.has(actionId)) return 4;
  if (POINTER_ACTIONS.has(actionId)) return actionId === "dragging" ? 4 : 4;
  return 4;
}

function minimumUniquePoses(actionId: SafeActionId) {
  if (LOOP_ACTIONS.has(actionId) && CORE_ACTION_SET.has(actionId)) return 4;
  if (actionId === "dragging" || actionId === "drag") return 2;
  return 3;
}
