export type ProviderFeasibilityStatus = {
  stage: "feasibility_only";
  uploadEnabled: false;
  providerExecutionEnabled: false;
  credentialAccepted: false;
  requiredGates: string[];
  disclosures: string[];
  redactionRules: string[];
  forbiddenClaims: string[];
};

export type ProviderConsentBoundaryReview = {
  status: "accepted" | "rejected";
  reasonCode:
    | "provider_feasibility_boundary_ok"
    | "provider_consent_required"
    | "provider_disclosure_required"
    | "provider_secret_rejected";
  providerName: string;
  uploadConsent: boolean;
  costDisclosureAccepted: boolean;
  privacyRetentionAccepted: boolean;
  licenseAttributionAccepted: boolean;
  providerExecutionAllowed: false;
  providerUploadAllowed: false;
  acceptsProviderSecret: false;
  redactedSecretPreview: string | null;
  outputMustPassLocalValidation: true;
};

export function providerFeasibilityStatus(): ProviderFeasibilityStatus {
  return {
    stage: "feasibility_only",
    uploadEnabled: false,
    providerExecutionEnabled: false,
    credentialAccepted: false,
    requiredGates: [
      "explicit provider choice",
      "explicit upload consent",
      "cost disclosure",
      "privacy and retention review",
      "license and attribution review",
      "credential redaction evidence",
      "provider response redaction",
      "imported output local validation"
    ],
    disclosures: [
      "Provider upload is disabled in this build.",
      "Provider execution is disabled in this build.",
      "Provider credentials are not accepted in this build.",
      "Future provider output must be imported through local validation before rendering.",
      "Cost, privacy, retention, license, and attribution terms must be shown before any future upload."
    ],
    redactionRules: [
      "redact Authorization headers",
      "redact API keys and bearer tokens",
      "redact cookies and session values",
      "redact raw provider responses",
      "redact local full paths and workspace/config paths"
    ],
    forbiddenClaims: [
      "provider adapter ready",
      "provider integration verified",
      "remote generation ready",
      "photo generation ready"
    ]
  };
}

export function createProviderConsentBoundaryReview(options: {
  providerName?: string;
  uploadConsent?: boolean;
  costDisclosureAccepted?: boolean;
  privacyRetentionAccepted?: boolean;
  licenseAttributionAccepted?: boolean;
  providerSecretPreview?: string;
}): ProviderConsentBoundaryReview {
  const providerName = sanitizeProviderName(options.providerName ?? "external generation provider");
  if (options.providerSecretPreview?.trim()) {
    return review("rejected", "provider_secret_rejected", providerName, options, redactProviderSecret(options.providerSecretPreview));
  }
  if (!options.uploadConsent) {
    return review("rejected", "provider_consent_required", providerName, options, null);
  }
  if (!options.costDisclosureAccepted || !options.privacyRetentionAccepted || !options.licenseAttributionAccepted) {
    return review("rejected", "provider_disclosure_required", providerName, options, null);
  }
  return review("accepted", "provider_feasibility_boundary_ok", providerName, options, null);
}

export function redactProviderSecret(value: string) {
  if (!value.trim()) {
    return "";
  }
  return value
    .replace(/Authorization[^\n\r]*/gi, "Authorization [redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/gi, "sk-[redacted]")
    .replace(/api[_-]?key\s*[:=]\s*[^\s]+/gi, "api key redacted")
    .replace(/cookie\s*[:=]\s*[^\n\r]+/gi, "cookie redacted");
}

export function providerConsentBoundaryHasForbiddenSecret(value: unknown) {
  const serialized = JSON.stringify(value);
  return /sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|api[_-]?key\s*[:=]\s*[^"'\s]+|cookie\s*[:=]\s*[^"'\s]+/i.test(serialized)
    || /\/Users\/|\/private\/|\/Volumes\/|[A-Za-z]:[\\/]/.test(serialized)
    || /raw provider response|raw payload|workspace path|config path|api-token\.json/i.test(serialized);
}

function review(
  status: ProviderConsentBoundaryReview["status"],
  reasonCode: ProviderConsentBoundaryReview["reasonCode"],
  providerName: string,
  options: {
    uploadConsent?: boolean;
    costDisclosureAccepted?: boolean;
    privacyRetentionAccepted?: boolean;
    licenseAttributionAccepted?: boolean;
  },
  redactedSecretPreview: string | null
): ProviderConsentBoundaryReview {
  return {
    status,
    reasonCode,
    providerName,
    uploadConsent: Boolean(options.uploadConsent),
    costDisclosureAccepted: Boolean(options.costDisclosureAccepted),
    privacyRetentionAccepted: Boolean(options.privacyRetentionAccepted),
    licenseAttributionAccepted: Boolean(options.licenseAttributionAccepted),
    providerExecutionAllowed: false,
    providerUploadAllowed: false,
    acceptsProviderSecret: false,
    redactedSecretPreview,
    outputMustPassLocalValidation: true
  };
}

function sanitizeProviderName(value: string) {
  const sanitized = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  if (!sanitized || /\/Users\/|https?:\/\/|file:\/\/|sk-[A-Za-z0-9_-]{8,}|Authorization/i.test(sanitized)) {
    return "external generation provider";
  }
  return sanitized;
}
