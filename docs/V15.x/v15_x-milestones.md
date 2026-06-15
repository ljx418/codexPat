# V15 Milestones

日期：2026-06-09  
状态：V15.0-V15.13 passed scoped。  

| Milestone | Phase | Exit Artifact |
| --- | --- | --- |
| M0 | V15.0 Scope Freeze | `docs/V15.x/evidence/v15_0-scope-freeze-2026-06-10.md` |
| M1 | V15.1 Interaction Model | `docs/V15.x/evidence/v15_1-interaction-model-smoke-2026-06-10.md` |
| M2 | V15.2 Drag Physics | `docs/V15.x/evidence/v15_2-drag-physics-smoke-2026-06-10.md` |
| M3 | V15.3 Pointer Feedback | `docs/V15.x/evidence/v15_3-pointer-feedback-smoke-2026-06-10.md` |
| M4 | V15.4 Autonomous Walk | `docs/V15.x/evidence/v15_4-autonomous-walk-smoke-2026-06-10.md` |
| M5 | V15.5 Emotion Composer | `docs/V15.x/evidence/v15_5-emotion-composer-smoke-2026-06-10.md` |
| M6 | V15.6 Interaction Settings | `docs/V15.x/evidence/v15_6-interaction-settings-smoke-2026-06-10.md` |
| M7 | V15.7 Final Gate | `docs/V15.x/v15_7-final-acceptance-report.md` |
| M8 | V15.8 2D Animation Continuity | `docs/V15.x/evidence/v15_8-2d-animation-continuity-smoke-2026-06-10.md` |
| M9 | V15.9 Photo Intake Consent | `docs/V15.x/evidence/v15_9-photo-intake-consent-smoke-2026-06-10.md` |
| M10 | V15.10 Trait Prompt Pack | `docs/V15.x/evidence/v15_10-trait-prompt-pack-smoke-2026-06-10.md` |
| M11 | V15.11 Provider Or Import Branch | `docs/V15.x/evidence/v15_11-photo-2d-provider-or-import-smoke-2026-06-10.md` |
| M12 | V15.12 Continuity Assembly | `docs/V15.x/evidence/v15_12-photo-2d-continuity-assembly-smoke-2026-06-10.md` |
| M13 | V15.13 Photo-To-2D Final Gate | `docs/V15.x/v15_13-photo-2d-final-acceptance-report.md` |

## Go / No-Go

- V15.1 passed scoped after V15.0 scope freeze, spec review, and smoke evidence.
- V15.2 passed scoped after V15.1 evidence, drag smoke, check/test, and capture evidence.
- V15.3 passed scoped after V15.2 evidence, pointer smoke, check/test, and capture evidence.
- V15.4 passed scoped after V15.3 evidence, autonomous walk smoke, check/test, and capture evidence.
- V15.5 passed scoped after V15.1-V15.4 evidence, composer smoke, check/test, and PRD/spec review.
- V15.6 passed scoped after V15.1-V15.5 evidence, settings smoke, check/test, and capture evidence.
- V15.7 passed scoped after V15.1-V15.6 evidence, final HTML, real screenshot evidence, regression, security scan, claim scan, and PRD/spec review.
- V15.8 passed scoped after default flagship and bundled gallery 2D assets passed first/final closure, adjacent-frame continuity, nonblank, frame-difference, security scan, and contact/runtime evidence.
- V15.9 passed scoped after photo intake consent evidence, desktop check/test, redaction scan, claim scan, and PRD/spec review.
- V15.10 passed scoped after trait approval, 8-action digest-only prompt pack, desktop check/test, redaction scan, claim scan, and PRD/spec review.
- V15.11 passed scoped for import-ready branch after V15.10 evidence, provider not-run boundary, desktop check/test, redaction scan, claim scan, and PRD/spec review.
- V15.12 passed scoped after local frame continuity assembly, failed fixture table, previous pack preservation, desktop check/test, redaction scan, claim scan, and PRD/spec review.
- V15.13 Go after V15.9-V15.12 each has explicit passed evidence.

## Drift / False-Green Review

After each milestone:

- compare implementation against `agent_desktop_pet_prd_v15.md`.
- update `v15_x-current-gap-analysis.md`.
- scan forbidden claims.
- confirm evidence is real runtime or explicit static/spec evidence as required.
- stop if High drift or false-green risk appears.
