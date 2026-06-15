# V8.3 Acceptance Plan

status: in-progress
date: 2026-06-02

## Acceptance Principle

V8.3 acceptance is evidence-based. V8.3 passes only when GLTF deep scan,
normalization, and action clip coverage are verified with real or fixture
provider output, and no forbidden content appears in evidence.

Full acceptance requires V8.2 real provider output. Offline acceptance uses
fixture GLB files.

## Acceptance Criteria

A1: Scanner rejects unsafe URI/path/extension/complexity
A2: Normalized output imports into app-managed storage
A3: All 8 core actions have clip or explicit fallback coverage
A4: Invalid output preserves previous active pack
A5: No forbidden content in evidence
A6: Scanner runnable against fixture GLB files
A7: Scanner runnable against V8.2 real provider output (blocked on V8.2)

## Evidence Items

### Evidence 1: GLTF Deep Scanner — Fixture Scan

Run scanner against fixture GLB files:
- `fixtures/manual/v5_12/gltf/cat.glb`
- `apps/desktop/public/assets/3d/agent-desktop-pet-cat-prototype.glb`

Expected: clean pass, stats captured.

### Evidence 2: GLTF Deep Scanner — Rejection Cases

Run scanner against crafted GLB with:
- `https://` URI → reject
- `file://` URI → reject
- `javascript:` URI → reject
- `data:` URI → reject
- path traversal (`../`) → reject
- absolute path (`/Users/...`) → reject
- non-allowlisted `extensionsRequired` → reject
- forbidden extension (`.sh`) → reject

Expected: all 8 reject cases produce correct error codes.

### Evidence 3: Asset Normalizer — Round-trip

Normalize fixture GLB → verify manifest structure → verify coverage table.

Expected: manifest valid, all 8 actions covered, output GLB in place.

### Evidence 4: Action Coverage Table — Blocked Actions

Create blocked coverage table → verify validateCoverageTable detects blocked actions.

Expected: blockedActions list contains all blocked action IDs.

### Evidence 5: Forbidden Content Scan

Scan all V8.3 evidence files for forbidden content:
```
grep -rE "(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|/Users/|/private/|/Volumes/|workspace|api-token\.json|raw.*payload|raw.*response)" \
  docs/V8.x/evidence/v8_3-*.md \
  apps/desktop/src/assets/gltf-deep-scanner.ts \
  apps/desktop/src/assets/asset-normalizer.ts || echo "PASS"
```

### Evidence 6: V7 Regression Baseline

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
```

### Evidence 7: V8.2 Real Provider Output (blocked)

V8.3 full acceptance requires V8.2 real provider GLB output. Once V8.2
unblocks, re-run Evidence 1-3 with real provider output.

## Phase Gate

V8.3 passes when:
1. Evidence 1-5 pass offline (fixture GLB).
2. Evidence 6 regression baseline remains passing.
3. V8.2 unblocks and Evidence 7 runs with real provider output.
4. V8.3 final acceptance report is written.

V8.3 is blocked if:
- Any evidence shows forbidden content.
- Scanner accepts a GLB with external URIs.
- V7 regression fails.
