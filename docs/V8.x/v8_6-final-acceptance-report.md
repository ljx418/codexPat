# V8.6 Final Acceptance Report

status: accepted
date: 2026-06-02

## Phase Summary

V8.6 operational hardening passed smoke on 2026-06-02. Diagnostics export,
deletion flow, license export, and security scan harness all verified.
13 tests passing. All regression tests passing.

## Acceptance Evidence

- `docs/V8.x/evidence/v8_6-operational-hardening-smoke-2026-06-02.md`
- `apps/desktop/src/assets/diagnostics-export.ts` (new)
- `apps/desktop/src/assets/diagnostics-export.test.ts` (new, 13 tests)

## V8.6 Allowed Claim

```
V8.6 operational hardening passed for tested diagnostics export, deletion
flow, license export, and security scan scenarios.
```

## Acceptance Gate Status

All 5 acceptance criteria passed:
- A1: Diagnostics export no forbidden content ✅
- A2: Deletion safe event recorded ✅
- A3: Retention documented ✅
- A4: License export sanitized ✅
- A5: Security scan detects forbidden content ✅

V7 regression baseline: 61 tests pass. petctl regression: 58 tests pass.