import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateLocalTraitPromptPack, localTraitPromptPackHasForbiddenContent } from "./local-trait-prompt-pack";

describe("V7.2 local trait prompt pack", () => {
  it("generates a sprite prompt pack for every core action from user-approved metadata", () => {
    const result = generateLocalTraitPromptPack({
      catName: "Orange Tabby",
      coat: "warm orange short hair",
      markings: "white chest and tabby stripes",
      eyes: "amber eyes",
      tail: "curled tail",
      personality: "playful desktop companion",
      rendererTarget: "sprite",
      photoReferenceMode: "local_reference_only"
    });

    assert.equal(result.status, "accepted");
    assert.equal(result.reasonCode, "trait_prompt_pack_ok");
    assert.equal(result.safetySummary.usesRawPhoto, false);
    assert.equal(result.safetySummary.uploadsByDefault, false);
    assert.equal(result.safetySummary.includesProviderCall, false);
    assert.equal(result.promptPack?.evidenceSummary.actionCount, 8);
    assert.equal(Object.keys(result.promptPack?.actionPrompts ?? {}).length, 8);
    assert.match(result.promptPack?.manifestTemplate ?? "", /"rendererKind": "sprite"/);
    assert.ok(result.multiViewGuidance.length >= 5);
    assert.equal(localTraitPromptPackHasForbiddenContent(result), false);
  });

  it("generates GLTF guidance without claiming local 3D generation readiness", () => {
    const result = generateLocalTraitPromptPack({
      catName: "Mochi",
      coat: "black coat",
      markings: "small white paws",
      eyes: "green eyes",
      tail: "long tail",
      personality: "calm work companion",
      rendererTarget: "gltf"
    });

    assert.equal(result.status, "accepted");
    assert.match(result.promptPack?.manifestTemplate ?? "", /"rendererKind": "gltf"/);
    assert.match(result.multiViewGuidance.join(" "), /single-file asset/);
    assert.doesNotMatch(JSON.stringify(result), /3D ready/);
  });

  it("rejects unsafe trait metadata with stable reason codes", () => {
    const pathResult = generateLocalTraitPromptPack({
      catName: "Mochi",
      coat: "see /Users/example/cat.png",
      rendererTarget: "sprite"
    });
    const urlResult = generateLocalTraitPromptPack({
      catName: "Mochi",
      markings: "https://example.test/cat",
      rendererTarget: "sprite"
    });
    const tokenResult = generateLocalTraitPromptPack({
      catName: "sk-test-token-123456789",
      rendererTarget: "sprite"
    });

    assert.equal(pathResult.status, "rejected");
    assert.equal(pathResult.reasonCode, "trait_metadata_invalid");
    assert.equal(urlResult.status, "rejected");
    assert.equal(urlResult.reasonCode, "trait_metadata_invalid");
    assert.equal(tokenResult.status, "rejected");
    assert.equal(tokenResult.reasonCode, "trait_metadata_invalid");
  });
});
