# Visual Asset Inventory

status: active
date: 2026-06-09

## Current Naming Rule

Visual asset names must describe user-visible purpose, renderer type, and version. Historical phase numbers are allowed only in archived evidence paths.

Use these pack ID patterns:

- Bundled runtime packs: `living-work-cat-v1`, `work-cat-v1`, `premium-*`, `sprite-v3-animated`, `gltf-prototype-cat`.
- Imported fixture packs: `imported-static-*`, `imported-animated-*`, `imported-gltf-*`.
- Legacy fallback packs: `sprite-v2`, `css-default`.

Display names should be readable by a normal user. Avoid names such as `V5.12 Runtime Sprite Cat` or `V7.10 MiniMax Actions` in active asset storage.

## Canonical Manual Fixture Packs

| Pack ID | Renderer | Canonical Path | Use |
| --- | --- | --- | --- |
| `imported-static-orange-tabby-v1` | sprite | `fixtures/manual/visual-assets/imported-static-orange-tabby-v1/manifest.json` | Static orange tabby state images for import/runtime QA. |
| `imported-animated-qa-cat-v1` | sprite | `fixtures/manual/visual-assets/imported-animated-qa-cat-v1/manifest.json` | Multi-frame animated sprite QA fixture. |
| `imported-gltf-prototype-cat-v1` | gltf | `fixtures/manual/visual-assets/imported-gltf-prototype-cat-v1/manifest.json` | Project-authored GLTF prototype cat fixture. |

## Bundled Runtime Packs

| Pack ID | Renderer | Status | Notes |
| --- | --- | --- | --- |
| `living-work-cat-v1` | sprite | active target | V11 living interaction pack. |
| `work-cat-v1` | sprite | active/bundled | Product-grade work-cat sprite baseline. |
| `sprite-v3-animated` | sprite | baseline | V10 animated 2D baseline, not final product-grade evidence by itself. |
| `sprite-v2` | sprite | fallback | Legacy fallback only. |
| `gltf-prototype-cat` | gltf | prototype | Local bundled 3D prototype, not `3D ready`. |
| `css-default` | css | fallback | Always-visible safe fallback. |

## Legacy Evidence Paths

These directories remain for historical evidence and regression compatibility. Do not use them as new active import paths:

- `fixtures/manual/v5_12/*`
- `fixtures/manual/v7_10/*`
- `fixtures/manual/v8_11/*`

## App-managed Storage Cleanup Rule

For current user-visible storage, keep only packs that are intentionally active or needed for a current manual acceptance run. Remove stale phase-named packs with:

```bash
node packages/petctl/dist/cli.js asset delete --pack <packId> --json
```

Rename safe active packs with:

```bash
node packages/petctl/dist/cli.js asset rename --pack <packId> --name "<display name>" --json
```

Deletion and rename commands must not print tokens, full local paths, raw payloads, prompt text, provider payloads, or config paths.
