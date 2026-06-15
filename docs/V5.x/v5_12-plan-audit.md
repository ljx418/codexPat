# V5.12 Runtime Imported Pack Rendering Plan Audit

status: passed-for-implementation / productization-gate-no-go

date: 2026-05-29

## Scope

V5.12 is the next implementation phase after V5.11 import UI acceptance.

It must close only this gap:

```text
imported pack metadata + activation record -> live PetInstance runtime rendering
```

It must not implement or claim photo-to-3D, provider generation, remote asset loading, marketplace behavior, or production release readiness.

## Required Implementation

- Activate an imported pack for one selected `PetInstance`.
- Render imported sprite and imported GLTF packs in the live runtime.
- Ensure only the target `PetInstance` uses imported visuals.
- Preserve default and unrelated pets.
- Restore `PetInstance -> active pack` mapping after restart.
- Fall back to CSS for invalid pack, corrupt sprite frame, corrupt GLB, stale pack, or renderer mismatch.
- Prove renderer input contains only safe action ID, renderer kind, safe profile/pack IDs, playback intent, scale, and visibility.

## P0 Gate

GLTF / GLB deep scan is P0 and must run before activation and runtime use.

Required scan:

- reject `http://`, `https://`, `file://`, `javascript:`, and `data:` URI.
- reject external `.bin` and external image references in local single-file mode.
- reject absolute paths and path traversal.
- reject unknown `extensionsRequired` unless allowlisted.
- enforce max file size, mesh/material/texture/animation count, and animation duration.
- require accepted clip names only: `idle`, `thinking`, `running`, `success`, `warning`, `error`, `need_input`, `sleeping`.

## PRD Alignment

Aligned:

- V5.11 remains import-only.
- V5.12 is the first runtime rendering phase for imported packs.
- Productization Gate remains No-Go.
- V3/V4 Codex monitoring semantics are unchanged.

## Risk Assessment

| Risk | Level | Decision |
| --- | --- | --- |
| Renderer receives raw path or raw provider payload. | High | Block acceptance unless renderer payload snapshot proves safe fields only. |
| GLTF deep scan skipped before activation. | High | Block acceptance. |
| V5.12 overclaims photo/provider/productization readiness. | High | Claim matrix forbids these claims. |
| Imported GLTF fixture is structurally valid but visually crude. | Medium | Accept only as runtime rendering smoke, not 3D readiness. |
| Existing imported records from older fixtures are stale/corrupt. | Medium | Must fall back to CSS with sanitized reason. |

## Go / No-Go

```text
V5.12 implementation: Go
V5.12 acceptance: No-Go until real runtime evidence passes
V5.x Productization Gate: No-Go
```
