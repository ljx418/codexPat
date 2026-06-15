# V8.1 Development Plan

status: in-progress
date: 2026-06-02
parent: V8.0 scope freeze passed 2026-06-02

## Objective

Implement V8.1 provider consent and credential harness — the foundation for all
subsequent V8 provider-backed work. V8.1 must not upload anything or expose
credentials; it establishes the consent boundary and diagnostics infrastructure
for V8.2+.

## V8.1 Scope

### In Scope

1. Provider config model with named provider, endpoint category, credential
   source state, cost/privacy/retention/license text.
2. Redacted diagnostics command and UI summary.
3. No-upload dry run proving all required consent fields are visible.
4. Stable reason codes for all provider readiness states.
5. Local .env / config file credential state detection.
6. Provider terms disclosure model.
7. Evidence that no token, Authorization, raw payload, prompt text, full local
   path, workspace path, config path, or provider credential appears in any
   output.

### Out of Scope

- Actual provider network calls.
- Provider output staging.
- GLTF/GLB deep scanning.
- Asset normalization.
- Action clip mapping.
- Runtime visual QA.
- User-facing guided UX.

## Development Tasks

### Task 1: Provider Config Model

File: `apps/desktop/src/assets/provider-config.ts` (new)

```typescript
export type ProviderEndpointCategory = "image" | "model_3d" | "video";

export type CredentialState =
  | "not_configured"    // no credential found anywhere
  | "missing"            // provider selected but no credential
  | "configured"         // credential found (value never printed)
  | "redacted";         // credential was displayed/referenced

export type ProviderConfig = {
  providerName: string;
  endpoint: string;                    // visible endpoint category only, not URL
  endpointCategory: ProviderEndpointCategory;
  credentialState: CredentialState;
  costDisclosure: string;               // must be non-empty if provider selected
  privacyRetention: string;             // must be non-empty if provider selected
  licenseAttribution: string;           // must be non-empty if provider selected
  uploadConsentRequired: boolean;
  uploadConsentGiven: boolean;
};
```

Reason codes (stable, user-visible):

```typescript
export type ProviderReadinessReasonCode =
  | "provider_not_selected"        // no provider chosen yet
  | "provider_credential_missing"  // provider chosen but no credential found
  | "provider_consent_required"    // credential exists but user has not consented
  | "provider_terms_unreviewed"    // cost/privacy/retention not acknowledged
  | "provider_ready_redacted"      // all gates passed, execution disabled in V8.1
  | "provider_upload_disabled"     // build-time flag, no upload possible
  | "provider_execution_disabled"; // V8.1 never executes provider calls
```

### Task 2: Provider Readiness Diagnostic

File: `apps/desktop/src/assets/provider-readiness.ts` (new)

```typescript
export type ProviderReadinessDiagnostic = {
  reasonCode: ProviderReadinessReasonCode;
  providerName: string | null;
  credentialState: CredentialState;
  uploadEnabled: boolean;       // always false in V8.1
  executionEnabled: boolean;   // always false in V8.1
  consentGates: {
    providerSelected: boolean;
    credentialAvailable: boolean;
    termsReviewed: boolean;
    uploadConsentGiven: boolean;
  };
  disclosures: string[];       // always shows all required disclosure texts
};
```

Rules:
- `providerName` is the sanitized display name only, never the full config value.
- `credentialState` is derived from config presence, never from the actual secret.
- No HTTP calls. No credentials printed. No paths in output.
- `disclosures` always lists all required terms even if not yet reviewed.

### Task 3: No-Upload Consent Flow

File: `apps/desktop/src/assets/provider-consent-dryrun.ts` (new)

Purpose: demonstrate that the full consent flow works end-to-end without any
upload or provider call.

```typescript
export type ConsentDryRunResult = {
  ok: boolean;
  consentFlowComplete: boolean;
  allDisclosuresVisible: boolean;
  reasonCode: ProviderReadinessReasonCode;
  redactedCredentialPreview: string | null;  // "sk-...xxxx" or null
  noUploadOccurred: true;                     // hard assertion
};
```

The dry run must:
1. Show cost/privacy/retention/license text.
2. Require explicit user confirmation.
3. Record consent decision (accepted/rejected).
4. Prove no network call was made.
5. Return redacted credential state ("configured" / "missing" / "not_used").

### Task 4: Integration with Desktop Manager UI

Update `apps/desktop/src/assets/guided-prompt-workflow.ts` to surface
provider readiness status in the Desktop Manager settings panel.

The UI must show:
- Current provider selection (or "not selected").
- Credential state badge: `not_configured` / `missing` / `configured` / `redacted`.
- "Review Terms" button that shows all disclosures.
- Consent confirmation checkbox.
- Readiness reason code in plain text.

Must NOT show:
- Actual token/API key.
- Full local paths.
- Raw provider response.

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| A1 | No provider upload occurs | Network monitor shows zero outbound calls during dry run |
| A2 | Credentials are never printed | Manual inspection of all console.log/output calls |
| A3 | Output contains provider readiness state only | `ProviderReadinessDiagnostic` contains only safe fields |
| A4 | All consent disclosures are visible | UI shows cost, privacy, retention, license text |
| A5 | `credentialState` values are correct | Test with valid/invalid/missing env vars |
| A6 | Reason codes are stable | All 7 reason codes return correct enum value |
| A7 | No forbidden content in evidence | Redaction scan passes on all diagnostic outputs |
| A8 | V8.0 scope remains frozen | No automatic photo-to-3D or provider integration claim |

## Implementation Notes

- All provider config reading must use the redaction patterns from
  `provider-consent-boundary.ts` (already implements `redactProviderSecret`).
- Credential state detection should check `.env`, `process.env`, and the
  macOS Keychain (future), but never surface the actual secret.
- The `uploadEnabled: false` / `executionEnabled: false` flags are build-time
  constants for V8.1; they become runtime flags in V8.2.
- Diagnostics output is logged to the Tauri app log only (not to network).
- Every new function must have unit tests covering redaction compliance.

## Dependencies

- V8.0 scope freeze (passed).
- `apps/desktop/src/assets/provider-consent-boundary.ts` (already exists, V5.14).
- `apps/desktop/src/assets/provider-consent-boundary.test.ts` (tests must be extended).

## Go / No-Go

V8.1 is Go for implementation after V8.0 scope freeze evidence is accepted.
V8.1 implementation is blocked if:
- V8.0 scope freeze has unresolved High planning risks.
- Any V8.1 acceptance criterion cannot be met due to architectural constraints.

## Output Artifacts

- `apps/desktop/src/assets/provider-config.ts`
- `apps/desktop/src/assets/provider-readiness.ts`
- `apps/desktop/src/assets/provider-consent-dryrun.ts`
- `docs/V8.x/evidence/v8_1-provider-consent-credential-smoke-2026-06-02.md`
- `docs/V8.x/v8_1-final-acceptance-report.md` (after evidence accepted)
