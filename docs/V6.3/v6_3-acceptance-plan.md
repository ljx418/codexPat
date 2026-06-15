# V6.3 Runtime Imported Pack Rendering Acceptance Plan

status: revalidation-ready

date: 2026-05-30

## Acceptance Gates

| Gate | Required Result |
| --- | --- |
| Sprite fixture | present and accepted by smoke. |
| GLTF fixture | present and accepted by smoke. |
| Runtime tests | Tauri asset import/runtime tests pass. |
| Desktop tests | unit tests pass. |
| Desktop typecheck | typecheck passes. |
| Security scan | no sensitive output or forbidden ready claim. |
| Claim scan | no photo/provider/3D/production overclaim. |

## Required Check

```bash
node scripts/v5_12_runtime_imported_pack_smoke.mjs
```

## Pass / Block / Fail Rules

- `passed`: all smoke cases pass.
- `blocked`: required local fixture/runtime is unavailable and no claim is made.
- `failed`: smoke fails, redaction fails, or V6.3 overclaims readiness.

## Allowed Claim

```text
V6.3 runtime imported asset pack rendering passed for tested local PetInstance scenarios.
```

