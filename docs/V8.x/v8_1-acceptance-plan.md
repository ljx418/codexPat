# V8.1 Acceptance Plan

status: in-progress
date: 2026-06-02

## Acceptance Principle

V8.1 acceptance is evidence-based. V8.1 passes only when all 8 acceptance
criteria are met with real local configuration state, no upload occurs, and no
credential is printed in any output.

## Required Evidence

### Evidence 1: No-Upload Diagnostic Run

Run the provider readiness diagnostic in isolation (no network). Verify:
- `uploadEnabled: false`
- `executionEnabled: false`
- No HTTP request was made to any provider endpoint.

Expected: `reasonCode: "provider_ready_redacted"`, no network calls.

### Evidence 2: Credential Redaction Check

Run the diagnostic with various credential formats and verify the output is always safe:

| Credential Format | Expected |
|---|---|
| `sk-1234567890abcdef` | never appears in output |
| `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` | never appears in output |
| `api_key=super-secret-key` | never appears in output |
| `cookie: session=abc123` | never appears in output |

### Evidence 3: Consent Disclosure Visibility

Manual UI test:
1. Open Desktop Manager → Provider Settings.
2. Select a named provider.
3. Verify all 4 disclosure categories are visible: cost, privacy, retention, license.
4. Verify no provider execution occurs when "Review" is clicked.

### Evidence 4: Reason Code Completeness

| Input State | Expected reasonCode |
|-------------|---------------------|
| No provider selected | `provider_not_selected` |
| Provider selected, no credential | `provider_credential_missing` |
| Provider selected, credential exists, no consent | `provider_consent_required` |
| Consent given, terms not reviewed | `provider_terms_unreviewed` |
| All gates pass (V8.1) | `provider_ready_redacted` |
| Build with upload disabled | `provider_upload_disabled` |
| Build with execution disabled | `provider_execution_disabled` |

### Evidence 5: Local .env Credential Detection

Test that the diagnostic correctly detects credential presence in `.env`
without reading the actual value.

Expected: `credentialState: "configured"`, no actual secret in output.

### Evidence 6: Forbidden Content Scan

Run all V8.1 diagnostic outputs through a forbidden content scanner:

```bash
grep -rE "(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|/Users/|/private/|/Volumes/|workspace|config.*path|api-token\.json|raw.*payload|raw.*response)" \
  docs/V8.x/evidence/v8_1-*.md || echo "PASS: no forbidden content"
```

### Evidence 7: V7 Regression Baseline

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
node scripts/v7_15_advanced_productization_gate_smoke.mjs
```

### Evidence 8: PRD Conformance Check

| PRD Requirement | V8.1 Implementation | Status |
|-----------------|---------------------|--------|
| no upload without explicit consent | `uploadEnabled: false` in V8.1 | ✅ |
| no raw photo persistence | no photo handling in V8.1 | ✅ |
| no EXIF/GPS persistence | no photo handling in V8.1 | ✅ |
| no full local path in evidence | all paths redacted | ✅ |
| no provider credential in manifest/logs | credentialState only, never value | ✅ |
| no raw provider response | no provider calls in V8.1 | ✅ |
| consent decision recorded | `consentFlowComplete` in dry run result | ✅ |
| stable reason codes | 7 defined reason codes | ✅ |

## Phase Gate

V8.1 passes when:
1. All 8 evidence items above are collected and pass.
2. No forbidden content appears in any V8.1 output.
3. V7 regression baseline remains passing.
4. V8.0 scope freeze remains intact (no automatic photo-to-3D claim).
5. V8.1 final acceptance report is written.

V8.1 is blocked if:
- Any network call is observed during the no-upload test.
- Any credential value appears in any output.
- Any reason code cannot be triggered with its expected input state.
- V7 regression fails.
