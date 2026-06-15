# V12.x Implementation Contract

status: planned
date: 2026-06-07

## Purpose

This contract converts the V12 PRD, architecture, and acceptance plan into
implementation-ready interfaces and evidence rules. V12 is not allowed to pass
unless these contracts are implemented or explicitly blocked with evidence.

## Commands / Scripts

Expected local commands:

```text
node scripts/v12_1_visibility_diagnostics_smoke.mjs
node scripts/v12_2_window_layering_smoke.mjs
node scripts/v12_3_real_screenshot_harness_smoke.mjs
node scripts/v12_4_first_run_real_desktop_proof_smoke.mjs
node scripts/v12_5_window_monitor_regression_smoke.mjs
node scripts/v12_6_acceptance_html_report_smoke.mjs
node scripts/v12_7_final_desktop_visibility_gate_smoke.mjs
```

The scripts may call Tauri commands or petctl commands, but evidence must be
sanitized and must not print token, Authorization, raw payload, prompt text,
tool command text, workspace path, config path, or full local path.

## Visibility Diagnostics Schema

Safe JSON shape:

```json
{
  "ok": true,
  "instanceId": "default",
  "windowLabel": "main",
  "visible": true,
  "position": { "x": 970, "y": 490 },
  "size": { "width": 160, "height": 160 },
  "monitorSummary": "monitor_primary_1",
  "layering": {
    "alwaysOnTopRequested": true,
    "visibleOnAllWorkspacesRequested": true,
    "skipTaskbarRequested": true,
    "transparentRequested": true,
    "lastShowActionAt": "redacted-time",
    "lastFocusActionAt": "redacted-time"
  },
  "screenshotObservation": {
    "desktopCapture": "visible",
    "petRegionCapture": "visible",
    "reasonCode": "desktop_visible"
  }
}
```

Allowed reasonCode values:

- `desktop_visible`
- `desktop_not_running`
- `window_not_found`
- `window_hidden`
- `window_offscreen`
- `window_occluded_or_not_captured`
- `capture_permission_unknown`
- `monitor_unavailable`
- `position_reset_required`
- `pixel_detection_inconclusive`
- `desktop_capture_missing`
- `pet_region_capture_missing`
- `html_report_missing_screenshot`

Forbidden diagnostic fields:

- raw window title.
- raw screen text.
- prompt text.
- tool command text.
- token.
- Authorization.
- raw payload.
- full local path.
- workspace path.
- config path.
- clipboard contents.
- shell history.

## Screenshot Artifacts

Required artifact paths:

```text
docs/V12.x/evidence/screenshots/v12_3-real-desktop-YYYY-MM-DD.png
docs/V12.x/evidence/screenshots/v12_3-real-pet-region-YYYY-MM-DD.png
docs/V12.x/evidence/screenshots/v12_4-first-run-desktop-YYYY-MM-DD.png
docs/V12.x/evidence/screenshots/v12_5-reset-position-before-YYYY-MM-DD.png
docs/V12.x/evidence/screenshots/v12_5-reset-position-after-YYYY-MM-DD.png
docs/V12.x/evidence/v12_6-complete-acceptance-html-YYYY-MM-DD.html
```

Screenshots must be treated as potentially sensitive desktop evidence. The
HTML report should show them as visual evidence, but text logs must not OCR or
dump desktop text.

## Pixel Visibility Detection

The harness must combine human-visible screenshots with automated checks.

Minimum automated checks:

- file exists and has nonzero size.
- image dimensions are nonzero.
- pet-region image has a nonblank pixel ratio above 1%.
- pet-region image is not a single flat color.
- if a safe marker layer is added, marker must be local-only and not visible in
  normal user mode.

Failure handling:

- If pixel checks are inconclusive but human screenshot clearly shows cat,
  evidence may be `passed_with_manual_visual_confirmation`.
- If screenshot does not show cat, status must be `blocked` or `failed`.
- Runtime HTML screenshots must never satisfy the real desktop screenshot gate.

## Window Layering Contract

V12.2 implementation must verify or expose:

- show visible default pet.
- re-show visible target pet.
- reset default pet position.
- reset target pet position.
- no duplicate window after repeated re-show.
- window remains within monitor bounds after reset.
- foreground browser/terminal does not permanently hide a visible pet.

If macOS full-screen Space prevents overlay visibility, evidence must record
the limitation and tested scenario. Do not claim cross-Space readiness unless
tested.

## Acceptance HTML Structure

V12.6 HTML must include:

- final status banner: passed / blocked / failed.
- real desktop screenshot section.
- pet-region screenshot section.
- first-run screenshot section.
- settings/diagnostics screenshot or diagnostics table.
- runtime capture section clearly labeled as non-desktop evidence.
- phase evidence table.
- regression table.
- security scan table.
- allowed claim.
- forbidden claims.
- blocker section visible when any screenshot path fails.

## Final Gate Rule

V12.7 cannot pass if any of these are missing:

- V12.1-V12.6 evidence files.
- real desktop screenshot with visible cat.
- pet-region screenshot with visible cat.
- V12.6 HTML embedding the screenshots.
- regression results.
- security scan.
- claim scan.
- active docs and drawio sync.

