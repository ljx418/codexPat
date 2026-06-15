# V10.12-V10.16 Open-source Benchmark Surpass Plan

status: planned
date: 2026-06-05

## Goal

V10.12-V10.16 continues the V10 experience track after V10.11. The target is to
surpass selected open-source desktop-pet benchmarks in two evidence-backed
dimensions:

1. visual quality of the default local animated pets.
2. ordinary-user first-run onboarding for local work-cat scenarios.

This track does not claim Petdex ecosystem parity, broad 3D readiness, provider
integration readiness, automatic photo-to-3D readiness, production signed
release readiness, Windows readiness, or cross-platform readiness.

## External Benchmark Sources

The benchmark set is intentionally narrow and evidence-matched:

| Project | Observed strength | Source |
| --- | --- | --- |
| Petdex | public animated Codex pet gallery; `pet.json` plus `spritesheet.webp`; `npx petdex install <pet>` flow | `https://petdex.crafter.run/`, `https://petdex.crafter.run/about`, `https://petdex.crafter.run/docs` |
| OpenPets | quick start: install app, pick pet, connect assistant, verify; AI assistant integrations and local IPC | `https://openpets.dev/docs`, `https://openpets.dev/integrations`, `https://openpets.dev/integrations/claude` |
| Shijima-Qt | cross-platform shimeji runner and import-oriented desktop-pet UX | `https://github.com/pixelomer/Shijima-Qt` |

V10.12-V10.16 may only claim superiority over these selected benchmark
dimensions when evidence exists. It must not claim full project parity,
ecosystem size parity, or platform parity.

## Phase Plan

| Phase | Name | Goal |
| --- | --- | --- |
| V10.12 | Benchmark & Experience Spec | freeze comparison metrics, target architecture delta, and no-false-green claim boundary |
| V10.13 | Premium Built-in Animated Cat Library | bundle at least 6 high-quality animated 2D cats with full 8-action coverage |
| V10.14 | Ordinary-user First-run Wizard | let a new user create a visible pet or Codex work-cat without reading docs |
| V10.15 | Built-in Gallery & Safe Pack UX | provide local pet library, safe previews, restore default, user asset deletion |
| V10.16 | Benchmark Surpass Gate | prove selected visual and onboarding benchmarks with screenshots/recordings |

## V10.12 Benchmark & Experience Spec

Required implementation:

- document selected benchmark projects and exact comparison dimensions.
- define visual-quality metrics:
  - at least 6 local bundled cats.
  - 8 core actions per cat.
  - action-distinctness for thinking/running/warning/error/need_input/sleeping.
  - nonblank, frame-difference, 1x/0.75x readability, off-canvas checks.
- define onboarding metrics:
  - new user sees a pet in at most 3 steps.
  - new user creates a Codex work-cat and sees a test reaction in at most 5 steps.
  - no README reading is required for the main path.
- update active drawio to show external benchmark, current gap, target
  architecture, milestones, acceptance gates, and forbidden claims.

Evidence:

- `docs/V10.x/v10_12-open-source-benchmark-spec.md`
- `docs/V10.x/evidence/v10_12-benchmark-spec-review-YYYY-MM-DD.md`

Allowed claim:

```text
V10.12 selected open-source benchmark spec completed for visual-quality and first-run onboarding comparison.
```

## V10.13 Premium Built-in Animated Cat Library

Required implementation:

- add at least 6 bundled local animated 2D cat packs.
- each pack uses the existing safe animation pack path.
- each pack covers all 8 core actions:
  - idle
  - thinking
  - running
  - success
  - warning
  - error
  - need_input
  - sleeping
- each loop action has at least 8 frames.
- each transient action has at least 4 frames.
- each pack has license/attribution metadata.
- each pack can be selected as active for one PetInstance without affecting
  default or unrelated pets.
- fallback always remains visible.

Visual QA must include:

- contact sheet for every pack.
- runtime playback capture for every pack.
- nonblank and frame-difference check for every action.
- 1x and 0.75x scale screenshots.
- operator visual acceptance rubric.

Evidence:

- `docs/V10.x/evidence/v10_13-premium-cat-library-smoke-YYYY-MM-DD.md`
- `docs/V10.x/evidence/v10_13-premium-cat-library-contact-sheets-YYYY-MM-DD.html`
- `docs/V10.x/evidence/v10_13-premium-cat-library-runtime-capture-YYYY-MM-DD.html`
- `docs/V10.x/v10_13-premium-cat-asset-production-spec.md`

Allowed claim:

```text
V10.13 premium bundled animated 2D cat library passed for tested local visual-quality scenarios.
```

## V10.14 Ordinary-user First-run Wizard

Required implementation:

- first-run wizard appears when no onboarding completion flag exists.
- user can choose:
  - default desktop pet.
  - Codex work-cat.
- user can select one bundled cat pack.
- wizard creates a visible pet or work-cat instance.
- wizard provides a copyable wrapper-launched JSONL command for Codex.
- wizard has a "send test reaction" step that visibly changes only the target pet.
- wizard clearly marks already-open Codex window automatic monitoring as
  unsupported.
- wizard can be reopened from Settings.

Safety:

- no prompt text, workspace path, token, Authorization, raw payload, or tool
  command is persisted.
- wizard must not install hooks or MCP silently.
- no OS-level binding claim is made.

Evidence:

- `docs/V10.x/evidence/v10_14-first-run-wizard-smoke-YYYY-MM-DD.md`
- `docs/V10.x/evidence/v10_14-first-run-wizard-capture-YYYY-MM-DD.html`
- real desktop screenshots under `docs/V10.x/evidence/`.
- `docs/V10.x/v10_14-first-run-wizard-ui-state-spec.md`

Allowed claim:

```text
V10.14 ordinary-user first-run work-cat onboarding passed for tested local macOS scenarios.
```

## V10.15 Built-in Gallery & Safe Pack UX

Required implementation:

- Desktop Manager shows a local built-in pet gallery.
- gallery supports:
  - filter by style tag.
  - preview all 8 core actions.
  - activate for selected PetInstance.
  - restore default work-cat.
  - delete user-imported packs.
- gallery displays:
  - rendererKind.
  - action coverage.
  - frameCount / fps.
  - license / attribution.
  - quality status.
  - fallback status.
- preview remains isolated:
  - no `notify`.
  - no `CatStateMachine` write.
  - no live PetInstance state mutation.
  - no delete/activate unless user explicitly clicks a command.

Evidence:

- `docs/V10.x/evidence/v10_15-built-in-gallery-ux-smoke-YYYY-MM-DD.md`
- `docs/V10.x/evidence/v10_15-built-in-gallery-capture-YYYY-MM-DD.html`
- `docs/V10.x/v10_15-gallery-data-model-and-ux-spec.md`

Allowed claim:

```text
V10.15 built-in local pet gallery and safe pack UX passed for tested local scenarios.
```

## V10.16 Benchmark Surpass Gate

Required implementation:

- V10.12-V10.15 final evidence exists.
- visual-quality benchmark table is completed.
- first-run onboarding benchmark table is completed.
- real screenshots/recordings support the comparison.
- claim scan passes.
- security scan passes.
- regression passes.
- PRD/spec review passes.
- drawio sync passes.
- benchmark scoring follows `docs/V10.x/v10_16-benchmark-scoring-rubric.md`.

Allowed final claim:

```text
V10.16 selected open-source UX benchmark exceeded for tested local macOS visual quality and first-run onboarding scenarios.
```

Forbidden final claims:

- Petdex parity achieved.
- full open-source ecosystem parity.
- 3D ready.
- automatic photo-to-3D ready.
- provider integration verified.
- remote asset loading ready.
- marketplace ready.
- production signed release ready.
- cross-platform ready.
- Windows ready.

Implementation-ready supporting specs:

- `docs/V10.x/v10_13-premium-cat-asset-production-spec.md`
- `docs/V10.x/v10_14-first-run-wizard-ui-state-spec.md`
- `docs/V10.x/v10_15-gallery-data-model-and-ux-spec.md`
- `docs/V10.x/v10_16-benchmark-scoring-rubric.md`
- `docs/V10.x/v10_12-v10_16-final-report-templates.md`
