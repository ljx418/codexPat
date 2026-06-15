# V6.8 Developer Integration Guide

status: scoped-local-guide

date: 2026-05-30

## Local Event Contract

Supported local routes:

```text
/api/events
/api/instances/:instanceId/events
```

The legacy `/api/events` route targets the default pet. Instance-aware integrations should use `/api/instances/:instanceId/events` or `petctl notify --instance`.

## petctl Examples

```bash
node packages/petctl/dist/cli.js notify --instance <instanceId> --level running --title "Agent running"
node packages/petctl/dist/cli.js attach codex --name "Codex Cat"
```

Do not print tokens, Authorization headers, raw payloads, prompt text, tool command text, workspace paths, config paths, or local full paths in debugging output.

## Expected Failure Codes

```text
auth_missing
auth_invalid
instance_not_found
instance_id_invalid
instance_limit_reached
invalid_sound
```

## MCP Adapter Boundary

Minimal tools:

```text
pet_notify
pet_list_instances
pet_get_capabilities
pet_get_state
```

These tools are instance-aware where applicable and route through the localhost bridge. This guide does not claim MCP ready.

## Codex Paths

Reliable state path:

```text
petctl codex session start --mode exec --monitor jsonl --name "<cat>" -- codex exec --json "<task>"
```

Managed TUI hooks path requires `/hooks` review/trust.

Already-open Codex window auto-monitoring remains unsupported.

## Claim Boundary

Allowed after V6.8 acceptance:

```text
V6.8 developer integration documentation and local contract tooling passed for tested examples.
```

Forbidden:

```text
MCP ready
Third-party agent integration verified
all Codex workflows verified
```
