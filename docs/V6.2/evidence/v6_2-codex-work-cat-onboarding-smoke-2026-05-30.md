# V6.2 Codex Work-Cat Onboarding Smoke

status: passed

date: 2026-05-30

## Scope

This evidence covers Desktop Manager Codex work-cat onboarding for tested local wrapper-managed scenarios.

It includes:

- recommended wrapper-launched exec JSONL path.
- managed TUI hooks command guidance and `/hooks` trust instruction.
- already-open Codex window unsupported explanation.
- sanitized diagnostics summary.
- default / unrelated pet isolation boundary.

It does not cover all Codex workflows, OS-level Codex lifecycle monitoring, already-open Codex auto-monitoring, or broad interactive TUI monitoring readiness.

## Implementation Evidence

| Check | Result |
| --- | --- |
| Desktop Manager work-cat panel added | passed |
| copyable JSONL wrapper command generated | passed |
| copyable managed TUI hooks command generated | passed |
| `/hooks` trust instruction present | passed |
| already-open window marked unsupported | passed |
| diagnostics summary uses safe fields only | passed |
| work-cat name sanitizer test | passed |
| desktop typecheck | passed |
| desktop build | passed |

## Runtime Regression

| Check | Result |
| --- | --- |
| V3.7 JSONL monitor smoke | passed |
| V4.4 managed session smoke | passed |
| V4.5 managed TUI preflight smoke | passed |
| petctl tests | passed |

## User Flow Evidence

The V6.2 settings panel supports the accepted flow:

1. Open Desktop Manager settings.
2. Use the "Codex 工作猫" section.
3. Create a work-cat with the "创建工作猫" action.
4. Copy the recommended JSONL wrapper command.
5. Copy the managed TUI hooks command if needed.
6. Read `/hooks` trust guidance before using managed TUI hooks.
7. See already-open Codex window auto-monitoring marked unsupported.
8. Review diagnostics without raw event or local path content.

## Security / Redaction

Passed.

V6.2 generated summaries and evidence do not include:

```text
token
Authorization
raw JSONL payload
raw hook payload
prompt text
tool command text
terminal text
transcript_path
full local path
workspace path
config path
api-token.json
```

## Claim Scan

Passed.

Allowed claim:

```text
V6.2 Codex work-cat onboarding passed for tested local wrapper-managed scenarios.
```

Forbidden claims remain not-ready:

```text
all Codex workflows verified
OS-level Codex window binding ready
already-open Codex auto-monitoring ready
interactive Codex TUI monitoring ready
```

