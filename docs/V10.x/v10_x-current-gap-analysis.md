# V10.x Current Gap Analysis

status: v10-product-grade-scoped-accepted-v10-11-active
date: 2026-06-05

## Baseline Fact

V10.1-V10.5 passed scoped for bundled `sprite-v3-animated` playback, isolated
preview metadata, bundled state-linked runtime animation, GLTF clip detection,
and real desktop visibility. This proves the pipeline can animate.

It does not prove that the product has a polished, daily-use, Petdex-like
animated work-cat experience.

## Current Gaps

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Default visual quality | bundled `work-cat-v1` visual smoke passed scoped | runtime micro-interactions and final product-grade QA | V10.7 passed scoped |
| Animation format | local `pet.json + spritesheet/png-sequence` adapter accepted scoped | consumed by `work-cat-v1` production pack and Manager UX | V10.6 passed scoped |
| Runtime behavior | local micro-interaction controller passed scoped | Manager polish and final integrated QA | V10.8 passed scoped |
| Interaction | idle/click/drag micro-interaction smoke passed scoped | final product-grade visual QA with Manager workflow | V10.8 passed scoped |
| Manager UX | active/fallback pack display, all-action preview metadata, restore default modeling, and preview isolation passed scoped | final integrated QA | V10.9 passed scoped |
| Final quality gate | product-grade visual QA, regression, security, claim, PRD/spec, and drawio sync passed | scoped V10 product-grade gate | V10.10 passed |
| Product experience evidence | V10 behavior is accepted, but public status and active docs briefly drifted to a wrong non-V10 active line | V10.11 current-state docs, three-minute onboarding, and real screenshot evidence close the user-facing gap | V10.11 passed scoped |
| External benchmark visual quality | V10 had `work-cat-v1`, but not a broad premium bundled library | 6 local bundled animated cats with full visual QA | V10.13 passed |
| Ordinary-user first-run | README/settings explained the path, but setup was not wizard-driven | new user creates visible pet in <=3 steps and Codex work-cat in <=5 steps | V10.14 passed |
| Built-in gallery UX | Manager had asset/preview foundations | local pet gallery with filters, safe preview, activation, restore, and user-import deletion | V10.15 passed |
| Benchmark claim | V10.11 did not compare against selected open-source benchmarks | evidence-matched selected benchmark surpass gate | V10.16 passed scoped |
| Animated 3D | GLTF detection labels static/partial | excluded unless real animated GLTF evidence appears later | excluded from V10 target |

## Go / No-Go

V10.6 implementation status:

- passed scoped with `docs/V10.x/evidence/v10_6-animation-format-rebaseline-smoke-2026-06-04.md`.
- proved safe local `pet.json + spritesheet` and `pet.json + png frame sequence` adaptation.
- preserved the V5 manifest import path.
- did not prove product-grade visual quality, micro-interactions, or final V10 acceptance.

V10.7 implementation status:

- passed scoped with `docs/V10.x/evidence/v10_7-work-cat-v1-visual-smoke-2026-06-04.md`.
- proved bundled `work-cat-v1` frames, contact sheet, runtime playback capture, nonblank checks, frame-difference checks, scale capture, and baseline comparison.
- did not prove runtime micro-interactions, Manager restore UX, final V10 product-grade acceptance, Petdex parity, 3D readiness, or provider integration.

V10.8 implementation status:

- passed scoped with `docs/V10.x/evidence/v10_8-runtime-micro-interaction-smoke-2026-06-04.md`.
- proved idle random, click, drag, priority blocking, no PetEvent emission, and no CatStateMachine write in tested local controller/UI-safe mapping scenarios.
- did not prove Manager restore UX or final V10 product-grade acceptance.

V10.9 implementation status:

- passed scoped with `docs/V10.x/evidence/v10_9-manager-preview-activation-smoke-2026-06-04.md`.
- proved Manager active/fallback pack display, all 8 core action preview metadata, restore default modeling, restart persistence modeling, zero accepted PetEvent, live PetInstance unchanged by preview, visible fallback for partial action, and safe preview renderer input.
- did not prove final V10 product-grade acceptance.

V10.10 closure status:

- passed with `docs/V10.x/v10_x-product-grade-final-acceptance-report.md`.
- final claim is limited to tested local bundled `work-cat-v1` scenarios.
- no ecosystem, marketplace, 3D, provider, Petdex parity, cross-platform, or
  production release claim is made.

V10.x scoped product-grade animated 2D work-cat target is accepted.

V10.11 passed scoped for product-experience rebaseline only. It corrected the
wrong non-V10 active-stage draft and did not expand V10 into Petdex parity,
broad 3D readiness, provider readiness, OS-level binding readiness, or
production release readiness.

V10.12-V10.16 are accepted scoped for selected open-source visual-quality and
ordinary-user onboarding benchmarks. They must not claim full Petdex parity,
remote gallery/marketplace readiness, production release readiness, or platform
parity.

## Supporting Design Documents

- `docs/V10.x/v10_x-development-plan.md`
- `docs/V10.x/v10_x-acceptance-plan.md`
- `docs/V10.x/v10_x-target-architecture.md`
- `docs/V10.x/v10_x-model-detailed-design.md`
- `docs/V10.x/v10_6-animation-pack-format-spec.md`
- `docs/V10.x/v10_7-work-cat-v1-asset-production-spec.md`
- `docs/V10.x/v10_8-runtime-micro-interaction-state-machine.md`
- `docs/V10.x/v10_9-manager-preview-ux-spec.md`
- `docs/V10.x/v10_10-product-grade-visual-qa-matrix.md`
- `docs/V10.x/v10_x-milestones.md`
- `docs/V10.x/v10_x-exit-criteria.md`
- `docs/V10.x/v10_x-claim-matrix.md`
- `docs/V10.x/v10_x-evidence-index.md`
- `docs/V10.x/v10_11-product-experience-rebaseline.md`
- `docs/V10.x/v10_11-final-acceptance-report.md`
- `docs/V10.x/v10_12-v10_16-open-source-surpass-plan.md`
- `docs/V10.x/v10_12-open-source-benchmark-spec.md`
- `docs/V10.x/v10_13-premium-cat-library-acceptance-plan.md`
- `docs/V10.x/v10_14-first-run-wizard-acceptance-plan.md`
- `docs/V10.x/v10_15-built-in-gallery-ux-acceptance-plan.md`
- `docs/V10.x/v10_16-benchmark-surpass-gate.md`
- `docs/active/current-vs-target-gap.drawio`
