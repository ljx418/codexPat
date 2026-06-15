# V15 Development Plan: Living Desktop Interaction & Photo-Guided 2D Assets

日期：2026-06-09  
状态：V15.0-V15.13 passed scoped；do not mark post-V15 phases passed without their own runtime/provider/import evidence。  

## Scope

V15 owns the user-facing living interaction gap after V14:

```text
premium animated pet gallery
  -> priority-safe interaction model
  -> natural drag / release / land
  -> pointer-aware hover / click / double-click
  -> autonomous walk and edge avoidance
  -> emotion/action composition
  -> configurable interaction settings
  -> screenshot-backed final interaction QA
  -> photo-guided 2D action asset generation/import workflow
```

V15 does not reopen Codex monitoring, MCP, third-party integration, OS-level binding, 3D readiness, provider/photo-to-3D readiness, production signing, notarization, auto-update, Windows, cross-platform, or remote marketplace work. V15.9-V15.13 may use an explicit-consent named provider or import-ready prompt branch for 2D action assets, but must not claim broad provider integration or arbitrary automatic photo-to-2D readiness.

## Phase Plan

| Phase | Development Goal | Required Output |
| --- | --- | --- |
| V15.0 Scope Freeze | Freeze PRD, target architecture, claims, evidence names, and drawio. | `v15_0-scope-freeze` evidence |
| V15.1 Interaction Model | Implement priority-safe interaction model and living idle scheduler rebaseline. | interaction model smoke evidence |
| V15.2 Drag Physics | Implement grabbed/dragging/release/land flow, no image ghost, persisted position. | drag desktop smoke evidence |
| V15.3 Pointer Feedback | Implement pointer-near, hover, click, double-click visual feedback. | pointer/click smoke evidence |
| V15.4 Autonomous Walk | Implement bounded walk, pause, turn, edge avoidance, disable switch. | autonomous walk smoke evidence |
| V15.5 Emotion Composer | Compose agent state + user interaction + idle/walk without priority inversion. | composer smoke evidence |
| V15.6 Settings UX | Add settings controls and preview for interaction intensity / quiet mode. | settings smoke evidence |
| V15.7 Final Gate | Produce screenshot-backed interaction QA HTML and scans. | final report + HTML |
| V15.8 2D Continuity Hardening | Enforce first/final closure and adjacent-frame continuity for default and gallery 2D assets. | continuity smoke + contact/runtime HTML |
| V15.9 Photo Intake Consent | Add local photo privacy boundary, EXIF/path redaction, and explicit upload consent. | photo intake consent evidence |
| V15.10 Trait Prompt Pack | Add user-approved cat trait model and 8-action prompt pack generation. | trait/prompt evidence |
| V15.11 Provider Or Import Branch | Run real named-provider 2D smoke if available, otherwise produce import-ready workflow evidence. | provider/import branch evidence |
| V15.12 Continuity Assembly | Assemble generated/imported frames into safe local pack and run continuity validation. | assembly + continuity evidence |
| V15.13 Photo-To-2D Final Gate | Preview all actions, apply to target pet, and produce final screenshot/contact/runtime report. | final report + HTML |

## Phase Specs

| Phase | Spec / Checklist |
| --- | --- |
| V15.0 | `docs/V15.x/v15_0-scope-freeze-checklist.md` |
| V15.1 | `docs/V15.x/v15_1-interaction-priority-spec.md` |
| V15.2 | `docs/V15.x/v15_2-drag-physics-release-spec.md` |
| V15.3 | `docs/V15.x/v15_3-pointer-feedback-spec.md` |
| V15.4 | `docs/V15.x/v15_4-autonomous-walk-spec.md` |
| V15.5 | `docs/V15.x/v15_5-emotion-action-composer-spec.md` |
| V15.6 | `docs/V15.x/v15_6-interaction-settings-preview-spec.md` |
| V15.7 | `docs/V15.x/v15_7-final-qa-evidence-plan.md` |
| V15.8 | `docs/V15.x/evidence/v15_8-2d-animation-continuity-smoke-2026-06-10.md` |
| V15.9-V15.13 | `docs/V15.x/v15_9-v15_13-photo-to-2d-asset-plan.md` |
| V15.9-V15.13 detailed implementation | `docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md` |

Implementation surfaces and evidence ownership are defined in:

```text
docs/V15.x/v15_x-implementation-contract.md
```

## Development Rules

1. Each subphase must have PRD/spec review before implementation.
2. Each subphase must produce passed / blocked / failed evidence.
3. If drag creates a dragged-out image artifact, V15.2 fails.
4. If pointer/click/idle/walk sends PetEvent or writes CatStateMachine, the current phase fails.
5. If `error` or `need_input` can be overwritten by idle/click/walk/success, the current phase fails.
6. If autonomous walk exits safe desktop bounds or hides the cat, V15.4 fails.
7. V15.7 cannot start until V15.1-V15.6 have explicit evidence.
8. V15.9 cannot upload any photo before explicit consent.
9. V15.10 cannot persist raw photo, EXIF/GPS, source filename, or full local path.
10. V15.11 cannot claim provider readiness from one provider smoke.
11. V15.12 fails if generated/imported assets have open loops, large adjacent jumps, blank frames, or unsafe payloads.
12. V15.13 cannot pass if preview/apply affects default or unrelated pets.

## Regression Baseline

Minimum regression before V15.7:

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl check
pnpm --filter @agent-desktop-pet/petctl test
node scripts/v14_6_final_acceptance_gate_smoke.mjs
node scripts/v13_7_beta_readiness_gate_smoke.mjs
node scripts/v12_7_final_desktop_visibility_gate_smoke.mjs
node scripts/v11_7_interaction_qa_gate_smoke.mjs
```

Minimum regression before V15.13:

```bash
pnpm --filter desktop check
pnpm --filter desktop test
pnpm --filter @agent-desktop-pet/petctl test
node scripts/v15_7_final_interaction_gate_smoke.mjs
node scripts/v15_8_2d_animation_continuity_smoke.mjs
```

## Final Decision Rule

V15 passes only if drag, pointer-aware feedback, autonomous walk, priority-safe composition, settings controls, real desktop visual evidence, security scan, claim scan, and regression baseline all pass.

V15.8 additionally closes the user-reported 2D asset flicker gap by requiring
default/gallery bundled 2D assets to pass first/final closure, adjacent-frame
delta, nonblank, frame-difference, contact sheet, and runtime capture evidence.

V15.13 passed after V15.9-V15.12 each had explicit evidence and the final
report proved privacy/consent, trait approval, 8-action generation/import,
continuity assembly, preview, target-only apply, GUI screenshot evidence,
runtime capture evidence, security scan, claim scan, PRD/spec review, and
regression.
