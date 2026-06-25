# Post-V30 Architecture Slice Evidence

status: pending
date: YYYY-MM-DD
slice-id: pending

## Scope

Document one architecture debt slice before implementation. This template is
for Post-V30.3 and Post-V30.4 planning evidence; it does not approve code
movement by itself.

## Slice Definition

- Target subsystem:
- Current hotspot:
- Proposed module boundary:
- Public interface changes:
- Files expected to change:
- Files explicitly out of scope:

## Before / After Test Plan

Before code movement:

```text
pending
```

After code movement:

```text
pending
```

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Regression in runtime state | pending |
| Bridge/auth behavior change | pending |
| UI behavior change | pending |
| Evidence overclaim | pending |

## PRD / Spec Review

- Matches `docs/active/architecture-remediation-plan.md`: pending.
- Does not expand V30 claim boundary: pending.
- Defines tests before code movement: pending.

## Claim Scan

Command:

```text
rg -n "Petdex parity achieved|automatic photo-to-animation ready for arbitrary cats|provider integration verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|all Codex workflows verified|OS-level Codex window binding ready" <touched-docs>
```

Result:

## Security Scan

Command:

```text
rg -n "token|Authorization|raw provider response|raw HTTP payload|raw photo bytes|raw JSONL|raw command text|raw prompt|TTY|terminal title|EXIF|GPS|api-token\\.json|private filename|full local path|workspace path|config path" <touched-docs>
```

Result:

## Decision

pending
