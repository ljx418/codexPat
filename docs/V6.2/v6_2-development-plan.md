# V6.2 Codex Work-Cat Product UX Development Plan

status: planning-ready

date: 2026-05-30

## Goal

Make the accepted Codex monitoring paths understandable and usable from Desktop Manager so a user can create a Codex work-cat without needing to infer the right CLI flow.

V6.2 productizes wrapper-managed onboarding. It does not create already-open Codex auto-monitoring and does not verify all Codex workflows.

## Required UX Paths

### Path 1: wrapper-launched exec JSONL

Label as the recommended reliable path.

Required behavior:

- Desktop Manager shows this as the default recommended mode.
- UI generates a copyable wrapper command using the target PetInstance.
- Command uses the existing wrapper-managed `codex exec --json` state mapping path.
- Explanation says it maps structured JSONL events only and does not parse terminal text or read `transcript_path`.

### Path 2: managed TUI hooks

Label as an advanced/manual trust path.

Required behavior:

- UI explains that managed TUI hooks require `/hooks` review/trust in Codex.
- UI shows trust instructions before any success claim.
- UI states PermissionRequest may be not observed depending on local policy.
- UI must not imply broad interactive TUI monitoring readiness.

### Path 3: already-open Codex window

Label as unsupported for automatic monitoring.

Required behavior:

- UI clearly states already-open Codex windows cannot currently be auto-monitored.
- OS-level discovery / manual route-test is not lifecycle monitoring.
- Recommended fallback is wrapper-launched JSONL or managed TUI hooks.

## Development Content

- Desktop Manager entry: "Create Codex Work-Cat".
- Create or select target PetInstance.
- Show mode selector or clearly separated cards for JSONL, TUI hooks, and already-open window.
- Generate copyable JSONL wrapper command.
- Generate copyable managed TUI hook command.
- Add diagnostics panel:
  - desktop health.
  - target instance.
  - instance route.
  - JSONL monitor status / command readiness.
  - hook config status / trust instruction.
  - last accepted event.
  - last state.
  - redaction status.
- Ensure default and unrelated pets are not affected during onboarding previews or diagnostics.

## Out Of Scope

- already-open Codex window automatic monitoring.
- OS-level lifecycle routing.
- all Codex workflows verification.
- broad interactive TUI monitoring readiness.
- parsing terminal text.
- reading transcript paths.

## Allowed Claim

```text
V6.2 Codex work-cat onboarding passed for tested local wrapper-managed scenarios.
```

## Forbidden Claims

```text
all Codex workflows verified
OS-level Codex window binding ready
already-open Codex auto-monitoring ready
interactive Codex TUI monitoring ready
```

