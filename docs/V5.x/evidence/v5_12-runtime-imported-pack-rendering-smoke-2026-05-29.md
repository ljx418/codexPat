# V5.12 Runtime Imported Pack Rendering Smoke Evidence

status: automated-smoke-passed / manual-runtime-visual-pending

date: 2026-05-29

## Scope

This evidence covers automated V5.12 pre-runtime checks:

- V5.12 real local fixture presence for imported sprite and GLTF packs.
- Tauri asset import/runtime unit tests.
- desktop renderer/unit tests.
- desktop typecheck.
- security redaction scan over smoke output.

Manual live runtime visual acceptance is still required before V5.12 final acceptance can pass.

## Fixtures

- `fixtures/manual/v5_12/sprite/manifest.json`
- `fixtures/manual/v5_12/gltf/manifest.json`

The sprite fixture uses real PNG files. The GLTF fixture uses the project-authored generated prototype GLB copied into the fixture directory.

## Command

```bash
node scripts/v5_12_runtime_imported_pack_smoke.mjs
```

## Result

```text
passed
```

## Security Notes

The smoke output records only fixture path names, renderer kinds, action coverage booleans, and command pass/fail results.

It does not include token, Authorization, raw payload, full local path, workspace path, config path, raw Agent/Codex/terminal/MCP/HTTP payload, prompt text, provider payload, or raw GLTF JSON chunks.

## Remaining Manual Gate

V5.12 final acceptance remains pending until live Desktop Manager validation confirms:

- imported sprite pack activates to one target PetInstance and renders.
- imported GLTF pack activates to one target PetInstance and renders.
- default and unrelated pets remain unchanged.
- restart restores active pack mapping.
- invalid/corrupt/stale pack falls back to CSS.
