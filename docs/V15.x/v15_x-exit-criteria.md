# V15 Exit Criteria

日期：2026-06-09  
状态：V15.0-V15.13 passed scoped。  

## Pass Criteria

V15 may pass only if:

- V15.1-V15.6 evidence exists and is passed.
- V15.7 final report is passed.
- V15.8 2D animation continuity smoke is passed for bundled default/gallery
  sprite assets.
- V15.9-V15.13 photo-guided 2D action asset phases have explicit
  passed/blocked/failed evidence before any photo-to-2D claim is used.
- drag start/move/release/land is visible in real desktop evidence.
- no native image ghost, dragged-out bitmap, selectable image, blank frame, transparent frame, or offscreen pet appears during drag.
- default/gallery 2D core actions have identical first/final rendered frames and
  bounded adjacent-frame deltas.
- photo-guided generated/imported 2D assets pass privacy, consent, same-cat
  trait approval, 8-action coverage, continuity, preview, target-only apply,
  security scan, and claim scan before V15.13.
- pointer-near, hover, click, and double-click are visible and priority-safe.
- autonomous walk remains inside safe desktop bounds.
- autonomous walk, pointer reactions, click reactions, drag physics, and quiet mode can be configured.
- error and need_input cannot be overwritten by lower-priority interactions.
- final HTML embeds screenshots/captures directly.
- security scan, claim scan, and regression baseline pass.

## Block Criteria

V15 must be blocked or failed if:

- drag creates a native image ghost or asset is dragged out of the app.
- cat disappears, becomes transparent, or exits safe desktop bounds.
- pointer/click/idle/walk emits PetEvent or writes CatStateMachine.
- lower-priority interaction overrides error or need_input.
- settings preview mutates live PetInstance state.
- default/gallery 2D animation has open first/final frames, unbounded adjacent
  frame jumps, old-pack flash, fallback flash, or sudden vertical snap.
- photo/provider flow leaks raw photo, source filename/path, EXIF/GPS, raw
  provider response, token, Authorization, prompt text, workspace path, config
  path, or full local path.
- provider upload runs without explicit consent.
- generated/imported pack fails continuity but changes the active target pet.
- final report claims automatic photo-to-2D or provider integration readiness.
- evidence leaks token, Authorization, raw payload, prompt text, tool command text, screen text, clipboard, workspace path, config path, or full local path.
- final report uses a forbidden ready claim.

## Final Evidence Required

- `docs/V15.x/v15_7-final-acceptance-report.md`
- `docs/V15.x/evidence/v15_7-final-interaction-html-YYYY-MM-DD.html`
- `docs/V15.x/evidence/v15_8-2d-animation-continuity-smoke-YYYY-MM-DD.md`
- `docs/V15.x/evidence/v15_8-2d-animation-continuity-contact-sheet-YYYY-MM-DD.html`
- `docs/V15.x/evidence/v15_8-2d-animation-continuity-runtime-capture-YYYY-MM-DD.html`
- `docs/V15.x/evidence/v15_9-photo-intake-consent-smoke-YYYY-MM-DD.md`
- `docs/V15.x/evidence/v15_10-trait-prompt-pack-smoke-YYYY-MM-DD.md`
- `docs/V15.x/evidence/v15_11-photo-2d-provider-or-import-smoke-YYYY-MM-DD.md`
- `docs/V15.x/evidence/v15_12-photo-2d-continuity-assembly-smoke-YYYY-MM-DD.md`
- `docs/V15.x/v15_13-photo-2d-final-acceptance-report.md`
- real desktop screenshots/captures for drag, pointer, click, autonomous walk, settings, and priority blocking.
- regression logs for desktop, petctl, V14, V13, V12, and V11 gates.
