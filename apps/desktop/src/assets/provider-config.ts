export type ProviderEndpointCategory = "image" | "model_3d" | "video";

export type CredentialState =
  | "not_configured"    // no provider config found
  | "missing"            // provider selected but no credential found
  | "configured"         // credential found (value never printed)
  | "redacted";         // credential was displayed/referenced to user

export type ProviderReadinessReasonCode =
  | "provider_not_selected"
  | "provider_credential_missing"
  | "provider_consent_required"
  | "provider_terms_unreviewed"
  | "provider_ready_redacted"
  | "provider_upload_disabled"
  | "provider_execution_disabled";

export type ProviderConfig = {
  providerName: string;
  endpointCategory: ProviderEndpointCategory;
  credentialState: CredentialState;
  costDisclosure: string;
  privacyRetention: string;
  licenseAttribution: string;
  uploadConsentRequired: boolean;
  uploadConsentGiven: boolean;
};