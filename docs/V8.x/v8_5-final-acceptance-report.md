# V8.5 Final Acceptance Report

status: accepted
date: 2026-06-02

## Phase Summary

V8.5 guided photo-to-3D UX passed smoke on 2026-06-02. Guided provider flow
wires V8.1-V8.4 components into end-to-end consent-gated workflow.
18 tests passing. All regression tests passing.

## Acceptance Evidence

- `docs/V8.x/evidence/v8_5-guided-ux-smoke-2026-06-02.md`
- `apps/desktop/src/assets/guided-provider-flow.ts` (new)
- `apps/desktop/src/assets/guided-provider-flow.test.ts` (new, 18 tests)

## V8.5 Allowed Claim

```
V8.5 guided photo-to-3D activation UX passed for tested explicit-consent
provider workflow scenario.
```

## Acceptance Gate Status

All 6 acceptance criteria passed:
- A1: No CLI-only steps ✅
- A2: Explicit consent required ✅
- A3: Stable reason codes ✅
- A4: All disclosures visible ✅
- A5: Output passes V8.3/V8.4 ✅
- A6: No forbidden content ✅

V7 regression baseline: 61 tests pass. petctl regression: 58 tests pass.