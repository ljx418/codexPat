import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createProviderConsentBoundaryReview,
  providerConsentBoundaryHasForbiddenSecret,
  providerFeasibilityStatus,
  redactProviderSecret
} from "./provider-consent-boundary";

describe("V6.6 provider consent boundary", () => {
  it("keeps provider execution disabled for feasibility-only acceptance", () => {
    const status = providerFeasibilityStatus();

    assert.equal(status.stage, "feasibility_only");
    assert.equal(status.uploadEnabled, false);
    assert.equal(status.providerExecutionEnabled, false);
    assert.equal(status.credentialAccepted, false);
    assert.ok(status.requiredGates.includes("explicit upload consent"));
    assert.ok(status.requiredGates.includes("imported output local validation"));
    assert.ok(status.disclosures.includes("Provider upload is disabled in this build."));
    assert.ok(status.redactionRules.includes("redact API keys and bearer tokens"));
    assert.ok(status.forbiddenClaims.includes("provider integration verified"));
  });

  it("keeps V7.4 feasibility-only provider review non-executing even with all disclosures accepted", () => {
    const review = createProviderConsentBoundaryReview({
      providerName: "User selected external tool",
      uploadConsent: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true
    });

    assert.equal(review.status, "accepted");
    assert.equal(review.reasonCode, "provider_feasibility_boundary_ok");
    assert.equal(review.providerExecutionAllowed, false);
    assert.equal(review.providerUploadAllowed, false);
    assert.equal(review.acceptsProviderSecret, false);
    assert.equal(review.outputMustPassLocalValidation, true);
    assert.equal(providerConsentBoundaryHasForbiddenSecret(review), false);
  });

  it("rejects provider secrets and redacts secret-like previews", () => {
    const review = createProviderConsentBoundaryReview({
      providerName: "Provider",
      uploadConsent: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true,
      providerSecretPreview: "Authorization Bearer sk-test-token-123456789"
    });
    const redacted = redactProviderSecret("api_key=abc123456789 cookie=session-secret");

    assert.equal(review.status, "rejected");
    assert.equal(review.reasonCode, "provider_secret_rejected");
    assert.match(review.redactedSecretPreview ?? "", /redacted/);
    assert.doesNotMatch(review.redactedSecretPreview ?? "", /sk-test-token/);
    assert.doesNotMatch(redacted, /abc123456789/);
    assert.doesNotMatch(redacted, /session-secret/);
    assert.equal(providerConsentBoundaryHasForbiddenSecret({ review, redacted }), false);
  });
});
