# V8.5 Acceptance Plan

status: in-progress
date: 2026-06-02

## Acceptance Principle

V8.5 acceptance is evidence-based. V8.5 passes only when guided flow
completes end-to-end with real data, all consent disclosures visible,
stable reason codes, and no forbidden content.

## Required Evidence

### Evidence 1: Consent Disclosures Visibility

Run consent dry run and verify all 4 disclosure categories visible:
- cost: Tripo3D credit cost per generation
- privacy: data sent to provider
- retention: how long provider keeps output
- license: ownership of generated output

Expected: `allDisclosuresVisible: true` when consent given.

### Evidence 2: Provider Call Blocked Until Consent

Simulate consent not given → provider call returns `consent_required` reason.

Expected: `reasonCode: "provider_consent_required"` until consentGiven: true.

### Evidence 3: Provider Generation End-to-End

Run full provider generation flow with V8.2 real GLB.

| Step | Expected |
|------|----------|
| Consent given | consentFlowComplete: true |
| GLB downloaded | File exists, size > 10MB |
| GLB scanned | scanGLTFBuffer result ok: true |
| GLB normalized | normalizeProviderOutput result ok: true |
| Pack activated | pack_id returned, non-empty |

### Evidence 4: Unsupported Provider Path Fails Cleanly

Use unsupported provider name → stable `provider_not_selected` reason code.

Expected: reasonCode is stable (not "unknown_error" or similar).

### Evidence 5: Forbidden Content Scan

```bash
grep -rE "(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|/Users/|/private/|/tmp/|api-token\.json|raw.*payload|raw.*response)" \
  apps/desktop/src/assets/guided-provider-flow.ts \
  apps/desktop/src/assets/provider-consent-ui.ts \
  docs/V8.x/evidence/v8_5-*.md || echo "PASS"
```

### Evidence 6: V7 Regression Baseline

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
```

## Phase Gate

V8.5 passes when:
1. Evidence 1-4 pass end-to-end with real provider output.
2. Evidence 5 shows no forbidden content.
3. Evidence 6 regression baseline remains passing.
4. V8.5 final acceptance report is written.

V8.5 is blocked if:
- Consent disclosures not all visible.
- Provider call succeeds without consent.
- Generated GLB fails V8.3 scan.
- Evidence contains forbidden content.
- V7 regression fails.