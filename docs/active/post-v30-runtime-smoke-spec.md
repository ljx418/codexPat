# Post-V30 Runtime Desktop Smoke Spec

文档状态：active execution spec。
当前日期：2026-06-23。

## Purpose

Post-V30.1 proves that the desktop app is really running and that the local
HTTP bridge is reachable. This is runtime evidence, separate from WSL static
tests, TypeScript checks, and V30 semantic animation smoke.

This spec does not claim Windows ready, cross-platform ready, production
release ready, provider integration verified, 3D ready, or arbitrary-cat
automatic animation ready.

## Preconditions

- Dependencies are installed in the same environment that runs the commands.
- The desktop app is started either as local unsigned app or with:

```bash
pnpm --filter desktop tauri dev
```

- `127.0.0.1:17321` is reachable from the shell where the smoke runs.
- If running from WSL while the app is outside WSL, first verify loopback access
  before interpreting any `desktop_not_running` result as product behavior.

## Required Smoke Commands

Run from the repository root after the app is running:

```bash
curl -sS http://127.0.0.1:17321/api/health
pnpm --filter @agent-desktop-pet/petctl build
pnpm --filter @agent-desktop-pet/petctl petctl -- list
pnpm --filter @agent-desktop-pet/petctl petctl -- notify --level success --title "Post-V30 runtime smoke"
pnpm --filter @agent-desktop-pet/petctl petctl -- visibility diagnostics --instance default
node scripts/v3_1_runtime_smoke.mjs
```

If the exact `petctl exec petctl` wrapper is not available in the local
workspace, use the repository's current petctl invocation documented in
`docs/reference/petctl-recipes.md` and record the exact command in evidence.

## Pass Criteria

- Health endpoint returns a successful JSON response from the desktop app.
- petctl build completes and produces the dist CLI expected by legacy smoke
  scripts.
- `petctl list` returns sanitized instance data or a clear empty-state response.
- `petctl notify` is accepted by the bridge and does not expose token values.
- Visibility diagnostics returns sanitized window/instance diagnostics.
- `scripts/v3_1_runtime_smoke.mjs` passes.
- Evidence records the app start method, command results, and environment
  boundary without raw token, raw HTTP payload, private path, or config path.

## Blocked Criteria

Mark Post-V30.1 as `blocked`, not failed, when:

- GUI app startup is not possible in the current environment.
- WSL cannot reach the desktop bridge running outside WSL.
- The desktop app cannot be started because platform GUI prerequisites are
  unavailable.

Mark as `failed` only when the app is running, the bridge is reachable, and a
required runtime behavior returns an unexpected product-level error.

## Evidence

Use:

```text
docs/V30.x/evidence/post-v30_1-runtime-desktop-smoke-TEMPLATE.md
```

The final evidence file should be named:

```text
docs/V30.x/evidence/post-v30_1-runtime-desktop-smoke-YYYY-MM-DD.md
```

Before closing Post-V30.1, run PRD/spec review, claim scan, and security scan
using `docs/active/post-v30-evidence-and-scan-checklist.md`.
