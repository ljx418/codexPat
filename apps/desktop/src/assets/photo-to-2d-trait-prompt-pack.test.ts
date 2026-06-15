import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPhoto2DTraitPromptEvidenceSnapshot,
  generatePhoto2DTraitPromptPack,
  photo2DTraitPromptPackHasForbiddenContent
} from "./photo-to-2d-trait-prompt-pack";

const APPROVED_TRAITS = {
  traitId: "orange-tabby-approved",
  coatColor: "warm orange",
  pattern: "classic tabby stripes with white chest",
  eyeColor: "amber",
  faceShape: "round kitten-like",
  bodyBuild: "small sitting companion",
  tailNotes: "curled fluffy tail",
  distinctiveNotes: "soft cheeks and symmetrical forehead stripes",
  approved: true,
  approvedAt: "2026-06-10T00:00:00.000Z"
};

describe("V15.10 photo-to-2D trait prompt pack", () => {
  it("generates sanitized 8-action prompt summaries from approved cat traits", () => {
    const result = generatePhoto2DTraitPromptPack({
      traits: APPROVED_TRAITS,
      createdAt: "2026-06-10T01:00:00.000Z"
    });
    assert.equal(result.status, "accepted");
    if (result.status !== "accepted") throw new Error("expected accepted prompt pack");

    const actionPrompts = Object.values(result.promptPack.actionPrompts);
    const evidence = buildPhoto2DTraitPromptEvidenceSnapshot(result);
    assert.equal("promptPack" in evidence, true);
    if (!("promptPack" in evidence)) throw new Error("expected accepted evidence");
    const acceptedEvidence = evidence as { promptPack: { actionCount: number } };
    const serialized = JSON.stringify(evidence);

    assert.equal(result.reasonCode, "prompt_pack_ready");
    assert.equal(actionPrompts.length, 8);
    assert.equal(actionPrompts.filter((action) => action.frameIntent === "loop").length, 4);
    assert.equal(actionPrompts.filter((action) => action.frameIntent === "priority").length, 2);
    assert.equal(actionPrompts.every((action) => action.promptDigest.startsWith("prompt_")), true);
    assert.equal(actionPrompts.every((action) => action.safeSummary.includes("same cat")), true);
    assert.equal(result.promptPack.safetySummary.fullPromptPrinted, false);
    assert.equal(result.promptPack.safetySummary.uploadsByDefault, false);
    assert.equal(result.promptPack.safetySummary.includesProviderCall, false);
    assert.equal(acceptedEvidence.promptPack.actionCount, 8);
    assert.doesNotMatch(serialized, /full prompt|raw prompt|prompt text/i);
    assert.equal(photo2DTraitPromptPackHasForbiddenContent(evidence), false);
  });

  it("requires explicit user approval before prompt pack generation", () => {
    const result = generatePhoto2DTraitPromptPack({
      traits: {
        ...APPROVED_TRAITS,
        approved: false
      }
    });

    assert.equal(result.status, "rejected");
    assert.equal(result.reasonCode, "traits_approval_required");
  });

  it("rejects unsafe trait metadata with stable reason code", () => {
    const pathResult = generatePhoto2DTraitPromptPack({
      traits: {
        ...APPROVED_TRAITS,
        traitId: "unsafe-path",
        distinctiveNotes: "/Users/example/private-cat.png"
      }
    });
    const urlResult = generatePhoto2DTraitPromptPack({
      traits: {
        ...APPROVED_TRAITS,
        traitId: "unsafe-url",
        pattern: "see https://example.invalid/cat"
      }
    });
    const tokenResult = generatePhoto2DTraitPromptPack({
      traits: {
        ...APPROVED_TRAITS,
        traitId: "unsafe-token",
        tailNotes: "sk-secret123456"
      }
    });

    assert.equal(pathResult.reasonCode, "trait_schema_invalid");
    assert.equal(urlResult.reasonCode, "trait_schema_invalid");
    assert.equal(tokenResult.reasonCode, "trait_schema_invalid");
  });

  it("flags forbidden diagnostics", () => {
    assert.equal(photo2DTraitPromptPackHasForbiddenContent({ sourcePath: "/Users/example/cat.png" }), true);
    assert.equal(photo2DTraitPromptPackHasForbiddenContent({ auth: "Authorization Bearer secret" }), true);
    assert.equal(photo2DTraitPromptPackHasForbiddenContent({ note: "raw prompt text" }), true);
    assert.equal(photo2DTraitPromptPackHasForbiddenContent({ safeSummary: "same cat with warm orange coat" }), false);
  });
});
