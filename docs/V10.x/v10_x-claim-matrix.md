# V10.x Claim Matrix

status: v10-product-grade-scoped-accepted-v10-11-active
date: 2026-06-05

## Existing Baseline Claims

These claims remain valid for V10.1-V10.5 scoped baseline only:

```text
V10.1 bundled animated 2D action pack passed for tested local runtime playback scenario.
V10.2 Desktop Manager action preview passed for tested local preview scenarios.
V10.3 state-linked animation playback passed for tested bundled sprite-v3-animated scenario.
V10.4 animated GLTF clip gate detection and static/partial labeling completed.
V10.x animated pet action playback passed for tested bundled animated 2D pack, Desktop Manager action preview, bundled state-linked runtime animation, and GLTF clip gate detection scenarios; animated GLTF runtime playback remains excluded.
```

These claims do not imply product-grade visual quality.

## V10.6 Scoped Claim

Allowed after V10.6 evidence:

```text
V10.6 animation format rebaseline passed for tested local pet.json spritesheet and frame-sequence scenarios.
```

This does not imply product-grade visual quality, Petdex parity, 3D readiness,
provider integration, or production release readiness.

## V10.7 Scoped Claim

Allowed after V10.7 evidence:

```text
V10.7 work-cat-v1 visual smoke passed for tested local bundled animated 2D sprite scenarios.
```

This does not imply final product-grade V10 acceptance, runtime
micro-interactions, Petdex parity, 3D readiness, provider integration, or
production release readiness.

## V10.8 Scoped Claim

Allowed after V10.8 evidence:

```text
V10.8 runtime micro-interaction smoke passed for tested local work-cat-v1 controller scenarios.
```

This does not imply final product-grade V10 acceptance, Manager restore UX,
Petdex parity, 3D readiness, provider integration, or production release
readiness.

## V10.9 Scoped Claim

Allowed after V10.9 evidence:

```text
V10.9 Manager preview and activation UX polish passed for tested local bundled work-cat-v1 scenarios.
```

This does not imply final product-grade V10 acceptance, live runtime animation
QA, Petdex parity, 3D readiness, provider integration, or production release
readiness.

## Final Allowed Claim

Allowed after V10.10 passed:

```text
V10 product-grade animated 2D work-cat experience passed for tested local bundled work-cat-v1 scenarios.
```

## V10.11 Scoped Claim

Allowed only after V10.11 evidence and final acceptance:

```text
V10.11 product experience rebaseline passed for tested local desktop-pet documentation, onboarding, settings, and screenshot evidence scenarios.
```

This does not imply Petdex parity, 3D readiness, provider integration,
automatic photo-to-3D readiness, OS-level Codex binding readiness, or production
signed release readiness.

## V10.12-V10.16 Accepted Scoped Claims

Allowed after V10.12:

```text
V10.12 selected open-source benchmark spec completed for visual-quality and first-run onboarding comparison.
```

Allowed after V10.13:

```text
V10.13 premium bundled animated 2D cat library passed for tested local visual-quality scenarios.
```

Allowed after V10.14:

```text
V10.14 ordinary-user first-run work-cat onboarding passed for tested local macOS scenarios.
```

Allowed after V10.15:

```text
V10.15 built-in local pet gallery and safe pack UX passed for tested local scenarios.
```

Allowed after V10.16 only:

```text
V10.16 selected open-source UX benchmark exceeded for tested local macOS visual quality and first-run onboarding scenarios.
```

These claims do not imply Petdex parity, full ecosystem parity, broad 3D
readiness, provider integration, production signed release readiness,
cross-platform readiness, or Windows readiness.

## Conditional Claims

Allowed only with later evidence:

```text
V10.x animated GLTF action clip playback passed for tested local GLB/GLTF pack with accepted core action clip names.
```

## Forbidden Claims

```text
Petdex parity achieved
3D ready
automatic photo-to-3D ready
automatic photo-to-animation ready for all providers
provider integration verified
animated GLTF playback passed without real accepted clip evidence
Rive ready
Live2D ready
asset marketplace ready
remote asset loading ready
production signed release ready
cross-platform ready
Windows ready
```

## False-green Rules

- A moving rough sprite does not prove product-grade pet experience.
- Static GLB does not prove animated 3D.
- Manifest `frameFiles` does not prove runtime playback unless visual/nonblank
  evidence passes.
- Prompt-only storyboard does not prove animation.
- Provider image output does not prove state-linked runtime animation.
- Preview-only evidence does not prove live PetInstance state mapping.
