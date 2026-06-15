# V15 Implementation Contract

日期：2026-06-10  
状态：V15.0-V15.13 passed scoped contract；do not mark post-V15 phases passed from this document alone。  

## Purpose

This contract maps the V15 PRD and target architecture to concrete implementation surfaces, test ownership, and evidence outputs. It exists to prevent phase drift between "living desktop pet interaction" planning and actual code changes.

V15.9-V15.13 photo-to-2D implementation details, data contracts, reason codes,
UI states, and evidence fields are further specified in:

```text
docs/V15.x/v15_9-v15_13-photo-to-2d-detailed-implementation-spec.md
```

## Current Code Baseline

The following existing surfaces are the preferred implementation anchors:

| Area | Existing Surface | V15 Use |
| --- | --- | --- |
| Micro interactions | `apps/desktop/src/runtime-micro-interactions.ts` | Rebaseline and extend priority-safe idle, pointer, drag, click, and wake behavior. |
| Micro interaction tests | `apps/desktop/src/runtime-micro-interactions.test.ts` | Unit coverage for priority, blocking, timing, and no PetEvent / no CatStateMachine mutation. |
| Renderer contract | `apps/desktop/src/renderer/renderer-contract.ts` | Ensure V15 outputs remain safe action / renderer / pack / playback intent fields only. |
| Renderer registry | `apps/desktop/src/renderer/renderer-registry.ts` | Keep V15 visual actions routed through existing renderer adapters. |
| Action resolver | `apps/desktop/src/state/cat-action-resolver.ts` | Preserve priority behavior between agent state and visual action resolution. |
| Pet state machine | `apps/desktop/src/state-machine.ts` | V15 interaction layer must read state but not write CatStateMachine. |
| Desktop app surface | `apps/desktop/src/main.ts` | UI wiring for drag, pointer, autonomous walk, and settings. |
| Asset/gallery baseline | `apps/desktop/src/assets/*` | Keep V14 gallery and animation pack baseline intact. |
| Provider/photo baseline | `apps/desktop/src/assets/minimax-image-provider.ts`, `apps/desktop/src/assets/photo-to-asset-orchestration.ts` | Reuse only with explicit consent and redacted evidence; do not infer broad provider readiness. |
| Continuity guard | `apps/desktop/src/assets/bundled-packs/work-cat-animation-continuity.ts` | Reuse for generated/imported 2D frames before activation. |

If implementation discovers a better local surface, the phase evidence must record the reason and confirm no V15 claim expansion.

## New / Extended V15 Modules

Recommended additions are scoped to desktop runtime:

| Module | Responsibility | Required Boundary |
| --- | --- | --- |
| `interaction-priority-engine` | Select highest-priority visual intent. | No PetEvent, no notify, no CatStateMachine write. |
| `drag-physics-controller` | grabbed / dragging / release / land flow and persisted position. | No native drag ghost; no raw pointer traces in evidence. |
| `pointer-awareness-controller` | pointer-near / hover / click / double-click debounce and hysteresis. | No screen text, clipboard, or raw pointer path persistence. |
| `autonomous-walk-controller` | bounded walk, pause, turn, edge avoidance. | Configurable; no offscreen placement. |
| `emotion-action-composer` | Compose agent state, interaction, idle, and walk. | Renderer receives safe fields only. |
| `interaction-settings-store` | Persist user toggles and intensity presets. | Safe booleans/enums only; invalid values fallback. |
| `interaction-preview-sandbox` | Settings preview for interaction behavior. | Must not mutate live PetInstance. |
| `photo-intake-consent-boundary` | Photo selection, privacy disclosure, EXIF/path redaction, upload consent. | No raw photo/path/EXIF/GPS in evidence. |
| `cat-trait-review-model` | Safe trait extraction/entry and user approval. | Safe trait fields only. |
| `photo-2d-prompt-pack-generator` | 8-action prompt generation from approved traits. | Redacted prompt summaries in evidence by default. |
| `photo-2d-provider-or-import-branch` | Named provider smoke or import-ready prompt workflow. | No broad provider integration claim. |
| `photo-2d-continuity-assembler` | Assemble frames into local pack and run continuity/safety gates. | Invalid pack preserves previous active pack. |
| `generated-pack-preview-apply-flow` | Preview all actions and apply only to selected pet. | Preview does not mutate live state. |

Implementation may keep these as one file or split files, but evidence must show the same contracts are met.

## Phase Implementation Matrix

| Phase | Implementation Tasks | Minimum Automated Checks | Evidence |
| --- | --- | --- | --- |
| V15.0 | Freeze docs, parse drawio, scan claims/security. | document existence scan, drawio XML parse, claim scan. | `docs/V15.x/evidence/v15_0-scope-freeze-YYYY-MM-DD.md` |
| V15.1 | Priority engine and idle scheduler rebaseline. | unit tests for priority, zero PetEvent, zero CatStateMachine writes. | `docs/V15.x/evidence/v15_1-interaction-model-smoke-YYYY-MM-DD.md` |
| V15.2 | Drag grabbed / dragging / release / land with persisted position. | drag smoke, no native image ghost, target isolation. | `docs/V15.x/evidence/v15_2-drag-physics-smoke-YYYY-MM-DD.md` |
| V15.3 | Pointer-near, hover, click, double-click feedback. | debounce tests, blocking tests, zero PetEvent. | `docs/V15.x/evidence/v15_3-pointer-feedback-smoke-YYYY-MM-DD.md` |
| V15.4 | Autonomous walk, pause, turn, edge avoidance, disable switch. | bounded movement test, high-priority blocking test. | `docs/V15.x/evidence/v15_4-autonomous-walk-smoke-YYYY-MM-DD.md` |
| V15.5 | Emotion/action composer and safe renderer snapshot. | matrix tests for agent state + interaction combinations. | `docs/V15.x/evidence/v15_5-emotion-composer-smoke-YYYY-MM-DD.md` |
| V15.6 | Desktop Manager controls and isolated preview. | persistence test, preview no-live-mutation test. | `docs/V15.x/evidence/v15_6-interaction-settings-smoke-YYYY-MM-DD.md` |
| V15.7 | Final screenshot-backed QA and regression. | required regression, security scan, claim scan. | `docs/V15.x/v15_7-final-acceptance-report.md` |
| V15.8 | Continuity guard for default/gallery assets. | continuity smoke, contact sheet, runtime capture. | `docs/V15.x/evidence/v15_8-2d-animation-continuity-smoke-YYYY-MM-DD.md` |
| V15.9 | Photo intake and consent boundary. | redaction scan, no default upload, explicit consent cases. | `docs/V15.x/evidence/v15_9-photo-intake-consent-smoke-YYYY-MM-DD.md` |
| V15.10 | Trait review and prompt pack. | user approval required, 8 action prompt coverage. | `docs/V15.x/evidence/v15_10-trait-prompt-pack-smoke-YYYY-MM-DD.md` |
| V15.11 | Provider or import branch. | real provider if available, otherwise import-ready branch with blocked provider result. | `docs/V15.x/evidence/v15_11-photo-2d-provider-or-import-smoke-YYYY-MM-DD.md` |
| V15.12 | Generated/imported frame assembly. | frame count, closure, continuity, safe manifest validation. | `docs/V15.x/evidence/v15_12-photo-2d-continuity-assembly-smoke-YYYY-MM-DD.md` |
| V15.13 | Preview/apply final gate. | target isolation, screenshots/contact/runtime evidence, regression. | `docs/V15.x/v15_13-photo-2d-final-acceptance-report.md` |

## Runtime Output Contract

V15 renderer input snapshots may include only:

- safe action ID.
- safe interaction kind.
- renderer kind.
- safe pack ID.
- playback intent.
- scale.
- visibility.
- sanitized reasonCode.
- safe approved trait labels.
- safe generated pack ID.

V15 renderer input snapshots must not include:

- raw PetEvent.
- raw Agent / Codex / terminal / MCP / HTTP payload.
- raw pointer path.
- raw photo.
- EXIF/GPS.
- raw provider response.
- source filename.
- screen text contents.
- clipboard contents.
- prompt text.
- tool command text.
- token.
- Authorization.
- workspace path.
- config path.
- full local path.

## No-False-Green Rules

- A unit test alone cannot pass V15.2, V15.3, V15.4, V15.6, or V15.7 if the phase requires desktop visual evidence.
- V15.7 cannot start until V15.1-V15.6 evidence files exist with passed / blocked / failed status.
- If drag creates a native image ghost or dragged-out bitmap, V15.2 is failed.
- If autonomous walk moves a pet offscreen or makes it transparent, V15.4 is failed.
- If preview mutates live PetInstance state, V15.6 is failed.
- If any lower-priority action overwrites `error` or `need_input`, the active phase is failed.
- If photo/provider evidence includes raw photo, source path, EXIF/GPS, token,
  Authorization, or raw provider response, the active photo-to-2D phase is failed.
- If generated/imported frames fail continuity but activation still changes the
  target pet, V15.12/V15.13 is failed.
- If V15.11 has no real provider output, it may only pass the import-ready
  branch and must not claim automatic photo-to-2D.

## Required Final Regression

V15.7 must run or explicitly record a blocked result for:

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

## Implementation Readiness Decision

V15 documentation can support phase-by-phase implementation if:

- this contract remains aligned with the PRD, acceptance plan, target architecture, and drawio.
- V15.0 evidence passes before code changes are marked accepted.
- every later phase records evidence before the next phase is accepted.
