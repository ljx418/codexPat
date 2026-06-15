# V6.2 Plan Audit

status: passed-for-planning

date: 2026-05-30

## Audit Focus

- wrapper-managed path vs already-open auto-monitoring.
- TUI hook trust false-green.
- wrong-pet routing.
- diagnostic leakage.

## Findings

| Finding | Severity | Decision |
| --- | --- | --- |
| JSONL onboarding could be misread as all Codex workflows verified. | Medium | Claim matrix limits scope to tested wrapper-managed scenarios. |
| TUI hook guidance could look like hook lifecycle acceptance. | Medium | Acceptance requires `/hooks` trust instruction and forbids false success. |
| Already-open window could be implied as supported. | Medium | UI must label auto-monitoring unsupported. |
| Diagnostics could leak prompts/commands/paths. | Medium | Redaction scan is a hard acceptance gate. |
| Onboarding diagnostics could affect wrong pet. | Medium | Instance isolation is required. |

## Go / No-Go

V6.2 planning: Go.

V6.2 implementation: Go only for Desktop Manager onboarding, copyable wrapper commands, trust guidance, unsupported already-open explanation, and sanitized diagnostics.

V6 Productization Gate: No-Go.

