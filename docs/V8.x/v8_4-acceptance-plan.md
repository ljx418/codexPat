# V8.4 Acceptance Plan

status: in-progress
date: 2026-06-02

## Acceptance Principle

V8.4 acceptance is evidence-based. V8.4 passes only when provider-output GLB
pack is verified at runtime with screenshots, all 8 core actions visually
represented, and no forbidden content in evidence.

## Required Evidence

### Evidence 1: Provider GLB Import

Import the V8.2 Tripo3D GLB into app storage via Tauri backend.

Expected: pack_id created, manifest valid, 8 actions mapped.

### Evidence 2: Runtime Visual QA — All 8 Actions

Run visual QA harness against imported pack.

| Action | Visual Check | Reason Code |
|--------|-------------|-------------|
| idle | nonblank + bounded | qa_pass |
| thinking | nonblank + bounded | qa_pass |
| running | nonblank + bounded | qa_pass |
| success | nonblank + bounded | qa_pass |
| warning | nonblank + bounded | qa_pass |
| error | nonblank + bounded | qa_pass |
| need_input | nonblank + bounded | qa_pass |
| sleeping | nonblank + bounded | qa_pass |

### Evidence 3: Scale Check (1x and 0.75x)

Verify GLB renders at 1x scale and 0.75x scale without going off-canvas.

Expected: model stays within bounding box at both scales.

### Evidence 4: Fallback on Corrupt Pack

Delete imported pack → verify CSS fallback cat renders.

Expected: safe cat visible, no blank screen.

### Evidence 5: Forbidden Content Scan

Run evidence through forbidden content scanner.

```bash
grep -rE "(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,}|/Users/|/private/|/tmp/|api-token\.json|raw.*payload|raw.*response)" \
  docs/V8.x/evidence/v8_4-*.md \
  apps/desktop/src/assets/visual-qa*.ts \
  apps/desktop/src-tauri/src/asset_import.rs || echo "PASS"
```

### Evidence 6: V7 Regression Baseline

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
```

## Phase Gate

V8.4 passes when:
1. Evidence 1-4 pass with real provider output.
2. Evidence 5 shows no forbidden content.
3. Evidence 6 regression baseline remains passing.
4. V8.4 final acceptance report is written.

V8.4 is blocked if:
- Any action shows blank/empty canvas.
- Model goes off-canvas at any scale.
- Evidence contains forbidden content.
- V7 regression fails.