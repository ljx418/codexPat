# V10.14 Ordinary-user First-run Wizard Acceptance Plan

status: planned
date: 2026-06-05

## Target Experience

A new local user should not need to read README or historical phase docs to
start using the desktop pet.

## Main Flow

1. Choose a bundled cat.
2. Choose default pet or Codex work-cat.
3. Create the pet.
4. For Codex work-cat, copy the recommended wrapper-launched JSONL command.
5. Send a test reaction and see the target cat change state.

## Acceptance

- visible pet appears in no more than 3 steps for default pet mode.
- Codex work-cat test reaction completes in no more than 5 steps.
- unsupported already-open Codex window automatic monitoring notice is visible.
- wizard can be reopened from Settings.
- no prompt text, tool command, token, Authorization, workspace path, or raw
  payload is persisted.
- default and unrelated pets are not affected by the test reaction.

## Evidence

- first-run wizard screenshots.
- test reaction runtime screenshot.
- onboarding diagnostics summary.
- security scan.
- claim scan.

