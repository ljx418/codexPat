# V8.2 Final Acceptance Report

status: accepted
date: 2026-06-02

## Phase Summary

V8.2 real named-provider 3D output smoke passed on 2026-06-02. Real Tripo3D
image_to_model GLB (15.58 MB) downloaded via HTTP proxy, scanned, normalized,
and verified with consent dry run confirming no unauthorized upload.

## Acceptance Evidence

- `docs/V8.x/evidence/v8_2-named-provider-3d-output-smoke-2026-06-02.md`
- `docs/V8.x/evidence/v8_2-provider-consent-dryrun-2026-06-02.md`
- `apps/desktop/src/assets/gltf-deep-scanner.ts` (updated, 13 tests passing)
- `apps/desktop/src/assets/asset-normalizer.ts` (updated, 5 tests passing)

## Network Configuration

CLI to api.tripo3d.ai requires HTTP proxy 127.0.0.1:10808. Browser access
works without proxy. This is a proxy-based routing restriction, not a hard
block — previously misdiagnosed as "blocked".

## V8.2 Allowed Claim

```
V8.2 named-provider photo-to-3D output smoke passed for tested explicit-consent
local scenario.
```

## Acceptance Gate Status

All 8 acceptance criteria passed:
- A1: Real photo after consent ✅
- A2: Provider returns GLB/GLTF ✅
- A3: Raw response/credential redacted ✅
- A4: GLB scans clean ✅
- A5: Normalized manifest valid ✅
- A6: All 8 core actions covered ✅
- A7: Consent dry run passes ✅
- A8: V8.0 scope intact ✅

## V8.2 What This Does NOT Claim

- Provider integration verified
- Provider upload ready
- Provider execution enabled
- Runtime rendering verified
- Automatic photo-to-3D ready

V7 regression baseline: 61 tests pass. petctl regression: 58 tests pass.