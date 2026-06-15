# V6.2 Codex Work-Cat Product UX Acceptance Plan

status: planning-ready

date: 2026-05-30

## Acceptance Gates

| Gate | Required Result |
| --- | --- |
| Work-cat creation | User can create or target a Codex work-cat from Desktop Manager. |
| JSONL command | User can copy the recommended wrapper-launched exec JSONL command. |
| JSONL explanation | UI states JSONL is reliable for wrapper-launched `codex exec --json` only. |
| TUI hook guidance | UI shows `/hooks` review/trust instruction before any hook success claim. |
| Already-open boundary | UI marks already-open Codex window auto-monitoring as unsupported. |
| Diagnostics | UI shows safe desktop/route/monitor/hook/last-state diagnostics. |
| Instance isolation | Default and unrelated pets are unchanged by onboarding diagnostics. |
| Redaction | Diagnostics and evidence do not leak sensitive fields. |
| Claim scan | Forbidden Codex readiness claims remain forbidden. |

## Required Redaction Scan

V6.2 diagnostics/evidence must not contain:

```text
token
Authorization
raw payload
raw JSONL payload
raw hook payload
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
```

## Required Functional Acceptance

Minimum accepted user flow:

1. Open Desktop Manager.
2. Choose "Create Codex Work-Cat".
3. Create or select one target PetInstance.
4. Copy recommended JSONL wrapper command.
5. Run the command locally.
6. Observe target cat state changes from JSONL monitor evidence.
7. Confirm default pet and unrelated pets remain unchanged.
8. Open TUI hooks path and confirm `/hooks` trust instruction is visible.
9. Open already-open Codex path and confirm it is explicitly unsupported for auto-monitoring.
10. Review diagnostics and confirm no sensitive fields are displayed.

## Required Checks

```bash
node scripts/v3_7_codex_exec_jsonl_monitor_smoke.mjs
node scripts/v4_4_managed_session_smoke.mjs
node scripts/v4_5_managed_tui_preflight_smoke.mjs
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
git diff --check --
```

## Pass / Block / Fail Rules

- `passed`: user flow, JSONL command copy, diagnostics, isolation, redaction, and claim scan pass.
- `blocked`: Codex CLI or desktop runtime unavailable; evidence remains blocked and no claim is made.
- `failed`: wrong pet receives events, unsupported already-open path is implied as ready, or diagnostics leak sensitive fields.

## Allowed Claim

```text
V6.2 Codex work-cat onboarding passed for tested local wrapper-managed scenarios.
```

