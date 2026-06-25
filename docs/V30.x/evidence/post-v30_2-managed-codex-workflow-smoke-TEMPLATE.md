# Post-V30.2 Managed Codex Workflow Smoke Evidence

status: pending
date: YYYY-MM-DD

## Scope

Prove a tested local wrapper-launched managed Codex workflow against a running
desktop bridge.

This evidence does not claim all Codex workflows verified, OS-level Codex
window binding ready, Claude Code integration verified, MCP ready, Windows
ready, cross-platform ready, or production release ready.

## Preconditions

- Post-V30.1 runtime bridge check status:
- Codex CLI availability:
- Bridge URL: `http://127.0.0.1:17321`

## Commands Run

```text
node scripts/v4_4_managed_session_smoke.mjs
pnpm --filter @agent-desktop-pet/petctl test
```

## Results

| Check | Status | Notes |
| --- | --- | --- |
| Runtime bridge available | pending |  |
| Managed session smoke | pending |  |
| petctl tests | pending |  |

## PRD / Spec Review

- Matches `docs/active/post-v30-managed-codex-smoke-spec.md`: pending.
- Does not expand V30 or V4.x claim boundaries: pending.
- Does not use fixture-only evidence as lifecycle evidence: pending.

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

## Remaining Risks

-

## Decision

pending
