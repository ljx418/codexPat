import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createV20ProviderConsentBoundary,
  createV20ReferenceImageEvidence,
  evaluateV20Benchmark,
  getV20MainlandProviderCandidates,
  v20ProviderEvidenceHasForbiddenLeak,
  type V20BenchmarkAttempt,
  type V20CatPhotoSample
} from "./v20-provider-benchmark";

describe("V20 mainland provider benchmark boundary", () => {
  it("defaults to MiniMax as the only active provider candidate", () => {
    const candidates = getV20MainlandProviderCandidates();
    assert.equal(candidates.find((item) => item.providerId === "minimax")?.activeCandidate, true);
    assert.equal(candidates.filter((item) => item.activeCandidate).length, 1);
    assert.equal(candidates.find((item) => item.providerId === "aliyun_wanxiang")?.decision, "document_only");
  });

  it("blocks provider execution until consent, disclosures, terms, attribution, and credential are present", () => {
    assert.equal(createV20ProviderConsentBoundary({ credentialAvailable: true }).reasonCode, "provider_consent_required");
    assert.equal(createV20ProviderConsentBoundary({
      uploadConsent: true,
      credentialAvailable: true
    }).reasonCode, "provider_terms_required");
    assert.equal(createV20ProviderConsentBoundary({
      uploadConsent: true,
      termsAccepted: true,
      costDisclosureAccepted: true,
      privacyDisclosureAccepted: true,
      retentionDisclosureAccepted: true,
      licenseDisclosureAccepted: true,
      attributionDisclosureAccepted: true
    }).reasonCode, "provider_credential_missing");

    const ready = createV20ProviderConsentBoundary({
      uploadConsent: true,
      termsAccepted: true,
      costDisclosureAccepted: true,
      privacyDisclosureAccepted: true,
      retentionDisclosureAccepted: true,
      licenseDisclosureAccepted: true,
      attributionDisclosureAccepted: true,
      credentialAvailable: true
    });
    assert.equal(ready.status, "ready");
    assert.equal(ready.canStartProvider, true);
    assert.equal(ready.reasonCode, "provider_ready");
    assert.equal(v20ProviderEvidenceHasForbiddenLeak(ready), false);
  });

  it("blocks document-only providers from execution", () => {
    const result = createV20ProviderConsentBoundary({
      providerId: "aliyun_wanxiang",
      uploadConsent: true,
      termsAccepted: true,
      costDisclosureAccepted: true,
      privacyDisclosureAccepted: true,
      retentionDisclosureAccepted: true,
      licenseDisclosureAccepted: true,
      attributionDisclosureAccepted: true,
      credentialAvailable: true
    });
    assert.equal(result.status, "blocked");
    assert.equal(result.reasonCode, "provider_document_only");
  });

  it("requires reference-image evidence fields for reference-image claims", () => {
    const passed = createV20ReferenceImageEvidence({
      referenceImageAttached: true,
      providerCapability: "reference_image_supported",
      textToImageOnly: false
    });
    assert.equal(passed.status, "passed");
    assert.equal(passed.reference_image_attached, true);
    assert.equal(passed.provider_capability, "reference_image_supported");
    assert.equal(passed.text_to_image_only, false);

    const blocked = createV20ReferenceImageEvidence({
      referenceImageAttached: false,
      providerCapability: "text_to_image_only",
      textToImageOnly: true
    });
    assert.equal(blocked.status, "blocked");
    assert.equal(blocked.reasonCode, "reference_image_evidence_missing");
  });

  it("distinguishes one-sample scoped smoke from three-sample low-retry benchmark", () => {
    const oneSample = evaluateV20Benchmark({
      samples: [sample("sample_1")],
      attempts: [attempt("sample_1", true, 1)]
    });
    assert.equal(oneSample.status, "passed");
    assert.equal(oneSample.reasonCode, "provider_smoke_passed_sample_limited");
    assert.equal(oneSample.canClaimScopedSmoke, true);
    assert.equal(oneSample.canClaimLowRetryReliability, false);

    const threeSample = evaluateV20Benchmark({
      samples: [sample("sample_1"), sample("sample_2"), sample("sample_3")],
      attempts: [
        attempt("sample_1", false, 1, "background_gate_failed"),
        attempt("sample_1", true, 2),
        attempt("sample_2", true, 1),
        attempt("sample_3", false, 1, "same_cat_qa_failed")
      ]
    });
    assert.equal(threeSample.status, "passed");
    assert.equal(threeSample.reasonCode, "provider_benchmark_passed");
    assert.equal(threeSample.acceptedSampleCount, 2);
    assert.equal(threeSample.canClaimLowRetryReliability, true);
  });

  it("fails benchmark when fewer than two of three samples pass", () => {
    const result = evaluateV20Benchmark({
      samples: [sample("sample_1"), sample("sample_2"), sample("sample_3")],
      attempts: [
        attempt("sample_1", true, 1),
        attempt("sample_2", false, 1, "motion_amplitude_too_low"),
        attempt("sample_3", false, 1, "provider_output_rejected")
      ]
    });
    assert.equal(result.status, "failed");
    assert.equal(result.reasonCode, "provider_benchmark_failed");
  });
});

function sample(sampleId: string): V20CatPhotoSample {
  return {
    sampleId,
    mediaType: "image/jpeg",
    sizeBucket: "small",
    dimensions: { width: 512, height: 512 },
    selected: true,
    consent: true
  };
}

function attempt(
  sampleId: string,
  accepted: boolean,
  attemptIndex: 1 | 2,
  reasonCode: V20BenchmarkAttempt["reasonCode"] = accepted ? "accepted" : "provider_output_rejected"
): V20BenchmarkAttempt {
  return {
    sampleId,
    promptVariant: "strict_grid_motion_sheet",
    attemptIndex,
    accepted,
    reasonCode
  };
}
