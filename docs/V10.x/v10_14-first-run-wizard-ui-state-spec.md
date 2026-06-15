# V10.14 First-run Wizard UI and State Spec

status: planned
date: 2026-06-05

## Goal

Define a first-run wizard that lets an ordinary local user create a visible pet
or Codex work-cat without reading README or historical phase docs.

## Wizard Entry Rules

Show the wizard when:

- no onboarding completion flag exists.
- user opens Settings and chooses `Start setup again`.

Do not show automatically when:

- the app is opened only for diagnostics export.
- tests set a bypass flag.

Completion flag:

```text
settings.onboarding.v10_14_completed_at
```

The flag stores only an ISO timestamp. It must not store prompt text, raw
command payload, token, Authorization, workspace path, config path, or full
local path.

## Wizard State Model

```ts
type FirstRunWizardStep =
  | "welcome"
  | "choose_pet"
  | "choose_mode"
  | "codex_command"
  | "test_reaction"
  | "done";

type FirstRunWizardMode = "desktop_pet" | "codex_work_cat";

interface FirstRunWizardState {
  step: FirstRunWizardStep;
  selectedPackId: string;
  mode: FirstRunWizardMode | null;
  createdInstanceId: string | null;
  testEventResult: "not_run" | "accepted" | "failed";
  unsupportedNoticesAccepted: boolean;
  completedAt: string | null;
}
```

## Screen Requirements

| Step | Required UI | Exit condition |
| --- | --- | --- |
| welcome | product summary, no readiness overclaim | user continues |
| choose_pet | preview at least 6 bundled cats | user selects pack |
| choose_mode | default pet or Codex work-cat | user selects mode |
| codex_command | copyable wrapper JSONL command and already-open unsupported notice | notice accepted and command copied or skipped with visible warning |
| test_reaction | send local test event to target instance only | visible target state change or stable failure |
| done | summary and reopen settings link | completion flag stored |

## Step Count Acceptance

- Default desktop pet path: visible pet in <=3 user actions after welcome.
- Codex work-cat path: visible target reaction in <=5 user actions after
  welcome.
- Main path must not require README, CLI docs, manual token lookup, or manual
  API calls.

## Command Copy

Recommended command must use wrapper-launched JSONL monitoring:

```text
node packages/petctl/dist/cli.js codex session start --mode exec --monitor jsonl --name "<cat name>" -- codex exec --json "<prompt>"
```

The UI must explain:

- this is the reliable path for state mapping.
- already-open Codex windows are not auto-monitored.
- no terminal text parsing is used.

## Reason Codes

Stable failure reason codes:

- `pet_create_failed`
- `desktop_not_running`
- `test_event_failed`
- `pack_not_available`
- `unsupported_notice_required`
- `copy_command_failed`
- `onboarding_state_invalid`

## Safety

The wizard must not:

- install hooks silently.
- enable MCP silently.
- send PetEvent to default if a target instance was created.
- persist prompt text, tool command, token, Authorization, raw payload, workspace
  path, config path, or full local path.

## Evidence Requirements

- first-run wizard screenshot sequence.
- test reaction runtime screenshot.
- step-count report.
- sanitized wizard state snapshot.
- security and claim scan.

