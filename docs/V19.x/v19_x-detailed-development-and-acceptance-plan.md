# V19 Detailed Development and Acceptance Plan

日期：2026-06-12  
状态：planned。

## V19.0

Development:

- Create V19 active PRD and phase docs.
- Update active development, acceptance, gap, and drawio.
- Record Petdex reference facts and license boundary.

Acceptance:

- V19 docs exist.
- active docs point to V19 planned.
- V18 evidence remains baseline only.
- Forbidden claims appear only in forbidden/not-ready/not-implied context.
- Drawio XML parses.

## V19.1

Development:

- Add motion sheet schema for:
  - `pet.json`
  - spritesheet image
  - row/action mapping
  - frame rects
  - fps
  - loop/transient metadata
  - fallbackActionId
- Accept app-managed local file references only.
- Reject remote URL, absolute path, path traversal, script/event fields, shell commands, raw provider payload, token/Auth fields.
- Implement the stable reasonCodes and layout rules in
  `docs/V19.x/v19_x-motion-sheet-format-and-qa-spec.md`.

Acceptance:

- Valid Petdex-compatible fixture accepted.
- Valid project 8-core-action sheet accepted.
- Each rejected fixture returns stable reasonCode.
- Rejected fixture table covers URL/path/script/event handler/shell/credential/raw-payload cases.
- Previous active pack preserved after invalid activation.
- Existing V5 manifest tests still pass.

## V19.2

Development:

- Add provider motion-sheet mode behind explicit consent.
- Use one provider job to produce a single same-cat sheet where possible.
- Store only safe job metadata and redacted reasonCode.

Acceptance:

- Real provider output exists and is accepted, or branch is explicitly blocked.
- No per-action independent provider drift is used as final evidence.
- Evidence contains no raw provider payload, prompt private text, token, Authorization, full local path, raw photo bytes.

## V19.3

Development:

- Crop sheet rows/columns.
- Normalize actions to project 8 core actions.
- Build safe app-managed pack.
- Generate contact sheet and preview metadata.

Acceptance:

- All 8 core actions have frames.
- Missing row/short row/transparent row/malformed sheet rejected.
- Safe pack imported.
- Invalid activation preserves previous active pack.

## V19.4

Development:

- Add motion amplitude metrics.
- Add same-cat continuity acceptance hooks.
- Add scale readability checks at 1x and 0.75x.
- Calibrate and record the V19.4 threshold values used for `meanFrameDelta`,
  `maxFrameDelta`, `bboxCenterShiftPx`, `bboxAreaChangeRatio`, and
  `uniquePoseCount`.

Acceptance:

- At least 6/8 actions are visibly high-amplitude compared with V18 transform baseline.
- Running, success, error, need_input have clear pose change.
- Loop/base actions have at least 4 unique poses; transient actions have at least 3 unique poses.
- No blank/transparent/off-canvas frames.
- Loop/base actions close first/final frame.
- QA failed pack cannot apply.

## V19.5

Development:

- Add Manager sheet preview.
- Add per-action animation preview.
- Add target picker and rollback path.

Acceptance:

- Preview sends zero PetEvent.
- Preview does not write CatStateMachine.
- Apply affects only target PetInstance.
- Rollback restores previous active pack.
- Default and unrelated pets unchanged.

## V19.6

Acceptance:

- V19.0-V19.5 have passed/blocked/failed evidence.
- Final HTML embeds screenshots/contact sheets/captures.
- Regression, security, license, claim scans pass.
- Final claim is the narrowest evidence-matched statement.
