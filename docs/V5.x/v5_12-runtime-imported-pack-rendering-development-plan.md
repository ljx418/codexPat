# V5.12 Runtime Imported Pack Rendering Development Plan

status: passed

date: 2026-05-30

## Goal

Make imported and activated asset packs render in the live desktop pet runtime for the selected PetInstance.

V5.12 closes the gap between V5.9 CLI activation metadata and actual runtime renderer usage.

## Required Behavior

- A PetInstance with an activated imported pack uses that pack for safe action IDs.
- Default pet and unrelated pets remain unchanged.
- If the imported pack is missing, invalid, or stale, the target pet falls back to CSS without crashing.
- Renderer adapters still receive only safe action IDs, renderer kind, safe pack/profile IDs, playback intent, scale, and visibility.
- Runtime never receives raw prompt text, raw provider payload, raw local paths, shell commands, tokens, or Authorization values.

## Implementation Scope

- Load sanitized imported-pack activation metadata at runtime.
- Resolve active pack per PetInstance.
- Route safe CatActionResolver output to the chosen renderer.
- Add stale/missing-pack diagnostics.
- Add tests proving per-instance isolation and fallback.
- Add Desktop Manager activation UX for a selected imported pack and selected PetInstance.
- Show current active pack per PetInstance.
- Support switching the selected PetInstance back to bundled/default rendering.
- Persist active imported pack mapping across app restart.
- Add P0 GLTF / GLB deep scan before activation and before local GLB runtime use.
- Add corrupt sprite frame / corrupt GLB fallback handling.

## Proposed Architecture

```text
Desktop Manager pack selection
  -> app-managed imported pack registry
  -> PetInstance active pack record
  -> CatStateMachine safe action ID
  -> CatActionResolver
  -> runtime active pack resolver
  -> RendererRegistry
  -> RendererAdapter
```

The runtime resolver may use only:

```text
instanceId
safe action ID
renderer kind
safe imported pack ID
safe profile ID
playback intent
scale
visibility
```

The runtime resolver and renderer adapter must not receive:

```text
raw manifest path
source file path
prompt text
photo metadata
provider payload
raw PetEvent
hook payload
terminal payload
token
Authorization
workspace path
config path
remote URL
shell command
script source
```

## Development Phases

1. Activation data path:
   - read imported pack records from app-managed storage.
   - add per-instance active pack record.
   - preserve previous active pack on invalid activation.

2. Desktop Manager UX:
   - list imported packs with sanitized metadata.
   - select pack for a specific PetInstance.
   - show active pack and fallback state.
   - switch back to bundled/default renderer.

3. Runtime rendering:
   - route target PetInstance to imported sprite renderer.
   - route target PetInstance to imported GLTF renderer when available.
   - keep default and unrelated pets unchanged.

4. P0 deep scan and fallback:
   - parse GLTF JSON / GLB JSON chunk.
   - reject `http://`, `https://`, `file://`, `javascript:`, and `data:` URIs.
   - reject external `.bin` and external image references in local single-file mode.
   - reject absolute paths and path traversal.
   - reject unknown `extensionsRequired` unless allowlisted.
   - enforce file and scene complexity limits.
   - require accepted action clip names only: `idle`, `thinking`, `running`, `success`, `warning`, `error`, `need_input`, `sleeping`.
   - fallback to CSS on missing, stale, corrupt, or incompatible packs.

5. Evidence:
   - automated smoke.
   - screenshots or recording.
   - sanitized renderer payload snapshot.
   - security and claim scans.

## Out Of Scope

- Provider generation.
- Photo upload.
- Marketplace.
- Remote asset loading.
- External `.bin` or texture references for imported GLB runtime mode.
- Production 3D readiness claim.

## Acceptance

- Imported sprite pack renders for the selected PetInstance.
- Imported GLTF pack renders for the selected PetInstance if the local renderer is selected and available.
- Default pet remains unchanged.
- Other Codex pets remain unchanged.
- Invalid or missing imported pack falls back to CSS.
- Security and claim scans pass.

## Evidence

- `docs/V5.x/evidence/v5_12-runtime-imported-pack-rendering-smoke-YYYY-MM-DD.md`
- `docs/V5.x/v5_12-final-acceptance-report.md`

## Allowed Claim After Final Pass

```text
V5.12 runtime imported asset pack rendering passed for tested local PetInstance scenarios.
```

Accepted scoped claim:

```text
V5.12 runtime imported asset pack rendering passed for tested local PetInstance scenarios.
```

## Forbidden Claims

```text
3D ready
photo-to-3D ready
provider integration verified
remote asset loading ready
production signed release ready
```
