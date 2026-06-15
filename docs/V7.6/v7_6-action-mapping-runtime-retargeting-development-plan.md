# V7.6 Development Plan: Action Mapping & Runtime Retargeting

status: accepted

date: 2026-05-31

## Goal

Map generated validated asset packs to runtime pet actions per PetInstance.

## Development Content

- map generated asset actions to core actions: covered by runtime action tests.
- use GLTF clips when available: covered by GLTF runtime baseline.
- fallback to pose or sprite pseudo-animation when clips are missing: covered by imported sprite/runtime baseline.
- preserve error and need_input priority over transient success: covered by cat action resolver tests.
- isolate renderer state across PetInstances: covered by V5.12 runtime baseline and V7.6 smoke.
- restore active generated pack mapping after restart: covered by V5.12 runtime baseline.

## Out of Scope

- editing GLTF bones or arbitrary animation names directly from agent payloads.
- remote runtime assets.
- production animation quality claims.

## Allowed Claim

```text
V7.6 generated asset action mapping passed for tested per-PetInstance runtime scenarios.
```
