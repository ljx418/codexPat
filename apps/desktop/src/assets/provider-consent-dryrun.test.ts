import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runConsentDryRun } from "./provider-consent-dryrun";
import { providerConsentBoundaryHasForbiddenSecret } from "./provider-consent-boundary";

describe("V8.1 provider-consent-dryrun", () => {
  it("always returns noUploadOccurred as true", () => {
    const result1 = runConsentDryRun();
    assert.equal(result1.noUploadOccurred, true);

    const result2 = runConsentDryRun({ apiKey: "sk-test-api-key-12345" });
    assert.equal(result2.noUploadOccurred, true);
  });

  it("returns redactedCredentialPreview in correct format when API key is present", () => {
    const result = runConsentDryRun({ apiKey: "sk-test-api-key-12345" });
    assert.equal(result.redactedCredentialPreview, "sk-...xxxx");
    assert.ok(providerConsentBoundaryHasForbiddenSecret(result.redactedCredentialPreview) === false);
  });

  it("returns null redactedCredentialPreview when no API key is present", () => {
    const result = runConsentDryRun({ apiKey: undefined });
    assert.equal(result.redactedCredentialPreview, null);
  });

  it("returns allDisclosuresVisible as true in correct state", () => {
    const result = runConsentDryRun();
    assert.equal(result.allDisclosuresVisible, true);
  });

  it("does not leak secret in any output field", () => {
    const result = runConsentDryRun({ apiKey: "sk-test-api-key-12345" });
    const serialized = JSON.stringify(result);
    assert.equal(providerConsentBoundaryHasForbiddenSecret(result), false);
    assert.doesNotMatch(serialized, /sk-test-api-key-12345/);
    assert.doesNotMatch(serialized, /sk-test-api-key/);
    assert.doesNotMatch(serialized, /Bearer/);
  });

  it("returns consentFlowComplete when provider is ready", () => {
    const result = runConsentDryRun();
    // With no env vars, reasonCode is provider_not_selected
    // which means consentFlowComplete should be true
    assert.equal(result.consentFlowComplete, true);
  });

  it("has correct result shape", () => {
    const result = runConsentDryRun();
    assert.ok("ok" in result);
    assert.ok("consentFlowComplete" in result);
    assert.ok("allDisclosuresVisible" in result);
    assert.ok("reasonCode" in result);
    assert.ok("redactedCredentialPreview" in result);
    assert.ok("noUploadOccurred" in result);
  });
});