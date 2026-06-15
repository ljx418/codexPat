import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPhoto2DWizardEvidenceSnapshot,
  buildPhoto2DWizardGenerationEvidenceSnapshot,
  createPhoto2DWizardGenerationSnapshot,
  createPhoto2DWizardIntakeSnapshot,
  createPhoto2DWizardModel,
  createPhoto2DWizardProviderDisclosureSnapshot,
  photo2DWizardHasForbiddenContent
} from "./photo-to-2d-wizard";

describe("photo-to-2D wizard model", () => {
  it("creates a safe four-step user-facing wizard for docs cat photo", () => {
    const model = createPhoto2DWizardModel({
      sourcePhotoRef: "docs/猫.jpg",
      targetPackId: "photo-2d-docs-cat"
    });

    assert.equal(model.status, "ready");
    if (model.status !== "ready") return;
    assert.equal(model.sourcePhotoRef, "docs/猫.jpg");
    assert.equal(model.targetPackId, "photo-2d-docs-cat");
    assert.deepEqual(model.steps.map((step) => step.id), [
      "prepare_photo",
      "generate_action_sheet",
      "package_frames",
      "preview_apply"
    ]);
    assert.equal(model.safety.uploadsByDefault, false);
    assert.equal(model.safety.storesRawPhoto, false);
    assert.equal(model.safety.emitsPetEventDuringPreview, false);
    assert.equal(model.safety.writesCatStateMachineDuringPreview, false);
    assert.equal(model.minimumVerification.length >= 6, true);
    assert.equal(photo2DWizardHasForbiddenContent(model), false);
  });

  it("does not leak absolute source paths into UI model", () => {
    const model = createPhoto2DWizardModel({
      sourcePhotoRef: "/Users/example/private/cat.jpg",
      targetPackId: "My Cat Pack"
    });

    assert.equal(model.status, "ready");
    assert.equal(model.sourcePhotoRef, "private/cat.jpg");
    assert.equal(model.targetPackId, "my-cat-pack");
    assert.equal(JSON.stringify(model).includes("/Users/"), false);
  });

  it("blocks unsafe generated wizard content", () => {
    assert.equal(photo2DWizardHasForbiddenContent({
      prompt: "paste token sk-secretvalue and Authorization header"
    }), true);
  });

  it("starts V17.1 intake in idle without a selected photo", () => {
    const snapshot = createPhoto2DWizardIntakeSnapshot();

    assert.equal(snapshot.state, "idle");
    assert.equal(snapshot.reasonCode, "photo_required");
    assert.equal(snapshot.safeMetadata.selected, false);
    assert.equal(snapshot.safeMetadata.mediaType, "none");
    assert.equal(snapshot.safety.acceptedPetEvents, 0);
    assert.equal(snapshot.safety.callsNotify, false);
    assert.equal(snapshot.safety.writesCatStateMachine, false);
    assert.equal(snapshot.safety.mutatesLivePetInstance, false);
  });

  it("requires consent after a safe local photo preview is selected", () => {
    const snapshot = createPhoto2DWizardIntakeSnapshot({
      photo: {
        selected: true,
        mediaType: "image/jpeg",
        sizeBytes: 480_000,
        width: 1024,
        height: 1024,
        safeSourceRef: "selected-local-photo"
      }
    });

    assert.equal(snapshot.state, "consent_required");
    assert.equal(snapshot.reasonCode, "consent_required");
    assert.deepEqual(snapshot.safeMetadata, {
      selected: true,
      mediaType: "image/jpeg",
      sizeBucket: "small",
      dimensions: "1024x1024",
      safeSourceRef: "selected-local-photo"
    });
  });

  it("requires user-approved traits after consent", () => {
    const snapshot = createPhoto2DWizardIntakeSnapshot({
      photo: {
        selected: true,
        mediaType: "image/png",
        sizeBytes: 900_000,
        width: 512,
        height: 768,
        safeSourceRef: "selected-local-photo"
      },
      consent: true
    });

    assert.equal(snapshot.state, "traits_required");
    assert.equal(snapshot.reasonCode, "traits_required");
    assert.equal(snapshot.consent, true);
  });

  it("marks generation ready only with photo, consent, and safe traits", () => {
    const snapshot = createPhoto2DWizardIntakeSnapshot({
      photo: {
        selected: true,
        mediaType: "image/webp",
        sizeBytes: 1_200_000,
        width: 1024,
        height: 768,
        safeSourceRef: "selected-local-photo"
      },
      consent: true,
      approvedTraits: "orange tabby, amber eyes, soft round face",
      targetPackName: "My Orange Cat"
    });

    assert.equal(snapshot.state, "generation_ready");
    assert.equal(snapshot.reasonCode, "generation_ready");
    assert.equal(snapshot.targetPackId, "my-orange-cat");
    assert.equal(snapshot.approvedTraits, "orange tabby, amber eyes, soft round face");
    assert.equal(photo2DWizardHasForbiddenContent(snapshot), false);

    const evidence = buildPhoto2DWizardEvidenceSnapshot(snapshot);
    assert.equal(evidence.mutationBoundary.acceptedPetEvents, 0);
    assert.equal(evidence.safeFieldList.includes("safeMetadata.sizeBucket"), true);
  });

  it("does not leak source filename or absolute path from intake metadata", () => {
    const snapshot = createPhoto2DWizardIntakeSnapshot({
      photo: {
        selected: true,
        mediaType: "image/jpeg",
        sizeBytes: 480_000,
        width: 1024,
        height: 1024,
        safeSourceRef: "/Users/example/private/my-cat.jpg"
      },
      consent: true,
      approvedTraits: "cream orange fur",
      targetPackName: "Private Cat"
    });

    const serialized = JSON.stringify(snapshot);
    assert.equal(serialized.includes("/Users/"), false);
    assert.equal(serialized.includes("my-cat.jpg"), false);
    assert.equal(snapshot.safeMetadata.safeSourceRef, "sanitized-reference");
  });

  it("blocks unsupported or too-large photo metadata before generation", () => {
    const unsupported = createPhoto2DWizardIntakeSnapshot({
      photo: {
        selected: true,
        mediaType: "image/gif",
        sizeBytes: 480_000,
        width: 1024,
        height: 1024
      }
    });
    const tooLarge = createPhoto2DWizardIntakeSnapshot({
      photo: {
        selected: true,
        mediaType: "image/png",
        sizeBytes: 20 * 1024 * 1024,
        width: 2048,
        height: 2048
      }
    });

    assert.equal(unsupported.state, "blocked");
    assert.equal(unsupported.reasonCode, "photo_metadata_rejected");
    assert.equal(tooLarge.state, "blocked");
    assert.equal(tooLarge.reasonCode, "photo_metadata_rejected");
  });

  it("requires completed intake before V17.2 generation mode can proceed", () => {
    const intake = createPhoto2DWizardIntakeSnapshot();
    const snapshot = createPhoto2DWizardGenerationSnapshot({
      intake,
      mode: "host_image_tool_assisted"
    });

    assert.equal(snapshot.jobState, "blocked");
    assert.equal(snapshot.reasonCode, "intake_not_ready");
    assert.equal(snapshot.safety.acceptedPetEvents, 0);
    assert.equal(snapshot.safety.callsNotify, false);
  });

  it("marks host image tool assisted mode as waiting for user output", () => {
    const intake = readyIntake();
    const snapshot = createPhoto2DWizardGenerationSnapshot({
      intake,
      mode: "host_image_tool_assisted"
    });

    assert.equal(snapshot.jobState, "waiting_for_output");
    assert.equal(snapshot.reasonCode, "host_tool_prompt_ready");
    assert.equal(snapshot.canCopyPrompt, true);
    assert.equal(snapshot.canSelectActionSheet, true);
    assert.equal(snapshot.safety.exposesRawPromptInStatus, false);
  });

  it("keeps provider API safely not-ready when configuration is missing", () => {
    const intake = readyIntake();
    const snapshot = createPhoto2DWizardGenerationSnapshot({
      intake,
      mode: "provider_api"
    });

    assert.equal(snapshot.jobState, "blocked");
    assert.equal(snapshot.reasonCode, "provider_credential_missing");
    assert.equal(snapshot.canStartProvider, false);
    assert.equal(snapshot.safety.exposesCredential, false);
  });

  it("freezes V18.1 provider disclosure boundary before provider execution", () => {
    const noConsent = createPhoto2DWizardProviderDisclosureSnapshot();
    assert.equal(noConsent.status, "blocked");
    assert.equal(noConsent.reasonCode, "consent_required");
    assert.equal(noConsent.safety.acceptedPetEvents, 0);
    assert.equal(noConsent.safety.exposesCredential, false);

    const noTerms = createPhoto2DWizardProviderDisclosureSnapshot({
      uploadConsent: true
    });
    assert.equal(noTerms.reasonCode, "provider_terms_required");

    const noCost = createPhoto2DWizardProviderDisclosureSnapshot({
      uploadConsent: true,
      termsReviewed: true
    });
    assert.equal(noCost.reasonCode, "provider_cost_disclosure_required");

    const noPrivacy = createPhoto2DWizardProviderDisclosureSnapshot({
      uploadConsent: true,
      termsReviewed: true,
      costDisclosureAccepted: true
    });
    assert.equal(noPrivacy.reasonCode, "provider_privacy_disclosure_required");

    const noRetention = createPhoto2DWizardProviderDisclosureSnapshot({
      uploadConsent: true,
      termsReviewed: true,
      costDisclosureAccepted: true,
      privacyDisclosureAccepted: true
    });
    assert.equal(noRetention.reasonCode, "provider_retention_disclosure_required");

    const noLicense = createPhoto2DWizardProviderDisclosureSnapshot({
      uploadConsent: true,
      termsReviewed: true,
      costDisclosureAccepted: true,
      privacyDisclosureAccepted: true,
      retentionDisclosureAccepted: true
    });
    assert.equal(noLicense.reasonCode, "provider_license_disclosure_required");

    const noCredential = createPhoto2DWizardProviderDisclosureSnapshot({
      uploadConsent: true,
      termsReviewed: true,
      costDisclosureAccepted: true,
      privacyDisclosureAccepted: true,
      retentionDisclosureAccepted: true,
      licenseDisclosureAccepted: true,
      attributionDisclosureAccepted: true
    });
    assert.equal(noCredential.reasonCode, "provider_credential_missing");
    assert.equal(noCredential.status, "blocked");
  });

  it("allows V18.1 provider boundary to become ready only after consent, disclosures, and credential presence", () => {
    const snapshot = createPhoto2DWizardProviderDisclosureSnapshot({
      providerName: "minimax",
      uploadConsent: true,
      termsReviewed: true,
      costDisclosureAccepted: true,
      privacyDisclosureAccepted: true,
      retentionDisclosureAccepted: true,
      licenseDisclosureAccepted: true,
      attributionDisclosureAccepted: true,
      credentialConfigured: true
    });

    assert.equal(snapshot.status, "ready");
    assert.equal(snapshot.reasonCode, "provider_capability_ready");
    assert.equal(snapshot.safeFieldList.includes("credentialConfigured"), true);
    assert.equal(photo2DWizardHasForbiddenContent(snapshot), false);
  });

  it("keeps V18 provider mode blocked until upload consent and disclosures are accepted", () => {
    const intake = readyIntake();
    const noConsent = createPhoto2DWizardGenerationSnapshot({
      intake,
      mode: "provider_api",
      providerConfigured: true,
      providerCredentialAvailable: true
    });
    assert.equal(noConsent.reasonCode, "consent_required");

    const noTerms = createPhoto2DWizardGenerationSnapshot({
      intake,
      mode: "provider_api",
      providerConfigured: true,
      providerCredentialAvailable: true,
      providerConsent: true
    });
    assert.equal(noTerms.reasonCode, "provider_terms_required");

    const missingOutput = createPhoto2DWizardGenerationSnapshot({
      intake,
      mode: "provider_api",
      providerConfigured: true,
      providerCredentialAvailable: true,
      providerConsent: true,
      providerTermsReviewed: true,
      providerCostDisclosureAccepted: true,
      providerPrivacyDisclosureAccepted: true,
      providerRetentionDisclosureAccepted: true,
      providerLicenseDisclosureAccepted: true
    });
    assert.equal(missingOutput.jobState, "running");
    assert.equal(missingOutput.reasonCode, "provider_output_missing");
    assert.equal(missingOutput.canStartProvider, true);
  });

  it("accepts local action sheet metadata without exposing file paths", () => {
    const intake = readyIntake();
    const snapshot = createPhoto2DWizardGenerationSnapshot({
      intake,
      mode: "local_action_sheet_import",
      actionSheet: {
        selected: true,
        mediaType: "image/png",
        sizeBytes: 600_000,
        width: 2048,
        height: 1024,
        safeSourceRef: "/Users/example/private/action-sheet.png"
      }
    });

    assert.equal(snapshot.jobState, "output_ready");
    assert.equal(snapshot.reasonCode, "action_sheet_output_ready");
    assert.equal(snapshot.actionSheetMetadata.dimensions, "2048x1024");
    assert.equal(snapshot.actionSheetMetadata.safeSourceRef, "sanitized-reference");
    assert.equal(JSON.stringify(snapshot).includes("/Users/"), false);

    const evidence = buildPhoto2DWizardGenerationEvidenceSnapshot(snapshot);
    assert.equal(evidence.safeFieldList.includes("mode"), true);
    assert.equal(photo2DWizardHasForbiddenContent(evidence), false);
  });
});

function readyIntake() {
  return createPhoto2DWizardIntakeSnapshot({
    photo: {
      selected: true,
      mediaType: "image/jpeg",
      sizeBytes: 480_000,
      width: 1024,
      height: 1024,
      safeSourceRef: "selected-local-photo"
    },
    consent: true,
    approvedTraits: "orange tabby, amber eyes",
    targetPackName: "Ready Cat"
  });
}
