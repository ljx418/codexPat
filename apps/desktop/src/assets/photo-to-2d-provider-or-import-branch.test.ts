import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPhoto2DProviderOrImportEvidenceSnapshot,
  createPhoto2DProviderOrImportBranch,
  photo2DProviderOrImportHasForbiddenContent
} from "./photo-to-2d-provider-or-import-branch";
import { generatePhoto2DTraitPromptPack } from "./photo-to-2d-trait-prompt-pack";

function approvedPromptPack() {
  return generatePhoto2DTraitPromptPack({
    traits: {
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
    },
    createdAt: "2026-06-10T01:00:00.000Z"
  });
}

describe("V15.11 photo-to-2D provider or import branch", () => {
  it("accepts import-ready branch from V15.10 prompt pack without provider execution", () => {
    const result = createPhoto2DProviderOrImportBranch({
      promptPackResult: approvedPromptPack(),
      branch: "import-ready"
    });
    assert.equal(result.status, "accepted");
    if (result.status !== "accepted") throw new Error("expected accepted import-ready branch");

    const evidence = buildPhoto2DProviderOrImportEvidenceSnapshot(result);
    const serialized = JSON.stringify(evidence);

    assert.equal(result.reasonCode, "import_ready_branch_selected");
    assert.equal(result.actionPlan.length, 8);
    assert.equal(result.providerBranch.attempted, false);
    assert.equal(result.providerBranch.reasonCode, "provider_output_missing");
    assert.equal(result.safetyBoundary.uploadsByDefault, false);
    assert.equal(result.safetyBoundary.callsProviderApi, false);
    assert.equal(result.safetyBoundary.requiresLocalImportValidation, true);
    assert.match(result.actionPlan[0].fileNamingRule, /frame-001\.png/);
    assert.doesNotMatch(serialized, /raw prompt|prompt text|Authorization|\/Users\//i);
    assert.equal(photo2DProviderOrImportHasForbiddenContent(evidence), false);
  });

  it("blocks provider branch without consent, terms, credential, or output", () => {
    const promptPackResult = approvedPromptPack();
    const noConsent = createPhoto2DProviderOrImportBranch({ promptPackResult, branch: "provider" });
    const noTerms = createPhoto2DProviderOrImportBranch({ promptPackResult, branch: "provider", providerConsent: true });
    const noCredential = createPhoto2DProviderOrImportBranch({
      promptPackResult,
      branch: "provider",
      providerConsent: true,
      providerTermsReviewed: true
    });
    const noOutput = createPhoto2DProviderOrImportBranch({
      promptPackResult,
      branch: "provider",
      providerConsent: true,
      providerTermsReviewed: true,
      providerCredentialAvailable: true
    });

    assert.equal(noConsent.reasonCode, "consent_required");
    assert.equal(noTerms.reasonCode, "provider_terms_required");
    assert.equal(noCredential.reasonCode, "provider_credential_missing");
    assert.equal(noOutput.reasonCode, "provider_output_missing");
    assert.equal(noOutput.status, "blocked");
  });

  it("blocks when the V15.10 trait prompt pack is not accepted", () => {
    const result = createPhoto2DProviderOrImportBranch({
      promptPackResult: generatePhoto2DTraitPromptPack({
        traits: {
          traitId: "unapproved",
          coatColor: "orange",
          pattern: "tabby",
          approved: false
        }
      }),
      branch: "import-ready"
    });

    assert.equal(result.status, "blocked");
    assert.equal(result.reasonCode, "trait_prompt_pack_invalid");
  });

  it("flags forbidden diagnostics", () => {
    assert.equal(photo2DProviderOrImportHasForbiddenContent({ sourcePath: "/Users/example/cat.png" }), true);
    assert.equal(photo2DProviderOrImportHasForbiddenContent({ auth: "Authorization Bearer secret" }), true);
    assert.equal(photo2DProviderOrImportHasForbiddenContent({ note: "raw prompt text" }), true);
  });
});

