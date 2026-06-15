# V7.5 Development Plan: Generated Asset Import & GLTF Deep Scan

status: accepted

date: 2026-05-31

## Goal

Import generated local sprite or GLTF assets only after strict validation and GLTF/GLB deep scan.

## Development Content

- accept generated asset folder or manifest candidate: covered by existing local import path.
- deep scan GLTF/GLB JSON chunks before activation: tested.
- reject external URIs, path traversal, absolute paths, disallowed data URI, external `.bin`, external images, and unknown required extensions: tested.
- enforce action clip names and size/count/duration limits: covered by import tests and validation constraints.
- preserve previous active pack after invalid import: covered by asset import/runtime baseline.

## Out of Scope

- remote asset loading.
- marketplace imports.
- arbitrary local paths at runtime.
- renderer access to raw manifest path.

## Allowed Claim

```text
V7.5 generated asset import validation passed for tested local sprite and GLTF asset scenarios.
```
