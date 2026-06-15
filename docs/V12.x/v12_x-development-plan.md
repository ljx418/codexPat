# V12.x Development Plan: Desktop Visibility & Evidence Hardening

status: passed scoped
date: 2026-06-07

## Goal

V12 closes the gap between runtime-rendered cat evidence and real desktop
visibility evidence. V11 proved living interaction; V12 must prove that the
cat is actually visible on the user's desktop and that acceptance HTML contains
direct screenshots of the completed effect.

## Non-goals

V12 does not implement:

- new Codex event sources.
- provider/photo-to-3D.
- new 3D renderer readiness.
- production signing/notarization/auto-update.
- Windows or cross-platform support.
- Petdex parity.

## Phase Plan

Implementation contract: `docs/V12.x/v12_x-implementation-contract.md`.

### V12.1 Desktop Visibility Diagnostics Baseline

Development:

- Add a sanitized visibility diagnostics model for each PetInstance.
- Capture safe fields only: instanceId, windowLabel, visible flag, position,
  size, monitor summary, last show/hide action, last focus/layer action,
  screenshot observed result.
- Add stable reasonCode vocabulary:
  - `desktop_visible`
  - `desktop_not_running`
  - `window_not_found`
  - `window_hidden`
  - `window_offscreen`
  - `window_occluded_or_not_captured`
  - `capture_permission_unknown`
  - `monitor_unavailable`
  - `position_reset_required`

Acceptance:

- Diagnostics can explain current default pet visibility without leaking paths.
- Diagnostics do not include raw window title, screen text, prompt text, token,
  Authorization, workspace path, config path, or raw payload.

### V12.2 Window Layering / Focus / Space Hardening

Development:

- Revalidate Tauri window flags for transparent, always-on-top, all-workspaces,
  skip-taskbar, focus, and show order.
- Add explicit re-show / refocus path for visible pets.
- Add safe reset-position flow for default and target PetInstance.
- Document macOS limitations: Spaces, full-screen apps, screen recording
  permission, window server capture behavior.

Acceptance:

- Visible pet can be forced to a known safe position.
- Re-show path does not create duplicate windows.
- Default and unrelated pets are not mutated by target re-show.

### V12.3 Real Screenshot Evidence Harness

Development:

- Add a local evidence harness that:
  - starts or verifies desktop health.
  - ensures target pet is visible.
  - triggers a visible safe state.
  - captures full desktop screenshot.
  - captures pet-region screenshot.
  - records diagnostics summary.
- If the pet is not visible in the screenshot, evidence must be `blocked` or
  `failed`, not silently replaced by runtime HTML.

Acceptance:

- Screenshot files are generated.
- At least one real desktop screenshot must visibly contain the cat for passed.
- Pet-region screenshot must visibly contain the cat and pass automated
  nonblank / non-flat image checks, or record explicit manual visual
  confirmation.
- If not, status remains blocked/failed with reasonCode.

### V12.4 First-Run Real Desktop Visual Proof

Development:

- Create a tested first-run proof path:
  - reset first-run flag safely.
  - show default living cat.
  - capture desktop screenshot.
  - capture settings/first-run panel if opened.
- Keep V11 first-run semantics: demo mode remains local and does not mutate
  Agent/Codex state.

Acceptance:

- First-run screenshot shows visible living cat within 10 seconds.
- First-run demo evidence remains zero PetEvent.

### V12.5 Multi-window / Monitor / Reset Regression

Development:

- Test:
  - default pet.
  - one Codex work-cat.
  - reset position.
  - hide/show.
  - safe monitor bounds.
  - browser/terminal foreground switch.
- Record target isolation.

Acceptance:

- Target pet visibility operations do not affect unrelated pets.
- Offscreen or stale position recovers to safe visible position.

### V12.6 Complete Acceptance HTML Reporter

Development:

- Generate one complete HTML report with embedded images:
  - real desktop screenshot.
  - pet-region screenshot.
  - settings/diagnostics screenshot.
  - V11 runtime capture screenshot.
  - pass/fail tables.
  - allowed/forbidden claims.
- The report must explicitly label any screenshot that is runtime HTML rather
  than real desktop capture.

Acceptance:

- User can open one HTML file and see the claimed effect directly.
- Missing/failed screenshots are visible as blockers, not hidden in logs.
- Runtime HTML captures are labeled separately and cannot satisfy real desktop
  screenshot proof.

### V12.7 Final Desktop Visibility Gate

Development:

- No new features.
- Run regression, security scan, claim scan, artifact scan, PRD/spec review,
  and drawio sync.

Acceptance:

- V12.1-V12.6 evidence exists and passes.
- Final report selects the narrowest evidence-matched claim.

## Required Regression

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
node scripts/v3_1_runtime_smoke.mjs
node scripts/v4_4_managed_session_smoke.mjs
node scripts/v11_7_interaction_qa_gate_smoke.mjs
```

## Go / No-Go

V12.1-V12.7: passed scoped.  
Final evidence: `docs/V12.x/v12_7-final-acceptance-report.md`.  
Acceptance HTML: `docs/V12.x/evidence/v12_6-complete-acceptance-html-2026-06-07.html`.
