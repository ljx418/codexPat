# Post-V30.1 Runtime Desktop Smoke Evidence

status: pending
date: YYYY-MM-DD

## Scope

Prove that the desktop app is running and the local bridge is reachable in the
current environment.

This evidence does not claim Windows ready, cross-platform ready, production
release ready, provider integration verified, 3D ready, or arbitrary-cat
automatic animation ready.

## Environment

- OS / shell:
- App start method:
- Bridge URL: `http://127.0.0.1:17321`
- WSL loopback notes, if applicable:

## Commands Run

```text
curl -sS http://127.0.0.1:17321/api/health
pnpm --filter @agent-desktop-pet/petctl build
pnpm --filter @agent-desktop-pet/petctl petctl -- list
pnpm --filter @agent-desktop-pet/petctl petctl -- notify --level success --title "Post-V30 runtime smoke"
pnpm --filter @agent-desktop-pet/petctl petctl -- visibility diagnostics --instance default
node scripts/v3_1_runtime_smoke.mjs
```

## Results

| Check | Status | Notes |
| --- | --- | --- |
| App process running | pending |  |
| Health endpoint | pending |  |
| petctl build | pending |  |
| petctl list | pending |  |
| petctl notify | pending |  |
| visibility diagnostics | pending |  |
| V3.1 runtime smoke | pending |  |

## PRD / Spec Review

- Matches `docs/active/post-v30-runtime-smoke-spec.md`: pending.
- Does not expand V30 claim boundary: pending.
- Does not substitute static tests for runtime proof: pending.

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
