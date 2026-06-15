import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { CORE_ACTION_IDS } from "./asset-manifest";
import { validateAssetManifest } from "./asset-pack-validator";
import { SPRITE_V2_FRAMES, renderSpriteFrame } from "./bundled-packs/sprite-v2";
import { SPRITE_V2_ASSET_MANIFEST } from "./bundled-packs/sprite-v2.manifest";
import { RendererRegistry } from "../renderer/renderer-registry";

describe("V5.1 bundled sprite asset pack", () => {
  test("validates sprite v2 manifest", () => {
    const result = validateAssetManifest(SPRITE_V2_ASSET_MANIFEST);
    assert.equal(result.ok, true);
    assert.equal(result.errors.length, 0);
  });

  test("covers every core action with a bundled sprite frame", () => {
    for (const actionId of CORE_ACTION_IDS) {
      assert.equal(SPRITE_V2_FRAMES[actionId].actionId, actionId);
      assert.equal(typeof renderSpriteFrame(SPRITE_V2_FRAMES[actionId]), "string");
    }
  });

  test("sprite frames do not contain remote paths or script-like content", () => {
    const combined = CORE_ACTION_IDS.map((actionId) => renderSpriteFrame(SPRITE_V2_FRAMES[actionId])).join("\n");
    assert.equal(/https?:\/\//i.test(combined), false);
    assert.equal(/file:\/\//i.test(combined), false);
    assert.equal(/\/Users\//.test(combined), false);
    assert.equal(/<script/i.test(combined), false);
    assert.equal(/javascript:/i.test(combined), false);
  });

  test("sprite and gltf renderers are selected without changing css fallback behavior", () => {
    const registry = new RendererRegistry();
    const sprite = registry.create("sprite");
    const gltf = registry.create("gltf");
    const rive = registry.create("rive");

    assert.equal(sprite.selectedKind, "sprite");
    assert.equal(sprite.fallbackUsed, false);
    assert.equal(gltf.selectedKind, "gltf");
    assert.equal(gltf.fallbackUsed, false);
    assert.equal(rive.selectedKind, "css");
    assert.equal(rive.fallbackUsed, true);
  });

  test("sprite renderer blocks native image drag-out behavior", () => {
    const rendererSource = readFileSync(new URL("../renderer/sprite-renderer.ts", import.meta.url), "utf8");
    const cssSource = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

    assert.match(rendererSource, /draggable="false"/);
    assert.match(cssSource, /-webkit-user-drag:\s*none/);
    assert.match(cssSource, /\.pet-stage img[\s\S]*pointer-events:\s*none/);
  });

  test("imported sprite action changes do not flash bundled fallback frames", () => {
    const rendererSource = readFileSync(new URL("../renderer/sprite-renderer.ts", import.meta.url), "utf8");

    assert.equal(/if \(this\.importedPackId\) \{\s*this\.renderBundledAction/.test(rendererSource), false);
    assert.match(rendererSource, /importedAssetCache/);
    assert.match(rendererSource, /asset_runtime_loading_previous_frame/);
    assert.match(rendererSource, /if \(!this\.hasRenderedImportedAsset\) \{\s*this\.renderBundledAction/);
  });

  test("sprite renderer closes 2D frame loops before playback", () => {
    const rendererSource = readFileSync(new URL("../renderer/sprite-renderer.ts", import.meta.url), "utf8");
    assert.match(rendererSource, /function closeFrameLoop/);
    assert.match(rendererSource, /const closedFrames = closeFrameLoop\(svgFrames\)/);
    assert.match(rendererSource, /const imageSources = closeFrameLoop/);
    assert.doesNotMatch(rendererSource, /frameIndex = \(frameIndex \+ 1\) % svgFrames\.length/);
  });

  test("imported sprite playback uses decoded stacked frames instead of src swapping", () => {
    const rendererSource = readFileSync(new URL("../renderer/sprite-renderer.ts", import.meta.url), "utf8");
    const cssSource = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

    assert.match(rendererSource, /dataset\.spriteSource = this\.importedPackId \? "imported" : "bundled"/);
    assert.match(rendererSource, /imported-sprite-frame-stack/);
    assert.match(rendererSource, /startImportedFrameStackAnimation/);
    assert.match(rendererSource, /image\.decode/);
    assert.match(rendererSource, /classList\.add\("is-active"\)/);
    assert.doesNotMatch(rendererSource, /image\.src\s*=/);
    assert.match(cssSource, /\.imported-sprite-frame-stack \.imported-sprite-frame[\s\S]*opacity:\s*0/);
    assert.match(cssSource, /\.imported-sprite-frame-stack \.imported-sprite-frame\.is-active[\s\S]*opacity:\s*1/);
    assert.match(cssSource, /\.pet-stage\[data-sprite-source="imported"\] \.imported-sprite-motion[\s\S]*animation:\s*none !important/);
    assert.match(cssSource, /\.pet-stage\[data-sprite-source="imported"\] \.imported-sprite-motion[\s\S]*filter:\s*none !important/);
  });

  test("sprite playback is frame-driven and blocks outer CSS motion loops", () => {
    const cssSource = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

    assert.match(cssSource, /\.imported-sprite-motion \{[\s\S]*animation:\s*none/);
    assert.match(cssSource, /\.pet-stage\[data-renderer-kind="sprite"\] \.imported-sprite-motion[\s\S]*animation:\s*none !important/);
    assert.match(cssSource, /\.pet-stage\[data-renderer-kind="sprite"\] \.imported-sprite-motion[\s\S]*animation-name:\s*none !important/);
    assert.match(cssSource, /\.pet-stage\[data-renderer-kind="sprite"\] \.imported-sprite-motion[\s\S]*transform:\s*scale\(var\(--pet-renderer-scale, 1\)\) translateZ\(0\) !important/);
  });
});
