# V29 Final Acceptance Report

status: blocked
date: 2026-06-17
commit: 9f94bc4

## Scope

V29 targets Petdex-level local gallery UX plus a stable photo-to-animated-2D
benchmark over diverse local cat photos.

## Final Decision

V29 final gate is blocked for the stronger real-user photo benchmark claim because V29.2 relies on host-imag2 synthetic samples.

V29.0, V29.1, V29.3, V29.4, and V29.5 have scoped evidence. V29.2 discovered
3 real local cat samples and 9 host-imag2 synthetic samples. This is enough for
mixed engineering coverage, but not enough for the stronger real-user benchmark
claim. Therefore V29 must not claim stable arbitrary real-user
photo-to-animated-2D readiness.

## Evidence Gate

| Phase | Evidence | Status |
| --- | --- | --- |
| V29.0 | docs/V29.x/evidence/v29_0-scope-freeze-2026-06-16.md | passed |
| V29.1 | docs/V29.x/evidence/v29_1-gallery-ux-smoke-2026-06-16.md | passed |
| V29.2 | docs/V29.x/evidence/v29_2-photo-benchmark-smoke-2026-06-16.md | passed |
| V29.3 | docs/V29.x/evidence/v29_3-quality-gate-v2-smoke-2026-06-16.md | passed |
| V29.4 | docs/V29.x/evidence/v29_4-productized-wizard-smoke-2026-06-16.md | passed |
| V29.5 | docs/V29.x/evidence/v29_5-asset-polish-smoke-2026-06-16.md | passed |

## Regression

| Check | Result | Summary |
| --- | --- | --- |
| desktop check | passed | pnpm --filter desktop check passed |
| desktop test | passed | pnpm --filter desktop test passed |
| petctl test | passed | pnpm --filter @agent-desktop-pet/petctl test passed |
| git diff --check | passed | git diff --check passed |

## Security Scan

Result: passed

Evidence summaries do not include token, Authorization, raw provider response,
raw HTTP payload, raw photo bytes, EXIF/GPS, full local path, workspace path,
config path, api-token.json, prompt private text, or shell command.

## Claim Scan

Result: passed

Allowed blocked claim:

```text
V29 stable real-user photo-to-animated-2D workflow remains blocked because the diverse 12-sample benchmark relies on host-imag2 synthetic samples.
```

No V29 passed claim is made.

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for all arbitrary cats；
- automatic photo-to-animation ready for all arbitrary cats；
- provider integration verified；
- low-retry provider reliability for arbitrary cats；
- Petdex parity achieved beyond tested standards；
- Petdex asset reuse authorization；
- 3D ready；
- automatic photo-to-3D ready；
- production signed release ready；
- Windows ready；
- cross-platform ready。

## Remaining Blocker

V29.2 now has 12 total samples and an accepted-candidate rate above threshold,
but only 3 are real local docs cat photos and 9 are host-imag2 synthetic samples.
This supports engineering coverage only, not arbitrary real-user reliability.

```text
docs/猫.jpg
docs/猫_1.jpg
docs/猫_2.jpg
```

Synthetic host-imag2 samples are under:

```text
docs/V29.x/benchmark-samples/host-imag2/
```
