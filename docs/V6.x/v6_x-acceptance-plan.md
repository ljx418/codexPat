# V6.x Acceptance Plan

status: passed-scoped

date: 2026-05-30

## Acceptance Principle

V6 acceptance requires product workflow evidence, not only scoped engineering smoke.

Each phase must prove:

- product behavior works for the stated local scenario.
- diagnostics are understandable.
- security redaction passes.
- forbidden claims remain forbidden.
- V3/V4/V5 baseline regressions are not broken.

## Required Regression Baseline

```bash
node scripts/v3_1_runtime_smoke.mjs
node scripts/v3_7_codex_exec_jsonl_monitor_smoke.mjs
node scripts/v4_4_managed_session_smoke.mjs
node scripts/v4_5_managed_tui_preflight_smoke.mjs
node scripts/v5_12_runtime_imported_pack_smoke.mjs
node scripts/v5_13_guided_workflow_smoke.mjs
node scripts/v5_14_provider_feasibility_smoke.mjs
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
git status --short
```

## Security Scan

Evidence, logs, screenshots, and exports must not contain:

```text
token
Authorization
raw payload
raw hook payload
raw JSONL payload
prompt text
tool command text
terminal text
shell history
screen contents
clipboard contents
transcript_path
full /Users path
workspace path
config path
api-token.json
photo raw bytes
EXIF/GPS
provider credential
raw provider response
```

## Productization Gate

V6.9 may pass only when V6.1-V6.8 are passed or explicitly excluded with scoped claim language, and all scans/regressions pass.

## Phase-Specific Acceptance Plans

- `docs/V6.1/v6_1-acceptance-plan.md`
- `docs/V6.2/v6_2-acceptance-plan.md`
- `docs/V6.3/v6_3-acceptance-plan.md`
- `docs/V6.4/v6_4-acceptance-plan.md`
- `docs/V6.5/v6_5-acceptance-plan.md`
- `docs/V6.6/v6_6-acceptance-plan.md`
- `docs/V6.7/v6_7-acceptance-plan.md`
- `docs/V6.8/v6_8-acceptance-plan.md`

V6.1 through V6.9 have scoped final acceptance reports and evidence. V6.9 passed only for tested local macOS developer workflow scenarios and does not imply any forbidden ready claim.
