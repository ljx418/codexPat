import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { manifestForRuntimeRenderer, resolveRuntimeRendererKind } from "./renderer-selection";

describe("runtime renderer selection", () => {
  test("defaults to bundled animated sprite when no renderer is selected", () => {
    const result = resolveRuntimeRendererKind(() => null);
    assert.equal(result.selectedKind, "sprite");
    assert.equal(result.fallbackUsed, false);
    assert.equal(manifestForRuntimeRenderer(result.selectedKind).rendererKind, "sprite");
    assert.equal(manifestForRuntimeRenderer(result.selectedKind).packId, "living-work-cat-v1");
  });

  test("selects bundled gltf when explicitly requested", () => {
    const result = resolveRuntimeRendererKind(() => "gltf");
    assert.equal(result.selectedKind, "gltf");
    assert.equal(result.fallbackUsed, false);
    assert.equal(manifestForRuntimeRenderer(result.selectedKind).packId, "gltf-prototype-cat");
  });

  test("migrates legacy css preference to the bundled animated sprite default", () => {
    const result = resolveRuntimeRendererKind(() => "css");
    assert.equal(result.selectedKind, "sprite");
    assert.equal(result.fallbackUsed, false);
    assert.equal(result.reasonCode, "legacy_css_renderer_migrated");
    assert.equal(manifestForRuntimeRenderer(result.selectedKind).packId, "living-work-cat-v1");
  });

  test("falls unsupported or invalid renderer choices back to css", () => {
    const unavailable = resolveRuntimeRendererKind(() => "rive");
    const invalid = resolveRuntimeRendererKind(() => "https://example.invalid/renderer");

    assert.equal(unavailable.selectedKind, "css");
    assert.equal(unavailable.fallbackUsed, true);
    assert.equal(unavailable.reasonCode, "renderer_kind_unavailable");
    assert.equal(invalid.selectedKind, "css");
    assert.equal(invalid.fallbackUsed, true);
    assert.equal(invalid.reasonCode, "renderer_kind_invalid");
  });
});
