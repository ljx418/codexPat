# Post-V30.2 Managed Codex Workflow Smoke Development And Acceptance Plan

status: active
date: 2026-06-23

## Objective

Post-V30.2 proves one tested local wrapper-launched managed Codex workflow
against a running desktop bridge. It builds on Post-V30.1 runtime evidence and
does not expand the product claim boundary.

The target maintainer experience after this subphase:

- a fresh same-session bridge check is available;
- the managed session smoke runs against the real local bridge;
- the workflow maps safe managed-session events to pet states;
- cleanup removes smoke-created instances;
- evidence explains pass, blocked, or failed state without recording sensitive
  runtime data.

## Source Specs

- PRD: `docs/active/agent_desktop_pet_prd_post_v30.md`
- Execution spec: `docs/active/post-v30-managed-codex-smoke-spec.md`
- Evidence checklist: `docs/active/post-v30-evidence-and-scan-checklist.md`
- Prior prerequisite evidence:
  `docs/V30.x/evidence/post-v30_1-runtime-desktop-smoke-2026-06-23.md`

## Development Plan

| Step | Action | Exit |
| --- | --- | --- |
| 1 | Recheck same-session host bridge health | host health returns ok |
| 2 | Confirm managed smoke script can run on the host runtime path | no Windows path/cwd blocker remains |
| 3 | Run managed session smoke against the real bridge | `node scripts/v4_4_managed_session_smoke.mjs` returns passed, blocked, or failed |
| 4 | Run petctl regression | 71 petctl tests pass |
| 5 | Write evidence | `post-v30_2-managed-codex-workflow-smoke-2026-06-23.md` exists |
| 6 | Run PRD/spec review, claim scan, and security scan | no fatal or major audit issue remains |

## Acceptance Criteria

Pass only if:

- the desktop bridge is reachable in the execution environment;
- managed session smoke passes against the running bridge;
- simple, tool-success, and tool-failure wrapper-launched scenarios are
  represented by safe event/state observations;
- smoke-created instances are cleaned up;
- petctl regression still passes;
- evidence contains no token value, Authorization value, raw JSONL, raw prompt,
  raw command text, terminal title, TTY, workspace path, config path, or full
  local path.

Blocked if:

- the bridge is no longer reachable;
- the host cannot execute the managed smoke due stable local environment
  constraints;
- wrapper-launched session prerequisites are unavailable.

Failed if:

- prerequisites are available but managed workflow behavior violates the spec;
- cleanup fails and leaves smoke-created instances;
- claim or security scan finds a real violation.

## Audit Notes Before Execution

- Post-V30.2 must not be used to claim all Codex workflows verified.
- The smoke uses local fake Codex JSONL scenarios to validate the managed
  wrapper and bridge behavior; it is not provider, MCP, Claude Code, OS-level
  window binding, production, Windows-ready, or cross-platform evidence.
- Because this environment is WSL driving a Windows host runtime, host-side
  execution is acceptable when WSL loopback cannot reach the bridge.

## Required Evidence

`docs/V30.x/evidence/post-v30_2-managed-codex-workflow-smoke-2026-06-23.md`
