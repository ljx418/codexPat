# V6.4 Acceptance Plan: Asset Manager Product UX

status: planning-ready

date: 2026-05-30

## Entry Criteria

- V6.1 final acceptance passed.
- V6.2 final acceptance passed.
- V6.3 runtime imported pack rendering revalidation passed.
- V5.12 runtime imported pack rendering remains accepted baseline.
- V6.4 plan audit has no unresolved High risk.

## Functional Acceptance

- imported sprite pack appears in Desktop Manager with sanitized metadata.
- imported GLTF pack appears in Desktop Manager with sanitized metadata.
- pack list shows renderer kind, status, health, and active usage count.
- previewing a pack/action does not activate it for any `PetInstance`.
- preview supports all core action IDs where the pack supports them.
- invalid preview falls back inside preview area and does not change active pack.
- target pet activation still works for imported sprite and GLTF packs.
- rollback/deactivate returns target pet to bundled/default renderer.
- rename changes only display name and preserves pack ID, renderer kind, validation result, and active mappings.
- delete of unused imported pack succeeds.
- delete of active imported pack requires explicit confirmation and clears/fallbacks active mappings.
- deleted/stale pack does not leave a broken active mapping.
- default pet and unrelated pets are unchanged during preview, rename, delete, and rollback.

## Security Acceptance

Evidence and UI must not contain:

```text
token
Authorization
raw payload
raw manifest path
raw provider payload
prompt text
photo metadata
workspace path
config path
full local path
api-token.json
```

Preview and asset manager view model may only expose:

```text
packId
displayName
rendererKind
validationStatus
healthStatus
activeInstanceCount
core action IDs
sanitized reasonCode
```

## Regression Acceptance

Required:

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
node scripts/v5_12_runtime_imported_pack_smoke.mjs
```

Conditional:

```bash
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Run conditional check if any Tauri/Rust command or asset storage code changes.

## PRD Review

Confirm V6.4 remains limited to Track C asset manager UX and does not claim provider generation, photo customization, remote loading, or production release readiness.

## Drift / False-Green Risk Gate

Stop before implementation or before moving to V6.5 if any item is High:

- preview changes active runtime pack.
- rename/delete exposes raw local paths or raw manifest contents.
- delete leaves broken active mappings.
- UI implies provider/photo generation readiness.
- evidence uses fixture-only validation where real imported pack validation is required.
