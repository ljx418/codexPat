# V10.14 Final Acceptance Report

status: passed
date: 2026-06-05

## Scope

V10.14 implemented and accepted ordinary-user first-run onboarding for local
desktop pet and Codex work-cat scenarios. It does not claim all Codex workflows,
OS-level Codex window binding, already-open Codex auto-monitoring, provider
integration, 3D readiness, production release readiness, cross-platform
readiness, or Windows readiness.

## Evidence Gate

| Item | Result | Evidence |
| --- | --- | --- |
| first-run wizard UI | passed | `docs/V10.x/evidence/v10_14-first-run-wizard-smoke-2026-06-05.md` |
| default pet path | passed | visible default pet plus success test reaction path |
| Codex work-cat path | passed | create target instance plus success test reaction path |
| JSONL wrapper guidance | passed | copyable wrapper command rendered by wizard |
| already-open window unsupported notice | passed | unsupported boundary shown in wizard |
| screenshot/capture evidence | passed | `docs/V10.x/evidence/v10_14-first-run-wizard-capture-2026-06-05.html` |
| safety scan | passed | no prompt text, token, Authorization, raw payload, workspace path, or full local path persisted |
| regression | passed | `pnpm --filter desktop check`, `pnpm --filter desktop test`, `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` |

## First-run Path Result

| Path | Step budget | Result |
| --- | --- | --- |
| default desktop pet | <=3 user actions | passed |
| Codex work-cat | <=5 user actions | passed |

## Allowed Claim

```text
V10.14 ordinary-user first-run work-cat onboarding passed for tested local macOS scenarios.
```

## Final Decision

V10.14 passed. V10.15 may proceed.
