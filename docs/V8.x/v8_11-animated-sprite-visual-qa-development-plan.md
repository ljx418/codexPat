# V8.11 Animated Sprite Visual QA Development Plan

status: accepted scoped
date: 2026-06-03

## Objective

Close animated 2D sprite runtime QA for accepted V8.9/V8.10 paths. V8.11 adds
no new generation features. It verifies that imported multi-frame sprite packs
are visibly animated, isolated per PetInstance, and safe under failure.

## Development Scope

- visual QA harness for animated sprite runtime playback.
- screenshot or short recording capture for all eight core actions.
- 1x and 0.75x scale checks.
- fallback checks for corrupt frame, missing frame, invalid fps, deleted pack,
  and deactivation.
- renderer input snapshot using safe fields only.
- CPU/memory baseline for idle animation and multi-pet playback.

## Allowed Claim

```text
V8.11 animated 2D sprite runtime visual QA passed for tested local imported multi-frame pack scenario.
```

## Forbidden Claims

- AI asset generation ready.
- automatic photo-to-animation ready.
- provider integration verified.
- 3D ready.
- Rive ready.
- Live2D ready.
- production signed release ready.

## Go / No-Go

V8.11 is accepted scoped for the tested local imported multi-frame pack
scenario. It does not claim provider execution, AI generation readiness, Rive,
Live2D, 3D readiness, or production release readiness.
