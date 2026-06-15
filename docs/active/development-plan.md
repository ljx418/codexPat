# Active Development Plan

文档状态：active index；V23-V28 planned；V22 scoped accepted 是输入基线。  
当前日期：2026-06-15。

## Current Active Line

V23-V28 is the current planned productization track. It starts from V22 scoped
accepted quality rejection and adds the missing upstream workflow for ordinary
users: photo suitability, trait extraction, multi-route generation, same-cat and
motion QA, automatic packaging, preview, target apply, rollback, retry guidance,
and a final productized wizard gate.

V23-V28 target flow:

```text
User Photo
  -> PhotoSuitabilityGate
  -> CatTraitExtractor
  -> GenerationRouteOrchestrator
  -> SameCat / Motion QA
  -> V22 Quality Review Gate
  -> 8-action Preview
  -> Target Apply / Rollback
```

V23-V28 active docs:

- `docs/active/agent_desktop_pet_prd_v23_v28.md`
- `docs/V23-V28.x/v23_v28-development-plan.md`
- `docs/V23-V28.x/v23_v28-detailed-development-and-acceptance-plan.md`
- `docs/V23-V28.x/v23_v28-acceptance-plan.md`
- `docs/V23-V28.x/v23_v28-target-architecture.md`
- `docs/V23-V28.x/v23_v28-current-gap-analysis.md`
- `docs/V23-V28.x/v23_v28-claim-matrix.md`
- `docs/V23-V28.x/v23_v28-milestones.md`
- `docs/V23-V28.x/v23_v28-implementation-contract.md`
- `docs/V23-V28.x/v23_v28-evidence-index.md`
- `docs/V23-V28.x/v23_v28-doc-audit.md`

V23-V28 are planned. V28 is No-Go until V23-V27 have passed / blocked / failed
evidence. This track must not claim Petdex parity, provider integration
verified, arbitrary-cat automatic photo-to-animation ready, automatic
photo-to-2D ready for arbitrary cats, 3D ready, production release readiness,
Windows readiness, or cross-platform readiness.

V22 accepted baseline evidence:

- `docs/V22.x/v22_7-final-acceptance-report.md`
- `docs/V22.x/evidence/v22_7-quality-review-dashboard-2026-06-15.html`
- `docs/V22.x/evidence/v22_7-regression-checks-2026-06-15.md`

## V21 Baseline

V21 is the latest scoped accepted product-experience recovery track. It starts from the V20
blocked provider motion-sheet evidence and stops treating "one provider directly
returns a perfect 8x9 sheet" as the only path. V21 runs four routes under one
QA/preview/apply/rollback contract, then lets the operator compare the actual
visual result:

```text
three local cat photos
  -> route orchestrator
      -> A provider key-pose to local animation pack
      -> B alternate provider capability preflight / scoped smoke
      -> C unified character plus local 2D rig
      -> D image-to-video to frames
  -> common same-cat / amplitude / background / loop QA
  -> side-by-side route comparator
  -> best route Manager preview
  -> target-only apply / rollback
```

V21 active docs:

- `docs/active/agent_desktop_pet_prd_v21.md`
- `docs/V21.x/v21_x-development-plan.md`
- `docs/V21.x/v21_x-acceptance-plan.md`
- `docs/V21.x/v21_x-target-architecture.md`
- `docs/V21.x/v21_x-current-gap-analysis.md`
- `docs/V21.x/v21_x-claim-matrix.md`
- `docs/V21.x/v21_x-milestones.md`
- `docs/V21.x/v21_x-exit-criteria.md`
- `docs/V21.x/v21_x-implementation-contract.md`
- `docs/V21.x/v21_x-route-comparison-matrix.md`
- `docs/V21.x/v21_x-doc-audit.md`

V21.0-V21.7 passed scoped on 2026-06-14. Route A was selected as the tested best
route, Route C passed as local-rig fallback evidence, Route B passed as provider
capability review only, and Route D was excluded because no safe explicit-consent
video source was available. V21 must not claim provider integration verified,
arbitrary-cat automatic photo-to-animation ready, low-retry reliability for
arbitrary cats, Petdex parity, Petdex asset reuse authorization, 3D readiness,
production release readiness, Windows readiness, or cross-platform readiness.

V21 final evidence:

- `docs/V21.x/v21_7-final-acceptance-report.md`
- `docs/V21.x/evidence/v21_7-final-acceptance-dashboard-2026-06-14.html`

## V20 Blocked Provider Baseline

V20 is now an input baseline for V21. It started from the accepted V19 local
Petdex-style motion sheet baseline and verified whether a mainland provider,
with MiniMax as P0, can produce a real same-cat high-amplitude motion sheet
suitable for ordinary-user preview/apply/rollback:

```text
user cat photo
  -> mainland provider selection
  -> consent / cost / privacy / retention / license boundary
  -> MiniMax reference-image motion sheet live smoke
  -> provider output normalization and background gate
  -> motion amplitude / same-cat / loop QA
  -> Manager preview
  -> target-only apply
  -> rollback
```

V20 active docs:

- `docs/active/agent_desktop_pet_prd_v20.md`
- `docs/V20.x/v20_x-development-plan.md`
- `docs/V20.x/v20_x-detailed-development-and-acceptance-plan.md`
- `docs/V20.x/v20_x-acceptance-plan.md`
- `docs/V20.x/v20_x-target-architecture.md`
- `docs/V20.x/v20_x-current-gap-analysis.md`
- `docs/V20.x/v20_x-claim-matrix.md`
- `docs/V20.x/v20_x-milestones.md`
- `docs/V20.x/v20_x-exit-criteria.md`
- `docs/V20.x/v20_x-implementation-contract.md`
- `docs/V20.x/v20_x-mainland-provider-matrix.md`
- `docs/V20.x/v20_x-minimax-live-smoke-request-spec.md`
- `docs/V20.x/v20_x-provider-benchmark-and-repair-loop-spec.md`
- `docs/V20.x/v20_x-motion-quality-qa-thresholds.md`
- `docs/V20.x/v20_x-doc-audit.md`

V20.0 and V20.1 passed, and V20.2 produced three MiniMax
reference-image provider outputs from three real cat photos. V20.3 is blocked because the generated provider
image was not a valid 8x9 motion sheet; V20.4/V20.5 are therefore blocked by
dependency and V20.6 remains No-Go. V20 must not claim provider integration
verified, arbitrary-cat automatic photo-to-animation ready, Petdex parity,
Petdex asset reuse authorization, 3D readiness, production release readiness,
Windows readiness, or cross-platform readiness.

V19 is the latest passed scoped visual-asset track. It starts from the accepted
V18 user-photo-to-2D workflow and upgrades the asset goal from transform-derived
same-cat frames to Petdex-style high-amplitude motion sheets:

```text
user cat photo or local motion sheet
  -> license/consent boundary
  -> provider single-sheet generation or local sheet import
  -> safe sheet validation
  -> crop / normalize / pack
  -> motion amplitude and same-cat QA
  -> Manager preview
  -> target-only apply
  -> rollback
```

V19 active docs:

- `docs/active/agent_desktop_pet_prd_v19.md`
- `docs/V19.x/v19_x-development-plan.md`
- `docs/V19.x/v19_x-detailed-development-and-acceptance-plan.md`
- `docs/V19.x/v19_x-acceptance-plan.md`
- `docs/V19.x/v19_x-target-architecture.md`
- `docs/V19.x/v19_x-current-gap-analysis.md`
- `docs/V19.x/v19_x-claim-matrix.md`
- `docs/V19.x/v19_x-milestones.md`
- `docs/V19.x/v19_x-exit-criteria.md`
- `docs/V19.x/v19_x-implementation-contract.md`
- `docs/V19.x/v19_x-motion-sheet-format-and-qa-spec.md`
- `docs/V19.x/v19_x-petdex-resource-boundary.md`
- `docs/V19.x/v19_x-doc-audit.md`

V19.0-V19.6 passed scoped for the tested local motion-sheet import/crop/QA/
preview/apply/rollback path. V19 provider single-sheet generation remained
blocked/not-claimed, so V20 owns the next provider-generation attempt.

V18 is the latest passed scoped product workflow track. It starts from the accepted
V17 wizard/import/apply baseline and upgrades the goal to the user-facing
experience the product still lacks:

```text
user selects a real cat photo
  -> explicit provider consent
  -> real image-to-image/reference-image generation
  -> generated 8-action 2D output
  -> same-cat and continuity QA
  -> in-app preview
  -> target-only apply
  -> rollback
```

V18 active docs:

- `docs/active/agent_desktop_pet_prd_v18.md`
- `docs/V18.x/v18_x-development-plan.md`
- `docs/V18.x/v18_x-detailed-development-and-acceptance-plan.md`
- `docs/V18.x/v18_x-acceptance-plan.md`
- `docs/V18.x/v18_x-target-architecture.md`
- `docs/V18.x/v18_x-current-gap-analysis.md`
- `docs/V18.x/v18_x-claim-matrix.md`
- `docs/V18.x/v18_x-milestones.md`
- `docs/V18.x/v18_x-exit-criteria.md`
- `docs/V18.x/v18_x-implementation-contract.md`
- `docs/V18.x/v18_x-provider-capability-preflight.md`
- `docs/V18.x/v18_x-wizard-state-and-evidence-spec.md`
- `docs/V18.x/v18_x-doc-audit.md`

V18.0-V18.6 have passed scoped evidence. V18 confirms the tested local MiniMax
reference-image workflow from user photo consent through provider generation,
8-action pack assembly, QA, preview/apply/rollback model path, and final
HTML/regression gate. V18 remains scoped to the tested MiniMax image-to-image
scenario; V17 text-to-image action-sheet evidence cannot be reused as broader
local-photo readiness, and V18 does not imply arbitrary-cat automation or
provider integration readiness.

V17 is the latest passed scoped product-experience track. It starts from the V16
scoped accepted provider-backed photo-to-2D evidence and turns that engineering
pipeline into a usable Desktop Manager wizard for the tested local photo +
4x2 action-sheet path.

V17 target flow:

```text
choose cat photo
  -> see safe preview and consent
  -> select host/manual/provider/import generation mode
  -> see loading/status/reasonCode
  -> upload or receive 4x2 action sheet
  -> auto crop and package 8 actions
  -> preview QA in modal
  -> apply to target cat
  -> retry / rollback with previous pack preserved
```

V17 active docs:

- `docs/active/agent_desktop_pet_prd_v17.md`
- `docs/V17.x/v17_x-development-plan.md`
- `docs/V17.x/v17_x-acceptance-plan.md`
- `docs/V17.x/v17_x-target-architecture.md`
- `docs/V17.x/v17_x-current-gap-analysis.md`
- `docs/V17.x/v17_x-claim-matrix.md`
- `docs/V17.x/v17_x-milestones.md`
- `docs/V17.x/v17_x-exit-criteria.md`
- `docs/V17.x/v17_x-implementation-contract.md`

V17.0-V17.7 passed scoped on 2026-06-11. V17.7 adds a tested MiniMax
text-to-image provider API action-sheet path. V17 must not claim automatic
photo-to-2D readiness for arbitrary cats, local photo upload to provider,
provider integration verified, Petdex parity, 3D ready, production signed
release readiness, Windows readiness, or cross-platform readiness.

V16 is the latest passed scoped baseline. It turns the V15 photo-guided
import-ready workflow into a tested host-image-tool-backed multi-frame 2D action
generation workflow. V16 starts from the V15.9-V15.13 scoped accepted baseline
but does not reuse V15 import-ready evidence as provider evidence.

V16 target flow:

```text
cat photo
  -> explicit consent and provider disclosures
  -> user-approved same-cat traits
  -> named provider generates 8 core action frame sets
  -> provider output is normalized into local app-managed frames
  -> same-cat consistency review
  -> V15.12 continuity assembly
  -> Desktop Manager preview
  -> target-only apply and rollback
```

V16 active docs:

- `docs/active/agent_desktop_pet_prd_v16.md`
- `docs/V16.x/v16_x-development-plan.md`
- `docs/V16.x/v16_x-acceptance-plan.md`
- `docs/V16.x/v16_x-target-architecture.md`
- `docs/V16.x/v16_x-current-gap-analysis.md`
- `docs/V16.x/v16_x-claim-matrix.md`
- `docs/V16.x/v16_x-milestones.md`
- `docs/V16.x/v16_x-exit-criteria.md`
- `docs/V16.x/v16_x-implementation-contract.md`

V16.0-V16.6 passed scoped on 2026-06-11 with host ChatGPT/Codex image tool
source output, local frame normalization, same-cat consistency review,
continuity assembly, preview/apply model, and final HTML evidence. V16 must not
claim automatic photo-to-2D readiness for arbitrary cats, provider integration
verified, Petdex parity, 3D ready, production release readiness, Windows
readiness, or cross-platform readiness.

V15 is the latest interaction-experience track after the accepted V14
premium pet gallery and stable animated asset baseline. V15.0-V15.8 have
passed scoped evidence. The track delivered:

- natural drag / release / land behavior.
- pointer-near / hover / click / double-click feedback.
- bounded autonomous walk and edge avoidance.
- priority-safe composition across agent state, drag, pointer, click, walk, and idle.
- user settings for interaction intensity and quiet mode.
- screenshot-backed final interaction QA.
- default and gallery 2D animation continuity hardening with closed first/final
  frames and bounded adjacent-frame deltas.

V15.9 passed scoped for local photo intake, privacy redaction, no-default-upload,
and explicit consent boundaries. V15.10 passed scoped for cat trait review and
digest-only 8-action prompt pack generation. V15.11 passed scoped for the
import-ready provider/import branch while leaving the real provider branch
not-run. V15.12 passed scoped for local frame continuity assembly and previous
pack preservation. V15.13 passed scoped with Desktop Manager preview/apply flow,
target-only apply evidence, GUI screenshot evidence, and runtime capture. This phase
must not claim automatic photo-to-2D readiness or provider integration verified
until matching evidence exists.

V15 final gate passed scoped for the tested local macOS living interaction
scenario, and V15.8 subsequently closed the user-reported 2D animation flicker
gap for bundled default/gallery sprite assets. V15 must not claim Petdex parity,
Petdex ecosystem parity, broad 3D readiness, automatic photo-to-3D readiness,
provider integration readiness, remote marketplace readiness, production signed
release readiness, Windows readiness, or cross-platform readiness.

V15 scoped final claim:

```text
V15 living desktop pet interaction upgrade passed for tested local macOS scenarios with drag, pointer-aware feedback, autonomous walk, configurable interaction settings, and priority-safe state composition.
```

V14 is the latest closed scoped product-experience track after the accepted V13
beta-user-ready closure. It delivered:

- high-quality default animated cat.
- stable multi-frame animation asset system.
- local pet gallery with browse / filter / favorites.
- isolated preview and one-click switching.
- AI asset workflow product boundary for ordinary users.

V14 final gate passed scoped for tested local macOS scenarios. V14 still must
not claim Petdex parity, Petdex ecosystem parity, broad 3D readiness, automatic
photo-to-3D readiness, provider integration readiness, remote marketplace
readiness, production signed release readiness, Windows readiness, or
cross-platform readiness.

V14 final scoped claim:

```text
V14 local premium animated pet gallery, stable 2D animation playback, favorites, preview, and one-click switching experience passed for tested local macOS scenarios.
```

V13.1-V13.7 passed scoped for the tested local macOS beta workflow scenario.
V13 did not reopen lower-level agent protocol, renderer safety, provider, 3D,
or OS-level Codex binding work; it turned the accepted V12 desktop-visible app
into a beta-user-ready local macOS workflow:

- local macOS packaging / install smoke foundation.
- first-run guide and ordinary-user onboarding.
- Codex work-cat onboarding with reliable JSONL wrapper path.
- safe diagnostics export and redaction scan.
- stability/performance baseline.
- artifact/license/claim hygiene.
- screenshot-backed beta acceptance HTML.

V13 final scoped claim:

```text
V13 beta distribution and user-ready closure passed for tested local macOS beta workflow scenarios.
```

V13 must not claim production signed release readiness, notarized release
readiness, auto-update readiness, Petdex parity, broad 3D readiness, automatic
photo-to-3D, provider integration, OS-level Codex binding, cross-platform, or
Windows readiness.

V3.x 已完成 scoped acceptance，作为当前可复用基线关闭。V3.6 hook-only strategy 保留为 historical blocked evidence，不再作为 active strategy 推进。V3.7 Codex Exec JSONL Monitor 是当前已验收的可靠监听路径，但只覆盖 wrapper-launched `codex exec --json` sessions。

V4.x 已经完成 scoped final acceptance：Terminal.app scoped candidate discovery / user-confirmed binding / manual route-test prototype、V4.4 managed exec JSONL session state mapping、V4.5 scoped real TUI hook lifecycle、V4.6 diagnostics、V4.7 sanitized session status。V4.x 仍不声明任意 already-open Codex TUI 自动监听或 OS-level binding ready。

V6 productization closed as a scoped baseline. V6.0-V6.9 have passed for tested local macOS developer workflow scenarios, and no new V6 feature development is planned. Remaining V6 work is closure hygiene only: document consistency, evidence review, regression reruns, security scan, claim scan, license/artifact scan, and commit readiness. External provider generation、自动 photo-to-3D、marketplace、MCP ready、cross-platform 和 production signed release 仍不属于已通过能力。

V7.0-V7.15 passed scoped for tested local guided/provider-assisted personalized cat asset workflow scenarios, advanced claim boundary planning, scoped MiniMax image provider smoke, generated 2D action pack target runtime activation, local GLB/GLTF intake contract evidence, tested local imported GLB/GLTF runtime action mapping, scoped photo-to-asset orchestration, scoped advanced visual QA, and the evidence-matched advanced final gate. Automatic photo-to-3D remains not-ready because no real 3D provider output was supplied or accepted.

V8.0-V8.11 have accepted scoped provider-backed photo-to-3D/productized 3D
workflow evidence through named provider output, GLTF normalization, runtime
visual QA, guided UX, operational hardening, final gate, prototype GLB rendering
quality improvement, local multi-frame sprite assembly, prompt-only animated
sprite workflow, and animated sprite visual QA. V8 must not use V7 generated 2D
images, fixture GLB import, local sample 3D rendering, local animated sprite
assembly, or prompt-only animated sprite instructions as automatic
photo-to-3D/provider/AI generation readiness evidence.

V9 has partial scoped evidence: MiniMax readiness passed, MiniMax static 2D
eight-action generation passed, and MiniMax dynamic 2D two-frame generation
passed for tested explicit-consent local scenarios. Tripo3D real 3D provider
generation remains blocked because no Tripo3D credential/consent/terms or real
provider GLB output evidence is available. V9 does not prove a Petdex-like
animated runtime experience by itself.

V10.x is reopened as the current product experience track. V10.1-V10.5 are the
accepted scoped animation baseline, but they are not product-grade. V10.6 passed
scoped for safe local `pet.json` animation pack adaptation and kept V5 manifest
compatibility. V10.7 passed scoped for bundled `work-cat-v1` visual smoke.
V10.8 passed scoped for runtime micro-interaction controller scenarios.
V10.9 passed scoped for Manager preview/activation polish. V10.10 passed the
scoped product-grade animated 2D work-cat final visual QA gate. Animated GLTF
runtime playback remains excluded.
V10 must not claim Petdex parity, broad 3D readiness, automatic photo-to-3D
readiness, or provider integration readiness.

V10.12-V10.16 are accepted scoped as the selected V10 open-source benchmark
experience track. They target selected benchmark dimensions only: premium local
visual quality and ordinary-user first-run onboarding. The final claim is
limited to tested local macOS scenarios and must not imply Petdex ecosystem
parity, broad 3D readiness, provider readiness, production signed release
readiness, cross-platform readiness, or Windows readiness.

V11.1-V11.7 have passed scoped acceptance. V11 is closed for the tested local
living work-cat interaction track. New work must start as a later phase or
separate track and must keep V11 forbidden claims out of ready wording.

V12.1-V12.7 passed scoped as the desktop visibility track. V12.7 final evidence
is `docs/V12.x/v12_7-final-acceptance-report.md`; the acceptance HTML is
`docs/V12.x/evidence/v12_6-complete-acceptance-html-2026-06-07.html`.

V13.1-V13.7 passed scoped as the beta distribution and user-ready closure track.
V13.7 final evidence is `docs/V13.x/v13_7-final-acceptance-report.md`; the
embedded screenshot-backed HTML is
`docs/V13.x/evidence/v13_7-beta-readiness-html-2026-06-08.html`.

V14 planned references:

- `docs/active/agent_desktop_pet_prd_v14.md`
- `docs/V14.x/v14_x-development-plan.md`
- `docs/V14.x/v14_x-acceptance-plan.md`
- `docs/V14.x/v14_x-target-architecture.md`
- `docs/V14.x/v14_x-current-gap-analysis.md`
- `docs/V14.x/v14_x-claim-matrix.md`
- `docs/V14.x/v14_x-exit-criteria.md`
- `docs/V14.x/v14_x-doc-audit.md`

## Audit Sources

- `docs/active/agent_desktop_pet_prd_v11.md`
- `docs/active/agent_desktop_pet_prd_v12.md`
- `docs/active/agent_desktop_pet_prd_v13.md`
- `docs/active/current-vs-target-gap.md`
- `docs/active/current-vs-target-gap.drawio`
- `docs/active/acceptance-plan.md`
- `docs/V10.x/v10_11-product-experience-rebaseline.md`
- `docs/V10.x/v10_11-final-acceptance-report.md`
- `docs/V10.x/v10_x-development-plan.md`
- `docs/V10.x/v10_x-acceptance-plan.md`
- `docs/V10.x/v10_x-target-architecture.md`
- `docs/V10.x/v10_x-claim-matrix.md`
- `docs/V10.x/v10_x-current-gap-analysis.md`
- `docs/V10.x/v10_12-v10_16-open-source-surpass-plan.md`
- `docs/V10.x/v10_12-open-source-benchmark-spec.md`
- `docs/V10.x/v10_13-premium-cat-library-acceptance-plan.md`
- `docs/V10.x/v10_13-premium-cat-asset-production-spec.md`
- `docs/V10.x/v10_14-first-run-wizard-acceptance-plan.md`
- `docs/V10.x/v10_14-first-run-wizard-ui-state-spec.md`
- `docs/V10.x/v10_15-built-in-gallery-ux-acceptance-plan.md`
- `docs/V10.x/v10_15-gallery-data-model-and-ux-spec.md`
- `docs/V10.x/v10_16-benchmark-scoring-rubric.md`
- `docs/V10.x/v10_16-benchmark-surpass-gate.md`
- `docs/V10.x/v10_12-v10_16-final-report-templates.md`
- `docs/V11.x/v11_x-development-plan.md`
- `docs/V11.x/v11_x-acceptance-plan.md`
- `docs/V11.x/v11_x-target-architecture.md`
- `docs/V11.x/v11_x-current-gap-analysis.md`
- `docs/V11.x/v11_x-claim-matrix.md`
- `docs/V11.x/v11_x-milestones.md`
- `docs/V11.x/v11_x-doc-audit.md`
- `docs/V12.x/v12_x-development-plan.md`
- `docs/V12.x/v12_x-acceptance-plan.md`
- `docs/V12.x/v12_x-target-architecture.md`
- `docs/V12.x/v12_x-current-gap-analysis.md`
- `docs/V12.x/v12_x-claim-matrix.md`
- `docs/V12.x/v12_x-milestones.md`
- `docs/V12.x/v12_x-exit-criteria.md`
- `docs/V12.x/v12_x-doc-audit.md`
- `docs/V13.x/v13_x-development-plan.md`
- `docs/V13.x/v13_x-acceptance-plan.md`
- `docs/V13.x/v13_x-target-architecture.md`
- `docs/V13.x/v13_x-current-gap-analysis.md`
- `docs/V13.x/v13_x-claim-matrix.md`
- `docs/V13.x/v13_x-milestones.md`
- `docs/V13.x/v13_x-exit-criteria.md`
- `docs/V13.x/v13_x-implementation-contract.md`
- `docs/V13.x/v13_x-doc-audit.md`
- `docs/V3.x/v3_x-development-plan.md`
- `docs/V3.x/v3_x-final-acceptance-report.md`
- `docs/V3.x/v3_x-codex-monitoring-strategy.md`
- `docs/V3.6/v3_6-final-acceptance-report.md`
- `docs/V3.7/v3_7-final-acceptance-report.md`
- `docs/V4.x/v4_x-development-plan.md`
- `docs/V4.x/v4_x-acceptance-plan.md`
- `docs/V4.x/v4_x-current-gap-analysis.md`
- `docs/V4.x/v4_x-claim-matrix.md`
- `docs/V4.x/v4_4-final-acceptance-report.md`
- `docs/V5.x/v5_x-development-plan.md`
- `docs/V5.x/v5_x-acceptance-plan.md`
- `docs/V5.x/v5_x-current-gap-analysis.md`
- `docs/V5.x/v5_x-claim-matrix.md`
- `docs/active/agent_desktop_pet_prd_v6.md`
- `docs/V6.0/v6_0-development-plan.md`
- `docs/V6.0/v6_0-acceptance-plan.md`
- `docs/V6.0/v6_0-claim-matrix.md`
- `docs/V6.x/v6_x-development-plan.md`
- `docs/V6.x/v6_x-acceptance-plan.md`
- `docs/V6.x/v6_x-claim-matrix.md`
- `docs/V6.1/v6_1-development-plan.md`
- `docs/V6.1/v6_1-acceptance-plan.md`
- `docs/V6.1/v6_1-plan-audit.md`
- `docs/V6.2/v6_2-development-plan.md`
- `docs/V6.2/v6_2-acceptance-plan.md`
- `docs/V6.2/v6_2-plan-audit.md`
- `docs/active/agent_desktop_pet_prd_v7.md`
- `docs/active/agent_desktop_pet_prd_v8.md`
- `docs/V7.x/v7_x-development-plan.md`
- `docs/V7.x/v7_x-acceptance-plan.md`
- `docs/V7.x/v7_x-current-gap-analysis.md`
- `docs/V7.x/v7_x-claim-matrix.md`
- `docs/V7.x/v7_x-evidence-index.md`
- `docs/V7.x/v7_remaining_target_architecture.md`
- `docs/V7.x/v7_remaining_development_and_acceptance_plan.md`
- `docs/V8.x/v8_x-development-plan.md`
- `docs/V8.x/v8_x-acceptance-plan.md`
- `docs/V8.x/v8_x-target-architecture.md`
- `docs/V8.x/v8_x-claim-matrix.md`
- `docs/V8.x/v8_x-current-gap-analysis.md`
- `docs/V8.x/v8_x-remote-milestones.md`
- `docs/V8.x/v8_x-doc-audit-2026-06-01.md`
- `docs/V8.x/v8_9-animated-sprite-assembler-development-plan.md`
- `docs/V8.x/v8_10-ai-assisted-animated-sprite-workflow-development-plan.md`
- `docs/V8.x/v8_11-animated-sprite-visual-qa-development-plan.md`
- `docs/V9.x/v9_x-development-plan.md`
- `docs/V9.x/v9_x-current-gap-analysis.md`
- `docs/V9.x/v9_x-claim-matrix.md`
- `docs/V10.x/v10_x-development-plan.md`
- `docs/V10.x/v10_x-acceptance-plan.md`
- `docs/V10.x/v10_x-target-architecture.md`
- `docs/V10.x/v10_x-model-detailed-design.md`
- `docs/V10.x/v10_6-animation-pack-format-spec.md`
- `docs/V10.x/v10_7-work-cat-v1-asset-production-spec.md`
- `docs/V10.x/v10_8-runtime-micro-interaction-state-machine.md`
- `docs/V10.x/v10_9-manager-preview-ux-spec.md`
- `docs/V10.x/v10_10-product-grade-visual-qa-matrix.md`
- `docs/V10.x/v10_x-claim-matrix.md`
- `docs/V10.x/v10_x-current-gap-analysis.md`

## V11.x Development Rule

V11 is now the selected active experience line. It owns living desktop-pet
interaction only and must not change V3/V4 Codex monitoring semantics, V5-V10
asset safety boundaries, provider claims, 3D claims, release claims, or
cross-platform claims.

V11 implementation order:

1. V11.1 Living Idle System: passed scoped.
2. V11.2 Pointer-Aware Interaction: passed scoped.
3. V11.3 Emotion Layer.
4. V11.4 Visual Action Composer.
5. V11.5 Flagship `living-work-cat-v1` pack.
6. V11.6 First-Run Delight.
7. V11.7 Final Interaction QA Gate: passed scoped.

V11.7 final gate passed after regression, security scan, claim scan, PRD/spec
review, and drawio sync.

## Closed Baseline Claims

These claims are closed V3.x baseline claims, not new V4.x readiness claims:

```text
V3.1 ready: multi-instance Codex pet workflow stabilized with user onboarding, manager polish, repeatable runtime smoke, and migration guidance.
V3.2 MCP adapter minimal smoke passed for localhost bridge routing.
V3.2 third-party contract v3 smoke passed.
V3.3 Codex window/session-to-pet binding smoke passed for tested local macOS terminal scenarios.
V3.4 Codex hook wrapper fixture smoke passed.
V3.4 Codex hooks state mapping smoke passed for tested local Codex hook scenarios.
V3.5 Codex hook diagnostics and recovery smoke passed for tested local diagnostics scenarios.
V3.6 final acceptance blocked on real PostToolUse failure evidence.
V3.6 hook-only monitoring is deprecated as an active strategy and superseded by V3.7 JSONL monitoring for supported wrapper-launched codex exec --json sessions.
V3.7 Codex exec JSONL monitor state mapping passed for tested local wrapper-launched codex exec --json scenarios.
V3.x scoped Codex local workflow acceptance passed with documented evidence and claim boundaries.
```

## Accepted Scoped Claims

Allowed scoped claims:

```text
V6 productization acceptance passed for tested local macOS developer workflow scenarios.
```

V4.x is no longer a planning-only line; it has scoped final acceptance evidence. V5.0-V5.15 also have scoped acceptance evidence for renderer/assets, the personalized CLI import pipeline, Desktop Manager local import UI, runtime imported rendering, guided prompt/import instructions, provider feasibility boundary, and visual QA. This does not imply user distribution readiness, provider readiness, automatic photo-to-3D readiness, marketplace readiness, production signed release readiness, or OS-level binding acceptance.

## Forbidden Claims

The following remain forbidden as ready / verified / passed claims unless a later scoped phase produces explicit evidence and final acceptance:

```text
OS-level Codex window binding ready
interactive Codex TUI monitoring ready
already-open Codex window auto-detection ready
already-open Codex window auto-monitoring ready
all Codex workflows verified
Codex internal reasoning exact mapping ready
ModelThinkingStart / ModelThinkingEnd verified
V3.6 selected Codex workflow hook coverage smoke passed
PostToolUse failure hook evidence passed
Claude Code integration verified
MCP ready
Third-party agent integration verified
Windows ready
cross-platform ready
USB ready
production signed release ready
per-instance queue ready
Rive / Live2D / 3D ready
custom asset pack import ready
user asset upload ready
asset marketplace ready
automatic photo-to-3D ready
provider integration verified
remote asset loading ready
```

## Current Codex Monitoring Direction

The product-supported reliable Codex monitoring path is now the managed exec JSONL wrapper entry:

```bash
node packages/petctl/dist/cli.js codex session start \
  --mode exec \
  --monitor jsonl \
  --name "Review Cat" \
  -- codex exec --json "summarize this repository"
```

This monitor:

- applies only to wrapper-launched `codex exec --json`.
- parses structured JSONL event types only.
- maps `turn.started -> thinking`, `item.started -> running`, `turn.completed -> success` if no error, and `turn.failed` / `error -> error`.
- does not parse terminal text.
- does not read `transcript_path`.
- does not record raw JSONL, prompt text, tool command text, token, Authorization, workspace path, config path, or full local paths.

Managed TUI hooks are available as a planned/manual path:

```bash
node packages/petctl/dist/cli.js codex session start \
  --mode tui \
  --monitor hooks \
  --name "TUI Cat" \
  -- codex
```

This path requires real hook trust/lifecycle evidence before any TUI state mapping claim. It is not currently accepted as ready.

## V4.5-V4.x Development Rule

V4.5 current status:

```text
V4.5 managed Codex TUI hook state mapping passed for UserPromptSubmit, PreToolUse, and Stop in tested local wrapper-launched scenario; PermissionRequest remains blocked by local policy.
```

V4.5 real managed TUI hook acceptance must continue to require:

- wrapper-launched Codex TUI.
- `/hooks` review/trust.
- real prompt submission.
- real tool use.
- real Stop event.
- permission request if local policy emits it.
- target cat changes.
- default and unrelated pets unchanged.

Preflight is not real lifecycle evidence and cannot be used to claim TUI hook state mapping passed. The accepted V4.5 claim is based on the separate real lifecycle evidence file and remains scoped to the observed hook events only.

V4.6 has implemented startup diagnostics and UX hardening:

- desktop health preflight.
- hooks config check.
- wrapper script check.
- Codex CLI check.
- clear `/hooks` trust instruction.
- stable reasonCode.

V4.7 has implemented sanitized session status:

```bash
petctl codex session status --json
```

It must not expose raw TTY, raw args, window title, path, prompt, tool command, raw hook payload, token, or Authorization.

V4.x Final must not run until V4.6 and V4.7 are accepted. Final claims must keep the V4.5 lifecycle scope explicit and must not include `PermissionRequest` unless a future local policy emits it and evidence passes.

## V5.x Development Rule

V5.x is now the selected active line. It owns renderer / asset productization only and must not change V3/V4 Codex monitoring semantics.

Completed scoped V5.x evidence:

- V5.0 asset system freeze.
- V5.1 bundled 2D sprite smoke.
- V5.2 renderer plugin interface.
- V5.3 bundled GLTF prototype.
- V5.4 bundled 3D action pack smoke.
- V5.5 runtime renderer selection.
- V5.6 privacy and claim boundary.
- V5.7 prompt pack generator.
- V5.8 local personalized import.
- V5.9 CLI activation mapping.
- V5.10 provider feasibility.
- V5.11 Desktop Manager local import UI.

Completed V5.x scoped productization order:

1. V5.12 runtime imported pack rendering and per-PetInstance activation.
2. V5.13 privacy-preserving photo/description guided prompt workflow.
3. V5.14 provider feasibility boundary, without default upload or real provider smoke.
4. V5.15 visual quality, action clarity, and performance QA.
5. V5.x Productization Gate, scoped to local import, runtime rendering, guided external asset instructions, and visual QA.

V5.x work must not be mixed into V4.x feasibility evidence. V5.x Productization Gate passed only for scoped local productization and must not be expanded to provider integration, remote generation, marketplace, automatic photo-to-3D, or production signed release readiness.

## V6.x Development Rule

V6.x is closed as the selected scoped productization baseline. It owns no further feature development under V6; closure work must not rewrite V3/V4 Codex monitoring semantics or V5 renderer security boundaries.

V6 baseline:

- V3.x closed scoped Codex baseline.
- V4.x closed scoped OS-level feasibility / managed session baseline.
- V5.x scoped local productization baseline.

V6 implementation order and status:

1. V6.0 Productization Scope Freeze: passed.
2. V6.1 Release / Distribution Foundation: passed.
3. V6.2 Codex Work-Cat Product UX: passed.
4. V6.3 Runtime Imported Pack Rendering: passed.
5. V6.4 Asset Manager Product UX: passed.
6. V6.5 Photo-Guided Personalization: passed.
7. V6.6 Provider Feasibility / Consent: passed.
8. V6.7 Visual QA / Renderer Hardening: passed.
9. V6.8 Agent / Third-party Developer Productization: passed.
10. V6.9 V6 Productization Gate: passed scoped.

V6 Productization Gate passed only for tested local macOS developer workflow scenarios after V6.1-V6.8 accepted evidence plus security, claim, artifact, license, and regression scans.

## V7.x Advanced Development Rule

V7.8-V7.15 continue the V7 personalized asset workflow instead of creating a new release track. They must not reopen V6 or rewrite V7.0-V7.7 accepted evidence.

Implementation order:

1. V7.8 Advanced Scope Reopen & Claim Boundary.
2. V7.9 MiniMax Image Provider Consent Boundary.
3. V7.10 Generated 2D Action Pack Assembly: passed scoped.
4. V7.11 External GLB/GLTF Intake Contract: passed scoped local intake; external photo-to-3D provider output remains not-ready.
5. V7.12 True 3D Runtime Action Mapping: passed scoped for tested local imported GLB/GLTF runtime action mapping.
6. V7.13 Photo-To-Asset Orchestration.
7. V7.14 Advanced Visual QA.
8. V7.15 Advanced Productization Gate.

V7.9 and V7.12 have passed scoped with real-data evidence. V7.13 may only claim automatic photo-to-3D for a named tested provider scenario if real photo input, real 3D provider output, GLTF scan, runtime mapping, and visual QA all pass.

V7.13-V7.15 have since passed scoped with the final accepted claim:

```text
V7 advanced personalized cat asset workflow passed for tested generated 2D and imported GLB/GLTF runtime scenarios; automatic photo-to-3D remains not-ready.
```

## V8.x Development Rule

V8.0-V8.11 are accepted scoped. There is no remaining V8 feature implementation
phase in this plan. V8 now remains a regression/evidence baseline for the V10
animation experience track.

Planned order:

1. V8.0 Scope Freeze / Provider Decision / Claim Matrix.
2. V8.1 Provider Consent And Credential Harness.
3. V8.2 Real Named-provider 3D Output Smoke.
4. V8.3 3D Asset Normalization And Action Clip Contract.
5. V8.4 Runtime 3D Action Visual QA.
6. V8.5 Guided Photo-to-3D Product UX.
7. V8.6 Operational Hardening.
8. V8.7 Productization Gate.
9. V8.8 3D Rendering Quality Improvement: passed scoped prototype.
10. V8.9 Local Animated Sprite Pack Assembler: passed scoped.
11. V8.10 AI-assisted Animated Sprite Workflow: passed scoped prompt-only.
12. V8.11 Animated Sprite Visual QA Gate: passed scoped.

V8.7 may not claim automatic photo-to-3D unless V8.2 provides real named-provider
3D output and V8.3-V8.6 pass with runtime evidence.

V8.9 may claim only local frame-sequence assembly. V8.10 prompt-only evidence
may not claim provider execution. V8.11 visual QA may not claim AI generation,
3D readiness, Rive/Live2D readiness, marketplace readiness, or production signed
release readiness.
