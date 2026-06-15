# V10.12 Benchmark Spec Review Evidence

status: passed
date: 2026-06-05

## Scope

V10.12 freezes the comparison target for the remaining V10 track. The selected
benchmark dimensions are intentionally narrow:

- local bundled animated 2D visual quality.
- ordinary-user first-run onboarding for local work-cat scenarios.

## Benchmark Sources Reviewed

| Source | Selected observed strength | Used for |
| --- | --- | --- |
| Petdex | public animated pet gallery, `pet.json` plus spritesheet model, simple install-style flow | visual variety and pack format comparison |
| OpenPets | user-facing app setup, assistant connection, verification path | first-run onboarding comparison |
| Shijima-Qt | import-oriented desktop-pet library workflow | local gallery and pack management comparison |

## Frozen Comparison Dimensions

| Dimension | V10.16 required outcome |
| --- | --- |
| visual variety | at least 6 accepted local bundled animated cats |
| action coverage | every accepted cat covers 8 core actions |
| visual evidence | contact sheet and runtime playback capture for every accepted cat |
| first-run default pet | visible pet in no more than 3 user actions |
| first-run Codex work-cat | visible target reaction in no more than 5 user actions |
| safety boundary | no remote marketplace, provider, 3D, production release, Windows, or cross-platform claim |

## PRD / Spec Review

Result: passed.

The V10.12 scope matches the active PRD direction of local Agent Desktop Pet
product experience improvement. It does not reopen V3/V4 monitoring scope, V8
provider/photo-to-3D scope, or release/cross-platform scope.

## Claim Boundary Review

Result: passed.

Allowed after this phase only:

```text
V10.12 selected open-source benchmark spec completed for visual-quality and first-run onboarding comparison.
```

Still forbidden:

```text
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
asset marketplace ready
production signed release ready
cross-platform ready
Windows ready
```

## Drawio Sync

Result: passed.

Evidence:

- `docs/V10.x/evidence/v10_12_v10_16_drawio_sync_snapshot_2026-06-05-implementation-ready.png`

## Security Scan

Result: passed.

No token, Authorization header, raw payload, full local path, workspace path,
config path, or credential-file marker is included in this evidence.

## Final Decision

V10.12 passed. V10.13 may proceed to implementation.
