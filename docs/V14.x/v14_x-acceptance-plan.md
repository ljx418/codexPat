# V14 Acceptance Plan

日期：2026-06-09  
状态：passed scoped。  

## Acceptance Status

| Phase | Status | Evidence |
| --- | --- | --- |
| V14.0 | passed | `docs/V14.x/evidence/v14_0-scope-freeze-2026-06-09.md` |
| V14.1 | passed | `docs/V14.x/evidence/v14_1-flagship-work-cat-v2-smoke-2026-06-09.md` |
| V14.2 | passed | `docs/V14.x/evidence/v14_2-animation-stability-linter-smoke-2026-06-09.md` |
| V14.3 | passed | `docs/V14.x/evidence/v14_3-gallery-filter-favorite-smoke-2026-06-09.md` |
| V14.4 | passed | `docs/V14.x/evidence/v14_4-preview-one-click-switch-smoke-2026-06-09.md` |
| V14.5 | passed | `docs/V14.x/evidence/v14_5-ai-asset-workflow-boundary-smoke-2026-06-09.md` |
| V14.6 | passed | `docs/V14.x/v14_6-final-acceptance-report.md` |

## V14.1 Gate: Flagship Work Cat V2

- all 8 core actions have contact sheets and runtime capture.
- living actions are visible and distinct.
- loop actions have identical first/final rendered frames.
- no blank, fully transparent, off-canvas, or sudden jump frame.
- 1x and 0.75x screenshots pass.
- operator visual acceptance is recorded.

## V14.2 Gate: Animation Stability

- valid spritesheet and png-sequence packs pass.
- corrupt frame, loop-open pack, size mismatch, transparent-only frame, off-canvas frame, remote URL, external href, script/event handler, path traversal, token, Authorization, and raw local path fixtures fail with stable reasonCode.
- invalid activation preserves previous active pack.
- renderer does not flash fallback or old pack during action switching.

## V14.3 Gate: Gallery and Favorites

- gallery lists at least 12 local curated packs.
- at least 8 packs are animated 2D packs.
- filters work for style, color, motion level, renderer kind, bundled/imported, favorite, and active state.
- favorite/unfavorite persists after restart.
- browsing and favorite changes do not affect live PetInstance state.
- GLTF prototype is labeled prototype/static, not 3D ready.

## V14.4 Gate: Preview and One-click Switching

- preview all core and living actions through isolated preview renderer.
- preview sends zero PetEvent, calls no notify, and does not write CatStateMachine.
- one-click apply affects only the selected PetInstance.
- default and unrelated pets remain unchanged.
- restore default works.
- deleting active imported pack first applies visible fallback.
- app restart restores active mapping.

## V14.5 Gate: AI Asset Guide Boundary

- prompt-only 2D action pack guide is generated.
- provider-assisted 2D path shows explicit consent, cost, privacy, retention, license, and attribution boundaries.
- external 3D import guide is present but does not claim 3D ready.
- raw photo is not persisted by default.
- approved traits metadata excludes EXIF/GPS/full path.
- provider credential and raw response never enter manifest, renderer payload, or evidence.
- generated output still goes through V14.2 linter and import validation.

## V14.6 Final Gate

V14.6 may pass only if:

- V14.1-V14.5 evidence exists and passed.
- final HTML embeds screenshots/captures.
- visual QA has no blank/transparent/off-canvas/flicker regression.
- CPU/memory baseline is recorded.
- security scan passes.
- claim scan passes.
- license/attribution scan passes.
- regression baseline passes.

Allowed final claim:

```text
V14 local premium animated pet gallery, stable 2D animation playback, favorites, preview, and one-click switching experience passed for tested local macOS scenarios.
```
