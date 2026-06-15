# V22.7 Final Acceptance Report

status: passed
date: 2026-06-15
commit: dd66a441
scope: Asset Quality Review & Rejection Gate

## Decision

V22 asset quality review gate passed for tested local candidate asset generation, rejection, retry guidance, approval, target apply, and rollback scenarios.

## Evidence

| Phase | Evidence | Result |
| --- | --- | --- |
| V22.0 | `docs/V22.x/evidence/v22_0-scope-freeze-2026-06-15.md` | passed |
| V22.1 | `docs/V22.x/evidence/v22_1-quality-schema-smoke-2026-06-15.md` | passed |
| V22.2 | `docs/V22.x/evidence/v22_2-technical-qa-smoke-2026-06-15.md` | passed |
| V22.3 | `docs/V22.x/evidence/v22_3-motion-qa-smoke-2026-06-15.md` | passed |
| V22.4 | `docs/V22.x/evidence/v22_4-visual-review-ux-smoke-2026-06-15.md` | passed |
| V22.5 | `docs/V22.x/evidence/v22_5-retry-route-guidance-smoke-2026-06-15.md` | passed |
| V22.6 | `docs/V22.x/evidence/v22_6-apply-enforcement-smoke-2026-06-15.md` | passed |
| V22.7 regression | `docs/V22.x/evidence/v22_7-regression-checks-2026-06-15.md` | passed |
| V22.7 dashboard | `docs/V22.x/evidence/v22_7-quality-review-dashboard-2026-06-15.html` | passed |

## Accepted Example

V21 Route A key-pose pack is used as the approved baseline candidate:

- candidateId: v21-route-a-keypose-orange-tabby
- packId: v21-route-a-keypose-orange-tabby
- status: approved
- apply result: applied

## Rejected Examples

| Candidate | Status | ReasonCodes |
| --- | --- | --- |
| v21-premium-pixel-failed | visual_rejected | cat_not_cute_enough, style_inconsistent |
| v22-technical-failed-fixture | technical_failed | blank_frame_detected, transparent_frame_detected, off_canvas_frame_detected, background_not_removed, missing_core_action, loop_closure_failed |
| v22-motion-failed-fixture | motion_failed | motion_amplitude_too_low, frame_delta_too_large, identity_drift_detected |

## Apply Enforcement

- visual rejected apply: blocked
- unreviewed apply: blocked
- approved apply: applied
- default pet unchanged: true
- unrelated pets unchanged: true
- rollback available: true

## Regression

Runtime regression commands are recorded in:

```text
docs/V22.x/evidence/v22_7-regression-checks-2026-06-15.md
```

| Check | Result |
| --- | --- |
| `pnpm --filter desktop check` | passed |
| `pnpm --filter desktop test` | passed |
| `pnpm --filter @agent-desktop-pet/petctl test` | passed |
| `node scripts/v3_1_runtime_smoke.mjs` | passed |
| `node scripts/v4_4_managed_session_smoke.mjs` | passed |

Runtime smoke suites were run serially. An earlier parallel V4.4 attempt hit
`instance_limit_reached` while V3.1 was intentionally filling the hard limit;
the serial V4.4 re-run passed.

## Security Scan

Passed. Evidence contains no token, Authorization header, raw provider response,
raw HTTP payload, raw photo bytes, EXIF/GPS, private filename, full local path,
workspace path, config path, or api-token.json.

## Claim Scan

Allowed claim:

```text
V22 asset quality review gate passed for tested local candidate asset generation, rejection, retry guidance, approval, target apply, and rollback scenarios.
```

Forbidden claims remain not-ready:

- Petdex parity achieved
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- automatic photo-to-2D ready for arbitrary cats
- 3D ready
- production signed release ready
- Windows ready
- cross-platform ready

## Final Decision

V22 passed for scoped Asset Quality Review & Rejection Gate. The approved-only
apply path is enforced; rejected, unreviewed, technically invalid, or
motion-weak candidates cannot be applied and preserve the previous visible
pack.
