import { describe, it } from "node:test";
import assert from "node:assert";
import {
  exportDiagnostics,
  scanForForbiddenContent,
  createDeletionEvent,
  exportLicenseFromManifest,
  createDiagnosticsBundle
} from "./diagnostics-export";
import { type GuidedFlowState } from "./guided-provider-flow";
import { type AssetManifest } from "./asset-manifest";

describe("DiagnosticsExport", () => {
  describe("exportDiagnostics", () => {
    it("creates clean diagnostics bundle with no forbidden content", () => {
      const result = exportDiagnostics({
        providerReadiness: {
          credentialState: "configured",
          reasonCode: "provider_ready_redacted",
          uploadConsentGiven: true,
          termsReviewed: true,
          uploadEnabled: false,
          executionEnabled: false,
          providerName: "Tripo3D"
        },
        consentFlow: {
          step: "complete",
          reasonCode: "complete",
          consentGiven: true,
          consentTimestamp: "2026-06-02T10:00:00.000Z",
          uploadedAssetPath: "/tmp/v8_2_provider_output/tripo_pbr_model.glb",
          activatedPackId: "tripo3d-cat-photo",
          errorMessage: null
        },
        normalizationResult: {
          ok: true,
          manifest: null,
          scanResult: null,
          coverageTable: null,
          errors: [],
          warnings: [],
          outputPath: "/tmp/v8_2_normalized/tripo_pbr_model.glb"
        },
        visualQAResult: {
          packId: "tripo3d-cat-photo",
          provider: "Tripo3D",
          timestamp: "2026-06-02T10:00:00.000Z",
          checks: [],
          anyFailed: false,
          failedActions: [],
          evidenceFile: null,
          errors: []
        },
        evidenceFiles: ["/tmp/v8_2_evidence.json"]
      });

      assert.strictEqual(result.ok, true, `diagnostics export failed: ${JSON.stringify(result.errors)}`);
      assert.strictEqual(result.forbiddenContentFound, false, `forbidden patterns found: ${result.forbiddenPatterns.join(", ")}`);
      assert.ok(result.bundle);
    });

    it("detects forbidden content in consentFlow state before sanitization", () => {
      // Use a path-based forbidden pattern that won't be caught by errorMessage redaction
      const stateWithPath: GuidedFlowState = {
        step: "error",
        reasonCode: "generation_failed",
        consentGiven: true,
        consentTimestamp: "2026-06-02T10:00:00.000Z",
        uploadedAssetPath: null,
        activatedPackId: null,
        // Use /private/ path which triggers FORBIDDEN_PATTERNS but not errorMessage redaction
        errorMessage: "File not found: /private/secret/path.glb"
      };

      const result = exportDiagnostics({
        providerReadiness: null,
        consentFlow: stateWithPath,
        normalizationResult: null,
        visualQAResult: null
      });

      // /private/ path should be detected by pattern scan even after sanitization
      assert.strictEqual(result.ok, false);
      assert.ok(result.forbiddenContentFound);
    });

    it("redacts /Users/ paths in bundle", () => {
      const result = exportDiagnostics({
        providerReadiness: null,
        consentFlow: {
          step: "preview_output",
          reasonCode: "complete",
          consentGiven: true,
          consentTimestamp: "2026-06-02T10:00:00.000Z",
          uploadedAssetPath: "/Users/admin/cat.glb",
          activatedPackId: null,
          errorMessage: null
        },
        normalizationResult: null,
        visualQAResult: null,
        evidenceFiles: ["/tmp/v8_2_evidence.json"]
      });

      if (result.bundle) {
        const serialized = JSON.stringify(result.bundle);
        assert.ok(!serialized.includes("/Users/admin"), "should redact /Users/ paths");
      }
    });
  });

  describe("scanForForbiddenContent", () => {
    it("detects API key pattern", () => {
      const result = scanForForbiddenContent({ apiKey: "sk-1234567890abcdef" });
      assert.strictEqual(result.ok, false);
      assert.ok(result.found.length > 0);
    });

    it("detects Bearer token pattern", () => {
      const result = scanForForbiddenContent({ token: "Bearer eyJhbGciOiJIUzI1NiJ9" });
      assert.strictEqual(result.ok, false);
      assert.ok(result.found.length > 0);
    });

    it("detects /Users/ path pattern", () => {
      const result = scanForForbiddenContent({ path: "/Users/admin/cat.glb" });
      assert.strictEqual(result.ok, false);
    });

    it("passes clean data", () => {
      const result = scanForForbiddenContent({
        packId: "tripo3d-cat-photo",
        status: "complete",
        providerName: "Tripo3D"
      });
      assert.strictEqual(result.ok, true);
      assert.deepStrictEqual(result.found, []);
    });
  });

  describe("createDeletionEvent", () => {
    it("creates safe deletion event with sanitized packId", () => {
      const event = createDeletionEvent("tripo3d-cat-photo", true);
      assert.strictEqual(event.type, "pack_deleted");
      assert.strictEqual(event.packId, "tripo3d-cat-photo");
      assert.strictEqual(event.packIdSanitized, "tripo3d-cat-photo");
      assert.strictEqual(event.appManagedStorage, true);
      assert.ok(!JSON.stringify(event).includes("/Users/"));
      assert.ok(!JSON.stringify(event).includes("sk-"));
    });

    it("sanitizes invalid packId characters", () => {
      const event = createDeletionEvent("pack with spaces & symbols!", false);
      assert.strictEqual(event.packIdSanitized, "pack_with_spaces___symbols_");
    });
  });

  describe("exportLicenseFromManifest", () => {
    it("exports and sanitizes license attribution", () => {
      const manifest: AssetManifest = {
        schemaVersion: "5.0",
        packId: "test-pack",
        version: "1.0.0",
        rendererKind: "gltf",
        license: {
          type: "Tripo3D trial",
          attribution: "Generated via Tripo3D API on 2026-06-02"
        },
        assets: {},
        actions: {}
      };

      const license = exportLicenseFromManifest(manifest, "Tripo3D");
      assert.strictEqual(license.packId, "test-pack");
      assert.strictEqual(license.licenseType, "Tripo3D trial");
      assert.strictEqual(license.attributionSanitized, "Generated via Tripo3D API on 2026-06-02");
      assert.strictEqual(license.providerName, "Tripo3D");
    });

    it("truncates attribution to 160 chars", () => {
      const longAttribution = "A".repeat(200);
      const manifest: AssetManifest = {
        schemaVersion: "5.0",
        packId: "test",
        version: "1.0.0",
        rendererKind: "gltf",
        license: { type: "test", attribution: longAttribution },
        assets: {},
        actions: {}
      };

      const license = exportLicenseFromManifest(manifest);
      assert.ok(license.attributionSanitized.length <= 160);
    });
  });

  describe("createDiagnosticsBundle", () => {
    it("creates bundle with all components", () => {
      const bundle = createDiagnosticsBundle({
        providerReadiness: {
          credentialState: "configured",
          reasonCode: "provider_ready_redacted",
          uploadConsentGiven: true,
          termsReviewed: true,
          uploadEnabled: false,
          executionEnabled: false,
          providerName: "Tripo3D"
        },
        consentFlow: null,
        normalizationResult: null,
        visualQAResult: null
      });

      assert.strictEqual(bundle.version, "1.0");
      assert.ok(bundle.timestamp);
      assert.ok(bundle.components.providerReadiness);
      assert.strictEqual(bundle.redactedFields.length > 0, true);
    });

    it("sanitizes paths in normalization result", () => {
      const bundle = createDiagnosticsBundle({
        providerReadiness: null,
        consentFlow: null,
        normalizationResult: {
          ok: true,
          manifest: null,
          scanResult: null,
          coverageTable: null,
          errors: [],
          warnings: [],
          outputPath: "/Users/admin/output.glb"
        },
        visualQAResult: null
      });

      const normalizedOutput = JSON.stringify(bundle.components.normalization);
      assert.ok(!normalizedOutput.includes("/Users/admin"));
      assert.ok(normalizedOutput.includes("[REDACTED_HOME]"));
    });
  });
});