# Post-V30 Managed Codex Workflow Smoke Spec

文档状态：active execution spec。
当前日期：2026-06-23。

## Purpose

Post-V30.2 proves that the existing managed Codex workflow can drive the
desktop pet through the running local bridge in a tested local wrapper-launched
scenario. It depends on Post-V30.1 runtime desktop smoke.

This spec does not claim all Codex workflows verified, OS-level Codex window
binding ready, Claude Code integration verified, MCP ready, Windows ready,
cross-platform ready, or production release ready.

## Preconditions

- Post-V30.1 has passed or a fresh runtime bridge check has passed in the same
  session.
- The desktop app is running and `127.0.0.1:17321` is reachable.
- The Codex CLI and petctl commands used by the existing V4.x managed workflow
  are available in the local environment.

## Required Smoke Commands

Run from the repository root:

```bash
node scripts/v4_4_managed_session_smoke.mjs
pnpm --filter @agent-desktop-pet/petctl test
```

If the managed smoke reports environment or Codex CLI unavailability, record
the exact stable reason and mark Post-V30.2 as `blocked`. Do not replace it
with fixture-only evidence.

## Pass Criteria

- Managed session smoke passes against the running desktop bridge.
- Petctl tests still pass after the managed smoke.
- Evidence records one tested local wrapper-launched scenario only.
- No evidence contains raw prompt text, raw JSONL, raw command text, token,
  Authorization value, terminal title, TTY, workspace path, or config path.

## Blocked Criteria

Mark Post-V30.2 as `blocked`, not failed, when:

- Post-V30.1 runtime bridge is unavailable.
- Codex CLI is unavailable in the local environment.
- The local environment cannot run wrapper-launched Codex sessions.

Mark as `failed` only when prerequisites are available and the managed workflow
itself returns an unexpected product-level error.

## Evidence

Use:

```text
docs/V30.x/evidence/post-v30_2-managed-codex-workflow-smoke-TEMPLATE.md
```

The final evidence file should be named:

```text
docs/V30.x/evidence/post-v30_2-managed-codex-workflow-smoke-YYYY-MM-DD.md
```

Before closing Post-V30.2, run PRD/spec review, claim scan, and security scan
using `docs/active/post-v30-evidence-and-scan-checklist.md`.
