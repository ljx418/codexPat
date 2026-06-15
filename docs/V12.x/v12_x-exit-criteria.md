# V12.x Exit Criteria

status: passed scoped
date: 2026-06-07

V12 exited scoped acceptance after all criteria below passed for the tested
local macOS desktop scenario.

## Visual Evidence

- real desktop screenshot contains visible cat.
- pet-region screenshot contains visible cat.
- pet-region screenshot passes nonblank and non-flat pixel checks, or records
  manual visual confirmation.
- first-run screenshot contains visible cat.
- settings or diagnostics screenshot explains visibility status.
- acceptance HTML embeds the screenshots directly.
- runtime capture screenshots are clearly labeled as non-desktop evidence.

## Runtime / Window Evidence

- desktop health is ok before screenshot.
- default pet can be shown and reset to safe position.
- target work-cat can be shown without affecting default pet.
- hide/show does not create duplicate windows.
- offscreen position recovers safely.

## Regression

```text
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
node scripts/v3_1_runtime_smoke.mjs
node scripts/v4_4_managed_session_smoke.mjs
node scripts/v11_7_interaction_qa_gate_smoke.mjs
```

## Security

Evidence and logs must not include:

- token.
- Authorization.
- raw payload.
- prompt text.
- tool command text.
- full local path.
- workspace path.
- config path.
- clipboard contents.
- shell history.

## Final Decision

V12.7 final status is `passed` in
`docs/V12.x/v12_7-final-acceptance-report.md`. If future runs lose real
desktop screenshot visibility, that future run must be `blocked` or `failed`,
not silently treated as passed.
