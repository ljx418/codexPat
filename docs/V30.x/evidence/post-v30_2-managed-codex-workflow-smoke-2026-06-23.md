# Post-V30.2 Managed Codex Workflow Smoke Evidence

status: passed scoped
date: 2026-06-23

## Scope

This evidence records Post-V30.2 managed Codex workflow smoke against the
running local desktop bridge from the Post-V30.1 same-session runtime. The
smoke used local wrapper-launched fake Codex JSONL scenarios to validate the
managed session wrapper, bridge routing, event-to-state mapping, failure
mapping, cleanup, claim scan, and security scan.

This evidence does not claim all Codex workflows verified, OS-level Codex
window binding ready, Claude Code integration verified, MCP ready, Windows
ready, cross-platform ready, production release ready, provider integration
verified, 3D ready, Petdex parity achieved, or arbitrary-cat automatic
animation ready.

## Preconditions

- Post-V30.1 runtime bridge check status: passed scoped.
- Fresh same-session host-side bridge health: passed.
- Bridge URL: `http://127.0.0.1:17321`.
- Execution mode: Windows host-side Node and petctl against the real running
  bridge, because WSL direct loopback remained unavailable in this session.
- Pre-execution audit:
  `docs/V30.x/evidence/post-v30_2-pre-execution-audit-2026-06-23.md`.

## Commands Run

```text
Windows host health request to http://127.0.0.1:17321/api/health
Windows host node scripts/v4_4_managed_session_smoke.mjs
pnpm --filter @agent-desktop-pet/petctl test
```

## Results

| Check | Status | Notes |
| --- | --- | --- |
| Runtime bridge available | passed | fresh host health returned ok/app/phase/listenAddress fields |
| Managed session smoke | passed | simple, tool-success, and tool-failure local wrapper scenarios passed |
| Cleanup | passed | all smoke-created instances detached |
| Security redaction scan | passed | managed smoke reported no sensitive output |
| Claim scan | passed | managed smoke reported no forbidden ready claim |
| petctl tests | passed | 71 tests passed |

## Managed Smoke Summary

The managed smoke passed these real bridge checks:

- desktop health passed;
- rate-limit window settled before managed session execution;
- simple managed session exited 0;
- simple session recorded `exec` mode and a managed binding id;
- simple session observed `turn.started`, mapped `thinking`, and ended in
  `success`;
- tool-success session observed `item.started`, mapped `running`, and ended in
  `success`;
- tool-failure session returned the expected `codex_process_failed` reason,
  observed structured failure, marked failure in the summary, and ended in
  `error`;
- all smoke instances were detached;
- managed smoke claim and security scans passed.

## PRD / Spec Review

- Matches `docs/active/agent_desktop_pet_prd_post_v30.md`: yes.
- Matches `docs/active/post-v30-managed-codex-smoke-spec.md`: yes.
- Uses a running bridge instead of fixture-only lifecycle evidence: yes.
- Does not expand V30 or V4.x claim boundaries: yes.
- Does not claim all Codex workflows verified: yes.
- Does not attempt Post-V30.5 final gate: yes.

## Implementation Notes

Before execution, `v4_4_managed_session_smoke.mjs` was updated to use
platform-correct file URL path conversion for host-side execution. This closed
the major pre-execution audit finding and did not change the managed workflow
contract.

## Claim Scan

Command:

```text
rg -n "Petdex parity achieved|automatic photo-to-animation ready for arbitrary cats|provider integration verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|all Codex workflows verified|OS-level Codex window binding ready" <touched-docs>
```

Result: passed. Matches appeared only in forbidden / not-ready /
must-not-claim contexts.

## Security Scan

Command:

```text
rg -n "token|Authorization|raw provider response|raw HTTP payload|raw photo bytes|raw JSONL|raw command text|raw prompt|TTY|terminal title|EXIF|GPS|api-token\\.json|private filename|full local path|workspace path|config path" <touched-docs>
```

Result: passed. Matches appeared only in safe-boundary, redaction,
troubleshooting, historical caveat, or runtime environment contexts. This
evidence records no token value, Authorization value, raw JSONL, raw prompt,
raw command text, terminal title, TTY, workspace path, config path, full local
path, raw provider response, raw HTTP payload, or raw photo bytes.

## Remaining Risks

- This is one tested local wrapper-launched managed workflow smoke; it is not
  evidence for all Codex workflows.
- The smoke uses controlled local fake Codex JSONL scenarios and does not prove
  OS-level binding to already-open Codex windows.
- WSL direct loopback remained unavailable, so host-side execution was required
  for real bridge access.
- Post-V30.3 and Post-V30.4 still require per-slice evidence before code
  movement.

## Decision

Post-V30.2 is passed scoped.

Post-V30.3 may proceed only with frontend slice planning, PRD/spec review,
per-slice pre-execution evidence, and claim/security scans before any code
movement.
