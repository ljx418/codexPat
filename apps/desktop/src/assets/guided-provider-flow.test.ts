import { describe, it } from "node:test";
import assert from "node:assert";
import {
  createInitialGuidedFlowState,
  canProceedToGeneration,
  isProviderConfigured,
  getConsentDryRunResult,
  allDisclosuresVisible,
  buildGuidedFlowStateFromConsent,
  sanitizeGuidedFlowStateForEvidence,
  validateGuidedFlowState,
  CONSENT_DISCLOSURES,
  type GuidedFlowState
} from "./guided-provider-flow";

describe("GuidedProviderFlow", () => {
  describe("createInitialGuidedFlowState", () => {
    it("creates initial state with correct defaults", () => {
      const state = createInitialGuidedFlowState();
      assert.strictEqual(state.step, "idle");
      assert.strictEqual(state.reasonCode, "consent_required");
      assert.strictEqual(state.consentGiven, false);
      assert.strictEqual(state.consentTimestamp, null);
      assert.strictEqual(state.uploadedAssetPath, null);
      assert.strictEqual(state.activatedPackId, null);
      assert.strictEqual(state.errorMessage, null);
    });
  });

  describe("canProceedToGeneration", () => {
    it("returns false when consent not given", () => {
      const state: GuidedFlowState = {
        step: "show_consent",
        reasonCode: "consent_required",
        consentGiven: false,
        consentTimestamp: null,
        uploadedAssetPath: null,
        activatedPackId: null,
        errorMessage: null
      };
      assert.strictEqual(canProceedToGeneration(state), false);
    });

    it("returns false when step is not show_consent", () => {
      const state: GuidedFlowState = {
        step: "select_photo_or_traits",
        reasonCode: "consent_given",
        consentGiven: true,
        consentTimestamp: new Date().toISOString(),
        uploadedAssetPath: null,
        activatedPackId: null,
        errorMessage: null
      };
      assert.strictEqual(canProceedToGeneration(state), false);
    });

    it("returns true when consent given and step is show_consent", () => {
      const state: GuidedFlowState = {
        step: "show_consent",
        reasonCode: "consent_given",
        consentGiven: true,
        consentTimestamp: new Date().toISOString(),
        uploadedAssetPath: null,
        activatedPackId: null,
        errorMessage: null
      };
      assert.strictEqual(canProceedToGeneration(state), true);
    });
  });

  describe("getConsentDryRunResult", () => {
    it("returns a valid ConsentDryRunResult", () => {
      const result = getConsentDryRunResult();
      assert.strictEqual(typeof result.ok, "boolean");
      assert.strictEqual(typeof result.consentFlowComplete, "boolean");
      assert.strictEqual(typeof result.allDisclosuresVisible, "boolean");
      assert.strictEqual(typeof result.noUploadOccurred, "boolean");
    });
  });

  describe("allDisclosuresVisible", () => {
    it("returns true when all 4 disclosures are visible", () => {
      assert.strictEqual(allDisclosuresVisible(CONSENT_DISCLOSURES), true);
    });

    it("returns false when a disclosure is hidden", () => {
      const hidden = [...CONSENT_DISCLOSURES.slice(0, 3),
        { ...CONSENT_DISCLOSURES[3], visible: false }];
      assert.strictEqual(allDisclosuresVisible(hidden), false);
    });
  });

  describe("buildGuidedFlowStateFromConsent", () => {
    it("updates state when consent is given", () => {
      const currentState = createInitialGuidedFlowState();
      const consentResult = getConsentDryRunResult();
      // If consent is given, ok=true and consentFlowComplete=true
      const newState = buildGuidedFlowStateFromConsent(currentState, {
        ...consentResult,
        ok: true,
        consentFlowComplete: true
      });
      assert.strictEqual(newState.consentGiven, true);
      assert.strictEqual(newState.reasonCode, "consent_given");
      assert.ok(newState.consentTimestamp !== null);
    });

    it("keeps consent_required when consent not given", () => {
      const currentState = createInitialGuidedFlowState();
      const newState = buildGuidedFlowStateFromConsent(currentState, {
        ok: false,
        consentFlowComplete: false,
        allDisclosuresVisible: true,
        reasonCode: "provider_consent_required",
        redactedCredentialPreview: null,
        noUploadOccurred: true
      });
      assert.strictEqual(newState.consentGiven, false);
      assert.strictEqual(newState.reasonCode, "consent_required");
    });
  });

  describe("sanitizeGuidedFlowStateForEvidence", () => {
    it("redacts user paths in uploadedAssetPath", () => {
      const state: GuidedFlowState = {
        step: "preview_output",
        reasonCode: "complete",
        consentGiven: true,
        consentTimestamp: "2026-06-02T10:00:00.000Z",
        uploadedAssetPath: "/Users/admin/cat.glb",
        activatedPackId: "test-pack",
        errorMessage: null
      };
      const sanitized = sanitizeGuidedFlowStateForEvidence(state);
      assert.ok(!sanitized.uploadedAssetPath!.includes("/Users/"));
      assert.ok(sanitized.uploadedAssetPath!.includes("[REDACTED_PATH]"));
    });

    it("redacts tokens in errorMessage", () => {
      const state: GuidedFlowState = {
        step: "error",
        reasonCode: "generation_failed",
        consentGiven: true,
        consentTimestamp: "2026-06-02T10:00:00.000Z",
        uploadedAssetPath: null,
        activatedPackId: null,
        errorMessage: "API failed with sk-12345678abcdef token"
      };
      const sanitized = sanitizeGuidedFlowStateForEvidence(state);
      assert.ok(!sanitized.errorMessage!.includes("sk-12345678"));
      assert.ok(sanitized.errorMessage!.includes("sk-...xxxx"));
    });
  });

  describe("validateGuidedFlowState", () => {
    it("accepts valid state", () => {
      const state = createInitialGuidedFlowState();
      const result = validateGuidedFlowState(state);
      assert.strictEqual(result.ok, true);
      assert.deepStrictEqual(result.errors, []);
    });

    it("rejects non-object state", () => {
      const result = validateGuidedFlowState(null);
      assert.strictEqual(result.ok, false);
      assert.ok(result.errors.length > 0);
    });

    it("rejects invalid step type", () => {
      const result = validateGuidedFlowState({ step: 123 });
      assert.strictEqual(result.ok, false);
      assert.ok(result.errors.some(e => e.includes("step")));
    });

    it("rejects invalid consentGiven type", () => {
      const result = validateGuidedFlowState({ consentGiven: "yes" });
      assert.strictEqual(result.ok, false);
      assert.ok(result.errors.some(e => e.includes("consentGiven")));
    });
  });
});

describe("Provider Consent Disclosures", () => {
  it("has exactly 4 disclosure categories", () => {
    const categories = CONSENT_DISCLOSURES.map(d => d.category);
    assert.deepStrictEqual(categories, ["cost", "privacy", "retention", "license"]);
  });

  it("all disclosures are visible", () => {
    assert.ok(CONSENT_DISCLOSURES.every(d => d.visible === true));
  });

  it("all disclosures have non-empty text", () => {
    assert.ok(CONSENT_DISCLOSURES.every(d => d.text.length > 10));
  });
});