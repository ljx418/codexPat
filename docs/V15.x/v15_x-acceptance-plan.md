# V15 Acceptance Plan

日期：2026-06-09  
状态：V15.0-V15.13 passed scoped photo-guided 2D action asset extension。  

## Acceptance Status

| Phase | Status | Evidence |
| --- | --- | --- |
| V15.0 | passed scoped | `docs/V15.x/evidence/v15_0-scope-freeze-2026-06-10.md` |
| V15.1 | passed scoped | `docs/V15.x/evidence/v15_1-interaction-model-smoke-2026-06-10.md` |
| V15.2 | passed scoped | `docs/V15.x/evidence/v15_2-drag-physics-smoke-2026-06-10.md` |
| V15.3 | passed scoped | `docs/V15.x/evidence/v15_3-pointer-feedback-smoke-2026-06-10.md` |
| V15.4 | passed scoped | `docs/V15.x/evidence/v15_4-autonomous-walk-smoke-2026-06-10.md` |
| V15.5 | passed scoped | `docs/V15.x/evidence/v15_5-emotion-composer-smoke-2026-06-10.md` |
| V15.6 | passed scoped | `docs/V15.x/evidence/v15_6-interaction-settings-smoke-2026-06-10.md` |
| V15.7 | passed scoped final gate | `docs/V15.x/v15_7-final-acceptance-report.md` |
| V15.8 | passed scoped 2D continuity hardening | `docs/V15.x/evidence/v15_8-2d-animation-continuity-smoke-2026-06-10.md` |
| V15.9 | passed scoped | `docs/V15.x/evidence/v15_9-photo-intake-consent-smoke-2026-06-10.md` |
| V15.10 | passed scoped | `docs/V15.x/evidence/v15_10-trait-prompt-pack-smoke-2026-06-10.md` |
| V15.11 | passed scoped import-ready branch | `docs/V15.x/evidence/v15_11-photo-2d-provider-or-import-smoke-2026-06-10.md` |
| V15.12 | passed scoped continuity assembly | `docs/V15.x/evidence/v15_12-photo-2d-continuity-assembly-smoke-2026-06-10.md` |
| V15.13 | passed scoped final gate | `docs/V15.x/v15_13-photo-2d-final-acceptance-report.md` |

## V15.1 Gate: Interaction Model

- priority order is implemented:

```text
error > need_input > drag > double_click > click > success transient > running > thinking > pointer_near > idle random
```

- idle scheduler runs only when base state allows it.
- interaction actions do not send PetEvent.
- interaction actions do not call notify.
- interaction actions do not write CatStateMachine.
- renderer output contains only safe action ID, renderer kind, safe pack ID, playback intent, scale, visibility, and sanitized interaction intent.

## V15.2 Gate: Drag Physics

- drag start enters grabbed visual.
- drag move enters dragging visual and follows pointer.
- drag release enters release/land/settle visual.
- final position persists.
- no dragged-out browser image, native image ghost, duplicate pet bitmap, or selectable asset appears.
- default and unrelated pets remain unchanged.

## V15.3 Gate: Pointer Feedback

- pointer-near wakes or looks at pointer when priority allows.
- hover can trigger look/ear/tail feedback.
- click triggers short feedback.
- double-click triggers stronger feedback and takes priority over click.
- error and need_input block lower-priority pointer/click feedback.
- zero accepted PetEvent and no CatStateMachine write.

## V15.4 Gate: Autonomous Walk

- cat can walk within safe desktop bounds.
- cat can pause, turn, and avoid edges.
- cat never disappears offscreen.
- autonomous walk can be disabled.
- walk is blocked by error, need_input, drag, active click/double-click, and quiet mode.

## V15.5 Gate: Emotion Composer

- Codex/agent states and user interactions compose without priority inversion.
- running/thinking visual can coexist with subtle look/idle effects only if state meaning remains clear.
- success transient returns to idle unless error/need_input blocks it.
- warning/error/need_input remain visibly distinct.

## V15.6 Gate: Settings UX

- settings expose interaction toggles: autonomous walk, pointer reactions, click reactions, drag physics, quiet mode.
- settings expose intensity/frequency presets.
- settings persist after restart.
- preview does not mutate live state.

## V15.7 Final Gate

V15.7 may pass only if:

- V15.1-V15.6 evidence exists and passed.
- real desktop screenshots/captures show drag, pointer, click, autonomous walk, and settings.
- final HTML embeds evidence, not only links.
- security scan passes.
- claim scan passes.
- regression baseline passes.
- PRD/spec review passes.

Allowed final claim:

```text
V15 living desktop pet interaction upgrade passed for tested local macOS scenarios with drag, pointer-aware feedback, autonomous walk, configurable interaction settings, and priority-safe state composition.
```

## V15.8 2D Continuity Hardening Gate

V15.8 passes only if:

- current default flagship 2D cat and bundled 2D gallery packs cover all 8 core actions.
- every scoped core action has identical first/final rendered frame.
- every adjacent frame pair stays under the continuity delta threshold.
- no sudden vertical jump, blank, transparent, off-canvas, unsafe SVG, old-pack flash, or fallback flash is accepted.
- generated contact sheet and runtime capture evidence exists.

Allowed scoped claim:

```text
V15.8 bundled default and gallery 2D animation continuity passed for tested local sprite scenarios.
```

## V15.9-V15.13 Photo-Guided 2D Action Asset Gate

V15.9-V15.13 may pass only if:

- one local cat photo can be selected without leaking raw filename, path, EXIF,
  GPS, raw image data, token, Authorization, prompt text, or raw provider
  payload into evidence.
- provider upload cannot run without explicit consent.
- user-approved cat traits are generated or entered before prompt/provider use.
- all 8 core actions are generated or imported.
- generated/imported frames are assembled into a safe local pack.
- V15.8 continuity guard passes on the assembled pack.
- Desktop Manager preview shows all 8 actions and does not mutate live state.
- apply affects only the selected target pet.
- invalid/corrupt/generated pack failure preserves previous visible cat.

Allowed scoped final claim after V15.13 evidence:

```text
V15.13 photo-guided 2D action asset preview and target-pet apply flow passed for tested local scenarios.
```

Forbidden unless future evidence explicitly supports it:

```text
automatic photo-to-2D ready
automatic photo-to-animation ready
provider integration verified
photo customization ready for arbitrary cats
```
