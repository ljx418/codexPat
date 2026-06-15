# V22.7 Regression Checks

status: passed  
date: 2026-06-15  
scope: V22 Asset Quality Review & Rejection Gate regression closure

## Automatic Checks

| Check | Result | Notes |
| --- | --- | --- |
| `pnpm --filter desktop check` | passed | TypeScript check completed with no hard failure. |
| `pnpm --filter desktop test` | passed | 215 tests passed, including V22 asset quality review tests. |
| `pnpm --filter @agent-desktop-pet/petctl test` | passed | 71 tests passed. |
| `node scripts/v3_1_runtime_smoke.mjs` | passed | Desktop health ok; multi-instance runtime smoke passed; cleanup passed. |
| `node scripts/v4_4_managed_session_smoke.mjs` | passed | Re-run serially after V3.1 completed; managed session JSONL state mapping passed. |

## Runtime Scheduling Note

An earlier V4.4 smoke attempt failed with `instance_limit_reached` while
V3.1 runtime smoke was simultaneously filling the instance hard limit. This was
an acceptance scheduling error, not a V4.4 behavior regression. After V3.1
cleanup returned the desktop to one default instance, V4.4 was re-run serially
and passed.

## Security Scan

The recorded V22 regression summary does not include token, Authorization
header, raw provider response, raw HTTP payload, raw photo bytes, EXIF/GPS,
private filename, full local path, workspace path, config path, or
`api-token.json`.

## Claim Scan

Forbidden claims remain only in forbidden / not-ready contexts:

- Petdex parity achieved
- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- automatic photo-to-2D ready for arbitrary cats
- 3D ready
- production signed release ready
- Windows ready
- cross-platform ready

## Decision

V22 regression closure passed. Runtime checks were executed serially to avoid
hard-limit interference between independent smoke suites.
