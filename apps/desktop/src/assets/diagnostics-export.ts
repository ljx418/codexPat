import { type AssetManifest } from "./asset-manifest";
import { type VisualQAPackResult } from "./visual-qa-types";
import { type GuidedFlowState } from "./guided-provider-flow";
import { type ProviderReadinessDiagnostic } from "./provider-readiness";
import { type NormalizationResult } from "./asset-normalizer";
import { providerConsentBoundaryHasForbiddenSecret, redactProviderSecret } from "./provider-consent-boundary";

// Diagnostics bundle combining V8.1-V8.6 operational data
export type DiagnosticsBundle = {
  version: "1.0";
  timestamp: string;
  components: {
    providerReadiness: ProviderReadinessDiagnostic | null;
    consentFlow: GuidedFlowState | null;
    normalization: {
      ok: boolean;
      packId: string | null;
      outputPath: string | null;
      errors: string[];
      warnings: string[];
    } | null;
    visualQA: {
      packId: string;
      anyFailed: boolean;
      failedActions: string[];
    } | null;
  };
  evidenceFiles: (string | null)[];
  redactedFields: string[];
};

export type DiagnosticsExportResult = {
  ok: boolean;
  bundle: DiagnosticsBundle | null;
  forbiddenContentFound: boolean;
  forbiddenPatterns: string[];
  errors: string[];
};

// Patterns that must not appear in diagnostics export
// Use specific matching to avoid cross-field false positives
const FORBIDDEN_PATTERNS = [
  /sk-[A-Za-z0-9_-]{8,}/,                              // API keys
  /Bearer\s+[A-Za-z0-9._-]{8,}/,                      // Bearer tokens
  /(?:\/Users\/|\/private\/|\/tmp\/|\/var\/)[^\s"']+/, // system paths (standalone only)
  /api[_-]?token\.json/,                              // token file references
  /raw\s+(?:payload|response|photo)/i,               // raw content (whole words)
  /(?:^|\s)(?:workspace|config)\s*path(?:\s|$)/i,    // path refs (word boundaries only)
  /Authorization\s*:/i,                               // Authorization header
];

export function redactForbiddenPatterns(value: string): string {
  let result = value;

  result = redactProviderSecret(result);

  return result;
}

export function createDiagnosticsBundle(options: {
  providerReadiness: ProviderReadinessDiagnostic | null;
  consentFlow: GuidedFlowState | null;
  normalizationResult: NormalizationResult | null;
  visualQAResult: VisualQAPackResult | null;
  evidenceFiles?: string[];
}): DiagnosticsBundle {
  const bundle: DiagnosticsBundle = {
    version: "1.0",
    timestamp: new Date().toISOString(),
    components: {
      providerReadiness: options.providerReadiness
        ? {
            ...options.providerReadiness,
            // credentialState is safe, but ensure no actual secret leaked
            credentialState: options.providerReadiness.credentialState
          }
        : null,
      consentFlow: options.consentFlow
        ? {
            step: options.consentFlow.step,
            reasonCode: options.consentFlow.reasonCode,
            consentGiven: options.consentFlow.consentGiven,
            consentTimestamp: options.consentFlow.consentTimestamp,
            uploadedAssetPath: sanitizePath(options.consentFlow.uploadedAssetPath),
            activatedPackId: options.consentFlow.activatedPackId,
            errorMessage: options.consentFlow.errorMessage
              ? options.consentFlow.errorMessage.replace(/\/Users\/[^\/]+/g, "[REDACTED_HOME]")
                                                 .replace(/\/tmp\/[^\/]+/g, "[REDACTED_TMP]")
                                                 .replace(/sk-[A-Za-z0-9_-]{4,}/g, "sk-...xxxx")
              : null
          }
        : null,
      normalization: options.normalizationResult
        ? {
            ok: options.normalizationResult.ok,
            packId: options.normalizationResult.manifest?.packId ?? null,
            outputPath: sanitizePath(options.normalizationResult.outputPath),
            errors: options.normalizationResult.errors,
            warnings: options.normalizationResult.warnings
          }
        : null,
      visualQA: options.visualQAResult
        ? {
            packId: options.visualQAResult.packId,
            anyFailed: options.visualQAResult.anyFailed,
            failedActions: options.visualQAResult.failedActions
          }
        : null
    },
    evidenceFiles: (options.evidenceFiles ?? []).map(sanitizePath),
    redactedFields: [
      "providerApiKey",
      "bearerToken",
      "rawPayload",
      "rawResponse",
      "fullPath",
      "assetPath"
    ]
  };

  return bundle;
}

export function exportDiagnostics(options: {
  providerReadiness: ProviderReadinessDiagnostic | null;
  consentFlow: GuidedFlowState | null;
  normalizationResult: NormalizationResult | null;
  visualQAResult: VisualQAPackResult | null;
  evidenceFiles?: string[];
}): DiagnosticsExportResult {
  const errors: string[] = [];
  const forbiddenPatterns: string[] = [];

  const bundle = createDiagnosticsBundle(options);

  // Check entire bundle for forbidden content
  const serialized = JSON.stringify(bundle);
  if (providerConsentBoundaryHasForbiddenSecret(bundle)) {
    errors.push("forbidden_secret_detected");
  }

  // Run pattern-based scan as secondary check
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(serialized)) {
      forbiddenPatterns.push(pattern.source);
    }
  }

  return {
    ok: errors.length === 0 && forbiddenPatterns.length === 0,
    bundle: errors.length === 0 ? bundle : null,
    forbiddenContentFound: forbiddenPatterns.length > 0,
    forbiddenPatterns,
    errors
  };
}

export function scanForForbiddenContent(value: unknown): {
  ok: boolean;
  found: string[];
} {
  const serialized = JSON.stringify(value);
  const found: string[] = [];

  for (const pattern of FORBIDDEN_PATTERNS) {
    const match = serialized.match(pattern);
    if (match) {
      found.push(pattern.source);
    }
  }

  return {
    ok: found.length === 0,
    found
  };
}

function sanitizePath(path: string | null | undefined): string | null {
  if (!path) return null;
  return path
    .replace(/\/Users\/[^\/]+/, "[REDACTED_HOME]")
    .replace(/\/tmp\/[^\/]+/, "[REDACTED_TMP]")
    .replace(/\/private\/[^\/]+/, "[REDACTED_PRIVATE]");
}

export type DeletionEvent = {
  type: "pack_deleted";
  timestamp: string;
  packId: string;
  packIdSanitized: string;
  appManagedStorage: boolean;
  // Note: No raw paths, no credential info
};

export function createDeletionEvent(
  packId: string,
  appManagedStorage: boolean
): DeletionEvent {
  return {
    type: "pack_deleted",
    timestamp: new Date().toISOString(),
    packId,
    packIdSanitized: packId.replace(/[^A-Za-z0-9._-]/g, "_"),
    appManagedStorage
  };
}

export type LicenseExport = {
  packId: string;
  licenseType: string;
  attribution: string;
  attributionSanitized: string;
  providerName: string | null;
};

export function exportLicenseFromManifest(
  manifest: AssetManifest,
  providerName?: string
): LicenseExport {
  const attribution = manifest.license.attribution ?? "";
  const attributionSanitized = attribution
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return {
    packId: manifest.packId,
    licenseType: manifest.license.type,
    attribution,
    attributionSanitized,
    providerName: providerName ?? null
  };
}