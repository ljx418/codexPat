# V30 WSL Baseline Recovery Evidence

status: passed
date: 2026-06-23
environment: Windows host with WSL/Linux shell

## Scope

This subphase restores the requested local validation baseline in WSL after the
handoff checks exposed environment-specific test failures. It does not expand
the V30 product claim.

Allowed claim remains:

```text
V30 semantic 2D pet animation quality passed for tested local action packs with
storyboard, motion-readability QA, preview, target apply, and rollback evidence.
```

This evidence does not claim Petdex parity, arbitrary-cat automatic generation,
provider integration verification, 3D readiness, production release readiness,
Windows readiness, or cross-platform readiness.

## Changes

- `apps/desktop/src/assets/minimax-image-provider.test.ts`
  - Replaced hardcoded macOS `/private/tmp/...` test output paths with
    `join(tmpdir(), ...)` so provider boundary tests can run in WSL while still
    returning safe basename-only summaries.
- `packages/petctl/src/codex-bind.ts`
  - Added optional `platform` injection for bind preview so tests can simulate
    the macOS Terminal probe path without changing the production default.
- `packages/petctl/src/petctl.test.ts`
  - Passed `platform: "darwin"` in codex bind tests that already use fake
    macOS Terminal probe data.

## PRD / Spec Review

- V30 PRD boundary remains unchanged: semantic 2D quality is scoped to tested
  local action packs.
- MiniMax tests still verify provider consent, safe summaries, no raw prompt,
  no credential, no provider URL leakage, and reference-image request shape.
- `petctl codex bind` remains a macOS Terminal active-window capability. The
  WSL test path only simulates macOS through injected test doubles and must not
  be treated as Windows or cross-platform runtime proof.
- No runtime desktop smoke was performed in this subphase.

## Validation

```text
pnpm --filter desktop exec node --test --import tsx src/assets/minimax-image-provider.test.ts
passed: 9/9

pnpm --filter @agent-desktop-pet/petctl test
passed: 71/71

pnpm --filter desktop test
passed: 261/261

pnpm --filter desktop check
passed

pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
passed
weak baseline: failed/rejected
semantic candidate: passed
claim scan: passed
security scan: passed
```

## Safety Scan

Commands:

```text
git diff --check -- apps/desktop/src/assets/minimax-image-provider.test.ts packages/petctl/src/codex-bind.ts packages/petctl/src/petctl.test.ts
rg -n "/private/tmp|Authorization\\s*[:=]|api[_-]?key\\s*[:=]|raw provider response|raw prompt|raw photo|EXIF|GPS" apps/desktop/src/assets/minimax-image-provider.test.ts packages/petctl/src/codex-bind.ts packages/petctl/src/petctl.test.ts
```

Result:

- `git diff --check`: passed.
- No `/private/tmp` hardcoded output path remains in the touched files.
- The remaining scan hits are negative test assertions that ensure safe
  summaries do not contain raw prompt, provider response, Authorization, or
  test credential strings.

## Claim Scan

Command:

```text
rg -n "Petdex parity achieved|arbitrary cats automatic|automatic photo-to-animation ready|automatic photo-to-2D ready|provider integration verified|3D ready|production release ready|Windows ready|cross-platform ready" apps/desktop/src/assets/minimax-image-provider.test.ts packages/petctl/src/codex-bind.ts packages/petctl/src/petctl.test.ts
```

Result: no matches.

## Remaining Risk

- The desktop app was not started; no real runtime window or active-window
  binding evidence was generated.
- Provider tests are mocked boundary tests. They do not verify live provider
  integration.
- WSL validation passing does not prove Windows desktop packaging or
  cross-platform readiness.
