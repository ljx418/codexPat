# V5.12 Runtime Imported Pack Rendering PRD Spec Review

status: passed-for-implementation / evidence-required-for-acceptance

date: 2026-05-29

## PRD Requirement

Users must be able to import personalized cat asset packs and have a selected pet instance render the imported assets at runtime.

V5.11 satisfied local import UI only. V5.12 must add runtime activation and rendering.

## Accepted Baseline

- V5.0-V5.11 accepted scoped baseline.
- V5.11 import UI passed for local manifest import.
- V5.11 does not prove runtime activation or rendering.
- V5.x Productization Gate remains No-Go.

## V5.12 Success Criteria

- Imported pack can be activated for a selected `PetInstance`.
- Imported sprite pack renders in the target pet runtime.
- Imported GLTF pack renders in the target pet runtime.
- Default pet and unrelated pets remain unchanged.
- Restart restores the active imported pack mapping.
- Invalid or corrupt imported assets fall back to CSS.
- Renderer mismatch fails with stable sanitized reason and no partial render.
- Two pets using the same pack do not share mutable renderer state.

## Out Of Scope

```text
photo customization ready
photo-to-3D ready
provider adapter ready
remote generation ready
remote asset loading ready
asset marketplace ready
production signed release ready
```

## Evidence Required

- Automated V5.12 smoke with real imported sprite and GLTF fixture packs.
- Runtime screenshot or operator confirmation for target pet rendering.
- Renderer payload snapshot proving safe fields only.
- Security scan for token, Authorization, raw payload, full local path, workspace path, config path, raw Agent/Codex/terminal/MCP/HTTP payload.
- Claim scan proving forbidden claims appear only in forbidden/not-ready contexts.

## Review Decision

```text
No fatal PRD drift found for V5.12 implementation.
V5.12 may proceed, but final acceptance remains blocked until real runtime evidence passes.
```
