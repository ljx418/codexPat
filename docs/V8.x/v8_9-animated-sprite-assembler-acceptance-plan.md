# V8.9 Animated Sprite Assembler Acceptance Plan

status: planned
date: 2026-06-03

## Acceptance Criteria

V8.9 passes only when local frame-sequence assembly, import, and optional
activation are verified with real local PNG fixture frames.

Required checks:

- valid frame folder accepted.
- generated manifest contains `rendererKind: "sprite"`, all core actions,
  `frameFiles`, and `fps`.
- missing core action rejected.
- action with fewer than 2 frames rejected.
- action with more than 48 frames rejected.
- invalid fps rejected.
- unsafe filename rejected.
- path traversal rejected.
- remote URL rejected.
- generated manifest imports through existing app-managed validation.
- optional activation targets one PetInstance only.
- invalid assembly/import preserves the previous active pack.
- evidence contains no token, Authorization, raw payload, prompt text, provider
  payload, raw photo, full source folder path, workspace path, config path, or
  api-token.json.

## Automated Smoke

Required script:

```bash
node scripts/v8_9_animated_sprite_assembler_smoke.mjs
```

The smoke must create temporary local PNG frame fixtures, assemble a manifest,
run import validation, and record only safe field names and outcomes.

## Regression

Run:

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl check
pnpm --filter @agent-desktop-pet/petctl test
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```

## Evidence

Required:

- `docs/V8.x/evidence/v8_9-animated-sprite-assembler-smoke-YYYY-MM-DD.md`
- `docs/V8.x/v8_9-final-acceptance-report.md`

## Pass / Block / Fail Rules

- `passed`: all automated smoke, regression, security scan, and claim scan pass.
- `blocked`: local fixture setup or Desktop Manager runtime is unavailable.
- `failed`: assembler accepts invalid input, leaks sensitive data, changes the
  wrong PetInstance, or invalid assembly does not preserve the previous active
  pack.
