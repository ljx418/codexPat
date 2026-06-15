# V6.3 Runtime Imported Pack Rendering Development Plan

status: revalidation-ready

date: 2026-05-30

## Goal

Carry V5.12 runtime imported pack rendering evidence forward under V6 naming and revalidate the local runtime path.

V6.3 does not add new renderer semantics. It confirms that imported pack rendering remains available as part of V6 productization planning.

## Development Content

- Re-run V5.12 runtime imported pack smoke.
- Confirm sprite and GLTF fixtures exist.
- Confirm Tauri asset import/runtime tests pass.
- Confirm desktop unit tests and typecheck pass through the smoke.
- Confirm redaction scan passes.
- Document V6 claim boundary.

## Out Of Scope

- Photo customization.
- Provider integration.
- 3D readiness.
- Production signed release readiness.
- Asset Manager preview/rollback/delete/rename product UX; that remains V6.4.

## Allowed Claim

```text
V6.3 runtime imported asset pack rendering passed for tested local PetInstance scenarios.
```

## Forbidden Claims

```text
photo customization ready
provider integration verified
3D ready
production signed release ready
```

