# Active Acceptance Plan

文档状态：active acceptance index；V32 quality rescue passed scoped；V31 partial scoped with continuation execution blocked scoped；V30 scoped passed；Post-V30 architecture/runtime remediation gates passed scoped；V29/V23-V28 scoped baselines 是输入基线。
当前日期：2026-06-24。

## V32 Quality Rescue 2D Action Assets Acceptance

Current active scoped PRD: `docs/active/agent_desktop_pet_prd_v32.md`.

V32 acceptance proves that the project can generate and validate named local
project-authored 2D frameSequence packs with visible local motion and real
visual evidence. It does not prove arbitrary-cat photo automation.

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V32.1 | measured quality gate | `apps/desktop/src/assets/v32-quality-rescue.test.ts` | passed scoped |
| V32.2 | local project-authored generated packs | `fixtures/manual/v32_quality_rescue/quality-rescue-tabby-v1`, `fixtures/manual/v32_quality_rescue/quality-rescue-tuxedo-v1` | passed scoped |
| V32.3 | integrated V30/V31/V32/runtime smoke | `docs/V32.x/evidence/v32_quality_rescue-smoke-2026-06-24.md` | passed scoped |
| V32.4 | visual report and screenshot | `docs/V32.x/evidence/v32_quality_rescue-report-2026-06-24.html`, `docs/V32.x/evidence/screenshots/v32_quality_rescue-overview-2026-06-24.png` | passed scoped |
| V32.5 | final claim/security gate | `docs/V32.x/v32-final-acceptance-report.md` | passed scoped |

V32 passed because two named local packs passed measured frame quality,
semantic action QA, art QA, target-only preview/apply/rollback, claim scan,
security scan, and real HTML/screenshot evidence. The accepted user-visible
experience is limited to viewing and applying these tested local packs.

V32 must not claim Petdex parity, arbitrary-cat automatic animation ready,
automatic photo-to-2D ready for arbitrary cats, provider integration verified,
3D ready, production signed release ready, Windows ready, cross-platform ready,
MCP ready, Claude Code integration verified, OS-level Codex window binding
ready, or all Codex workflows verified.

## V31 High-quality 2D Action Assets Acceptance

Current active PRD: `docs/active/agent_desktop_pet_prd_v31.md`.

V31 acceptance starts from the corrected V30 visual review: the semantic gate
passed scoped, but the current simplified SVG cat is not accepted as
high-quality target visual art. V31 must prove visual product quality with real
screenshots/playback, not with text-only claims.

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V31.0 | scope, docs, drawio | `docs/V31.x/evidence/v31_0-scope-freeze-2026-06-24.md` | passed scoped |
| V31.1 | art quality rubric | `docs/V31.x/evidence/v31_1-art-quality-rubric-2026-06-24.md` | passed scoped |
| V31.2 | flagship 2D asset route | `docs/V31.x/evidence/v31_2-flagship-asset-route-2026-06-24.md` | passed scoped |
| V31.3 | visual review report | `docs/V31.x/evidence/v31_3-visual-review-report-2026-06-24.html` | passed scoped |
| V31.4 | layered rig / professional animation route | `docs/V31.x/evidence/v31_4-layered-rig-route-2026-06-24.md` | passed scoped as route contract |
| V31.5 | arbitrary-cat photo route | `docs/V31.x/evidence/v31_5-photo-to-character-route-2026-06-24.md` | candidate-only scoped |
| V31.6 | real-data E2E acceptance | `docs/V31.x/evidence/v31_6-e2e-real-data-acceptance-2026-06-24.md` | partial scoped |
| V31.7 | final gate | `docs/V31.x/v31-final-acceptance-report.md` | partial scoped |
| V31.8 | repeatable asset production | `docs/V31.x/evidence/v31_8-repeatable-asset-production-2026-06-24.md` | partial scoped |
| V31.9 | layered rig runtime route | `docs/V31.x/evidence/v31_9-layered-rig-runtime-route-2026-06-24.md` | blocked scoped |
| V31.10 | named photo sample set | `docs/V31.x/evidence/v31_10-photo-sample-set-2026-06-24.md` | partial scoped |
| V31.11 | photo action preview/apply/rollback | `docs/V31.x/evidence/v31_11-photo-action-preview-apply-rollback-2026-06-24.md` | blocked scoped |
| V31.12 | continuation real-data E2E | `docs/V31.x/evidence/v31_12-real-data-e2e-2026-06-24.md` | blocked scoped |
| V31.13 | continuation final gate | `docs/V31.x/evidence/v31_13-continuation-final-gate-2026-06-24.md` | blocked scoped |

V31 final is currently partial scoped: at least one named local high-quality
flagship 8-action asset passed visual and semantic gates, the final report
embeds real visual evidence, target-only apply and rollback passed, and the
arbitrary-cat route is honestly marked candidate-only scoped.

V31 continuation acceptance now has real evidence for V31.8-V31.13, but the
continuation final gate is blocked scoped. A future pass requires repeatable
high-quality production, a real layered/professional runtime route, and real
photo-derived action frames that pass visual QA, semantic QA, preview, apply,
rollback, claim scan, and security scan.

V31 must not claim Petdex parity, arbitrary-cat automatic animation ready,
provider integration verified, 3D ready, production release ready, Windows
ready, cross-platform ready, MCP ready, Claude Code integration verified,
OS-level Codex window binding ready, or all Codex workflows verified.

V31 execution specs:

- `docs/V31.x/v31-detailed-development-and-acceptance-plan.md`
- `docs/V31.x/v31_1-art-quality-rubric-spec.md`
- `docs/V31.x/v31_2-flagship-asset-route-spec.md`
- `docs/V31.x/v31_3-visual-review-report-spec.md`
- `docs/V31.x/v31_4-layered-rig-route-spec.md`
- `docs/V31.x/v31_5-photo-to-character-route-spec.md`
- `docs/V31.x/v31_6-e2e-real-data-acceptance-spec.md`
- V31.8-V31.13 continuation evidence specs are controlled by
  `docs/V31.x/v31-detailed-development-and-acceptance-plan.md` until separate
  execution specs are created.

## Post-V30 Architecture and Runtime Remediation Acceptance

Post-V30 acceptance keeps V30 claim boundaries intact while making the active
fact sources, development environment notes, and runtime verification path
consistent.

Current active PRD: `docs/active/agent_desktop_pet_prd_post_v30.md`.
Post-V30 target architecture and milestone contracts:

- `docs/V30.x/post-v30-target-architecture.md`
- `docs/V30.x/post-v30-detailed-development-and-acceptance-plan.md`
- `docs/V30.x/post-v30-acceptance-plan.md`
- `docs/V30.x/post-v30-milestones.md`

Current Post-V30 gate decision:

| Phase | Decision | Constraint |
| --- | --- | --- |
| Post-V30.1 | passed scoped | real Windows host Tauri runtime, bridge, petctl, and runtime smoke passed |
| Post-V30.2 | passed scoped | one local wrapper-launched managed workflow smoke passed against the running bridge |
| Post-V30.3 | passed scoped | FE-1 through FE-5 frontend slices have per-slice evidence, PRD/spec review, checks, and scans |
| Post-V30.4 | passed scoped | RS-1 through RS-6 have per-slice evidence; RS-5/RS-6 passed with real WSL frontend plus Windows Cargo runtime smoke |
| Post-V30.5 | passed scoped | final regression, real runtime smoke, managed smoke, PRD/spec review, claim scan, and security scan passed |
| Post-V30/V30 full audit | passed scoped | PRD-code-docs-function mapping, full regression checks, real runtime E2E, managed smoke, drawio page check, claim scan, and security scan passed with residual risks recorded |

Do not treat documentation completion as proof that runtime desktop smoke,
managed Codex workflow, frontend refactor, or Tauri bridge refactor has passed.

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| Post-V30.0 | fact-source sync and architecture remediation plan | `docs/V30.x/evidence/post-v30-architecture-remediation-2026-06-23.md` | passed scoped |
| Post-V30.1 | runtime desktop smoke | `docs/V30.x/evidence/post-v30_1-runtime-desktop-smoke-2026-06-23.md` | passed scoped |
| Post-V30.2 | managed Codex workflow smoke | `docs/V30.x/evidence/post-v30_2-managed-codex-workflow-smoke-2026-06-23.md` | passed scoped |
| Post-V30.3 | frontend architecture slice specs | `docs/V30.x/evidence/post-v30_3-architecture-slice-FE-1-command-boundary-2026-06-23.md`, `docs/V30.x/evidence/post-v30_3-architecture-slice-FE-2-runtime-state-boundary-2026-06-23.md`, `docs/V30.x/evidence/post-v30_3-architecture-slice-FE-3-asset-manager-boundary-2026-06-23.md`, `docs/V30.x/evidence/post-v30_3-architecture-slice-FE-4-photo-wizard-boundary-2026-06-23.md`, `docs/V30.x/evidence/post-v30_3-architecture-slice-FE-5-preview-gallery-boundary-2026-06-23.md` | passed scoped |
| Post-V30.4 | Tauri bridge architecture slice specs | RS-1 through RS-6 evidence plus `docs/V30.x/evidence/post-v30_4-tauri-bridge-slice-closure-2026-06-24.md` | passed scoped |
| Post-V30.5 | final remediation gate | `docs/V30.x/evidence/post-v30_5-final-remediation-gate-2026-06-24.md` | passed scoped |
| Post-V30/V30 audit | PRD/code/docs/function/E2E audit | `docs/V30.x/evidence/post-v30-v30-full-audit-2026-06-24.md` | passed scoped with residual risks |

Post-V30.0 passed because active docs, V30 docs, README, and ops docs agree
that V30 is scoped passed and the next active line is remediation, not a new
provider/photo/3D/product release claim.

Post-V30.1 and later must use:

- `docs/active/post-v30-runtime-smoke-spec.md`
- `docs/active/post-v30-managed-codex-smoke-spec.md`
- `docs/active/post-v30-frontend-architecture-slices.md`
- `docs/active/post-v30-tauri-bridge-architecture-slices.md`
- `docs/active/post-v30-evidence-and-scan-checklist.md`

## V30 Semantic Character Animation Quality Acceptance

V30 is the latest accepted semantic animation track. It proves semantic
character animation for tested local action packs, not arbitrary automatic
asset generation. A candidate fails if it only scales, translates, rotates,
jitters, or decorates a static image without readable action logic.

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V30.0 | scope freeze | `docs/V30.x/evidence/v30_0-scope-freeze-2026-06-17.md` | passed scoped |
| V30.1 | action storyboard and key-pose contract | `docs/V30.x/evidence/v30_1-action-storyboard-2026-06-17.md` | passed scoped |
| V30.2 | semantic candidate generation | `docs/V30.x/evidence/v30_2-semantic-candidate-generation-2026-06-17.md` | passed scoped |
| V30.3 | motion readability QA | `docs/V30.x/evidence/v30_3-motion-readability-qa-2026-06-17.md` | passed scoped |
| V30.4 | old-vs-new preview UX | `docs/V30.x/evidence/v30_4-preview-ux-2026-06-17.html` | passed scoped |
| V30.5 | approved target apply and rollback | `docs/V30.x/evidence/v30_5-target-apply-rollback-2026-06-17.md` | passed scoped |
| V30.6 | final semantic animation gate | `docs/V30.x/v30-final-acceptance-report.md` | passed scoped |

V30.6 passed because V30.0-V30.5 evidence exists, at least one 8-action pack
passed semantic readability QA, the weak transform-only baseline was rejected,
old-vs-new visual evidence was embedded in HTML, QA failed packs could not
apply, target-only apply and rollback passed, and security/claim scans passed.

## V29 Petdex-level Gallery and Stable Photo-to-Animated-2D Acceptance

V29 is the immediate input baseline. It must prove a product-level user
experience: gallery browse/filter/favorite/preview/switch plus stable
photo-to-animated-2D generation over a diverse benchmark.

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V29.0 | scope freeze | `docs/V29.x/evidence/v29_0-scope-freeze-YYYY-MM-DD.md` | planned |
| V29.1 | gallery UX | `docs/V29.x/evidence/v29_1-gallery-ux-smoke-YYYY-MM-DD.md` | planned |
| V29.2 | photo benchmark | `docs/V29.x/evidence/v29_2-photo-benchmark-smoke-YYYY-MM-DD.md` | planned |
| V29.3 | quality gate v2 | `docs/V29.x/evidence/v29_3-quality-gate-v2-smoke-YYYY-MM-DD.md` | planned |
| V29.4 | productized wizard | `docs/V29.x/evidence/v29_4-productized-wizard-smoke-YYYY-MM-DD.md` | planned |
| V29.5 | asset polish | `docs/V29.x/evidence/v29_5-asset-polish-smoke-YYYY-MM-DD.md` | planned |
| V29.6 | final gate | `docs/V29.x/v29-final-acceptance-report.md` | No-Go |

V29.6 can pass only if the gallery UX gate passes, the diverse photo benchmark
reaches the accepted threshold, all accepted candidates pass Quality Gate V2,
final HTML embeds real visual evidence, and security/claim scans pass.

## V23-V28 Photo-to-Animated-2D Productization Acceptance Baseline

V23-V28 is the accepted baseline acceptance track. V23 has passed scoped evidence for
local photo suitability and safe trait extraction. V24 has passed scoped
evidence for route registration, safe candidate metadata, and non-mutating
orchestration. V25 has passed scoped evidence for same-cat and motion QA
rejection. V26 has passed scoped evidence for approved-candidate packaging,
isolated preview, target-only apply, and rollback. V27 has passed scoped
evidence for retry budgets, repeated-failure repair guidance, provider
preflight blocking, actionable next steps, and previous-pack preservation. V28
has passed scoped evidence for the final evidence-matched productized gate. It
must continue to use V22 as the quality gate.

```text
photo
  -> suitability check
  -> trait extraction
  -> multi-route generation
  -> same-cat / motion QA
  -> V22 quality review
  -> preview / apply / rollback
```

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V23 | photo suitability and traits | `docs/V23-V28.x/evidence/v23-photo-suitability-trait-smoke-2026-06-16.md` | passed scoped |
| V24 | multi-route generation | `docs/V23-V28.x/evidence/v24-multi-route-generation-smoke-2026-06-16.md` | passed scoped |
| V25 | same-cat and motion QA | `docs/V23-V28.x/evidence/v25-same-cat-motion-qa-smoke-2026-06-16.md` | passed scoped |
| V26 | pack, preview, apply, rollback | `docs/V23-V28.x/evidence/v26-pack-preview-apply-smoke-2026-06-16.md` | passed scoped |
| V27 | retry/cost/failure guidance | `docs/V23-V28.x/evidence/v27-retry-cost-guidance-smoke-2026-06-16.md` | passed scoped |
| V28 | final evidence-matched gate | `docs/V23-V28.x/v28-final-acceptance-report.md` | passed scoped |

V28 can pass only if V23-V27 evidence exists, at least one approved candidate
can preview/apply target-only, rollback preserves the previous visible pack,
and final HTML embeds real visual evidence.

## V22 Asset Quality Review & Rejection Gate Acceptance

V22 is the latest scoped accepted input baseline. It proves that generated
candidate assets are not accepted merely because they have 8 actions. Bad
visual or motion results are rejected before gallery/apply/final evidence.

## V21 Multi-route Animation Asset Recovery Acceptance

V21 is the latest scoped accepted recovery track. It proved that one of four
routes can turn provider-derived material into a real
previewable, target-applicable, rollback-safe 8-action 2D animation pack:

```text
cat photos / provider outputs
  -> route A provider key poses
  -> route B alternate provider preflight
  -> route C local unified-character rig
  -> route D image-to-video frames
  -> common QA
  -> route comparator
  -> best route preview/apply/rollback
```

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V21.0 | scope freeze and route matrix | `docs/V21.x/evidence/v21_0-scope-freeze-2026-06-14.md` | passed |
| V21.1 | provider key-pose to local pack | `docs/V21.x/evidence/v21_1-route-a-keypose-pack-smoke-2026-06-14.md` | passed |
| V21.2 | alternate provider capability preflight | `docs/V21.x/evidence/v21_2-route-b-provider-preflight-2026-06-14.md` | passed as review |
| V21.3 | unified character local rig | `docs/V21.x/evidence/v21_3-route-c-local-rig-smoke-2026-06-14.md` | passed |
| V21.4 | image-to-video frame extraction | `docs/V21.x/evidence/v21_4-route-d-video-frame-smoke-2026-06-14.md` | excluded |
| V21.5 | side-by-side route comparator | `docs/V21.x/evidence/v21_5-route-comparator-report-2026-06-14.html` | passed |
| V21.6 | best route preview/apply/rollback | `docs/V21.x/evidence/v21_6-best-route-preview-apply-rollback-2026-06-14.md` | passed |
| V21.7 | final evidence-matched gate | `docs/V21.x/v21_7-final-acceptance-report.md` | passed scoped |

V21 passed because Route A produced a real safe animation pack,
passes common QA, previews all 8 actions, applies only to the target PetInstance,
and rolls back to the previous visible pack. This does not imply arbitrary-cat
automatic photo-to-animation readiness or provider integration verification.

## V20 Mainland Provider Motion Sheet Acceptance

V20 is now a blocked provider baseline for V21. It proved whether a mainland
provider, with MiniMax as P0, can generate a real same-cat motion sheet suitable
for the project runtime:

```text
cat photo
  -> provider selection and consent/disclosure boundary
  -> MiniMax reference-image motion sheet live smoke
  -> provider output normalization/background gate
  -> motion amplitude + same-cat QA
  -> Manager preview
  -> target-only apply
  -> rollback
```

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V20.0 | scope freeze and mainland provider matrix | `docs/V20.x/evidence/v20_0-scope-freeze-2026-06-14.md` | passed |
| V20.1 | provider consent/credential/disclosure boundary | `docs/V20.x/evidence/v20_1-provider-consent-boundary-2026-06-14.md` | passed |
| V20.2 | MiniMax reference-image motion sheet live smoke | `docs/V20.x/evidence/v20_2-minimax-motion-sheet-live-smoke-2026-06-14.md` | passed 3-sample provider output benchmark; 8x9 normalization still blocked |
| V20.3 | provider output normalization/background gate | `docs/V20.x/evidence/v20_3-provider-output-normalization-smoke-2026-06-14.md` | blocked |
| V20.4 | same-cat/amplitude/loop QA | `docs/V20.x/evidence/v20_4-motion-quality-qa-smoke-2026-06-14.md` | blocked by V20.3 |
| V20.5 | Manager preview / target apply / rollback | `docs/V20.x/evidence/v20_5-preview-apply-rollback-smoke-2026-06-14.md` | blocked by V20.3/V20.4 |
| V20.6 | final evidence-matched gate | `docs/V20.x/v20_6-final-acceptance-report.md` | blocked |

V20 cannot pass by reusing V19 local sheet evidence. V19 remains the accepted
fallback baseline if MiniMax provider motion-sheet generation is blocked.

## V19 Petdex-style Motion Sheet Acceptance

V19 is the latest passed scoped local motion-sheet acceptance track. It proved
the local Petdex-style workflow:

```text
cat photo or local motion sheet
  -> license/consent boundary
  -> safe local sheet import
  -> crop/normalize/pack
  -> motion amplitude + same-cat QA
  -> Manager preview
  -> target-only apply
  -> rollback
```

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V19.0 | scope freeze and Petdex resource boundary | `docs/V19.x/evidence/v19_0-scope-freeze-2026-06-13.md` | passed scoped |
| V19.1 | Petdex-compatible motion sheet validation | `docs/V19.x/evidence/v19_1-motion-sheet-format-smoke-2026-06-13.md` | passed scoped |
| V19.2 | provider same-cat single-sheet generation or blocked decision | `docs/V19.x/evidence/v19_2-provider-motion-sheet-smoke-2026-06-13.md` | blocked |
| V19.3 | sheet crop / normalize / safe pack assembly | `docs/V19.x/evidence/v19_3-sheet-crop-pack-smoke-2026-06-13.md` | passed scoped |
| V19.4 | motion amplitude and same-cat QA | `docs/V19.x/evidence/v19_4-motion-amplitude-qa-smoke-2026-06-13.md` | passed scoped |
| V19.5 | Manager preview / target apply / rollback | `docs/V19.x/evidence/v19_5-preview-apply-rollback-smoke-2026-06-13.md` | passed scoped |
| V19.6 | final screenshot-backed product gate | `docs/V19.x/v19_6-final-acceptance-report.md` | passed scoped |

V19 cannot be used to claim provider generation passed. V19 also cannot bundle
or redistribute Petdex community assets without explicit license evidence.

## V18 User Photo to Multi-action 2D Pet Workflow Acceptance

V18 is the latest passed scoped acceptance track. It proved the end-user workflow
requested for this stage:

```text
real local cat image
  -> explicit provider consent
  -> real image-to-image/reference-image provider output
  -> 8-action local animation pack
  -> in-app preview
  -> target apply
  -> rollback
```

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V18.0 | scope freeze and claim boundary | `docs/V18.x/evidence/v18_0-scope-freeze-2026-06-12.md` | passed scoped |
| V18.1 | reference photo consent/provider boundary | `docs/V18.x/evidence/v18_1-reference-photo-consent-2026-06-12.md` | passed scoped |
| V18.2 | real image-to-image provider job | `docs/V18.x/evidence/v18_2-provider-capability-preflight-2026-06-12.md` | passed scoped |
| V18.3 | multi-action output normalization/package | `docs/V18.x/evidence/v18_3-multi-action-normalizer-2026-06-12.md` | passed scoped |
| V18.4 | same-cat and continuity QA | `docs/V18.x/evidence/v18_4-same-cat-continuity-qa-2026-06-12.md` | passed scoped |
| V18.5 | preview/apply/rollback E2E | `docs/V18.x/evidence/v18_5-preview-apply-rollback-2026-06-12.md` | passed scoped |
| V18.6 | final screenshot-backed gate | `docs/V18.x/v18_6-final-acceptance-report.md` | passed scoped |

V18.6 must remain blocked if a real provider image-to-image/reference-image
output is not available. V17 action-sheet import and V17.7 MiniMax text-to-image
output can remain fallback/baseline evidence, but they cannot satisfy V18's
local photo generation claim.

## V17 Photo-to-2D Productized Wizard Acceptance

V17 is the latest passed scoped acceptance track. V17.0-V17.6 produced product
UI evidence for a usable photo-to-2D action asset wizard in the tested local
photo + 4x2 action-sheet scenario. V17.7 adds a scoped MiniMax text-to-image
provider API action-sheet scenario.

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V17.0 | scope freeze and claim boundary | `docs/V17.x/evidence/v17_0-scope-freeze-2026-06-11.md` | passed scoped |
| V17.1 | wizard shell photo intake and consent | `docs/V17.x/evidence/v17_1-wizard-shell-photo-intake-2026-06-11.md` | passed scoped |
| V17.2 | generation mode and loading UX | `docs/V17.x/evidence/v17_2-generation-mode-loading-2026-06-11.md` | passed scoped |
| V17.3 | 4x2 action-sheet packaging | `docs/V17.x/evidence/v17_3-action-sheet-packaging-2026-06-11.md` | passed scoped |
| V17.4 | in-modal 8-action preview QA | `docs/V17.x/evidence/v17_4-modal-preview-qa-2026-06-11.md` | passed scoped |
| V17.5 | target apply, retry, rollback | `docs/V17.x/evidence/v17_5-apply-rollback-2026-06-11.md` | passed scoped |
| V17.6 | final productized wizard gate | `docs/V17.x/v17_6-final-acceptance-report.md` | passed scoped |
| V17.7 | MiniMax provider API action-sheet addendum | `docs/V17.x/v17_7-provider-api-addendum-report.md` | passed scoped |

V17 passed only for the tested local UI/action-sheet/preview/apply/rollback
path. A purely instructional modal is not sufficient, and direct provider API
generation remains not-ready.

## V16 Provider-backed Photo-to-2D Action Generation Acceptance

V16 is the latest passed scoped acceptance track. It did not reuse V15
import-ready prompt workflow evidence as real provider generation evidence.

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V16.0 | scope freeze and claim boundary | `docs/V16.x/evidence/v16_0-scope-freeze-2026-06-11.md` | passed |
| V16.1 | provider consent/credential/redaction boundary | `docs/V16.x/evidence/v16_1-provider-boundary-2026-06-11.md` | passed |
| V16.2 | real named-provider 8-action generation | `docs/V16.x/evidence/v16_2-provider-multi-action-generation-2026-06-11.md` | passed |
| V16.3 | same-cat consistency review | `docs/V16.x/evidence/v16_3-same-cat-consistency-2026-06-11.md` | passed |
| V16.4 | auto packaging and continuity assembly | `docs/V16.x/evidence/v16_4-auto-packaging-continuity-2026-06-11.md` | passed |
| V16.5 | Manager preview/apply/rollback | `docs/V16.x/evidence/v16_5-manager-preview-apply-rollback-2026-06-11.md` | passed |
| V16.6 | final provider-backed product gate | `docs/V16.x/v16_6-final-acceptance-report.md` | passed |

V16.6 passed only for the tested host ChatGPT/Codex image tool scenario. It
does not claim automatic photo-to-2D readiness for arbitrary cats.

文档状态：active acceptance index；V15.0-V15.13 passed scoped；no active V15 feature phase remains open。
当前日期：2026-06-10。

## Current Acceptance Status

| Phase | Status | Evidence |
| --- | --- | --- |
| V15.0 | passed scoped | `docs/V15.x/evidence/v15_0-scope-freeze-2026-06-10.md` |
| V15.1 | passed scoped | `docs/V15.x/evidence/v15_1-interaction-model-smoke-2026-06-10.md` |
| V15.2 | passed scoped | `docs/V15.x/evidence/v15_2-drag-physics-smoke-2026-06-10.md` |
| V15.3 | passed scoped | `docs/V15.x/evidence/v15_3-pointer-feedback-smoke-2026-06-10.md` |
| V15.4 | passed scoped | `docs/V15.x/evidence/v15_4-autonomous-walk-smoke-2026-06-10.md` |
| V15.5 | passed scoped | `docs/V15.x/evidence/v15_5-emotion-composer-smoke-2026-06-10.md` |
| V15.6 | passed scoped | `docs/V15.x/evidence/v15_6-interaction-settings-smoke-2026-06-10.md` |
| V15.7 | passed scoped final gate | `docs/V15.x/v15_7-final-acceptance-report.md` |
| V15.8 | passed scoped 2D continuity hardening | `docs/V15.x/evidence/v15_8-2d-animation-continuity-smoke-2026-06-10.md` |
| V15.9 | passed scoped photo intake consent | `docs/V15.x/evidence/v15_9-photo-intake-consent-smoke-2026-06-10.md` |
| V15.10 | passed scoped trait prompt pack | `docs/V15.x/evidence/v15_10-trait-prompt-pack-smoke-2026-06-10.md` |
| V15.11 | passed scoped import-ready provider/import branch | `docs/V15.x/evidence/v15_11-photo-2d-provider-or-import-smoke-2026-06-10.md` |
| V15.12 | passed scoped continuity assembly | `docs/V15.x/evidence/v15_12-photo-2d-continuity-assembly-smoke-2026-06-10.md` |
| V15.13 | passed scoped photo-to-2D final gate | `docs/V15.x/v15_13-photo-2d-final-acceptance-report.md` |
| V14.0 | passed scoped | `docs/V14.x/evidence/v14_0-scope-freeze-2026-06-09.md` |
| V14.1 | passed scoped | `docs/V14.x/evidence/v14_1-flagship-work-cat-v2-smoke-2026-06-09.md` |
| V14.2 | passed scoped | `docs/V14.x/evidence/v14_2-animation-stability-linter-smoke-2026-06-09.md` |
| V14.3 | passed scoped | `docs/V14.x/evidence/v14_3-gallery-filter-favorite-smoke-2026-06-09.md` |
| V14.4 | passed scoped | `docs/V14.x/evidence/v14_4-preview-one-click-switch-smoke-2026-06-09.md` |
| V14.5 | passed scoped | `docs/V14.x/evidence/v14_5-ai-asset-workflow-boundary-smoke-2026-06-09.md` |
| V14.6 | passed scoped final gate | `docs/V14.x/v14_6-final-acceptance-report.md` |
| V10.11 | passed scoped product experience rebaseline | `docs/V10.x/v10_11-final-acceptance-report.md` |
| V11.1 | passed scoped living idle system | `docs/V11.x/v11_1-final-acceptance-report.md` |
| V11.2 | passed scoped pointer-aware interaction | `docs/V11.x/v11_2-final-acceptance-report.md` |
| V11.3 | passed scoped emotion layer | `docs/V11.x/v11_3-final-acceptance-report.md` |
| V11.4 | passed scoped visual ActionComposer | `docs/V11.x/v11_4-final-acceptance-report.md` |
| V11.5 | passed scoped flagship living cat pack | `docs/V11.x/v11_5-final-acceptance-report.md` |
| V11.6 | passed scoped first-run living pet delight | `docs/V11.x/v11_6-final-acceptance-report.md` |
| V11.7 | passed final interaction QA gate | `docs/V11.x/v11_7-final-acceptance-report.md` |
| V12.x | passed scoped desktop visibility and screenshot-backed acceptance | `docs/V12.x/v12_7-final-acceptance-report.md` |
| V13.x | passed scoped beta distribution and user-ready closure | `docs/V13.x/v13_7-final-acceptance-report.md` |
| V3.1 | passed | `docs/V3.1/v3_1-final-acceptance-report.md` |
| V3.2 | passed scoped | `docs/V3.2/v3_2-final-acceptance-report.md` |
| V3.3 | passed scoped | `docs/V3.3/v3_3-final-acceptance-report.md` |
| V3.4 | passed scoped | `docs/V3.4/v3_4-final-acceptance-report.md` |
| V3.5 | passed scoped | `docs/V3.5/v3_5-final-acceptance-report.md` |
| V3.6 | historical blocked / deprecated active strategy | `docs/V3.6/v3_6-final-acceptance-report.md` |
| V3.7 | passed scoped / current Codex exec monitoring strategy | `docs/V3.7/v3_7-final-acceptance-report.md` |
| V3.x Final | passed scoped / closed baseline | `docs/V3.x/v3_x-final-acceptance-report.md` |
| V4.0 | accepted feasibility review / no readiness claim | `docs/V4.x/v4_0-os-binding-feasibility-review.md` |
| V4.4 | passed scoped managed exec JSONL | `docs/V4.x/v4_4-final-acceptance-report.md` |
| V4.5 | passed scoped real TUI hook lifecycle / PermissionRequest not observed | `docs/V4.x/v4_5-final-acceptance-report.md` |
| V4.6 | passed startup diagnostics | `docs/V4.x/evidence/v4_6-startup-diagnostics-smoke-2026-05-27.md` |
| V4.7 | passed sanitized session status | `docs/V4.x/evidence/v4_7-session-status-smoke-2026-05-27.md` |
| V4.x Final | passed scoped | `docs/V4.x/v4_x-final-acceptance-report.md` |
| V5.0 | passed scoped asset system freeze | `docs/V5.x/v5_0-final-acceptance-report.md` |
| V5.1 | passed scoped bundled 2D sprite smoke | `docs/V5.x/v5_1-final-acceptance-report.md` |
| V5.2 | passed scoped renderer plugin interface | `docs/V5.x/v5_2-final-acceptance-report.md` |
| V5.3 | passed scoped bundled GLTF prototype | `docs/V5.x/v5_3-final-acceptance-report.md` |
| V5.4 | passed scoped bundled 3D action pack smoke | `docs/V5.x/v5_4-final-acceptance-report.md` |
| V5.5 | passed scoped local renderer selection smoke | `docs/V5.x/v5_5-final-acceptance-report.md` |
| V5.6 | passed scoped privacy and claim boundary | `docs/V5.x/v5_6-photo-personalization-claim-matrix.md` |
| V5.7 | passed prompt pack generator | `docs/V5.x/v5_7-prompt-pack-final-acceptance-report.md` |
| V5.8 | passed scoped local personalized import | `docs/V5.x/v5_8-local-asset-import-final-acceptance-report.md` |
| V5.9 | passed scoped CLI activation mapping | `docs/V5.x/v5_9-dynamic-action-pack-final-acceptance-report.md` |
| V5.10 | completed scoped provider feasibility | `docs/V5.x/v5_10-provider-feasibility-report.md` |
| V5.11 | passed scoped import UI | `docs/V5.x/v5_11-final-acceptance-report.md` |
| V5.12 | passed scoped runtime imported pack rendering | `docs/V5.x/v5_12-final-acceptance-report.md` |
| V5.13 | passed scoped local guided prompt/import workflow | `docs/V5.x/v5_13-final-acceptance-report.md` |
| V5.14 | passed feasibility-only provider consent boundary | `docs/V5.x/v5_14-final-acceptance-report.md` |
| V5.15 | passed scoped visual quality and action QA | `docs/V5.x/v5_15-final-acceptance-report.md` |
| V5.x scoped renderer/import pipeline baseline | passed scoped bundled renderer / asset system and personalized CLI pipeline | `docs/V5.x/v5_personalized_asset_pipeline_final_report.md` |
| V5.x Productization Gate | passed scoped local productization | `docs/V5.x/v5_x-productization-final-acceptance-report.md` |
| V6.0 | passed scope freeze | `docs/V6.0/v6_0-final-acceptance-report.md` |
| V6.1 | passed release/distribution foundation | `docs/V6.1/v6_1-final-acceptance-report.md` |
| V6.2 | passed Codex work-cat product UX | `docs/V6.2/v6_2-final-acceptance-report.md` |
| V6.3 | passed runtime imported pack rendering revalidation | `docs/V6.3/v6_3-final-acceptance-report.md` |
| V6.4 | passed asset manager product UX | `docs/V6.4/v6_4-final-acceptance-report.md` |
| V6.5 | passed photo-guided local prompt/import workflow | `docs/V6.5/v6_5-final-acceptance-report.md` |
| V6.6 | passed provider feasibility/consent boundary | `docs/V6.6/v6_6-final-acceptance-report.md` |
| V6.7 | passed visual QA / renderer hardening | `docs/V6.7/v6_7-final-acceptance-report.md` |
| V6.8 | passed developer integration documentation/tooling examples | `docs/V6.8/v6_8-final-acceptance-report.md` |
| V6.9 Productization Gate | passed scoped local macOS developer workflow | `docs/V6.9/v6_9-final-acceptance-report.md` |
| V7.0-V7.15 | passed scoped personalized asset workflow baseline | `docs/V7.x/v7_x-evidence-index.md` |
| V7.13 | passed scoped photo-to-asset orchestration | `docs/V7.13/v7_13-final-acceptance-report.md` |
| V7.14 | passed scoped advanced visual QA | `docs/V7.14/v7_14-final-acceptance-report.md` |
| V7.15 | passed scoped advanced productization gate | `docs/V7.15/v7_15-final-acceptance-report.md` |
| V8.0-V8.8 | passed scoped provider-backed photo-to-3D/productized 3D baseline plus prototype GLB rendering quality improvement | `docs/V8.x/v8_x-evidence-index.md` |
| V8.9 | passed scoped local animated sprite pack assembler | `docs/V8.x/v8_9-final-acceptance-report.md` |
| V8.10 | passed scoped prompt-only AI-assisted animated sprite workflow | `docs/V8.x/v8_10-final-acceptance-report.md` |
| V8.11 | passed scoped animated sprite visual QA gate | `docs/V8.x/v8_11-final-acceptance-report.md` |
| V9.1 | blocked-partial provider readiness | `docs/V9.x/v9_1-final-acceptance-report.md` |
| V9.2 | passed scoped MiniMax static 2D generation | `docs/V9.x/v9_2-final-acceptance-report.md` |
| V9.3 | passed scoped MiniMax dynamic 2D generation | `docs/V9.x/v9_3-final-acceptance-report.md` |
| V9.4 | blocked Tripo3D real 3D provider branch | `docs/V9.x/v9_4-final-acceptance-report.md` |
| V10.1 | passed scoped bundled animated 2D pack | `docs/V10.x/evidence/v10_1-default-animated-2d-pack-smoke-2026-06-04.md` |
| V10.2 | passed scoped Desktop Manager action preview isolation | `docs/V10.x/evidence/v10_2-action-preview-ux-smoke-2026-06-04.md` |
| V10.3 | passed scoped bundled state-linked runtime animation | `docs/V10.x/evidence/v10_3-state-linked-animation-smoke-2026-06-04.md` |
| V10.4 | detection/static-partial labeling passed; animated GLTF playback excluded | `docs/V10.x/evidence/v10_4-animated-gltf-clip-gate-smoke-2026-06-04.md` |
| V10.5 | passed scoped final visual QA | `docs/V10.x/evidence/v10_5-final-visual-qa-smoke-2026-06-04.md` |
| V10.6 | passed scoped animation format rebaseline | `docs/V10.x/evidence/v10_6-animation-format-rebaseline-smoke-2026-06-04.md` |
| V10.7 | passed scoped high-quality default 2D work-cat visual smoke | `docs/V10.x/evidence/v10_7-work-cat-v1-visual-smoke-2026-06-04.md` |
| V10.8 | passed scoped runtime micro-interaction layer | `docs/V10.x/evidence/v10_8-runtime-micro-interaction-smoke-2026-06-04.md` |
| V10.9 | passed scoped Manager preview and activation UX polish | `docs/V10.x/evidence/v10_9-manager-preview-activation-smoke-2026-06-04.md` |
| V10.10 | passed scoped product-grade animation gate | `docs/V10.x/v10_x-product-grade-final-acceptance-report.md` |
| V10.11 | passed scoped product experience rebaseline | `docs/V10.x/v10_11-final-acceptance-report.md` |
| V10.12-V10.16 | passed scoped selected open-source visual/onboarding benchmark track | `docs/V10.x/v10_16-final-acceptance-report.md` |
| V11.x | passed scoped local living work-cat interaction experience | `docs/V11.x/v11_7-final-acceptance-report.md` |
| V12.x | passed scoped desktop visibility and screenshot-backed acceptance | `docs/V12.x/v12_7-final-acceptance-report.md` |
| V13.x | passed scoped beta distribution and user-ready closure | `docs/V13.x/v13_7-final-acceptance-report.md` |

## V14.x Acceptance Gate

V14.x passed scoped for tested local macOS premium animated pet gallery
experience after:

- `flagship-work-cat-v2` visual QA passes with contact sheets, runtime capture,
  loop closure, nonblank, frame-difference, scale, and operator acceptance.
- animation linter rejects unsafe or unstable multi-frame packs and runtime
  playback no longer flashes old/fallback frames during action switching.
- gallery lists at least 12 local curated packs and at least 8 animated 2D
  packs.
- filters, favorites, favorite persistence, preview, restore, delete
  user-imported pack, and one-click target switching pass.
- preview sends zero PetEvent and does not mutate live PetInstance state.
- AI Asset Guide explains prompt-only, provider-assisted 2D, and external 3D
  import paths without claiming automatic photo-to-3D or provider readiness.
- final HTML embedded screenshots/captures and security, claim, license, and
  regression scans passed.

Active scoped final claim:

```text
V14 local premium animated pet gallery, stable 2D animation playback, favorites, preview, and one-click switching experience passed for tested local macOS scenarios.
```

V14 must not claim Petdex parity, Petdex ecosystem parity, 3D ready,
automatic photo-to-3D ready, provider integration verified, remote asset
loading ready, asset marketplace ready, production signed release ready,
Windows ready, or cross-platform ready.

## V13.x Acceptance Gate

V13.x passed scoped after:

- V13.1-V13.6 produced passed evidence.
- local macOS packaging / launch smoke passed.
- first-run beta user journey is screenshot-backed.
- Codex work-cat onboarding shows reliable JSONL wrapper path, TUI hook trust guide, and already-open window unsupported notice.
- diagnostics export redaction scan passed.
- stability/performance baseline was recorded with real desktop and pet-region screenshots.
- artifact/license/claim hygiene passed.
- final HTML report embeds evidence and uses the narrow allowed claim.

Allowed final claim:

```text
V13 beta distribution and user-ready closure passed for tested local macOS beta workflow scenarios.
```

V13 must not claim production signed release ready, notarized release ready,
auto update ready, Windows ready, cross-platform ready, Petdex parity, 3D ready,
automatic photo-to-3D ready, provider integration verified, OS-level Codex
window binding ready, already-open Codex auto-monitoring ready, or all Codex
workflows verified.

## V12.x Acceptance Gate

V12.x passed scoped after:

- real desktop screenshot visibly contains the cat.
- pet-region screenshot visibly contains the cat.
- sanitized diagnostics explain visibility / capture status.
- first-run real desktop proof passes.
- multi-window / monitor / reset regression passes.
- final HTML embeds screenshots directly and labels evidence type.
- V3/V4/V10/V11 regression remains green.
- security scan and claim scan pass.

V12 final allowed claim:

```text
V12 desktop pet visibility and screenshot-backed acceptance passed for tested local macOS desktop scenarios.
```

V12 must not claim production signed release ready, Windows ready,
cross-platform ready, Petdex parity, 3D ready, provider integration verified,
OS-level Codex window binding ready, or all Codex workflows verified.

## V10.11 Acceptance Gate

V10.11 is the accepted scoped product experience rebaseline.
It is not a new protocol, provider, 3D, OS-level binding, or release-signing
phase.

V10.11 passed because:

- README and active docs agree on current status and user-facing capabilities.
- Settings onboarding exposes the recommended Codex wrapper JSONL path.
- already-open Codex window auto-monitoring is clearly unsupported.
- real Tauri desktop screenshots prove the settings page and visible work-cat.
- HTML reports link real screenshots and are not used as mock proof.
- regression, security scan, claim scan, and drawio sync pass.

Required V10.11 references:

- `docs/V10.x/v10_11-product-experience-rebaseline.md`
- `docs/V10.x/v10_11-final-acceptance-report.md`
- `docs/V10.x/v10_x-development-plan.md`
- `docs/V10.x/v10_x-acceptance-plan.md`
- `docs/V10.x/v10_x-target-architecture.md`
- `docs/V10.x/v10_x-milestones.md`
- `docs/V10.x/v10_x-exit-criteria.md`
- `docs/V10.x/v10_x-claim-matrix.md`
- `docs/V10.x/v10_x-current-gap-analysis.md`

## V10.x Acceptance Gate

V10.1-V10.5 passed scoped as the animation baseline. V10.6 passed scoped for
safe local `pet.json` animation format adaptation only. V10.7 passed scoped for
bundled `work-cat-v1` visual smoke only. V10.8 passed scoped for runtime
micro-interaction controller scenarios. V10.9 passed scoped for Manager
preview/activation polish. V10.10 passed the scoped product-grade animated 2D
work-cat gate. Animated GLTF runtime playback remains excluded;
manifests, static screenshots, or prompt-only plans are insufficient for any
broader animation claim.

Required V10 planning references:

- `docs/V10.x/v10_x-development-plan.md`
- `docs/V10.x/v10_x-acceptance-plan.md`
- `docs/V10.x/v10_x-target-architecture.md`
- `docs/V10.x/v10_x-model-detailed-design.md`
- `docs/V10.x/v10_x-milestones.md`
- `docs/V10.x/v10_x-exit-criteria.md`
- `docs/V10.x/v10_x-claim-matrix.md`
- `docs/V10.x/v10_x-current-gap-analysis.md`

V10 phase gates:

| Phase | Acceptance Gate |
| --- | --- |
| V10.0 | animation gap audit, target architecture, claim boundary, and no unresolved High false-green risk |
| V10.1 | bundled animated 2D pack visibly plays all core actions with no blank/transparent/off-canvas frames |
| V10.2 | Desktop Manager action preview works for all core actions without mutating live PetInstance state |
| V10.3 | runtime state changes visibly switch target pet animation while default/unrelated pets remain unchanged |
| V10.4 | animated GLTF claim passes only with real accepted action clips, otherwise branch is blocked/excluded |
| V10.5 | visual QA, nonblank, scale, fallback, performance, regression, security, claim, and PRD/spec review pass |
| V10.6 | local animation format adapter accepts safe pet packs and rejects unsafe packs |
| V10.7 | `work-cat-v1` passes all visual quality, frame, nonblank, scale, and identity checks |
| V10.8 | idle/click/drag micro-interactions pass without mutating agent state |
| V10.9 | Manager preview/activation polish passes without live-state mutation |
| V10.10 | product-grade animation gate passes with regression, security, claim, PRD/spec, and drawio sync |

V10 must not claim Petdex parity, broad 3D readiness, automatic photo-to-3D
readiness, provider integration readiness, Rive/Live2D readiness, marketplace
readiness, or production signed release readiness.

## V10.12-V10.16 Acceptance Gate

V10.12-V10.16 accepted the selected V10 experience track. The acceptance basis is:

- V10.12 benchmark spec is accepted.
- V10.13 premium bundled animated cat library has at least 6 packs with full
  visual QA.
- V10.14 first-run wizard proves <=3-step visible pet and <=5-step Codex
  work-cat verification.
- V10.15 built-in gallery proves safe preview, activation, restore, and
  user-imported pack deletion.
- V10.16 final gate uses real screenshots/recordings and selects the narrowest
  evidence-matched benchmark-surpass claim.

Required references:

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

## V11.x Acceptance Gate

V11.x has passed scoped final acceptance for tested local desktop scenarios.
The acceptance basis is:

- V11.1 living idle evidence has passed.
- V11.2 pointer-aware interaction evidence passes.
- V11.3 emotion-layer evidence passes.
- V11.4 ActionComposer priority evidence passes.
- V11.5 flagship living cat pack visual QA passes.
- V11.6 first-run delight evidence passes.
- V11.7 final interaction QA gate passes regression, security scan, claim scan,
  PRD/spec review, and drawio sync.

V11 final allowed claim after evidence only:

```text
V11 living work-cat interaction experience passed for tested local desktop scenarios.
```

V11 must not claim Petdex parity, broad 3D readiness, automatic photo-to-3D
readiness, provider integration, marketplace readiness, production signed
release readiness, cross-platform readiness, or Windows readiness.

V11 phase evidence map:

| Phase | Required Evidence | Current Status |
| --- | --- | --- |
| V11.1 | `docs/V11.x/v11_1-final-acceptance-report.md` | passed scoped |
| V11.2 | `docs/V11.x/v11_2-final-acceptance-report.md` | passed scoped |
| V11.3 | `docs/V11.x/evidence/v11_3-emotion-layer-smoke-2026-06-07.md` | passed scoped |
| V11.4 | `docs/V11.x/evidence/v11_4-action-composer-smoke-2026-06-07.md` | passed scoped |
| V11.5 | `docs/V11.x/evidence/v11_5-flagship-living-cat-pack-smoke-2026-06-07.md` | passed scoped |
| V11.6 | `docs/V11.x/evidence/v11_6-first-run-delight-smoke-2026-06-07.md` | passed scoped |
| V11.7 | `docs/V11.x/v11_7-final-acceptance-report.md` | passed |

## V8.x Acceptance Gate

V8.0-V8.11 are accepted scoped. V8.9-V8.11 added local animated 2D sprite
assembly, prompt-only animated sprite instructions, and runtime animated sprite
visual QA.

V8 may pass only through these gates:

| Phase | Acceptance Gate |
| --- | --- |
| V8.0 | scope, architecture, claim matrix, remote milestones, and audit reviewed with no unresolved High planning risk |
| V8.1 | provider consent and credential harness passes with redacted local diagnostics and no upload |
| V8.2 | real named-provider 3D output is produced under explicit consent, or phase is blocked |
| V8.3 | provider output passes GLTF/GLB deep scan, normalization, and action coverage contract |
| V8.4 | provider/imported 3D pack passes runtime visual QA, scale, fallback, and isolation checks |
| V8.5 | Desktop Manager guided workflow passes without CLI-only required steps for the claimed path |
| V8.6 | diagnostics, deletion, retention, license/attribution, redaction, and artifact scans pass |
| V8.7 | final report selects the narrowest evidence-matched claim |
| V8.8 | prototype GLB rendering quality improves with scoped evidence |
| V8.9 | local frame folder assembles into validated animated sprite pack without leaking paths or changing wrong PetInstance |
| V8.10 | prompt-only animated sprite workflow passes, or explicit-consent provider branch has separate evidence |
| V8.11 | accepted animated sprite pack visibly animates all core actions with fallback/isolation evidence |

V8 may not claim automatic photo-to-3D from image generation, fixture GLB import,
local sample 3D rendering, local animated sprite assembly, or prompt-only
animated sprite instructions. The required V8 planning references are:

- `docs/active/agent_desktop_pet_prd_v8.md`
- `docs/V8.x/v8_x-development-plan.md`
- `docs/V8.x/v8_x-acceptance-plan.md`
- `docs/V8.x/v8_x-target-architecture.md`
- `docs/V8.x/v8_x-claim-matrix.md`
- `docs/V8.x/v8_x-remote-milestones.md`
- `docs/V8.x/v8_9-animated-sprite-assembler-acceptance-plan.md`
- `docs/V8.x/v8_10-ai-assisted-animated-sprite-workflow-acceptance-plan.md`
- `docs/V8.x/v8_11-animated-sprite-visual-qa-acceptance-plan.md`

## Closed V3.x Acceptance

V3.x Final passed on 2026-05-26 because:

- PRD conformance scan passed for the scoped V3.x local workflow baseline.
- V3.6 remains historical blocked / deprecated as active strategy.
- V3.7 remains scoped JSONL monitor and current Codex exec monitoring path.
- V3.4 real Codex hook lifecycle evidence remains operator-accepted, with trust/manual lifecycle requirements documented.
- required smoke and automatic checks had no hard failure.
- security scan passed.
- claim scan passed.
- git artifact check confirmed generated `dist/`, `target/`, and `node_modules/` are not staged as source changes.

Allowed closed baseline claim:

```text
V3.x scoped Codex local workflow acceptance passed with documented evidence and claim boundaries.
```

## V3.7 Regression Baseline

V3.7 remains the current accepted Codex monitoring fallback:

```text
V3.7 Codex exec JSONL monitor state mapping passed for tested local wrapper-launched codex exec --json scenarios.
```

Required evidence:

- `docs/V3.7/evidence/codex-exec-jsonl-monitor-smoke-2026-05-25.md`
- `docs/V3.7/v3_7-final-acceptance-report.md`

Required regression smoke:

```bash
node scripts/v3_7_codex_exec_jsonl_monitor_smoke.mjs
```

Unsupported by this claim:

- interactive Codex TUI monitoring.
- already-open Codex terminal window discovery.
- OS-level Codex window binding.
- official `PostToolUse failure` hook evidence.
- all Codex workflows verification.

## V4.0 Acceptance Gate

V4.0 is a strict feasibility and claim-boundary phase. It has passed as feasibility review only and does not claim readiness or implementation.

Required V4.0 evidence:

- terminal app feasibility matrix covering Terminal.app, iTerm2, VS Code integrated terminal, Warp, and Ghostty.
- permission model for Accessibility, Automation, shell integration, and any local helper process.
- privacy and redaction model for process metadata, window identifiers, TTY identifiers, session identifiers, permissions, and forbidden fields.
- safe identity field list.
- state event source analysis for already-running Codex sessions.
- analysis of whether `AGENT_DESKTOP_PET_INSTANCE_ID` can be injected into already-running sessions; if not, relaunch-through-wrapper fallback must be stated.
- event ownership proof analysis for any future selected-terminal routing.
- no-go list for unsupported terminal / Codex scenarios.
- go / no-go decision for implementation.
- claim scan proving forbidden claims are not used as ready / passed.

V4.0 explicitly does not include active window probe, explicit binding UX, selected-terminal routing, or runtime smoke.

Allowed V4.0 scoped claim:

```text
V4.0 OS-level Codex window/session binding feasibility review completed with scoped go/no-go decision.
```

V4.0 decision:

- Go for V4.1 planning for Terminal.app and iTerm2 safe-field probe only.
- No-go for V4.3 selected-terminal routing from OS-level discovery alone.
- No-go for interactive Codex TUI monitoring ready.

V4.0 may not claim:

```text
OS-level Codex window binding ready
interactive Codex TUI monitoring ready
already-open Codex window auto-detection ready
all Codex workflows verified
Codex internal reasoning exact mapping ready
```

## V4.1-V4.3 Acceptance Split

| Phase | Earliest Allowed Work | Maximum Allowed Claim |
| --- | --- | --- |
| V4.1 | active window safe-field probe prototype | `V4.1 macOS active window safe-field probe completed for <terminal app> on tested local environment.` |
| V4.2 | explicit user-confirmed binding UX | no auto-bind or monitoring claim |
| V4.3 | selected-terminal routing prototype | `V4.3 user-confirmed binding prototype passed for <terminal app>/<macOS>/<Codex version> tested local scenario.` |

V4.3 may pass only if events can be proven to belong to the user-confirmed bound session. If event ownership cannot be proven, V4.3 must be blocked.

## V4.x Final Gate

V4.x Final must not add features. It may only consolidate regression, evidence, security, artifact, and claim scans for whatever V4.x scope was actually implemented.

Required final checks:

- all V4.x scoped runtime smokes, if implementation exists.
- V3.7 regression smoke remains passing unless explicitly superseded with accepted evidence.
- no security leakage in V4.x evidence.
- no forbidden claim used as ready.
- generated `dist/`, `target/`, and `node_modules/` are not committed as source changes.

## V4.4 Managed Session Acceptance

V4.4 adds a managed user entry for state mapping:

```bash
node packages/petctl/dist/cli.js codex session start \
  --mode exec \
  --monitor jsonl \
  --name "Review Cat" \
  -- codex exec --json "task"
```

Accepted V4.4 scope:

```text
V4.4 managed Codex exec JSONL state mapping passed for tested local wrapper-launched scenario.
```

Evidence:

- `docs/V4.x/v4_4-development-plan.md`
- `docs/V4.x/v4_4-acceptance-plan.md`
- `docs/V4.x/v4_4-prd-spec-review.md`
- `docs/V4.x/v4_4-plan-audit.md`
- `docs/V4.x/evidence/v4_4-managed-exec-jsonl-smoke-2026-05-27.md`
- `docs/V4.x/evidence/v4_4-managed-tui-hooks-smoke-2026-05-27.md`
- `docs/V4.x/v4_4-final-acceptance-report.md`

Managed TUI hooks remain not-run. No interactive TUI monitoring ready claim is allowed.

## V4.5 Managed TUI Hook Acceptance

Current allowed claim:

```text
V4.5 managed Codex TUI hook state mapping passed for UserPromptSubmit, PreToolUse, and Stop in tested local wrapper-launched scenario; PermissionRequest remains blocked by local policy.
```

Required real manual acceptance:

- start `node packages/petctl/dist/cli.js codex session start --mode tui --monitor hooks --name "V4.5 TUI Cat" -- codex`.
- run `/hooks` inside Codex TUI.
- review/trust project hooks.
- submit real prompt.
- trigger tool use.
- trigger permission request if local policy allows.
- let turn stop.
- confirm target cat changes.
- confirm default and unrelated pets unchanged.

Required evidence:

- `UserPromptSubmit -> thinking`.
- `PreToolUse -> running`.
- `Stop -> success` / idle marker.
- `PermissionRequest -> need_input`, or blocked by local policy.
- no curl.
- no manual `petctl notify`.
- no fixture smoke as lifecycle evidence.
- no terminal text parsing.
- no `transcript_path`.
- no raw hook payload.
- no prompt text.
- no tool command text.

If only preflight passes, status remains `pending-manual-hook-lifecycle`. The 2026-05-27 local run passed scoped real lifecycle acceptance for `UserPromptSubmit`, `PreToolUse`, and `Stop`; `PermissionRequest` was not observed and is not claimed passed.

## V4.6 UX Hardening Acceptance

Status: passed on 2026-05-27.

Allowed scope:

- desktop health preflight.
- hooks config check.
- wrapper script check.
- Codex CLI check.
- clear "run `/hooks` and trust hooks" instruction.
- stable reasonCode.

Recommended reasonCode:

```text
desktop_not_running
hook_config_missing
hook_wrapper_missing
hook_trust_required
hook_lifecycle_not_observed
codex_not_found
pet_instance_create_failed
binding_env_missing
```

Allowed claim:

```text
V4.6 managed session startup diagnostics and UX hardening passed for tested local wrapper-launched scenarios.
```

Evidence:

- `docs/V4.x/evidence/v4_6-startup-diagnostics-smoke-2026-05-27.md`

Forbidden expansion:

- TUI hook mapping passed.
- interactive Codex TUI monitoring ready.
- OS-level binding ready.

## V4.7 Session Status Acceptance

Status: passed on 2026-05-27.

Allowed command:

```bash
petctl codex session status --json
```

Allowed fields:

- `instanceId`
- redacted `bindingId`
- `mode`
- `monitor`
- `status` as `active` / `stale` / `unknown`
- `lastEventKind`
- `lastSeenAt`

Forbidden fields:

- raw TTY
- raw args
- window title
- path
- prompt
- tool command
- raw hook payload
- token
- Authorization

Allowed claim:

```text
V4.7 managed session status and stale-binding diagnostics passed for tested local wrapper-launched scenarios.
```

Evidence:

- `docs/V4.x/evidence/v4_7-session-status-smoke-2026-05-27.md`

## V4.x Final Boundary

V4.x Final status: passed on 2026-05-27.

```text
V4.x managed Codex session-to-PetInstance state mapping passed for tested local wrapper-launched exec JSONL and scoped managed TUI hook scenarios, with Terminal.app candidate binding and manual route-test prototype accepted.
```

## V5.x Acceptance Boundary

V5.x is renderer, 3D, and action asset work. V5.0-V5.15 have passed scoped acceptance through bundled renderer/assets, the personalized CLI import pipeline, Desktop Manager local import UI, runtime imported rendering, guided photo-to-asset workflow, provider consent boundary, and visual QA.

V5.x acceptance is defined in `docs/V5.x/v5_x-acceptance-plan.md`. V5.11-V5.15 moved from planned to passed only after phase-specific evidence and final acceptance reports.

V5.11 scoped import UI acceptance passed after automated smoke and manual Desktop Manager UI validation. See `docs/V5.x/v5_11-final-acceptance-report.md` and `docs/V5.x/v5_11-manual-ui-acceptance-steps.md`.

V5.11 accepted evidence:

- `docs/V5.x/v5_11-import-ui-acceptance-plan.md`
- `docs/V5.x/evidence/v5_11-import-ui-smoke-2026-05-28.md`
- `fixtures/manual/v5_11/README.md`

## V6.x Acceptance Boundary

V6.x is now the active productization planning line. It uses V5.12-V5.15 as accepted baseline evidence rather than reopening those phases as unfinished migration work.

V6.0 acceptance requires:

- V6 planning docs exist.
- active docs identify V6 as current planning line.
- V5 scoped baseline is not expanded into production release, provider integration, photo-to-3D, MCP, cross-platform, or 3D-ready claims.
- forbidden claims appear only in forbidden / not-ready contexts.

V6.9 Productization Gate passed for tested local macOS developer workflow scenarios after V6.1-V6.8 phase evidence, regression, security, claim, license, and artifact scans.

Scoped V5 productization acceptance docs:

- `docs/V5.x/v5_12-runtime-imported-pack-rendering-acceptance-plan.md`
- `docs/V5.x/v5_12-final-acceptance-report.md`
- `docs/V5.x/v5_13-photo-to-asset-guided-workflow-privacy-review.md`
- `docs/V5.x/v5_13-final-acceptance-report.md`
- `docs/V5.x/v5_14-provider-adapter-feasibility-and-consent-plan.md`
- `docs/V5.x/v5_14-final-acceptance-report.md`
- `docs/V5.x/v5_15-visual-quality-action-qa-plan.md`
- `docs/V5.x/v5_15-final-acceptance-report.md`
- `docs/V5.x/v5_x-productization-gate-plan.md`
- `docs/V5.x/v5_x-productization-final-acceptance-report.md`

## Security Gate

Acceptance evidence must not contain:

```text
token
Authorization
raw JSONL payload
raw hook payload
prompt text
tool command text
shell history
screen contents
clipboard contents
transcript_path
full /Users path
workspace path
config path
api token filename
```

## Claim Gate

Forbidden as ready / passed:

```text
OS-level Codex window binding ready
interactive Codex TUI monitoring ready
already-open Codex window auto-detection ready
already-open Codex window auto-monitoring ready
V3.6 selected Codex workflow hook coverage smoke passed
PostToolUse failure hook evidence passed
all Codex workflows verified
Codex internal reasoning exact mapping ready
ModelThinkingStart / ModelThinkingEnd verified
MCP ready
Third-party agent integration verified
Claude Code integration verified
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
