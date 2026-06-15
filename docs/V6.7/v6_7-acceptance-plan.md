# V6.7 Acceptance Plan: Visual QA / Renderer Hardening

status: planning-ready

date: 2026-05-30

## Entry Criteria

- V6.6 final acceptance passed.
- V6.7 plan audit has no unresolved Critical or High risk.

## Acceptance Gates

- bundled sprite visual fixture nonblank check passes.
- imported orange tabby visual fixture nonblank check passes.
- evidence covers all eight core actions for bundled and imported fixture.
- evidence includes 0.75x distinguishability for warning/error/need_input via retained V5.15 fixture.
- GLTF renderer visibility hardening is implemented and build-tested.
- performance baseline remains local observation only.

## Security

Evidence must not include token, Authorization, raw payload, prompt text, provider payload, raw photo, workspace path, config path, full local path, remote asset URL, or script source.

## Drift / False-Green Risk Gate

Stop before implementation or before V6.8 if any item is High:

- visual evidence is missing or blank.
- hidden renderer keeps animation running after visibility false.
- claim implies 3D ready, production visual quality, or production signed release.
