# V13 Visual Asset Cleanup

status: passed
date: 2026-06-09

## Scope

This cleanup organizes active visual assets and current reusable manual fixtures. It does not change Codex monitoring semantics, renderer claim boundaries, provider/photo-to-3D claims, or production release claims.

## Changes

- Added `petctl asset rename` for safe user-facing asset display name cleanup.
- Added `petctl asset delete` for removing stale app-managed imported packs.
- Added canonical fixture directory: `fixtures/manual/visual-assets/`.
- Added active inventory document: `docs/active/visual-asset-inventory.md`.
- Repointed current scripts and desktop tests to canonical fixture paths.

## Canonical Fixture Paths

| Pack ID | Renderer | Path |
| --- | --- | --- |
| `imported-static-orange-tabby-v1` | sprite | `fixtures/manual/visual-assets/imported-static-orange-tabby-v1/manifest.json` |
| `imported-animated-qa-cat-v1` | sprite | `fixtures/manual/visual-assets/imported-animated-qa-cat-v1/manifest.json` |
| `imported-gltf-prototype-cat-v1` | gltf | `fixtures/manual/visual-assets/imported-gltf-prototype-cat-v1/manifest.json` |

## App-managed Runtime Storage Result

The active app-managed asset list now contains only:

| Pack ID | Display Name | Renderer | Active Instance |
| --- | --- | --- | --- |
| `imported-static-orange-tabby-v1` | `橘猫状态图包（静态）` | sprite | `default` |

Removed stale or duplicate phase-named packs:

- `v7-10-minimax-orange-tabby-actions`
- `orange-tabby-actions-v1`
- `v5-12-runtime-sprite`
- `v5-12-runtime-gltf`

## Verification

| Check | Result |
| --- | --- |
| `pnpm --filter @agent-desktop-pet/petctl check` | passed |
| `pnpm --filter @agent-desktop-pet/petctl test` | passed, 69 tests |
| `pnpm --filter @agent-desktop-pet/petctl build` | passed |
| `pnpm --filter desktop test` | passed, 129 tests |
| `pnpm --filter desktop check` | passed |
| `node packages/petctl/dist/cli.js asset list --json` | passed, one active app-managed pack |
| desktop screenshot | passed, visible pet retained at `docs/V13.x/evidence/screenshots/v13_visual_asset_cleanup_desktop_2026-06-09.png` |

## Security Scan

Evidence and CLI results record only safe pack IDs, display names, renderer kinds, copied asset IDs, manifest hashes, creation timestamps, and active instance IDs.

No token, Authorization header, raw payload, prompt text, provider payload, config path, workspace path, or full local path is recorded here.

## Claim Boundary

Allowed cleanup claim:

`Visual asset naming and active app-managed asset storage have been organized for the current local runtime.`

Still not claimed:

- `3D ready`
- `automatic photo-to-3D ready`
- `provider integration verified`
- `production signed release ready`
- `cross-platform ready`
- `Windows ready`
