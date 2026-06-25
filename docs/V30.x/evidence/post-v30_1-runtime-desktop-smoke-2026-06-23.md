# Post-V30.1 Runtime Desktop Smoke Evidence

status: passed scoped
date: 2026-06-23

## Scope

This evidence records the Post-V30.1 runtime desktop smoke in the current
Windows host plus WSL shell environment. The real Tauri desktop app was started
on the Windows host, the local bridge health endpoint passed on the host, and
host-side `petctl` plus `v3_1_runtime_smoke.mjs` passed against the running
bridge with real runtime state.

This evidence does not claim managed Codex workflow verified, frontend refactor
completed, Tauri / HTTP bridge refactor completed, Windows ready,
cross-platform ready, production release ready, provider integration verified,
3D ready, Petdex parity achieved, or arbitrary-cat automatic animation ready.

## Environment

- OS / shell: WSL bash driving a Windows host desktop runtime.
- App start method: Windows host Tauri dev process with the frontend dev server
  already running.
- Bridge URL: `http://127.0.0.1:17321`.
- WSL loopback note: WSL direct curl to the bridge URL still failed while the
  Windows host health request passed. Runtime acceptance therefore used
  host-side bridge and CLI commands.
- Local environment remediation performed before pass:
  - Installed the Windows Rust toolchain and Tauri CLI needed to start the
    desktop runtime.
  - Added the missing Tauri Windows icon resource from the existing PNG icon.
  - Fixed Windows Node entry detection in `petctl`.
  - Fixed Windows path handling and spawn-output hardening in
    `v3_1_runtime_smoke.mjs`.
  - Repaired Windows-readable package links in local dependencies for host-side
    CLI execution.

## Commands Run

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
pnpm --filter @agent-desktop-pet/petctl build
curl --noproxy '*' -sS http://127.0.0.1:17321/api/health
Windows host health request to http://127.0.0.1:17321/api/health
Windows host petctl list --json
Windows host petctl notify --level success --title "Post-V30 runtime smoke"
Windows host petctl visibility diagnostics --instance default
Windows host node scripts/v3_1_runtime_smoke.mjs
```

## Results

| Check | Status | Notes |
| --- | --- | --- |
| Desktop unit tests | passed | 261 tests passed |
| Desktop TypeScript check | passed | `tsc --noEmit` passed |
| petctl tests | passed | 71 tests passed |
| V30 semantic gate | passed | weak transform-only baseline rejected; semantic candidate accepted |
| petctl build | passed | dist CLI built |
| App process running | passed | Windows host Tauri dev runtime started |
| Health endpoint | passed scoped | Windows host health returned ok/app/phase/listenAddress fields |
| WSL curl to bridge | blocked environment note | WSL direct loopback request could not connect although Windows host bridge was listening |
| petctl list | passed scoped | host-side JSON output contained the default instance with sanitized fields |
| petctl notify | passed scoped | host-side notify returned success exit code against real bridge |
| visibility diagnostics | passed scoped | host-side diagnostics returned success exit code against real bridge |
| V3.1 runtime smoke | passed | health, list, attach, route, reject, hard-limit, cleanup, and security redaction checks passed |

## Runtime Smoke Summary

`v3_1_runtime_smoke.mjs` passed with:

- pre-existing instance count: 1;
- default instance visible in list;
- two smoke instances attached and routed independently;
- explicit instance routing overrode environment instance routing;
- legacy notify kept default-route behavior;
- unknown and invalid instances rejected with stable reason codes;
- invalid sound path rejected and redacted;
- hard limit rejected the thirteenth pet;
- all smoke instances were detached during cleanup;
- security redaction scan passed.

## PRD / Spec Review

- Matches `docs/active/post-v30-runtime-smoke-spec.md`: yes.
- Matches `docs/V30.x/post-v30_1-runtime-desktop-smoke-development-and-acceptance-plan.md`: yes.
- Uses real runtime data instead of fixture-only evidence: yes.
- Does not expand V30 claim boundary: yes.
- Does not substitute documentation completion for runtime proof: yes.
- Does not attempt Post-V30.5 final gate: yes.
- Allows Post-V30.2 only because the same-session host bridge is currently
  running or can be freshly rechecked: yes.

## Claim Scan

Command:

```text
rg -n "Petdex parity achieved|automatic photo-to-animation ready for arbitrary cats|provider integration verified|3D ready|production signed release ready|Windows ready|cross-platform ready|MCP ready|Claude Code integration verified|all Codex workflows verified|OS-level Codex window binding ready|runtime desktop smoke passed|managed Codex workflow verified|frontend refactor completed|Tauri / HTTP bridge refactor completed" <touched-docs>
```

Result: passed. Matches appeared only in forbidden / not-ready /
must-not-claim contexts.

## Security Scan

Command:

```text
rg -n "token|Authorization|raw provider response|raw HTTP payload|raw photo bytes|raw JSONL|raw command text|raw prompt|TTY|terminal title|EXIF|GPS|api-token\\.json|private filename|full local path|workspace path|config path" <touched-docs>
```

Result: passed. Matches appeared only in safe-boundary, redaction,
troubleshooting, historical caveat, or runtime environment contexts. No token
value, Authorization value, raw payload, raw prompt, raw provider response,
photo bytes, or full local path is recorded in this evidence.

## Remaining Risks

- WSL cannot directly reach the Windows host bridge at the loopback URL in this
  session; host-side commands were required for runtime acceptance.
- The Windows host runtime pass is a scoped local runtime baseline, not a
  Windows-ready or cross-platform-ready claim.
- Post-V30.2 still needs its own execution plan, PRD/spec review, audit, and
  evidence before it can be marked passed.
- Frontend and Rust/Tauri architecture slices still require per-slice evidence
  before code movement.

## Decision

Post-V30.1 is passed scoped.

Post-V30.2 may start only after a same-session bridge health check passes, or
after a fresh host-side bridge check re-establishes the runtime prerequisite.
