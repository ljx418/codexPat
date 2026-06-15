# V8.11 Animated Sprite Visual QA Acceptance Plan

status: accepted scoped
date: 2026-06-03

## Acceptance Criteria

V8.11 passes when:

- accepted V8.9 animated sprite pack renders on the target PetInstance.
- `idle`, `thinking`, `running`, `success`, `warning`, `error`,
  `need_input`, and `sleeping` visibly animate.
- default pet remains unchanged.
- unrelated pets remain unchanged.
- corrupt frame fallback leaves a visible safe cat.
- missing frame fallback leaves a visible safe cat.
- deleted pack fallback leaves a visible safe cat.
- deactivation returns to bundled/default renderer.
- 1x and 0.75x scale pass.
- animation switching never leaves a transparent, blank, or off-canvas pet.
- renderer input snapshot contains only safe action ID, renderer kind, safe
  pack/profile IDs, playback intent, scale, and visibility.

## Automated / Manual Evidence

Required:

```bash
node scripts/v8_11_animated_sprite_visual_qa_smoke.mjs
```

Manual visual evidence may be required for desktop screenshots or recordings.
Manual evidence must record the operator result without exposing paths, prompt
text, provider payload, token, Authorization, or raw photo data.

## Regression

Run:

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter desktop build
pnpm --filter @agent-desktop-pet/petctl test
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```

## Evidence

Required:

- `docs/V8.x/evidence/v8_11-animated-sprite-visual-qa-YYYY-MM-DD.md`
- `docs/V8.x/v8_11-final-acceptance-report.md`

## Pass / Block / Fail Rules

- `passed`: all action animations are visible and fallback/isolation/security
  checks pass.
- `blocked`: desktop runtime or visual capture is unavailable.
- `failed`: any claimed path is transparent, blank, off-canvas, leaks sensitive
  data, or affects the wrong PetInstance.
