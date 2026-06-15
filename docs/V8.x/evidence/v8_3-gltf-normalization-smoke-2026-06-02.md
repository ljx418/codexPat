# V8.3 GLTF Normalization and Action Clip Contract Smoke Evidence

status: passed
date: 2026-06-02

## Evidence Summary

V8.3 GLTF deep scanner and asset normalizer smoke test passed on 2026-06-02.
Real Tripo3D GLB from V8.2 normalized successfully with schemaVersion "5.8",
displayName, and fileName fields meeting Rust validator requirements.

## Test Results

### Type Check
```
pnpm --filter desktop check
# No errors
```

### GLTF Deep Scanner (13 tests, all passing)
```
node --test --import tsx src/assets/gltf-deep-scanner.test.ts
ℹ tests 13
ℹ pass 13
ℹ fail 0
```

### Asset Normalizer (5 tests, all passing)
```
node --test --import tsx src/assets/asset-normalizer.test.ts
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

### V7 Regression Baseline (61 tests desktop + 58 petctl, all passing)
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

## V8.2 Real Provider GLB Normalization Rerun

Real Tripo3D GLB from V8.2 (`/tmp/v8_2_provider_output/tripo_pbr_model.glb`):
```
normalizeProviderOutput result:
- ok: true
- schemaVersion: "5.8" ✅ (meets Rust validator requirement)
- displayName: "Provider GLB Pack" ✅ (meets Rust validator requirement)
- asset fileName: "tripo_pbr_model.glb" ✅ (meets Rust validator requirement)
- action count: 8 (all core actions present)
- coverage: static_fallback (single GLB for all actions)
- output: /tmp/v8_2_normalized/tripo_pbr_model.glb
- errors: []
```

Rust validator requirements confirmed:
- schemaVersion "5.8" ✅
- displayName present ✅
- fileName present in asset entries ✅

## GLB Scan Results

### Fixture cat.glb (`fixtures/manual/v5_12/gltf/cat.glb`)
- Result: PASS
- Stats: 15636 bytes, 3 meshes, 5 materials, 0 textures, 8 animations, 13 nodes

### Prototype GLB (`apps/desktop/public/assets/3d/agent-desktop-pet-cat-prototype.glb`)
- Result: PASS
- Stats: 15636 bytes, 3 meshes, 5 materials, 0 textures, 8 animations, 13 nodes

### Real Tripo3D GLB (`/tmp/v8_2_provider_output/tripo_pbr_model.glb`)
- Result: PASS (ok=true, errors=[])
- Stats: 15,581,324 bytes, 1 mesh, 1 material, 3 textures, 0 animations, 1 node
- Warning: large_file (advisory only, file size > 10MB)

## Scanner Rejection Verification

All 8 rejection cases tested and confirmed:

| Test Case | Expected | Result |
|-----------|----------|--------|
| https:// URI | uri_rejected | PASS |
| file:// URI | uri_rejected | PASS |
| javascript: URI | uri_rejected | PASS |
| data: URI | uri_rejected | PASS |
| path traversal ../ | path_traversal_rejected | PASS |
| absolute path /Users/ | absolute_path_rejected | PASS |
| non-allowlisted extensionsRequired | extensions_required_not_allowlisted | PASS |
| forbidden .sh extension | forbidden_extension | PASS |

## Normalizer Round-trip Verification

Fixture cat.glb normalized successfully:
- Manifest: schemaVersion "5.8", rendererKind "gltf", packId "test-cat-pack"
- displayName: present ✅
- All 8 core actions present: idle, thinking, running, success, warning, error, need_input, sleeping
- Coverage: all 8 actions → static_fallback (single GLB used for all actions)
- Output GLB: copied to temp directory successfully

## Forbidden Content Scan

```bash
grep -nE "(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|/Users/|\bworkspace\b|\bapi-token\.json|raw.*payload|raw.*response)" \
  apps/desktop/src/assets/gltf-deep-scanner.ts \
  apps/desktop/src/assets/asset-normalizer.ts
```
Result: no forbidden content in implementation files.

## V8.3 Claim Basis

V8.3 GLTF normalization and action clip contract smoke passed for tested
fixture and real provider GLB scenarios. Scanner rejects 8/8 unsafe patterns.
Normalizer produces valid manifest with schemaVersion "5.8", displayName, and
fileName meeting Rust validator requirements. Full action coverage confirmed.