# V17 Detailed Development and Acceptance Plan

状态：ready for V17.1 implementation after operator review。  
日期：2026-06-11。

## 1. Implementation Rules

V17 upgrades the current explanation-only wizard into a productized workflow.
It must be implemented phase-by-phase. A later phase may prepare interfaces, but
it cannot be marked passed until its own runtime evidence exists.

Global implementation rules:

- UI must be usable without reading smoke scripts or development docs.
- Preview must send zero PetEvent.
- Preview must not call notify.
- Preview must not write CatStateMachine.
- Preview must not mutate live PetInstance.
- Apply must require explicit target PetInstance.
- Apply must never fallback to default silently.
- Invalid output must preserve previous active pack.
- Evidence must use screenshots/HTML plus safe machine-readable summaries.

## 2. V17.1 Productized Wizard Shell

### Development Tasks

1. Replace the current explanation-only modal with a stateful wizard surface.
2. Add local photo selector and drag/drop zone.
3. Render local preview using browser object URL or sanitized app-managed preview data.
4. Show safe metadata only:
   - media type
   - approximate size bucket
   - dimensions if available
   - selected/not-selected state
5. Do not show:
   - full path
   - original filename if it can reveal private data
   - EXIF/GPS
6. Add explicit consent checkbox.
7. Add approved-traits text field.
8. Add target pack name field.
9. Add wizard state:

```text
idle
photo_selected
consent_required
consent_ready
traits_required
generation_ready
blocked
```

10. Add stable reasonCode display.

### Acceptance Criteria

- User can select `docs/猫.jpg` or another local image and see a preview.
- User can understand current state and next action.
- Without consent, generation controls are disabled with `consent_required`.
- Without traits, generation controls show `traits_required`.
- Selecting photo does not mutate live pet.
- Evidence contains no full path, token, Authorization, EXIF/GPS, raw photo bytes.

### Evidence

`docs/V17.x/evidence/v17_1-wizard-shell-photo-intake-YYYY-MM-DD.md`

Must include:

- screenshot or DOM capture of wizard shell.
- safe metadata table.
- state/reasonCode table.
- zero PetEvent / no CatStateMachine write statement.
- security scan result.

## 3. V17.2 Generation Mode and Loading UX

### Development Tasks

1. Add mode selector:
   - `host_image_tool_assisted`
   - `local_action_sheet_import`
   - `provider_api`
2. Host image tool mode:
   - shows reference photo state.
   - shows copyable prompt.
   - points user to upload 4x2 action sheet after generation.
3. Local action sheet mode:
   - exposes upload control directly.
4. Provider API mode:
   - checks credential/consent/disclosure readiness.
   - if not ready, shows stable not-ready reason.
   - no silent upload.
5. Add loading/status model:

```text
pending_user_action
copy_prompt_ready
waiting_for_output
output_ready
running
blocked
failed
```

### Acceptance Criteria

- Host/manual path is clear and actionable.
- Provider API path is safe not-ready unless all gates are satisfied.
- Status UI never includes raw prompt, raw provider response, token, Authorization, full path, workspace path, config path.
- Loading UX clearly distinguishes “waiting for user output” from “provider running”.

### Evidence

`docs/V17.x/evidence/v17_2-generation-mode-loading-YYYY-MM-DD.md`

Must include:

- screenshot/DOM capture for each mode.
- provider not-ready reasonCode.
- copied prompt digest or summary, not raw private prompt if it contains user details.
- security scan result.

## 4. V17.3 Action Sheet Crop and Auto Packaging

### Development Tasks

1. Accept 4x2 PNG/WebP action sheet from local file input or app-managed path.
2. Decode image in app-controlled flow.
3. Validate minimum dimensions.
4. Crop fixed 4x2 grid in this order:

```text
row 1: idle, thinking, running, success
row 2: warning, error, need_input, sleeping
```

5. Normalize every cell into a frame sequence.
6. Use controlled transforms only; no CSS-only movement as evidence.
7. Ensure loop actions close first/final frame.
8. Generate safe local pack:

```text
pet.json
idle/frame-001.png ...
thinking/frame-001.png ...
...
```

9. Parameterize the V16 pack generator or implement an app-owned equivalent.
10. Validate generated manifest with existing asset validator.

### Rejection Cases

- not an image.
- unsupported mime type.
- corrupt image.
- too small.
- too large.
- blank/transparent cells.
- missing core action cell.
- unsafe generated manifest.
- remote URL.
- absolute path.
- path traversal.
- script/event handler/external href.
- raw provider payload.
- prompt text.
- token/Authorization.

### Acceptance Criteria

- A valid 4x2 sheet becomes an 8-action sprite pack.
- Generated pack is app-managed and safe.
- Invalid input fails with stable reasonCode.
- Previous active pack remains unchanged after failure.
- V15.12 continuity assembly remains compatible.

### Evidence

`docs/V17.x/evidence/v17_3-action-sheet-packaging-YYYY-MM-DD.md`

Must include:

- accepted action sheet summary.
- action crop order table.
- frame count table.
- rejected fixture table.
- previous pack preserved result.
- security scan result.

## 5. V17.4 In-modal QA Preview

### Development Tasks

1. Display all 8 core actions in the same modal.
2. Use isolated preview renderer.
3. Show per-action QA:
   - coverageState
   - frameCount
   - firstFinalClosed
   - maxAdjacentDelta
   - nonblank
   - offCanvas
   - fallbackActionId
   - sameCatReview
   - reasonCode
4. Add manual same-cat pass/fail control.
5. Block apply unless all required QA gates pass.

### Acceptance Criteria

- All 8 actions are visible.
- Switching preview actions does not affect live target pet.
- Preview sends zero accepted PetEvent.
- Preview renderer receives only safe pack/action/renderer/playback/scale/visibility fields.
- Transparent/blank/off-canvas/flicker/mismatch paths show visible fallback and block apply.

### Evidence

`docs/V17.x/evidence/v17_4-modal-preview-qa-YYYY-MM-DD.md`

Must include:

- screenshot/HTML preview grid.
- QA table.
- manual same-cat decision.
- zero event/state mutation proof.
- failure case proof.

## 6. V17.5 Target Apply, Retry, Rollback

### Development Tasks

1. Add target PetInstance picker.
2. Require explicit target before apply.
3. Store previous active pack assignment for rollback.
4. Apply generated pack only to target.
5. Provide retry upload/generation controls.
6. Provide rollback control.
7. Keep visible fallback on delete/stale pack.

### Acceptance Criteria

- Target pet changes to generated pack.
- Default pet unchanged.
- `default pet unchanged` must be recorded as a hard acceptance field.
- Unrelated pets unchanged.
- `unrelated pets unchanged` must be recorded as a hard acceptance field.
- Apply failure preserves previous pack.
- Rollback restores previous pack.
- Retry does not leave stale partially active pack.
- Deleting generated pack leaves target visible.

### Evidence

`docs/V17.x/evidence/v17_5-apply-rollback-YYYY-MM-DD.md`

Must include:

- before/after assignment table.
- target-only apply proof.
- rollback proof.
- failure preservation proof.
- screenshot/HTML evidence.

## 7. V17.6 Final Product UX Gate

### Required Inputs

- V17.1 evidence passed or explicitly blocked/failed.
- V17.2 evidence passed or explicitly blocked/failed.
- V17.3 evidence passed or explicitly blocked/failed.
- V17.4 evidence passed or explicitly blocked/failed.
- V17.5 evidence passed or explicitly blocked/failed.

### Required Commands

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop build
node scripts/v15_12_photo_2d_continuity_assembly_smoke.mjs
node scripts/v15_13_photo_2d_preview_apply_smoke.mjs
node scripts/v16_6_final_provider_photo2d_gate_smoke.mjs
```

If V17-specific smoke scripts exist, run them too.

### Final Report Must Include

- status: passed / blocked / failed.
- date.
- scope.
- tested local photo summary.
- tested action-sheet summary.
- wizard screenshots.
- QA preview screenshots.
- apply/rollback results.
- security scan.
- claim scan.
- regression summary.
- final allowed claim.
- forbidden claims.

### Final HTML

`docs/V17.x/evidence/v17_6-productized-wizard-html-YYYY-MM-DD.html`

Must embed or directly display:

- wizard shell screenshot.
- photo preview.
- generation mode/loading.
- action sheet upload/packaging.
- 8-action QA preview.
- target apply.
- rollback.

## 8. Development Order

Recommended implementation order:

1. V17.1 stateful wizard UI and safe photo preview.
2. V17.2 mode selector and loading/status model.
3. V17.3 action sheet packaging service/script.
4. V17.4 QA preview model.
5. V17.5 target apply/rollback.
6. V17.6 evidence and final gate.

## 9. Remaining Product Boundary

V17 can be product-useful without provider API readiness if the local action
sheet path works. In that case final claim must explicitly say direct provider
API generation remains not-ready.
