# V10.x Exit Criteria

status: v10-product-grade-scoped-accepted-v10-11-active
date: 2026-06-05

## Product-grade Exit Criteria

V10.x may claim product-grade animated 2D work-cat experience only if:

- V10.6 local animation format rebaseline has passed.
- V10.7 `work-cat-v1` visual smoke has passed.
- V10.8 runtime micro-interaction smoke has passed.
- V10.9 Manager preview and activation UX polish smoke has passed.
- `work-cat-v1` is bundled, active by default, and visually better than
  `sprite-v3-animated`.
- all 8 core actions are animated and previewable.
- runtime state changes visibly switch target pet animation.
- idle/click/drag micro-interactions are visible.
- fallback remains visible for missing, corrupt, deleted, or partial assets.
- no final visual state is transparent, blank, or off-canvas.
- default and unrelated pets remain unchanged in isolation tests.
- 1x and 0.75x scale checks pass.
- performance baseline is recorded.
- security and claim scans pass.
- PRD/spec review passes.
- drawio gap map matches final status.

## V10.11 Product Experience Exit Criteria

V10.11 may claim product-experience rebaseline only if:

- README and active docs agree on V10.11 as the current active line.
- active docs no longer treat any non-V10 phase as the current desktop-pet phase.
- three-minute Codex work-cat onboarding explains wrapper-launched JSONL as the
  recommended reliable path.
- already-open Codex window automatic monitoring is clearly marked unsupported.
- real desktop screenshots exist under `docs/V10.x/evidence/`.
- HTML evidence summaries link screenshots and are not used as mock proof.
- drawio gap map includes current architecture, target architecture delta,
  development/acceptance plan, milestones, gates, and exit conditions.
- regression, security scan, and claim scan pass.

## V10.12-V10.16 Benchmark Surpass Exit Criteria

V10.16 may claim selected open-source UX benchmark exceeded only if:

- V10.12 benchmark spec is accepted.
- V10.13 premium local cat library has at least 6 accepted bundled animated cats.
- every accepted cat has all 8 core actions and visual QA evidence.
- V10.14 first-run wizard creates visible default pet in <=3 user actions.
- V10.14 first-run wizard creates Codex work-cat and verifies visible reaction
  in <=5 user actions.
- V10.15 gallery preview, activation, restore default, and delete imported pack
  flows pass.
- visual-quality benchmark scorecard is `exceeded`.
- first-run onboarding benchmark scorecard is `exceeded`.
- screenshots/recordings support both scorecards.
- security scan, claim scan, PRD/spec review, regression, and drawio sync pass.

If either scorecard is `matched`, `partial`, or `blocked`, V10.16 cannot use the
benchmark-exceeded claim.

## Security Exit Criteria

Evidence, UI diagnostics, adapter output, and renderer payloads must not expose:

- raw source path.
- full local path.
- remote URL.
- prompt text.
- provider payload.
- raw PetEvent or Codex payload.
- token.
- Authorization.
- raw image payload.
- raw GLTF JSON chunk.
- shell command or script source.

## Allowed Final Claim

```text
V10 product-grade animated 2D work-cat experience passed for tested local bundled work-cat-v1 scenarios.
```

Allowed only after V10.11 passes:

```text
V10.11 product experience rebaseline passed for tested local desktop-pet documentation, onboarding, settings, and screenshot evidence scenarios.
```

Allowed only after V10.16 passes:

```text
V10.16 selected open-source UX benchmark exceeded for tested local macOS visual quality and first-run onboarding scenarios.
```

## Forbidden Claims

```text
Petdex parity achieved
3D ready
automatic photo-to-3D ready
automatic photo-to-animation ready for all providers
provider integration verified
Rive ready
Live2D ready
asset marketplace ready
remote asset loading ready
production signed release ready
cross-platform ready
Windows ready
```

## No-Go Conditions

V10.10 must fail or remain blocked if:

- `work-cat-v1` is visually indistinguishable from the rough baseline.
- any required core action is blank, transparent, or off-canvas.
- click/drag/idle micro-interaction is not visible.
- Manager preview mutates live PetInstance state.
- corrupt assets make the pet disappear.
- final report uses Petdex parity, 3D readiness, provider readiness, or release
  readiness language.
