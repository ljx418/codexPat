import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  CredentialState,
  ProviderEndpointCategory,
  ProviderReadinessReasonCode,
} from "./provider-config";

describe("V8.1 provider-config types", () => {
  it("supports all 4 CredentialState values", () => {
    const states: CredentialState[] = [
      "not_configured",
      "missing",
      "configured",
      "redacted",
    ];
    for (const state of states) {
      const config = {
        providerName: "Test Provider",
        endpointCategory: "image" as ProviderEndpointCategory,
        credentialState: state,
        costDisclosure: "Test cost",
        privacyRetention: "Test privacy",
        licenseAttribution: "Test license",
        uploadConsentRequired: true,
        uploadConsentGiven: false,
      };
      assert.equal(config.credentialState, state);
    }
  });

  it("supports all 3 ProviderEndpointCategory values", () => {
    const categories: ProviderEndpointCategory[] = ["image", "model_3d", "video"];
    for (const category of categories) {
      const config = {
        providerName: "Test Provider",
        endpointCategory: category,
        credentialState: "not_configured" as CredentialState,
        costDisclosure: "Test cost",
        privacyRetention: "Test privacy",
        licenseAttribution: "Test license",
        uploadConsentRequired: true,
        uploadConsentGiven: false,
      };
      assert.equal(config.endpointCategory, category);
    }
  });

  it("supports all 7 ProviderReadinessReasonCode values", () => {
    const reasonCodes: ProviderReadinessReasonCode[] = [
      "provider_not_selected",
      "provider_credential_missing",
      "provider_consent_required",
      "provider_terms_unreviewed",
      "provider_ready_redacted",
      "provider_upload_disabled",
      "provider_execution_disabled",
    ];
    assert.equal(reasonCodes.length, 7);
    for (const code of reasonCodes) {
      assert.ok(typeof code === "string");
    }
  });
});