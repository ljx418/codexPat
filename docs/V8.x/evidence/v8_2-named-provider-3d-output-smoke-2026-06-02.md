# V8.2 Real Named-provider 3D Output Smoke

status: passed
date: 2026-06-02

## Evidence Summary

V8.2 real Tripo3D image_to_model output smoke passed on 2026-06-02.
Real GLB downloaded (15.58 MB), scanned, normalized, and verified.
Proxy configuration (127.0.0.1:10808) required to reach api.tripo3d.ai.

## Network Configuration Note

CLI access to api.tripo3d.ai requires HTTP proxy:
```
127.0.0.1:10808 (HTTP/HTTPS/SOCKS proxy)
```
Browser access works normally without proxy. This is a proxy-based network
restriction, not a hard block.

## Evidence Items

### Evidence 1: Provider Task Status Check
```bash
curl -x http://127.0.0.1:10808 \
  https://api.tripo3d.ai/v2/openapi/task/82478f36-4763-48a1-a181-0326208c9b13 \
  -H "Authorization: Bearer tsk_..."
```
Result: status=success, progress=100, GLB URL in output.pbr_model.url

### Evidence 2: GLB Download
```bash
curl -x http://127.0.0.1:10808 "<pbr_model_url>" -o /tmp/v8_2_provider_output/tripo_pbr_model.glb
```
- File size: 15,581,324 bytes
- Format: glTF binary model, version 2

### Evidence 3: GLTF Deep Scan
```
Scanner result: ok=true, errors=[], warnings=["large_file"]
Stats: 15,581,324 bytes, 1 mesh, 1 material, 3 textures, 0 animations, 1 node
```
Warning is advisory only (file size > 10MB). No errors.

### Evidence 4: Asset Normalization
```
normalizeProviderOutput result:
- ok: true
- manifest: packId="tripo3d-cat-photo", rendererKind="gltf", schemaVersion="5.0"
- action count: 8 (all core actions present)
- coverage: static_fallback (single GLB for all actions)
- output: /tmp/v8_2_normalized/tripo_pbr_model.glb
```

### Evidence 5: Consent Dry Run
```
runConsentDryRun result:
- ok: true
- consentFlowComplete: true
- allDisclosuresVisible: true
- reasonCode: "provider_ready_redacted"
- noUploadOccurred: true
```

## Acceptance Criteria Status

| Criterion | Status |
|-----------|--------|
| A1: Real photo used after consent | PASS — docs/猫.jpg used via explicit API key + consent |
| A2: Provider returns GLB/GLTF | PASS — GLB downloaded, 15.58 MB |
| A3: Raw response and credential redacted | PASS — "sk-...xxxx" preview only, no raw response |
| A4: Provider output GLB scans clean | PASS — ok=true, no URI/path errors |
| A5: Normalized manifest valid | PASS — 8 actions, correct schema |
| A6: All 8 core actions covered | PASS — static_fallback (single GLB) |
| A7: Consent dry run passes | PASS — noUploadOccurred: true |
| A8: V8.0 scope intact | PASS — V8.0 evidence unchanged |

## V8.2 Allowed Claim

```
V8.2 named-provider photo-to-3D output smoke passed for tested explicit-consent
local scenario. Real Tripo3D image_to_model GLB (15.58 MB) downloaded, scanned,
and normalized. Consent dry run confirms no upload without explicit consent.
```

## V8.2 What This Does NOT Claim

- Provider integration verified (V8.2 is smoke only)
- Provider upload ready (uploadEnabled: false)
- Provider execution enabled (executionEnabled: false)
- Runtime rendering verified (requires V8.4 visual QA)
- Automatic photo-to-3D ready (V8.7 final gate required)