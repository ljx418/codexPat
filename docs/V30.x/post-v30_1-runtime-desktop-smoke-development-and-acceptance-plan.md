# Post-V30.1 Runtime Desktop Smoke Development And Acceptance Plan

文档状态：active subphase plan。
当前日期：2026-06-23。

## Purpose

Post-V30.1 is the first executable phase after documentation review. Its job is
to prove, with real local evidence, whether the desktop app is running and the
local bridge can be reached from the current WSL/Windows test environment.

This plan does not claim Windows ready, cross-platform ready, production
release ready, provider integration verified, 3D ready, managed Codex workflow
verified, or arbitrary-cat automatic animation ready.

## PRD / Architecture Link

This phase supports the Post-V30 PRD target experience:

- desktop app runtime state is proven with real local evidence or blocked with
  stable environment reason；
- local bridge is validated through health, `petctl list`, `petctl notify`,
  and diagnostics；
- later managed Codex workflow is not attempted until a running bridge exists。

This phase supports the target architecture Runtime Smoke Layer:

```text
real desktop app process
  -> local bridge health
  -> petctl list / notify / diagnostics
  -> v3_1 runtime smoke
  -> evidence / scan gate
```

## Entry Criteria

- Dependencies are installed.
- Baseline commands can run in WSL or have stable blocked reasons.
- A real desktop app can be started, or environment limitations are recorded.
- `127.0.0.1:17321` is the bridge URL for this smoke.

## Development Actions

1. Run baseline regression commands.
2. Start or verify the real desktop app.
3. Run bridge health check.
4. Build petctl.
5. Run petctl list, notify, and visibility diagnostics.
6. Run `scripts/v3_1_runtime_smoke.mjs`.
7. Record evidence and scans.

## Required Commands

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
curl -sS http://127.0.0.1:17321/api/health
pnpm --filter @agent-desktop-pet/petctl build
pnpm --filter @agent-desktop-pet/petctl petctl -- list
pnpm --filter @agent-desktop-pet/petctl petctl -- notify --level success --title "Post-V30 runtime smoke"
pnpm --filter @agent-desktop-pet/petctl petctl -- visibility diagnostics --instance default
node scripts/v3_1_runtime_smoke.mjs
```

## Acceptance

Pass only if:

- real desktop app is running；
- bridge health succeeds；
- `petctl list`, `petctl notify`, and visibility diagnostics return sanitized
  results；
- V3.1 runtime smoke passes；
- baseline commands pass；
- PRD/spec review, claim scan, and security scan pass。

Blocked when:

- GUI startup is impossible；
- WSL cannot reach the host bridge；
- required platform prerequisites are unavailable。

Failed when:

- prerequisites are available but runtime behavior violates the spec；
- evidence would require a forbidden ready claim；
- evidence exposes sensitive values。

## Audit Opinion Before Execution

No fatal or major specification deviation is present. The subphase can proceed
to execution because it is scoped to Post-V30.1 runtime evidence and does not
attempt Post-V30.2, architecture refactor, or Post-V30.5 final gate.
