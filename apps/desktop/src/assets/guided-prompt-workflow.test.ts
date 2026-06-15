import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateGuidedAssetPromptPack } from "./guided-prompt-workflow";

describe("V6.5 guided asset prompt workflow", () => {
  it("generates prompts, manifest template, and import checklist for every core action", () => {
    const pack = generateGuidedAssetPromptPack({
      catName: "Mochi",
      visualNotes: "orange tabby, amber eyes, white chest, curled tail",
      rendererTarget: "sprite",
      photoReferenceProvided: true
    });

    assert.equal(pack.rendererTarget, "sprite");
    assert.equal(pack.photoReferenceMode, "local_reference_only");
    assert.equal(pack.evidenceSummary.actionCount, 8);
    assert.equal(Object.keys(pack.actionPrompts).length, 8);
    assert.match(pack.manifestTemplate, /"schemaVersion": "5.8"/);
    assert.match(pack.manifestTemplate, /"rendererKind": "sprite"/);
    assert.ok(pack.importChecklist.length >= 5);
    assert.equal(pack.evidenceSummary.storesRawPhoto, false);
    assert.equal(pack.evidenceSummary.uploadsByDefault, false);
    assert.equal(pack.evidenceSummary.includesProviderCall, false);
    assert.equal(pack.evidenceSummary.photoReferenceMode, "local_reference_only");
    assert.match(JSON.stringify(pack.actionPrompts), /not uploaded or persisted/);
  });

  it("redacts unsafe paths, urls, and token-like input from generated prompt text", () => {
    const pack = generateGuidedAssetPromptPack({
      catName: "sk-test-token-123456789",
      visualNotes: "see /Users/example/cat.png and https://example.test/cat",
      rendererTarget: "gltf"
    });
    const serialized = JSON.stringify(pack);

    assert.equal(pack.catName, "Personalized Cat");
    assert.equal(pack.rendererTarget, "gltf");
    assert.equal(pack.photoReferenceMode, "not_provided");
    assert.doesNotMatch(serialized, /\/Users\//);
    assert.doesNotMatch(serialized, /https:\/\//);
    assert.doesNotMatch(serialized, /sk-test-token/);
    assert.match(pack.manifestTemplate, /"rendererKind": "gltf"/);
  });
});
