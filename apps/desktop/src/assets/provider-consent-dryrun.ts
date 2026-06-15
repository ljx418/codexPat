import { getProviderReadinessDiagnostic } from "./provider-readiness";
import { providerConsentBoundaryHasForbiddenSecret } from "./provider-consent-boundary";
import type { ProviderReadinessReasonCode } from "./provider-config";

export type ConsentDryRunResult = {
  ok: boolean;
  consentFlowComplete: boolean;
  allDisclosuresVisible: boolean;
  reasonCode: ProviderReadinessReasonCode;
  redactedCredentialPreview: string | null;  // "sk-...xxxx" or null
  noUploadOccurred: true;
};

export function runConsentDryRun(
  options?: { apiKey?: string }
): ConsentDryRunResult {
  const diag = getProviderReadinessDiagnostic(options);

  // Verify all required disclosures exist and are non-missing
  // A disclosure is "visible" when its value is present and meaningful
  // In not_configured state, providerName is null by design - this is a valid state
  const hasValidProviderName = diag.providerName !== undefined;
  const hasValidUploadConsent = typeof diag.uploadConsentGiven === "boolean";
  const hasValidUploadEnabled = typeof diag.uploadEnabled === "boolean";
  const hasValidExecutionEnabled = typeof diag.executionEnabled === "boolean";

  const allDisclosuresVisible =
    hasValidProviderName &&
    hasValidUploadConsent &&
    hasValidUploadEnabled &&
    hasValidExecutionEnabled;

  // Determine consent flow completeness
  let consentFlowComplete = false;
  if (
    diag.reasonCode === "provider_ready_redacted" ||
    diag.reasonCode === "provider_not_selected"
  ) {
    consentFlowComplete = true;
  }

  // Build redacted preview if API key is present
  // Check diagnostic's credentialState rather than options directly
  const hasApiKey =
    diag.credentialState === "configured" ||
    diag.credentialState === "redacted";
  const redactedCredentialPreview = hasApiKey ? "sk-...xxxx" : null;

  // Determine ok status
  const ok =
    diag.reasonCode === "provider_ready_redacted" ||
    diag.reasonCode === "provider_not_selected";

  return {
    ok,
    consentFlowComplete,
    allDisclosuresVisible,
    reasonCode: diag.reasonCode,
    redactedCredentialPreview,
    noUploadOccurred: true,
  };
}