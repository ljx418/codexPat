# V34.8 Command Results

Date: 2026-06-25
overallStatus: passed

## Commands
### pnpm --filter desktop test
- exitCode: 0
- signal: none
- summary:
```text
    # Subtest: success transient cannot override error or need_input
    ok 4 - success transient cannot override error or need_input
ok 58 - V10.8 runtime micro-interaction controller
    ok 1 - observes at least four distinct idle behaviors in three minutes
    ok 2 - does not repeat the same living idle action more than twice in a row
    ok 3 - enters nap after long idle and wakes on pointer near
    ok 4 - priority and active interaction states block living idle
    ok 5 - sleeping base state can wake on pointer near
ok 59 - V11.1 living idle scheduler
    ok 1 - supports pointer near and pointer leave without mutating agent state
    ok 2 - supports hover dwell feedback without state mutation
    ok 3 - distinguishes drag start, dragging, release, and land feedback
    ok 4 - drag cancels click and urgent states block pointer interactions
    ok 5 - autonomous walk is bounded to priority-safe visual states
ok 60 - V11.2 pointer-aware interaction controller
    ok 1 - freezes the V15 priority order and required safe actions
    ok 2 - urgent states block pointer, click, drag, and idle random
    ok 3 - drag blocks lower-priority pointer, click, and idle random
    ok 4 - safe renderer input contains only audited fields and maps V15 actions
ok 61 - V15.1 priority-safe interaction model rebaseline
    ok 1 - maps core CatState values to safe action ids
    ok 2 - falls missing optional action back to idle with sanitized warning
    ok 3 - uses V11 optional micro-interaction action when the active manifest supports it
    # Subtest: does not let transient success overwrite active error
    ok 4 - does not let transient success overwrite active error
    ok 5 - does not let transient success overwrite active need_input
ok 62 - V5.0 cat action resolver
    ok 1 - maps all core states to distinct emotion profiles without state mutation
    ok 2 - produces safe renderer input fields only
ok 63 - V11.3 emotion resolver
    # Subtest: holds error and need_input above lower-priority visual actions
    ok 1 - holds error and need_input above lower-priority visual actions
    ok 2 - treats success and click feedback as transients
    ok 3 - applies higher-priority interrupts and stable rapid-event final states
    ok 4 - maps pointer and drag micro-interactions to safe action fallbacks
    ok 5 - keeps working states clear when lower-priority ambience is active
ok 64 - V11.4 action composer
# tests 311
# suites 64
# fail 0
```

### pnpm --filter desktop check
- exitCode: 0
- signal: none
- summary:
```text
command completed with no notable output
```

### pnpm --filter @agent-desktop-pet/petctl test
- exitCode: 0
- signal: none
- summary:
```text
    ok 1 - previews a sanitized Terminal.app Codex candidate without creating an instance
    ok 2 - confirms a valid candidate and only calls the instance creation endpoint
    ok 3 - rejects expired candidates
    ok 4 - rejects inactive candidates before creating an instance
    ok 5 - routes a manual test event only to the bound instance
    ok 6 - does not route unknown or stale bindings
ok 5 - petctl codex bind
    ok 1 - returns a redacted Terminal.app candidate without leaking tty or paths
    ok 2 - returns permission denied without raw os output
    ok 3 - returns unsupported terminal when focused app does not match
    ok 4 - returns codex process not found for a terminal without codex on tty
    ok 5 - detects Codex when the focused terminal runs the Node packaged CLI
    ok 6 - does not treat unrelated Node processes on the same tty as Codex
    ok 7 - does not treat a local codex.js filename as the OpenAI Codex CLI
    ok 8 - blocks non-macos platforms
ok 6 - petctl codex probe
    # Subtest: reports supported hook diagnostics without leaking sensitive values
    ok 1 - reports supported hook diagnostics without leaking sensitive values
    ok 2 - treats missing instance env and unavailable desktop as warnings
    ok 3 - reports strict managed startup diagnostics with stable reason codes
ok 7 - petctl codex doctor
    ok 1 - returns sanitized managed session status without raw binding id
    ok 2 - marks old managed sessions stale
ok 8 - petctl codex session status
    # Subtest: does not send http when local validation fails
    ok 1 - does not send http when local validation fails
    ok 2 - maps accepted bridge response
    ok 3 - posts to instance endpoint when instance is set
    ok 4 - rejects invalid instance locally
    ok 5 - maps unauthorized response
ok 9 - petctl notify
    ok 1 - attaches a codex instance
    ok 2 - rejects invalid attach display name locally
    ok 3 - lists instances
    ok 4 - detaches an instance
    ok 5 - rejects invalid detach instance locally
ok 10 - petctl attach/list
# tests 71
# suites 10
# fail 0
```

### pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
- exitCode: 0
- signal: none
- summary:
```text
  "ok": true,
  "status": "passed",
    "v30_0_scope_freeze": "passed",
    "v30_1_storyboard": "passed",
    "v30_2_candidate_generation": "passed",
    "v30_3_motion_readability": "passed",
    "v30_4_preview_html": "passed",
    "v30_5_apply_rollback": "passed"
    "status": "failed",
      "error": true,
      "error": {
    "semanticChecklistResult": "failed",
    "loopClosureResult": "passed",
    "adjacentDeltaResult": "passed",
    "sameCatResult": "passed"
    "status": "passed",
      "semantic_animation_passed"
      "error": true,
      "error": {
    "semanticChecklistResult": "passed",
    "loopClosureResult": "passed",
    "adjacentDeltaResult": "passed",
    "sameCatResult": "passed"
  "claimScan": {
    "status": "passed",
  "securityScan": {
    "status": "passed",
```

### pnpm --filter desktop exec node --import tsx ../../scripts/v31_stage_smoke.mjs
- exitCode: 0
- signal: none
- summary:
```text
  "ok": true,
  "flagshipStatus": "passed",
  "photoRouteStatus": "candidate_workflow_passed_scoped",
  "claimScan": "passed",
  "securityScan": "passed"
```

### pnpm --filter desktop exec node --import tsx ../../scripts/v32_quality_rescue_smoke.mjs
- exitCode: 0
- signal: none
- summary:
```text
  "ok": true,
  "finalStatus": "passed scoped",
  "evidencePath": "docs/V32.x/evidence/v32_quality_rescue-smoke-2026-06-24.md",
  "finalReportPath": "docs/V32.x/v32-final-acceptance-report.md",
  "htmlPath": "docs/V32.x/evidence/v32_quality_rescue-report-2026-06-24.html",
  "screenshotStatus": "passed",
      "status": "passed"
      "status": "passed"
  "previewApplyStatus": "passed",
  "claimScan": "passed",
  "securityScan": "passed"
```

### pnpm --filter desktop exec node --import tsx ../../scripts/v33_7_final_gate_smoke.mjs
- exitCode: 0
- signal: none
- summary:
```text
  "ok": true,
  "finalReportPath": "docs/V33.x/v33-final-acceptance-report.md",
  "claimScan": "passed",
  "securityScan": "passed"
```

### pnpm --filter desktop exec node --import tsx ../../scripts/v34_1_subject_detection_smoke.mjs
- exitCode: 0
- signal: none
- summary:
```text
  "ok": true,
  "evidencePath": "docs/V34.x/evidence/v34_1-subject-detection-2026-06-25.md",
  "singleCatPassedCount": 3,
  "claimScan": "passed",
  "securityScan": "passed"
```

### pnpm --filter desktop exec node --import tsx ../../scripts/v34_2_segmentation_mask_smoke.mjs
- exitCode: 0
- signal: none
- summary:
```text
  "ok": true,
  "evidencePath": "docs/V34.x/evidence/v34_2-segmentation-mask-2026-06-25.md",
  "passedDetections": 3,
  "passedMasks": 3,
  "claimScan": "passed",
  "securityScan": "passed"
```

### pnpm --filter desktop exec node --import tsx ../../scripts/v34_3_pose_part_map_smoke.mjs
- exitCode: 0
- signal: none
- summary:
```text
  "ok": true,
  "evidencePath": "docs/V34.x/evidence/v34_3-pose-part-map-2026-06-25.md",
  "passedMasks": 3,
  "passedPartMaps": 3,
  "claimScan": "passed",
  "securityScan": "passed"
```

### pnpm --filter desktop exec node --import tsx ../../scripts/v34_4_character_asset_contract_smoke.mjs
- exitCode: 0
- signal: none
- summary:
```text
  "ok": true,
  "evidencePath": "docs/V34.x/evidence/v34_4-character-asset-contract-2026-06-25.md",
  "passedPartMaps": 3,
  "passedContracts": 3,
  "claimScan": "passed",
  "securityScan": "passed"
```

### pnpm --filter desktop exec node --import tsx ../../scripts/v34_5_rig_frame_synthesis_smoke.mjs
- exitCode: 0
- signal: none
- summary:
```text
  "ok": true,
  "evidencePath": "docs/V34.x/evidence/v34_5-rig-frame-synthesis-2026-06-25.md",
  "passedContracts": 3,
  "passedPacks": 2,
  "passedQa": 2,
  "failedPacks": 1,
  "distinctPassedCharacterAssetCount": 2,
  "claimScan": "passed",
  "securityScan": "passed"
```

### pnpm --filter desktop exec node --import tsx ../../scripts/v34_6_generation_product_e2e_smoke.mjs
- exitCode: 0
- signal: none
- summary:
```text
  "ok": true,
  "evidencePath": "docs/V34.x/evidence/v34_6-generation-product-e2e-2026-06-25.md",
  "passedCandidateCount": 2,
  "blockedFailedCandidateCount": 2,
  "claimScan": "passed",
  "securityScan": "passed"
```

### pnpm --filter desktop exec node --import tsx ../../scripts/v34_7_real_data_report_smoke.mjs
- exitCode: 0
- signal: none
- summary:
```text
  "ok": true,
  "htmlPath": "docs/V34.x/evidence/v34_7-real-data-report-2026-06-25.html",
  "passedCandidateCount": 2,
  "blockedFailedCandidateCount": 2,
  "claimScan": "passed",
  "securityScan": "passed"
```

## Security Scan
- Status: passed
- Boundary: command summaries are sanitized and omit local absolute paths.
