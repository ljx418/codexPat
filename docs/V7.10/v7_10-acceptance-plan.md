# V7.10 Acceptance Plan

status: passed scoped
date: 2026-06-01

## Required Checks

- Real generated images or real local generated fixtures are used; pure mock assets cannot pass final smoke.
- Missing any core action is rejected.
- Corrupt image or unreadable frame falls back safely and does not make the cat transparent.
- Activated pack affects only the target PetInstance.
- Default pet and unrelated pets remain unchanged.
- Deleting or deactivating the generated pack restores a safe visual state.

## Accepted Evidence

- Real MiniMax-generated action images were assembled into a local sprite pack:
  `docs/V7.10/evidence/v7_10-generated-2d-action-pack-smoke-2026-05-31.md`.
- The generated pack was imported into app-managed storage and activated for one
  target PetInstance through `petctl asset import` and `petctl asset activate`.
- A target-only runtime route was exercised with `petctl notify`; the target
  instance changed to `running`, while the default instance remained `idle`.
- Runtime visual evidence was captured as a cropped, sanitized screenshot:
  `docs/V7.10/evidence/v7_10-runtime-activation-screenshot-2026-06-01.png`.

This scoped acceptance proves generated 2D sprite action pack assembly and local
runtime activation for one tested target PetInstance. It does not prove 3D
runtime readiness, automatic photo-to-3D, broad provider integration, or
production release readiness.

## Renderer Payload Snapshot

Evidence must prove renderer input contains only:

- safe action ID.
- renderer kind.
- safe profile/pack IDs.
- playback intent.
- scale.
- visibility.

Renderer input must not include raw prompt, provider payload, local source path, token, Authorization, photo metadata, workspace path, or config path.
