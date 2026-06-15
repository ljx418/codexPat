import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { redactProviderSecret } from "./provider-consent-boundary";
import type { CredentialState, ProviderReadinessReasonCode } from "./provider-config";

export type ProviderReadinessDiagnostic = {
  credentialState: CredentialState;
  reasonCode: ProviderReadinessReasonCode;
  uploadConsentGiven: boolean;
  termsReviewed: boolean;
  uploadEnabled: boolean;
  executionEnabled: boolean;
  providerName: string | null;
};

function loadEnvFromFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  if (!existsSync(filePath)) {
    return env;
  }
  try {
    const content = readFileSync(filePath, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 0) {
        continue;
      }
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (key) {
        env[key] = val;
      }
    }
  } catch {
    // ignore read errors
  }
  return env;
}

function getEnvValue(key: string, options?: { apiKey?: string }): string | undefined {
  if (options?.apiKey !== undefined && key === "PROVIDER_API_KEY") {
    return options.apiKey;
  }
  const envVal = process.env[key];
  if (envVal !== undefined) {
    return envVal;
  }
  // Check project root .env file
  const envFile = join(process.cwd(), ".env");
  const fileEnv = loadEnvFromFile(envFile);
  return fileEnv[key];
}

export function getProviderReadinessDiagnostic(
  options?: { apiKey?: string }
): ProviderReadinessDiagnostic {
  // Determine actual credential presence
  // options.apiKey === "": credential "missing" (explicitly provided but empty)
  // options.apiKey === undefined: credential not provided at all
  const envApiKey = getEnvValue("PROVIDER_API_KEY", options);
  const envProviderName = getEnvValue("PROVIDER_NAME", options);

  const hasProviderNameInEnv = (envProviderName ?? "") !== "";
  const hasApiKeyInEnv = (envApiKey ?? "") !== "";

  // options.apiKey presence indicates user intent to configure, but "" means missing
  const apiKeyProvided = options?.apiKey !== undefined;
  const apiKeyValue = options?.apiKey ?? "";
  const hasApiKeyValueNonEmpty = apiKeyValue !== "";

  let credentialState: CredentialState;
  if (!hasProviderNameInEnv && !apiKeyProvided && !hasApiKeyInEnv) {
    credentialState = "not_configured";
  } else if ((hasProviderNameInEnv || apiKeyProvided) && !hasApiKeyValueNonEmpty && !hasApiKeyInEnv) {
    credentialState = "missing";
  } else if ((hasProviderNameInEnv || apiKeyProvided) && (hasApiKeyValueNonEmpty || hasApiKeyInEnv)) {
    // credential is configured, but we never read or expose the actual value
    credentialState = "configured";
  } else {
    // apiKey exists without providerName - treat as missing
    credentialState = "missing";
  }

  let reasonCode: ProviderReadinessReasonCode;
  if (credentialState === "not_configured") {
    reasonCode = "provider_not_selected";
  } else if (credentialState === "missing") {
    reasonCode = "provider_credential_missing";
  } else {
    // credentialState === "configured"
    // V8.1: consent flow simplified - consent given implies terms reviewed
    const uploadConsentGiven = getEnvValue("PROVIDER_UPLOAD_CONSENT_GIVEN", options) === "true";
    if (!uploadConsentGiven) {
      reasonCode = "provider_consent_required";
    } else {
      reasonCode = "provider_ready_redacted";
    }
  }

  // V8.1 build-time constants
  const uploadEnabled = false;
  const executionEnabled = false;
  const termsReviewed = getEnvValue("PROVIDER_UPLOAD_CONSENT_GIVEN", options) === "true";

  // Sanitize provider name before returning - never expose raw paths or secrets
  let safeProviderName: string | null = null;
  if (envProviderName) {
    safeProviderName = redactProviderSecret(envProviderName);
    if (!safeProviderName || safeProviderName === envProviderName) {
      // If redaction didn't change anything, do additional sanitization
      if (/[\/\\]/.test(envProviderName) || /\.(json|env|yaml|yml)$/i.test(envProviderName)) {
        safeProviderName = "[provider]";
      }
    }
  }

  return {
    credentialState,
    reasonCode,
    uploadConsentGiven: getEnvValue("PROVIDER_UPLOAD_CONSENT_GIVEN", options) === "true",
    termsReviewed,
    uploadEnabled,
    executionEnabled,
    providerName: safeProviderName,
  };
}