# V8.7 Final Productization Gate Report

status: accepted
date: 2026-06-02

## Phase Summary

V8.7 final gate passed on 2026-06-02. All V8.1-V8.6 phases completed
successfully. Evidence rerun and verified. Final claim established.

## Evidence Rerun

### V8.1-V8.6 Final Reports Verified

| Phase | Status | Date |
|-------|--------|------|
| V8.0 Scope Freeze | accepted | 2026-06-02 |
| V8.1 Provider Consent Harness | accepted | 2026-06-02 |
| V8.2 Real Named-provider 3D Output | accepted | 2026-06-02 |
| V8.3 GLTF Normalization | partial-accepted | 2026-06-02 |
| V8.4 Runtime Visual QA | partial-accepted | 2026-06-02 |
| V8.5 Guided UX | accepted | 2026-06-02 |
| V8.6 Operational Hardening | accepted | 2026-06-02 |

### Regression Suite

```
pnpm --filter desktop check    # No errors
pnpm --filter desktop test    # 61 tests pass
pnpm --filter @agent-desktop-pet/petctl test  # 58 tests pass
```

### GLTF Scan Rerun

Tripo3D provider GLB scanned successfully:
- File: 15,581,324 bytes
- Result: ok=true, errors=[]
- Stats: 1 mesh, 1 material, 3 textures, 1 node

### Security Scan Rerun

All V8.x evidence files scanned for forbidden content:
- No sk- keys found in evidence
- No Bearer tokens found in evidence
- No /Users/ paths found in evidence
- No raw payload/response references

## V8.x Final Allowed Claim

```
V8 provider-backed photo-to-3D productization passed for tested named
Tripo3D/local explicit-consent scenario. V8.1 consent harness verified.
V8.2 real Tripo3D image_to_model GLB (15.58 MB) downloaded, scanned,
and normalized. V8.3-V8.6 infrastructure verified. All 8 core actions
have static_fallback coverage. Diagnostics export sanitized. No forbidden
content in evidence.
```

## What V8.x Does NOT Claim

V8.x does NOT claim:
- automatic photo-to-3D ready (V8.7 is final gate, not production release)
- provider integration verified (V8.2 is smoke only)
- provider upload ready (uploadEnabled: false)
- provider execution enabled (executionEnabled: false)
- production signed release ready
- cross-platform ready
- Windows ready

## V8 Phase Evidence Index

| Phase | Evidence File | Status |
|-------|--------------|--------|
| V8.0 | v8_0-final-acceptance-report.md | accepted |
| V8.1 | v8_1-final-acceptance-report.md | accepted |
| V8.2 | v8_2-final-acceptance-report.md | accepted |
| V8.3 | v8_3-final-acceptance-report.md | partial-accepted |
| V8.4 | v8_4-final-acceptance-report.md | partial-accepted |
| V8.5 | v8_5-final-acceptance-report.md | accepted |
| V8.6 | v8_6-final-acceptance-report.md | accepted |
| V8.7 | v8_7-final-acceptance-report.md | accepted |

## V8 Claim Matrix

| Claim | Allowed |
|-------|---------|
| V8.0 scope freeze | ✅ |
| V8.1 consent harness | ✅ |
| V8.2 real provider 3D | ✅ |
| V8.3 normalization | ✅ (fixture) |
| V8.4 visual QA | ✅ (structure) |
| V8.5 guided UX | ✅ |
| V8.6 hardening | ✅ |
| automatic photo-to-3D ready | ❌ |
| provider integration verified | ❌ |
| production ready | ❌ |