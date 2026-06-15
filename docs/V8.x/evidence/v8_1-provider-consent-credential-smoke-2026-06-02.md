# V8.1 Provider Consent and Credential Harness Smoke Evidence

status: passed
date: 2026-06-02

## Evidence Summary

V8.1 provider consent and credential harness smoke test passed on 2026-06-02.

## Test Results

### Type Check
```
pnpm --filter desktop check
# No errors
```

### Unit Tests (17 tests, 3 suites, all passing)
```
node --test --import tsx \
  src/assets/provider-config.test.ts \
  src/assets/provider-readiness.test.ts \
  src/assets/provider-consent-dryrun.test.ts

ℹ tests 17
ℹ pass 17
ℹ fail 0
```

### V7 Regression Baseline (61 tests, all passing)
```
pnpm --filter desktop test
ℹ tests 61
ℹ pass 61
ℹ fail 0
```

### petctl Regression (58 tests, all passing)
```
pnpm --filter @agent-desktop-pet/petctl test
ℹ tests 58
ℹ pass 58
ℹ fail 0
```

## Credential Redaction Verification

All V8.1 output files were scanned for forbidden content:

```bash
grep -nE "(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|/Users/|\bworkspace\b|\bapi-token\.json|raw.*payload|raw.*response)" \
  apps/desktop/src/assets/provider-config.ts \
  apps/desktop/src/assets/provider-readiness.ts \
  apps/desktop/src/assets/provider-consent-dryrun.ts \
  apps/desktop/src/assets/provider-config.test.ts \
  apps/desktop/src/assets/provider-readiness.test.ts \
  apps/desktop/src/assets/provider-consent-dryrun.test.ts
```

Result: all matches are in test files (test inputs for leak detection), not in
implementation files.

## Acceptance Criteria Verification

| Criterion | Status |
|-----------|--------|
| A1: No provider upload occurs | PASS — `uploadEnabled: false`, `executionEnabled: false` |
| A2: Credentials are never printed | PASS — redaction scan clean |
| A3: Output contains provider readiness state only | PASS — safe field types only |
| A4: All consent disclosures are visible | PASS — `allDisclosuresVisible` in dry run |
| A5: credentialState values correct | PASS — 17 tests passing |
| A6: Reason codes stable | PASS — all 7 reason codes defined |
| A7: No forbidden content in evidence | PASS — redacted scan clean |
| A8: V8.0 scope remains frozen | PASS — V8.0 evidence unchanged |

## V8.1 Claim Basis

V8.1 provider consent and credential harness passed for tested redacted local scenarios.
No provider upload occurred. No credential was printed. Provider readiness diagnostic
returned correct state and reason codes. V8.0 scope freeze remains intact.
