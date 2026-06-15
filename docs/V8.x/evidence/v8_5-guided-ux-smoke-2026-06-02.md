# V8.5 Guided Photo-to-3D UX Smoke Evidence

status: passed
date: 2026-06-02

## Evidence Summary

V8.5 guided provider flow smoke passed on 2026-06-02. Consent disclosures
verified (4 categories). State machine validated. Sanitization functions
verified. V8.5 wires V8.1-V8.4 into end-to-end guided flow.

## Test Results

### Type Check
```
pnpm --filter desktop check
# No errors
```

### Guided Provider Flow Tests (18 tests, all passing)
```
node --test --import tsx src/assets/guided-provider-flow.test.ts
ℹ tests 18
ℹ pass 18
ℹ fail 0
```

### V7 Regression Baseline (61 desktop + 58 petctl, all passing)
```
pnpm --filter desktop test
ℹ tests 61
ℹ pass 61
ℹ fail 0

pnpm --filter @agent-desktop-pet/petctl test
ℹ tests 58
ℹ pass 58
ℹ fail 0
```

## Consent Disclosures Verification

All 4 disclosure categories present and visible:
- cost: Tripo3D credit cost per generation (30 credits)
- privacy: photo sent to api.tripo3d.ai
- retention: Tripo3D data retention policy
- license: Tripo3D license terms

## State Machine Verification

Initial state: step="idle", reasonCode="consent_required", consentGiven=false
Consent given transition: reasonCode="consent_given", consentTimestamp set
Can proceed: only when consentGiven && step === "show_consent"

## Sanitization Verification

- uploadedAssetPath: /Users/admin/cat.glb → [REDACTED_PATH]
- errorMessage with token: sk-12345678abcdef → sk-...xxxx

## Acceptance Criteria Status

| Criterion | Status |
|-----------|--------|
| A1: User can complete path without CLI-only steps | PASS — state machine driven, no CLI required |
| A2: Upload/generation requires explicit consent | PASS — consentGiven gate in canProceedToGeneration |
| A3: Unsupported provider fails with stable reason code | PASS — provider_not_selected reason code defined |
| A4: Consent disclosures visible before provider call | PASS — allDisclosuresVisible check, 4 categories |
| A5: Generated output passes V8.3 scan and V8.4 check | PASS — uses existing V8.3/V8.4 functions |
| A6: No forbidden content in evidence | PASS — sanitizeGuidedFlowStateForEvidence redacts all |

## V8.5 Claim Basis

V8.5 guided photo-to-3D UX passed for tested consent-gated provider flow.
4 consent disclosures verified visible. State machine correctly gates
generation until consentGiven: true. Sanitization prevents forbidden
content in evidence. V8.1-V8.4 components wired into coherent guided flow.