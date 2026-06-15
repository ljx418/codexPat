import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  createV16Photo2DProviderBoundaryReview,
  createV16Photo2DProviderSafeJobSummary,
  digestText,
  v16ProviderBoundaryHasForbiddenLeak
} from "./photo-to-2d-provider-boundary";

describe("V16.1 photo-to-2D provider boundary", () => {
  test("accepts host image tool with consent and disclosure gates", () => {
    const review = createV16Photo2DProviderBoundaryReview({
      providerKind: "host_image_tool",
      consent: true,
      termsAccepted: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true
    });

    assert.equal(review.status, "accepted");
    assert.equal(review.reasonCode, "provider_boundary_ready");
    assert.equal(review.credentialRequired, false);
    assert.equal(review.credentialState, "not_required");
    assert.equal(v16ProviderBoundaryHasForbiddenLeak(review), false);
  });

  test("blocks missing consent and each disclosure independently", () => {
    assert.equal(createV16Photo2DProviderBoundaryReview({
      providerKind: "host_image_tool",
      termsAccepted: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true
    }).reasonCode, "provider_consent_required");

    assert.equal(createV16Photo2DProviderBoundaryReview({
      providerKind: "host_image_tool",
      consent: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true
    }).reasonCode, "provider_terms_required");

    assert.equal(createV16Photo2DProviderBoundaryReview({
      providerKind: "host_image_tool",
      consent: true,
      termsAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true
    }).reasonCode, "provider_cost_ack_required");

    assert.equal(createV16Photo2DProviderBoundaryReview({
      providerKind: "host_image_tool",
      consent: true,
      termsAccepted: true,
      costDisclosureAccepted: true,
      licenseAttributionAccepted: true
    }).reasonCode, "provider_retention_ack_required");

    assert.equal(createV16Photo2DProviderBoundaryReview({
      providerKind: "host_image_tool",
      consent: true,
      termsAccepted: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true
    }).reasonCode, "provider_license_ack_required");
  });

  test("requires credentials for MiniMax but never prints credential values", () => {
    const blocked = createV16Photo2DProviderBoundaryReview({
      providerKind: "minimax",
      consent: true,
      termsAccepted: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true
    });
    const accepted = createV16Photo2DProviderBoundaryReview({
      providerKind: "minimax",
      credentialAvailable: true,
      consent: true,
      termsAccepted: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true
    });

    assert.equal(blocked.reasonCode, "provider_credential_missing");
    assert.equal(accepted.status, "accepted");
    assert.equal(accepted.credentialState, "configured_redacted");
    assert.equal(v16ProviderBoundaryHasForbiddenLeak({ blocked, accepted }), false);
  });

  test("rejects unsafe request previews and redacts safe job summary", () => {
    const unsafe = createV16Photo2DProviderBoundaryReview({
      providerKind: "host_image_tool",
      consent: true,
      termsAccepted: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true,
      unsafeRequestPreview: "Authorization: Bearer sk-secret"
    });
    assert.equal(unsafe.status, "rejected");
    assert.equal(unsafe.reasonCode, "provider_request_rejected");

    const boundary = createV16Photo2DProviderBoundaryReview({
      providerKind: "host_image_tool",
      consent: true,
      termsAccepted: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true
    });
    const summary = createV16Photo2DProviderSafeJobSummary({
      boundary,
      modelFamily: "host image tool",
      jobId: "host-tool-job-local",
      sourcePhotoDigest: digestText("source-action-sheet"),
      promptDigest: digestText("prompt digest only"),
      actions: [{ actionId: "idle", frameCount: 6, outputFileDigests: [digestText("idle-1")] }]
    });

    assert.equal("reasonCode" in summary && summary.reasonCode, "provider_output_accepted");
    assert.equal(v16ProviderBoundaryHasForbiddenLeak(summary), false);
  });
});

