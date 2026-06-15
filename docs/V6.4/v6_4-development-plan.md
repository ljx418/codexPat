# V6.4 Development Plan: Asset Manager Product UX

status: planning-ready

date: 2026-05-30

## Scope

V6.4 productizes the asset manager layer that sits on top of the accepted V5.12 / V6.3 runtime imported pack rendering baseline.

This phase may implement:

- imported pack preview in Desktop Manager.
- core action preview selection.
- pack status and pack health display.
- sanitized import diagnostics.
- asset pack rename UX.
- asset pack delete UX with active-pack fallback.
- rollback to bundled / default renderer for a target `PetInstance`.
- visual selection UX that makes active pack and target pet clear.

This phase must not implement:

- provider generation.
- remote asset loading.
- automatic photo-to-3D.
- asset marketplace behavior.
- production release readiness.
- new Codex monitoring semantics.

## Product Requirements

V6.4 maps to PRD Track C:

- V6-C2: import preview.
- V6-C3: rollback / delete / rename.
- V6-C4: asset safety diagnostics surfaced as stable reason codes.

## User Flow

1. User opens Desktop Manager.
2. User sees imported packs with renderer kind, status, health, and sanitized diagnostics.
3. User selects a target pet.
4. User previews a pack and core action without changing the active pack.
5. User activates a pack for the target pet.
6. User rolls the target pet back to bundled / default renderer.
7. User renames an imported pack display name.
8. User deletes an imported pack; active mappings are cleared or fallback safely.

## Implementation Boundaries

Preview must use the same safe renderer boundary as runtime rendering:

```text
safe action ID
renderer kind
safe profile/pack IDs
playback intent
scale
visibility
```

Preview and asset manager UI must not receive or display:

```text
raw manifest path
raw provider payload
prompt text
photo metadata
token
Authorization
workspace path
config path
full local path
raw Agent / Codex / terminal / MCP / HTTP payload
```

## Technical Tasks

1. Add a safe asset manager view model for imported pack status, health, available actions, and active instance count.
2. Add preview state in Desktop Manager that renders selected pack/action in a non-active preview area.
3. Add rename command and UI for imported pack display names.
4. Harden delete UI to show active usage and fallback behavior before deletion.
5. Add rollback/deactivate control per target pet.
6. Add tests for view model, rename, preview non-activation, delete active fallback, and sanitized diagnostics.
7. Update evidence and active docs after real local validation.

## Required Checks

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
node scripts/v5_12_runtime_imported_pack_smoke.mjs
```

Run `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` if Tauri commands are changed.

## Allowed Claim

```text
V6.4 asset manager product UX passed for tested local import and preview scenarios.
```

## Forbidden Claims

```text
photo customization ready
automatic photo-to-3D ready
provider integration verified
remote generation ready
asset marketplace ready
3D ready
production signed release ready
```
