# V19 Development Plan

日期：2026-06-12  
状态：planned；do not mark passed without runtime evidence。

## Objective

V19 turns the V18 scoped photo-to-2D generation path into a higher-motion 2D animation workflow inspired by Petdex-style motion sheets while preserving license, security, and no-false-green boundaries.

## Phase Plan

### V19.0 Scope Freeze & Petdex Resource Boundary

Deliver:

- Confirm V19 PRD, architecture, acceptance, claim matrix, implementation contract.
- Confirm motion sheet format, stable reasonCode, and QA threshold spec.
- Record Petdex research as format/UX reference only.
- State no Petdex asset bundling without explicit license evidence.
- Sync active docs and drawio.

Evidence:

- `docs/V19.x/evidence/v19_0-scope-freeze-YYYY-MM-DD.md`

### V19.1 Petdex-compatible Motion Sheet Format

Deliver:

- Define and implement safe 8-row motion sheet schema.
- Support spritesheet dimensions, frame size, row/action mapping, fps, loop/transient metadata.
- Reject unsafe paths, remote URLs, scripts, event handlers, raw provider payload fields.
- Preserve V5/V18 manifest compatibility.
- Use `docs/V19.x/v19_x-motion-sheet-format-and-qa-spec.md` as the source of truth for layout, rejected fixtures, reasonCodes, and QA fields.

Evidence:

- `docs/V19.x/evidence/v19_1-motion-sheet-format-smoke-YYYY-MM-DD.md`

### V19.2 Provider Single-sheet Generation

Deliver:

- Ask provider for one same-cat motion sheet instead of independent per-action images.
- Use reference image only with explicit consent.
- If provider cannot produce a valid sheet, mark branch blocked.

Evidence:

- `docs/V19.x/evidence/v19_2-provider-motion-sheet-smoke-YYYY-MM-DD.md`

### V19.3 Sheet Crop / Normalize / Pack

Deliver:

- Crop sheet into per-action frame sequences.
- Generate safe `pet.json + frames`.
- Reject missing rows, empty frames, malformed grids.
- Preserve previous active pack on invalid activation.

Evidence:

- `docs/V19.x/evidence/v19_3-sheet-crop-pack-smoke-YYYY-MM-DD.md`

### V19.4 Motion Amplitude & Same-cat QA

Deliver:

- Motion amplitude metrics compared to V18 transform baseline.
- Same-cat continuity checks.
- Nonblank/off-canvas/closure/frame-delta/scale readability.
- QA failed pack cannot apply.

Evidence:

- `docs/V19.x/evidence/v19_4-motion-amplitude-qa-smoke-YYYY-MM-DD.md`

### V19.5 Manager Preview / Apply / Rollback

Deliver:

- Sheet preview and per-action animation preview.
- Target-only apply.
- Rollback previous pack.
- Default/unrelated pets unchanged.

Evidence:

- `docs/V19.x/evidence/v19_5-preview-apply-rollback-smoke-YYYY-MM-DD.md`

### V19.6 Final Gate

Deliver:

- Final HTML with embedded screenshots/contact sheets/runtime capture.
- Regression, security, claim, license scans.
- Narrow evidence-matched final decision.

Evidence:

- `docs/V19.x/v19_6-final-acceptance-report.md`
- `docs/V19.x/evidence/v19_6-motion-sheet-html-YYYY-MM-DD.html`

## Regression Baseline

Minimum checks before V19.6:

- `pnpm --filter desktop check`
- `pnpm --filter @agent-desktop-pet/petctl test`
- V18 final gate smoke or documented equivalent if script exists.
- Security scan over V19 docs/evidence.
- Claim scan over active docs and V19 docs.

## Forbidden Expansion

V19 must not claim:

- Petdex parity achieved
- Petdex asset reuse authorized
- arbitrary cats automatic photo-to-animation ready
- provider integration verified
- 3D ready
- production signed release ready
- Windows ready
- cross-platform ready
