# V9.x Development Plan

status: active
date: 2026-06-03

## Objective

V9 turns the V8 scoped asset pipeline into in-app AI cat asset generation for
tested local provider scenarios:

- MiniMax static 2D action pack generation.
- MiniMax dynamic 2D multi-frame pack generation.
- Tripo3D 3D GLB generation and local runtime activation.

V9 does not claim broad provider integration, broad automatic photo-to-animation
readiness, broad automatic photo-to-3D readiness, broad 3D readiness, or
production signed release readiness.

## Phase Outline

| Phase | Development Scope | Status |
| --- | --- | --- |
| V9.0 | scope freeze, architecture, claim boundaries | planned |
| V9.1 | provider credential and consent UX/readiness | planned |
| V9.2 | MiniMax static 2D action pack generation | planned |
| V9.3 | MiniMax dynamic 2D multi-frame generation | planned |
| V9.4 | Tripo3D 3D GLB generation | planned / blocked until credential |
| V9.5 | unified preview / activation UX | planned |
| V9.6 | runtime QA and failure hardening | planned |
| V9.7 | final productized gate | planned |

## Implementation Rules

- Provider calls require explicit local environment consent flags.
- Provider credentials are read from environment / `.env` only and never printed.
- Raw provider responses, raw prompts, source photos, EXIF/GPS, full local paths,
  workspace paths, config paths, and auth headers must not appear in
  evidence.
- Generated outputs must pass local import validation before activation.
- Invalid generation/import preserves the previous active pack.
- V9.2/V9.3 MiniMax image output must be converted into local PNG assets before
  sprite import.
- V9.4 Tripo3D output must pass GLTF/GLB deep scan and normalization before use.

## Next Implementation Order

1. V9.1 provider readiness smoke.
2. V9.2 MiniMax static 2D generation smoke.
3. V9.3 dynamic 2D multi-frame generation smoke after V9.2 passes.
4. V9.4 Tripo3D generation only after `TRIPO_API_KEY` and consent flags exist.
5. V9.5-V9.7 after provider paths have accepted or blocked evidence.
