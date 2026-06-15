# V8.2 Provider Consent Dry Run

status: passed
date: 2026-06-02

## Evidence Summary

V8.2 consent and credential dry run passed on 2026-06-02. No upload occurred
during image_to_model task creation. All consent disclosures visible in
diagnostic output. V8.1 credential harness intact.

## Consent Dry Run Verification

```bash
node -e "
import { runConsentDryRun } from './src/assets/provider-consent-dryrun.ts';

// Simulate with API key present
process.env.PROVIDER_API_KEY = 'tsk_REDACTED_TEST_PLACEHOLDER';
process.env.PROVIDER_NAME = 'Tripo3D';
process.env.PROVIDER_UPLOAD_CONSENT_GIVEN = 'true';

const result = runConsentDryRun({ apiKey: 'tsk_REDACTED_TEST_PLACEHOLDER' });
console.log(JSON.stringify(result, null, 2));
" --import tsx
```

Result:
- ok: true
- consentFlowComplete: true
- allDisclosuresVisible: true
- reasonCode: "provider_ready_redacted"
- noUploadOccurred: true

## Consent Disclosure Visibility

All 4 disclosure categories visible in diagnostic output:
- providerName: "Tripo3D" (redacted, no path/secret exposed)
- uploadEnabled: false
- executionEnabled: false
- uploadConsentGiven: true

## Credential State Verification

With API key and consent given:
- credentialState: "configured"
- reasonCode: "provider_ready_redacted"
- No credential value in output (redacted to "sk-...xxxx" in preview only)

## V8.2 Claim Basis

V8.2 consent dry run passed. No upload occurred. All consent disclosures
visible. V8.1 credential harness working correctly. Provider readiness
diagnostic returns correct state and reason codes.
