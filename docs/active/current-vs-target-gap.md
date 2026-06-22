# Current vs Target Gap

文档状态：active gap；V30 planned；V29/V23-V28 scoped baselines 是输入基线；Petdex public resources are format/UX references only, not bundled assets。
配套图：`current-vs-target-gap.drawio`。  
当前日期：2026-06-17。

## Active Line

```text
Current active status: V30 planned for semantic 2D pet animation quality. V29 Petdex-level gallery/photo benchmark work is the immediate input baseline, but V30 exists because recent visual review found generated frames still look like whole-image transforms rather than intuitive character actions.
Current active PRD: docs/active/agent_desktop_pet_prd_v30.md.
V30 target: action semantics -> storyboard/key-pose contract -> semantic candidate generation -> motion readability QA -> old-vs-new preview -> approved target apply -> rollback.
V29/V23-V28 scoped acceptance remains the input baseline: the pipeline can close and gallery/generation flows exist, but it does not prove that generated actions are attractive, readable character animation.
V30 must not claim Petdex parity achieved, provider integration verified, automatic photo-to-animation ready for arbitrary cats, Petdex asset reuse authorization, 3D ready, production release ready, Windows ready, or cross-platform ready.
Historical baselines: V19 local motion sheet scoped passed; V18/V17/V16/V15 and earlier tracks are closed scoped baselines and regression constraints, not current active work.
V3.x status: closed scoped baseline.
V4.x status: closed scoped OS-level feasibility / managed session baseline.
V5.x status: V5.0-V5.15 passed scoped; V5.x Productization Gate passed for scoped local productization.
V6.x status: V6.0-V6.9 passed scoped for tested local macOS developer workflow scenarios.
V7.x status: V7.0-V7.15 passed scoped for tested local guided/provider-assisted personalized cat asset workflow scenarios, MiniMax image provider smoke, generated 2D action packs, external GLB/GLTF intake, tested local 3D runtime mapping, orchestration, advanced visual QA, and the evidence-matched advanced gate.
V8.x status: V8.0-V8.11 passed scoped for tested provider-backed 3D workflow, prototype GLB quality improvement, local animated sprite assembly, prompt-only animated sprite workflow, and animated sprite visual QA.
V9.x status: V9.2/V9.3 passed scoped for tested MiniMax static and dynamic 2D generation; V9.4 Tripo3D real 3D provider branch blocked.
V10.x status: V10.1-V10.16 passed scoped through product-grade animated 2D baseline, product-experience rebaseline, selected benchmark visual/onboarding track, premium local cat library, first-run wizard, built-in gallery, and benchmark gate. Animated GLTF playback remains excluded.
V11.x status: V11.1-V11.7 passed scoped for tested local living work-cat interaction experience.
V12.x status: V12.1-V12.7 passed scoped for real desktop visibility, window-layer diagnostics, screenshot harness, first-run desktop proof, multi-window/reset regression, complete acceptance HTML, and final desktop visibility gate.
V13.x status: V13.1-V13.7 passed scoped with local macOS packaging smoke, first-run user journey screenshots, safe diagnostics export, stability/performance screenshots, artifact/license/claim hygiene, and final beta readiness HTML.
V14.x status: passed scoped for tested local macOS premium animated pet gallery, stable 2D animation playback, favorites, preview, one-click switching, and AI asset workflow boundary.
```

## Implementation Focus Summary

This section is the short automation-facing summary. It overrides any confusion caused by historical baselines below:

```text
Current active work: V30 Semantic Character Animation Quality Track.
V30.0 scope freeze: planned.
V30.1 action storyboard and key-pose contract: planned.
V30.2 semantic frame candidate generation: planned.
V30.3 motion readability QA and transform-only rejection: planned.
V30.4 old-vs-new preview UX with contact sheets and animated playback: planned.
V30.5 approved semantic pack target apply and rollback: planned.
V30.6 final gate: No-Go until V30.0-V30.5 evidence exists.
V29 Petdex-level Gallery and Stable Photo-to-Animated-2D Track: immediate input baseline; it does not prove semantic character animation quality.
V23-V28 Photo-to-Animated-2D Productization Track: passed scoped and retained as baseline.
V23 photo suitability and trait extraction: passed scoped with real local photo samples and quality fixtures.
V24 multi-route generation orchestrator: passed scoped with route registration, budgets, safe candidate metadata, and non-mutating route states.
V25 same-cat and motion QA: passed scoped with identity drift, weak motion, frame delta, loop, and visibility rejection evidence.
V26 auto-pack, preview, target apply, rollback: passed scoped with approved-candidate packaging, isolated 8-action preview, target-only apply, and rollback evidence.
V27 retry/cost/failure guidance: passed scoped with budget, repeated-failure repair, provider gate, and actionable next-step evidence.
V28 productized workflow final gate: passed scoped with final dashboard, regression, security, and claim scans.
V22 closure completed scoped and is now the input baseline.
V22.0 scope freeze: passed.
V22.1 quality schema: passed.
V22.2 technical QA gate: passed.
V22.3 motion QA gate: passed.
V22.4 visual review UX: passed.
V22.5 retry/route guidance: passed.
V22.6 approved-only apply enforcement: passed.
V22.7 final gate: passed scoped.
V21 closure completed scoped and remains a historical input baseline.
V21.0 scope freeze: passed.
V21.1 Route A provider key-pose pack: passed.
V21.2 Route B alternate provider preflight: passed as capability review.
V21.3 Route C local 2D rig: passed.
V21.4 Route D image-to-video frames: excluded because no safe explicit-consent video source was available.
V21.5 comparator: passed with embedded visual evidence.
V21.6 best route preview/apply/rollback: passed for Route A.
V21.7 final gate: passed scoped.
V20 provider outputs are route inputs, not V21 pass evidence.
V19 local motion-sheet workflow remains accepted fallback baseline.

V23-V28 baseline design docs:

- `docs/active/agent_desktop_pet_prd_v23_v28.md`
- `docs/V23-V28.x/v23_v28-target-architecture.md`
- `docs/V23-V28.x/v23_v28-development-plan.md`
- `docs/V23-V28.x/v23_v28-detailed-development-and-acceptance-plan.md`
- `docs/V23-V28.x/v23_v28-acceptance-plan.md`
- `docs/V23-V28.x/v23_v28-claim-matrix.md`
- `docs/V23-V28.x/v23_v28-milestones.md`
- `docs/V23-V28.x/v23_v28-current-gap-analysis.md`
- `docs/V23-V28.x/v23_v28-implementation-contract.md`
- `docs/V23-V28.x/v23_v28-evidence-index.md`
- `docs/V23-V28.x/v23_v28-doc-audit.md`
- `docs/V23-V28.x/v23_v28-target-state.drawio`

V30 active design docs:

- `docs/active/agent_desktop_pet_prd_v30.md`
- `docs/V30.x/v30-target-architecture.md`
- `docs/V30.x/v30-development-plan.md`
- `docs/V30.x/v30-acceptance-plan.md`
- `docs/V30.x/v30-claim-matrix.md`
- `docs/V30.x/v30-milestones.md`
- `docs/V30.x/v30-current-gap-analysis.md`
- `docs/V30.x/v30-implementation-contract.md`
- `docs/V30.x/v30-doc-audit.md`
- `docs/V30.x/v30-target-state.drawio`

V22 accepted baseline evidence:

- `docs/V22.x/v22_7-final-acceptance-report.md`
- `docs/V22.x/evidence/v22_7-quality-review-dashboard-2026-06-15.html`
- `docs/V22.x/evidence/v22_7-regression-checks-2026-06-15.md`

V23 accepted scoped evidence:

- `docs/V23-V28.x/evidence/v23-photo-suitability-trait-smoke-2026-06-16.md`
V24 accepted scoped evidence:

- `docs/V23-V28.x/evidence/v24-multi-route-generation-smoke-2026-06-16.md`
V25 accepted scoped evidence:

- `docs/V23-V28.x/evidence/v25-same-cat-motion-qa-smoke-2026-06-16.md`
V26 accepted scoped evidence:

- `docs/V23-V28.x/evidence/v26-pack-preview-apply-smoke-2026-06-16.md`
V27 accepted scoped evidence:

- `docs/V23-V28.x/evidence/v27-retry-cost-guidance-smoke-2026-06-16.md`
V28 accepted scoped evidence:

- `docs/V23-V28.x/v28-final-acceptance-report.md`
- `docs/V23-V28.x/evidence/v28-productized-photo-to-2d-dashboard-2026-06-16.html`
```

## Historical Baselines

V3-V19 作为已验收基线和回归约束存在，不是当前 active work。V15.0-V15.13 已 scoped passed。V16 已 scoped passed，用于闭环测试场景下真实宿主图像工具多帧照片到 2D 动作生成；不得把该单场景证据扩大为任意猫 automatic photo-to-2D ready 或 provider integration verified。V17.0-V17.7 已完成 scoped acceptance，用于闭环测试本地照片 + 4x2 动作表导入 + 预览 + 目标应用/回滚的产品化向导路径，并补齐 MiniMax text-to-image provider API 生成 4x2 动作表的 scoped addendum。V18.0-V18.6 已完成 scoped acceptance：真实用户猫图 reference image -> MiniMax image-to-image canonical 身份图 -> identity-locked 8 动作本地派生包 -> 应用内预览 -> target-only apply/rollback。V19.0-V19.6 已完成 scoped acceptance：本地 Petdex-style motion sheet 导入、裁切、QA、预览、目标应用、回滚；provider 单 sheet 分支 blocked。V20 provider branch produced three MiniMax reference-image outputs but remained blocked at normalization. V21 owns the multi-route recovery plan.

## V21 Multi-route Animation Asset Recovery

V21 owns the recovery gap after V20:

```text
V20 MiniMax outputs are real but not valid 8x9 sheets
  -> V21 Route A provider key-pose extraction
  -> V21 Route B alternate provider review/smoke
  -> V21 Route C unified-character local rig
  -> V21 Route D image-to-video frame extraction
  -> common QA / comparator / target apply / rollback
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Provider output utility | V20 outputs include usable-looking cats but invalid sheet layout | extract key poses or route around layout failure | V21.1 passed via Route A |
| Provider choice | MiniMax P0 is real but not sufficient as direct sheet generator | evaluate alternate provider modes and capability boundaries | V21.2 passed as review |
| Same-cat control | provider direct output drifts or repeats | local rig route controls identity and frame continuity | V21.3 passed |
| Motion strength | local transform routes can be too weak | video/key-pose/rig routes compete on amplitude | V21.4 excluded for video route; Route A/C passed |
| User comparison | no unified route comparison | side-by-side embedded HTML with actual assets | V21.5 passed |
| Product apply | only V19 fallback passed | best V21 route previews, applies target-only, rolls back | V21.6 passed |
| Final claim | V20 blocked | route-scoped final decision | V21.7 passed scoped |

## V20 Mainland Provider Motion Sheet Workflow

V20 owns the remaining provider-generation gap after V19:

```text
V19 local motion-sheet workflow
  -> V20 mainland provider matrix
  -> MiniMax reference-image motion sheet benchmark
  -> reasonCode-driven prompt repair loop
  -> provider output normalization/background gate
  -> high-amplitude/same-cat/loop QA
  -> in-app preview
  -> target apply / rollback
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Mainland provider | MiniMax historical smokes exist; V19 provider branch blocked | MiniMax P0 multi-sample reference-image motion-sheet benchmark | V20.2 passed 3-sample provider output benchmark; 8x9 normalization still blocked |
| Provider consent | Existing provider boundaries | provider selector + upload/cost/privacy/retention/license/credential checks | V20.1 passed |
| Single sheet output | V19 local sheet only | real MiniMax output is one parseable 8x9 sheet or explicit blocked reason; reliability claims require at least 3 samples | V20.3 blocked: output was not valid 8x9 sheet |
| Background | local sheet controllable | provider output transparent/background-safe or blocked | V20.3 blocked before accepted background normalization |
| Motion QA | V19 local amplitude QA | provider output passes same-cat, amplitude, loop, delta, 1x/0.75x checks | V20.4 blocked by V20.3 |
| Product UX | V19 preview/apply model | provider-generated pack preview, target apply, rollback | V20.5 blocked by V20.3/V20.4 |
| Final proof | V19 local final | V20 evidence-matched final; provider claim only if real output passes | No-Go V20.6 |

## V19 Petdex-style High-amplitude Motion Sheet Workflow

V19 owns the local visual experience gap after V18:

```text
V18 identity-locked transform-derived action pack
  -> V19 Petdex-style single motion sheet
  -> safe crop / normalize / pack
  -> high-amplitude motion QA
  -> same-cat continuity QA
  -> in-app preview
  -> target apply / rollback
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Motion source | V18 derives action frames from one canonical image | same-cat single motion sheet or safe imported sheet | planned V19.2 |
| Motion amplitude | V18 frame deltas are lower than Petdex-style samples | visibly stronger action poses and motion amplitude QA | planned V19.4 |
| Format | existing project pack formats | Petdex-compatible 8-row sheet validation and project 8-core-action mapping | planned V19.1 |
| License boundary | Petdex public assets observed but not licensed for bundling | Petdex as format/UX reference only; no asset reuse without explicit license | planned V19.0 |
| Product preview | V18 action preview model exists | sheet + per-action preview, target apply, rollback | planned V19.5 |
| Final proof | V18 final HTML proves transform-derived identity pack | V19 final HTML proves high-amplitude sheet workflow | planned V19.6 |

V19 current status: V19.0-V19.6 passed scoped for local motion-sheet workflow;
V19.2 provider branch blocked/not-claimed. V20 owns the next provider branch.

## V18 User Photo to Multi-action 2D Pet Workflow

V18 owns the remaining product gap after V17:

```text
V17 action-sheet wizard
  -> V18 reference photo provider consent
  -> image-to-image provider canonical identity job
  -> identity-locked multi-action local assembly
  -> same-cat + continuity QA
  -> in-app preview
  -> target apply / rollback
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Reference photo generation | V17.7 uses text-to-image action sheet; local photo upload was not-ready before V18.2 | real image-to-image/reference-image provider path | V18.2 passed scoped |
| Consent and disclosure | V17 has local consent UI | explicit upload consent, provider name, cost/privacy/retention/license before provider call | V18.1 passed scoped |
| Provider job lifecycle | V18.2 proved one real MiniMax reference-image job | queued/uploading/generating/output_received/blocked with stable reasonCode | V18.2 passed scoped |
| Multi-action output | V18.3 generates one provider canonical identity image, then derives all 8 actions locally from the same source hash | identity-locked 8 core action safe local pack | V18.3 passed scoped |
| Same-cat QA | V18.4 passed same-cat source-hash and continuity QA for the tested identity-locked generated pack | input cat photo and generated actions pass visible same-cat/continuity QA before apply | V18.4 passed scoped |
| End-user E2E | V18.6 final report summarizes tested local MiniMax image-to-image path | user selects cat image, generates, previews, applies, and rolls back in tested scoped path | V18.6 passed scoped |

V18 final allowed claim after evidence only:

```text
V18 user-provided cat photo to multi-action 2D pet asset workflow passed for the tested local image-to-image provider scenario with in-app preview, target apply, and rollback.
```

V18 must not claim automatic photo-to-2D ready for arbitrary cats, provider integration verified, Petdex parity, 3D ready, photo-to-3D ready, production signed release ready, Windows ready, or cross-platform ready.

## V17 Photo-to-2D Productized Wizard

V17 owns the product UX gap after V16:

```text
V16 provider-backed evidence pipeline
  -> V17 user-facing wizard
  -> photo preview / consent
  -> generation mode / loading state
  -> 4x2 action sheet intake
  -> auto crop and pack
  -> modal QA preview
  -> target apply / rollback
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| User entry | explanation modal and multiple expert panels | one guided photo-to-2D wizard | passed V17.1 scoped |
| Photo handling | privacy summary exists | image preview + safe metadata + consent state | passed V17.1 scoped |
| Generation path | prompt/provider/manual concepts split | clear host/manual/provider/import mode selector | passed V17.2 scoped |
| Loading/status | no product job state | progress + next action + stable reasonCode | passed V17.2 scoped |
| Action sheet intake | generated output handled by scripts/evidence | upload 4x2 sheet and auto crop | passed V17.3 scoped |
| Packaging | V16 pack script is scenario-specific | parameterized local frameSequence pack | passed V17.3 scoped |
| QA preview | evidence not user-centered | 8-action modal preview with pass/fail | passed V17.4 scoped |
| Apply/rollback | model exists | target picker, apply, retry, rollback UX | passed V17.5 scoped |
| Final proof | V16 final HTML proves pipeline | V17 final HTML proves productized wizard | passed V17.6 scoped |

## V16 Provider-backed Photo-to-2D Action Generation

V16 owns the remaining photo personalization gap after V15:

```text
V15 import-ready prompt workflow and local frame validation
  -> real named-provider multi-frame 2D action output
  -> same-cat consistency review
  -> auto packaging into safe local animation pack
  -> visual preview / target-only apply / rollback
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Provider output | V15.11 provider branch not-run | host image tool returns 8-action source sheet, normalized into frame sets | passed V16.2 |
| Same-cat consistency | user-approved traits exist | all generated actions visibly remain same cat | passed V16.3 |
| Auto packaging | local imported frames pass V15.12 | provider output normalizes into `pet.json + frames` | passed V16.4 |
| Manager UX | preview/apply existing generated pack | preview/apply/rollback safety model | passed V16.5 |
| Final proof | V15.13 screenshot-backed preview/apply | provider-backed E2E HTML with contact/runtime evidence | passed V16.6 |

V16 final claim is allowed only after real accepted provider output:

```text
V16 provider-backed photo-to-2D multi-action generation passed for the tested named provider and local cat-photo scenario.
```

V16 must not claim automatic photo-to-2D ready for arbitrary cats, automatic photo-to-animation ready, provider integration verified, Petdex parity achieved, 3D ready, automatic photo-to-3D ready, marketplace readiness, production signed release ready, Windows ready, or cross-platform ready.

## V15 Living Desktop Interaction Upgrade

V15 owns the interaction-experience gap after V14:

```text
premium animated pet gallery
  -> natural drag / release / land
  -> pointer-near / hover / click / double-click feedback
  -> autonomous walk / pause / turn / edge avoidance
  -> priority-safe state and interaction composition
  -> user controls for interaction intensity and quiet mode
  -> final screenshot-backed interaction QA
  -> user-provided cat photo to safe local 2D action asset workflow
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Scope freeze | V15 documents and claim boundary were planned | evidence-backed V15.0 scope freeze | passed V15.0 |
| Priority composition baseline | state mapping and living actions existed | V15 priority order, required safe actions, safe renderer snapshot, zero PetEvent / CatStateMachine writes | passed V15.1 |
| Drag interaction | pet could move but drag feel was not product-grade | grabbed/dragging/release/land with no image ghost and persisted position path | passed V15.2 |
| Pointer feedback | limited pointer/click interaction | pointer-near, hover, click, double-click visible response | passed V15.3 |
| Autonomous movement | idle random exists | bounded walk, pause, turn, edge avoidance | passed V15.4 |
| Priority composition | state mapping and living actions exist | one composer prevents error/need_input overwrite | passed V15.5 |
| User controls | settings exist but interaction controls incomplete | toggles, intensity presets, quiet mode, preview | passed V15.6 |
| Final proof | V14 final HTML proves gallery/switching | V15 final HTML proves living interaction on real desktop | passed V15.7 |
| 2D animation continuity | bundled 2D assets could pass coverage while still having visible adjacent-frame jumps | default and gallery 2D core actions close first/final frames and pass bounded adjacent-frame continuity | passed V15.8 |
| Photo intake privacy | prior privacy/provider boundaries existed but not as one ordinary-user flow | local photo selection, consent, EXIF/path redaction, no default upload | passed V15.9 |
| Trait and prompt review | prompt generation existed but not as approved same-cat review | approved traits drive 8 core action prompts | passed V15.10 |
| Photo-guided 2D generation/import | MiniMax smokes existed but not integrated into Manager workflow | import-ready prompt workflow passed; real named-provider branch remains not-run | passed V15.11 import-ready |
| Continuity assembly | V15.8 covers bundled packs | generated/imported frames become safe local pack and pass continuity guard | passed V15.12 |
| Preview/apply final gate | Manager applies existing packs | photo-guided pack preview and target-only apply with screenshots/contact/runtime evidence | passed V15.13 |

V15 final allowed claim:

```text
V15 living desktop pet interaction upgrade passed for tested local macOS scenarios with drag, pointer-aware feedback, autonomous walk, configurable interaction settings, and priority-safe state composition.
```

V15 must not claim Petdex parity, Petdex ecosystem parity, 3D ready,
automatic photo-to-2D ready, automatic photo-to-3D ready, provider integration
verified, remote asset loading ready, asset marketplace ready, production
signed release ready, Windows ready, cross-platform ready, OS-level Codex window
binding ready, or all Codex workflows verified.

## V14 Premium Pet Gallery & Stable Animated Asset Experience

V14 owns the product-experience gap after V13:

```text
beta-ready local desktop pet
  -> high-quality default animated cat
  -> stable multi-frame animation assets
  -> local pet gallery
  -> browse / filter / favorite / preview
  -> one-click switching
  -> ordinary-user AI asset boundary
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Default visual appeal | accepted animated packs exist but user still perceives quality gaps | `flagship-work-cat-v2` becomes a higher-quality default animated cat | V14.1 passed |
| Animation stability | historical 2D flicker, loop-open frames, and asset naming clutter occurred | linter and runtime safeguards block unstable packs and fallback flashing | V14.2 passed |
| Gallery browsing | gallery foundations exist | at least 12 local curated packs with filters and favorites | V14.3 passed |
| Preview / switching | preview/activation foundations exist | isolated preview and one-click apply to default or selected Codex work-cat | V14.4 passed |
| AI asset product boundary | provider/prompt paths exist but are not ordinary-user stable | AI Asset Guide explains prompt/import/provider boundaries and validation | V14.5 passed |
| Final product proof | V13 beta HTML proves beta readiness | V14 final HTML proves gallery, switching, stability, and visual experience | V14.6 passed |

V14 final allowed claim after evidence only:

```text
V14 local premium animated pet gallery, stable 2D animation playback, favorites, preview, and one-click switching experience passed for tested local macOS scenarios.
```

V14 must not claim Petdex parity, Petdex ecosystem parity, 3D ready,
automatic photo-to-3D ready, provider integration verified, remote asset
loading ready, asset marketplace ready, production signed release ready,
Windows ready, cross-platform ready, OS-level Codex window binding ready, or
all Codex workflows verified.

## V13 Beta Readiness Closure

V13 owns the gap after V12:

```text
real desktop-visible app
  -> local macOS beta package
  -> ordinary user first-run path
  -> safe diagnostics export
  -> stability / artifact / claim hygiene
  -> screenshot-backed beta readiness report
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Local beta package | Developer-run workflow and build evidence exist. | Tested local macOS package/launch smoke. | V13.2 passed scoped |
| First-run beta journey | V12 proves visibility; product explanation still spread across docs/settings. | User can understand visible pet, settings, Codex work-cat path, and unsupported already-open window notice. | V13.3 passed scoped |
| Safe diagnostics export | Diagnostics exist across tools/evidence. | One redacted support export boundary with scan evidence. | V13.4 passed scoped |
| Stability/performance | Phase-level visual evidence exists. | Local stability smoke with real start/end desktop and pet-region screenshots. | V13.5 passed scoped |
| Artifact/license/claim hygiene | Prior phase evidence exists. | Beta gate scans generated artifacts, licenses, evidence leaks, and forbidden claims. | V13.6 passed scoped |
| Final beta report | V12 has screenshot-backed report. | V13 final HTML shows install/open/first-run/diagnostics/stability evidence. | V13.7 passed scoped |

V13 final allowed claim after evidence only:

```text
V13 beta distribution and user-ready closure passed for tested local macOS beta workflow scenarios.
```

V13 must not claim production signed release ready, notarized release ready,
auto update ready, Windows ready, cross-platform ready, Petdex parity achieved,
3D ready, automatic photo-to-3D ready, provider integration verified,
OS-level Codex window binding ready, already-open Codex auto-monitoring ready,
or all Codex workflows verified.

## V12 Active Desktop Visibility Gap

V12 owns the gap exposed during V11 acceptance reporting:

```text
V11 living interaction accepted
  -> runtime capture pages show the cat
  -> real macOS desktop screenshot did not capture the floating pet window
  -> V12 must make desktop visibility and screenshot-backed acceptance trustworthy
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Real desktop screenshot | runtime capture screenshots showed cat; real desktop proof was missing | real desktop screenshot visibly contains cat | V12 passed scoped |
| Window diagnostics | `petctl list` could say visible even when screenshot missed cat | sanitized reasonCode explains visible/hidden/offscreen/occluded/capture mismatch | V12 passed scoped |
| Window layering | always-on-top existed in code but was not proven by visual evidence | re-show/focus/all-workspaces/reset behavior is tested | V12 passed scoped |
| First-run proof | first-run capture page showed generated cat | real first-run desktop screenshot shows cat within 10 seconds | V12 passed scoped |
| Acceptance HTML | V11 summary embedded runtime screenshots after correction | V12 report embeds real desktop screenshot, pet-region screenshot, diagnostics, and runtime capture with labels | V12 passed scoped |

V12 final evidence:

- `docs/V12.x/v12_7-final-acceptance-report.md`
- `docs/V12.x/evidence/v12_6-complete-acceptance-html-2026-06-07.html`

V12 must not claim production signed release ready, Windows ready,
cross-platform ready, Petdex parity achieved, 3D ready, automatic photo-to-3D
ready, provider integration verified, OS-level Codex window binding ready, or
all Codex workflows verified.

## V11 User Experience Gate

V11 结束后，用户不应该只看到“动画组件存在”，而应该能在真实桌面运行中体验到一只“有生命感的工作猫”。

当前项目已经具备的能力：

- 启动 macOS 桌面宠物应用，并看到透明窗口桌面猫。
- 创建和管理多只猫实例。
- 创建 Codex 工作猫。
- 通过 wrapper-launched Codex exec JSONL 路径把 Codex 状态映射到指定猫。
- 使用 scoped TUI hooks 路径，但需要 `/hooks review/trust`。
- 使用内置动态 2D 猫资产。
- 导入、预览、激活、删除本地猫资产包。
- 看到 8 个核心状态动作：`idle`、`thinking`、`running`、`success`、`warning`、`error`、`need_input`、`sleeping`。
- V11.1 后，看到空闲生活化动作：眨眼、看向用户、尾巴摆动、伸展、打盹、醒来。

V11 全部完成后的目标体验：

- 首次打开应用 10 秒内看到一只活的、会动的工作猫。
- 不阅读内部协议文档，也能理解猫的基本状态和反馈。
- 鼠标靠近、点击、双击、拖拽开始、拖动中、放下都有可见反馈。
- Codex 思考、运行、成功、警告、出错、等待输入时，目标猫有肉眼可辨的情绪和动作。
- 多只猫同时存在时，目标猫变化不会污染默认猫或其他 Codex 猫。
- 猫的动作切换自然，不空白、不透明、不出画、不闪烁。
- 本地鼠标交互只是视觉反馈，不冒充 Agent / Codex 状态。

典型用户场景：

| 场景 | 用户能做什么 | V11 验收重点 |
| --- | --- | --- |
| Codex 工作猫 | 创建一只 Codex 工作猫，用 wrapper 启动 Codex，看猫展示 thinking/running/need_input/success/error。 | 状态映射只影响目标猫。 |
| 不盯终端 | 让 Codex 跑测试或改代码，用户转去看浏览器/编辑器，用余光看猫判断进展。 | 状态可读、低打扰。 |
| 多 session 多猫 | 一个 session 修 bug，另一个写文档，每个 session 一只猫。 | 多实例隔离。 |
| 桌面陪伴 | 没有 Codex 事件时，猫会眨眼、甩尾、伸展、打盹、醒来。 | living idle 真实可见。 |
| 整理桌面 | 拖动猫到屏幕角落，看到抓住、拖动、放下反馈，重启后位置仍合理。 | 拖拽反馈与位置持久化。 |
| 首次试用 | 第一次打开应用就看到活猫，并能点击、双击、拖动、进入 demo。 | 普通用户上手。 |
| 换猫 / 导入资产 | 切换内置猫或导入本地资产，失败时保留上一只可见猫。 | fallback 不透明、不消失。 |
| 安全边界 | 点击、拖动、靠近猫不触发 PetEvent，不改变 Codex 状态，不泄露敏感字段。 | zero PetEvent 与 redaction。 |

## V10.11 Active Product Experience Gap

V10.11 rebaseline owns the externally visible product-experience gap:

```text
accepted local capabilities -> understandable README -> three-minute onboarding
-> visible animated work-cat proof -> real screenshot-backed reporting
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Public README | README had a wrong non-V10 active-line draft and too much internal phase history. | Product-first V10.11 current status with concise capabilities and limits. | V10.11 passed scoped |
| Codex onboarding | Work-cat capability exists, but a new user must inspect multiple docs/settings sections. | Three-minute path with copyable wrapper JSONL command and unsupported already-open notice. | V10.11 passed scoped |
| Visual proof | Evidence exists but is spread across phase docs and some reports are HTML summaries. | Real Tauri desktop screenshots are required proof; HTML only summarizes. | V10.11 passed scoped |
| Default cat experience | V10 scoped animated 2D path exists. | Screenshot-ready default animated work-cat with clear state/action evidence. | V10.11 passed scoped |
| Claim boundary | Many historical claims exist. | Concise external allowed/forbidden matrix scoped to V10.11. | V10.11 passed scoped |

V10.11 must not claim Petdex parity, broad 3D readiness, automatic photo-to-3D,
provider integration, OS-level Codex binding, cross-platform, Windows, or
production signed release readiness.

## V10.12-V10.16 Accepted Open-source Benchmark Gap

V10.12-V10.16 completed the selected V10 experience target:

```text
selected open-source benchmark strengths
-> premium local animated cat library
-> first-run wizard
-> built-in gallery
-> screenshot/recording-backed benchmark surpass gate
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Benchmark spec | comparisons were not frozen | selected Petdex/OpenPets/Shijima dimensions and metrics documented | V10.12 passed |
| Visual quality breadth | one accepted default work-cat | 6 premium bundled animated 2D cats with full 8-action visual QA | V10.13 passed |
| First-run onboarding | README/settings explained the path | user sees pet in <=3 steps and verifies Codex work-cat in <=5 steps | V10.14 passed |
| Built-in gallery | Manager preview foundations existed | local pet gallery with safe preview, activation, restore, and delete user import | V10.15 passed |
| Benchmark surpass claim | no open-source surpass claim | evidence-matched selected benchmark surpass gate | V10.16 passed scoped |

V10.12-V10.16 must not claim full Petdex parity, ecosystem-size parity, remote
asset loading, marketplace readiness, provider integration readiness, broad 3D
readiness, cross-platform readiness, Windows readiness, or production signed
release readiness.

## V11.x Planned Living Interaction Gap

V11 owns the experience gap that remains after V10:

```text
animated work-cat accepted
  -> living idle
  -> pointer/click/drag reactions
  -> emotion continuity
  -> flagship living cat
  -> first-run delight
  -> interaction QA gate
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Living idle | V10 had scoped micro-interaction smoke | 3-minute varied idle with sleep/wake and no priority overwrite | V11.1 passed scoped |
| Pointer-aware interaction | V11.2 controller/runtime wiring accepted scoped | hover, click, double-click, drag_start/dragging/drop feedback with isolation | V11.2 passed scoped |
| Emotion continuity | V11.3 accepted scoped | 8 states have distinct emotion profile and transitions | V11.3 passed scoped |
| Natural sequencing | V11.4 accepted scoped | enter/loop/exit/transient visual ActionComposer | V11.4 passed scoped |
| Flagship visual quality | `living-work-cat-v1` accepted scoped | `living-work-cat-v1` first-run flagship pack | V11.5 passed scoped |
| First-run delight | first-run living pet path and local demo accepted scoped | app opens to a living pet in <=10 seconds and safe demo | V11.6 passed scoped |
| Interaction QA | benchmark evidence exists | recordings/scans prove living interaction quality | V11.7 passed scoped |

V11 must not claim Petdex parity, 3D ready, automatic photo-to-3D ready,
provider integration verified, asset marketplace ready, production signed
release ready, cross-platform ready, or Windows ready.

## Closed Baseline Summary

| Baseline | Status | Notes |
| --- | --- | --- |
| macOS-first desktop pet | passed | Tauri 桌面猫、透明窗口、拖拽、托盘、设置页。 |
| PetEvent / HTTP / petctl | passed | token、白名单、rate limit、diagnostics、safe sound。 |
| V3.1 stabilization | passed | onboarding、Manager polish、runtime smoke、migration guidance。 |
| V3.2 scoped integration | passed scoped | MCP adapter minimal smoke、third-party contract v3；不代表 MCP ready。 |
| V3.3 Codex binding | passed scoped | wrapper-first `petctl codex launch` binding；不代表 OS-level binding。 |
| V3.4 hooks mapping | passed scoped | tested local Codex hook scenarios；不代表 exact internal reasoning。 |
| V3.5 diagnostics | passed scoped | `petctl codex doctor` 和 recovery smoke。 |
| V3.6 hook-only failure mapping | historical blocked / deprecated | `PostToolUse` payload 无稳定 failure fields；不再作为 active strategy。 |
| V3.7 JSONL monitor | passed scoped / current recommended exec path | wrapper-launched `codex exec --json`；不覆盖 interactive TUI 或 OS-level window binding。 |
| V3.x final | passed scoped | evidence / claim / PRD / security / regression 收口。 |

V3.x 允许的核心声明：

```text
V3.x scoped Codex local workflow acceptance passed with documented evidence and claim boundaries.
V3.7 Codex exec JSONL monitor state mapping passed for tested local wrapper-launched codex exec --json scenarios.
V3.6 hook-only monitoring is deprecated as an active strategy and superseded by V3.7 JSONL monitoring for supported wrapper-launched codex exec --json sessions.
```

## V4.x Active Gap

V4.x 处理 V3.x 明确不覆盖的用户诉求：

```text
Already-running or active Codex terminal window -> explicit user-confirmed pet binding.
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Already-running Codex discovery | Not implemented. V3.7 requires wrapper-launched `codex exec --json`. | Feasibility audit for active window / session candidate discovery only. | V4.0 accepted feasibility |
| State event source for already-running sessions | OS-level discovery does not provide lifecycle events. | Hooks/registry/wrapper relaunch are the only plausible safe sources; discovery alone is no-go for routing. | V4.0 accepted feasibility |
| Existing session env injection | Not supported. | If `AGENT_DESKTOP_PET_INSTANCE_ID` cannot be injected, user must relaunch through V3.7 wrapper or future registry path. | V4.0 accepted feasibility |
| macOS permission model | Feasibility model documented. | Accessibility / automation permissions must be opt-in and scoped before V4.1. | V4.0 accepted feasibility |
| Terminal app matrix | Feasibility matrix completed. | Terminal.app and iTerm2 are first V4.1 safe-field probe candidates; VS Code/Warp/Ghostty remain deferred/no-go without app-specific support. | V4.0 accepted feasibility |
| Safe identity fields | Field boundary defined. | Only safe session hints; no terminal text, prompt, command, workspace path, full local path. | V4.0 accepted feasibility |
| Active window probe | CLI implementation built and unit-tested, including Node-packaged Codex CLI detection. Terminal.app runtime evidence passed in the tested local environment. | V4.2 may plan from Terminal.app-only evidence; iTerm2/all-terminal support remains unproven. | V4.1 passed-terminal-app |
| User-confirmed binding | CLI implementation built, unit-tested, and runtime accepted for Terminal.app candidate-to-PetInstance binding UX. | Two-step preview / confirm flow, stale-aware binding record, Terminal.app-only candidate-to-PetInstance association. | V4.2 passed Terminal.app-only |
| Manual route-test | CLI implementation built, unit-tested, and runtime accepted for Terminal.app manual route-test. | Revalidated binding can send an explicit manual test event only to the bound PetInstance. | V4.3 passed Terminal.app-only |
| Managed exec JSONL state mapping | `petctl codex session start --mode exec --monitor jsonl` implemented and runtime accepted. | Wrapper-launched Codex exec session can create one cat and map structured state to that cat. | V4.4 passed scoped exec JSONL |
| Managed TUI hooks state mapping | V4.5 wrapper preflight passed. Real Codex TUI hook lifecycle passed for `UserPromptSubmit -> thinking`, `PreToolUse -> running`, and `Stop -> success` in the tested wrapper-launched local scenario. `PermissionRequest` was not observed because local policy did not emit it. | Requires managed wrapper launch and trusted project hooks. Does not cover already-open Codex windows, OS-level lifecycle monitoring, or all hook events. | V4.5 passed scoped / PermissionRequest not observed |
| V4.6 UX hardening | Implemented and accepted for startup diagnostics. | Desktop health preflight, hook config check, wrapper check, Codex CLI check, stable reasonCode, and clear `/hooks` trust instruction. | V4.6 passed |
| V4.7 session status | Implemented and accepted for managed wrapper-launched sessions. | Sanitized `petctl codex session status --json` with redacted binding/session fields only. | V4.7 passed |
| Lifecycle routing | Not implemented. OS discovery is not an event source. | Remains unsupported unless a trusted event source is added later; use V3.7 wrapper path for reliable monitoring. | no-go from OS discovery alone |
| Unsupported terminal handling | Not implemented. | Unsupported apps fail safely and are not counted as passed. | planned |
| V4.x final acceptance | V4.0-V4.7 scoped final completed. | Managed session mapping and Terminal.app binding prototype accepted with scoped claims and no OS-level or all-workflow expansion. | V4.x final passed scoped |

V4.x must not treat candidate window discovery as Codex lifecycle monitoring. If no safe event source exists for an already-running Codex session, the accepted fallback is to prompt the user to relaunch through the managed wrapper path.

V4.5 preflight is not real hook lifecycle evidence. The scoped V4.5 lifecycle acceptance used a real wrapper-launched Codex TUI session after `/hooks` review/trust and observed real hook-driven state changes. `PermissionRequest` remains not-passed for this local run.

## V5.x Future Gap

V5.x is now the active renderer / asset productization line.

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Asset system freeze | V5.0 passed scoped. | Manifest, action mapping, fallback, security rules. | passed V5.0 |
| High-quality 2D actions | V5.1 sprite smoke passed scoped. | Sprite / 2D Asset Pack v2 for core states. | passed V5.1 |
| Renderer plugin interface | V5.2 passed scoped. | CSS / sprite / GLTF / Rive / Live2D abstraction. | passed V5.2 for css/sprite/gltf |
| GLTF / Three.js 3D prototype | V5.3 passed scoped. | Bundled GLB/GLTF renderer prototype. | passed V5.3 |
| 3D action clips | V5.4 passed scoped. | Bundled clips for core pet states. | passed V5.4 |
| Runtime renderer selection | V5.5 passed scoped. | Explicit local CSS/sprite/GLTF selection with CSS fallback. | passed V5.5 |
| Personalized prompt pack | V5.7 passed. | Standardized prompt pack for external asset generation. | passed V5.7 |
| Custom asset import | V5.8 CLI smoke passed scoped. | Manifest-validated local import after separate security review. | passed V5.8 scoped |
| Personalized action mapping | V5.9 CLI smoke passed scoped. | Imported pack activation for a PetInstance. | passed V5.9 scoped |
| Provider adapter | Feasibility only. | Explicit-consent external generation adapter. | V5.10 feasibility completed |
| Import UI | Implemented and manually accepted. | Desktop Manager local manifest import UX. | passed V5.11 scoped |
| Runtime imported rendering | Implemented and manually accepted. | Activated imported pack renders per PetInstance. | passed V5.12 scoped |
| Photo-guided workflow | Implemented locally. | Local prompt and import-instruction generation from user-approved cat traits/photo notes. | passed V5.13 scoped |
| Provider consent smoke | Feasibility-only boundary implemented. | Explicit-consent provider adapter remains separate and not verified. | passed V5.14 feasibility-only |
| Visual/action QA | Bundled and imported visual fixture evidence captured. | Productized visual quality, performance, and action clarity evidence for tested scenarios. | passed V5.15 scoped |
| V5.x Productization Gate | Scoped local final acceptance complete. | Local import, runtime rendering, guided external asset instruction, and visual QA accepted; external provider generation remains not verified. | passed scoped local |

## Accepted Scoped Claims

Allowed scoped claims:

```text
V6 productization acceptance passed for tested local macOS developer workflow scenarios.
V4.x OS-level Codex window/session binding is planned for feasibility review.
V4.6 managed session startup diagnostics and UX hardening passed for tested local wrapper-launched scenarios.
V4.7 managed session status and stale-binding diagnostics passed for tested local wrapper-launched scenarios.
V5.x Cat Renderer & Asset System is planned for high-quality 2D, 3D, and action asset development.
V5.x scoped renderer and bundled asset acceptance passed final regression.
V5 personalized prompt-pack and local import pipeline passed scoped CLI acceptance.
V5.11-V5.15 personalized asset productization passed scoped for import UI, runtime rendering, guided prompt workflow, provider consent boundary, and visual QA.
V5.11 personalized asset import UI passed for tested local manifest import scenarios. Imported packs are listed with sanitized metadata only. Runtime activation/rendering is covered separately by V5.12.
V5.12 runtime imported asset pack rendering passed for tested local PetInstance scenarios.
V5.13 photo-guided personalized asset workflow passed for local prompt and import-instruction generation.
V5.14 external generation provider feasibility completed with explicit consent boundary.
V5.15 visual quality and action QA passed for tested bundled and imported asset scenarios.
V5.x personalized cat renderer and asset workflow productization passed for tested local import, runtime rendering, guided external asset instruction, and visual QA scenarios. External provider generation remains not verified.
```

## V8.x Active Gap

V8.x owns the post-V7 product gap that V7 intentionally left not-ready:

```text
user-approved cat photo / traits -> real named-provider 3D output -> validated
local 3D/action asset pack -> runtime visual QA -> guided activation.
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Real provider 3D output | V7 provider 3D branch blocked | named provider returns accepted GLB/GLTF under explicit consent | V8.2 passed scoped |
| Provider consent/credential operations | feasibility boundary exists | redacted provider credential/consent harness | V8.1 passed scoped |
| 3D normalization | local GLB import accepted scoped | provider output normalized into safe local pack | V8.3 passed scoped |
| Action-ready 3D coverage | tested imported GLB runtime mapping accepted scoped | all core actions mapped to clips or explicit fallbacks | V8.3/V8.4 passed scoped |
| Product UX | guided V7 workflow exists | Desktop Manager provider-backed photo-to-3D activation flow | V8.5 passed scoped |
| Operational hardening | local diagnostics exists | deletion, retention, license, diagnostics and evidence redaction | V8.6 passed scoped |
| V8 final gate | evidence-matched final report exists | narrow provider/scenario-matched final claim | V8.7 passed scoped |
| 3D rendering quality | V8.4 visual QA identified poor presentation | camera/lighting/viewport improvement | V8.8 passed scoped prototype |
| Local animated 2D assembly | Desktop Manager local assembler accepted scoped | local frame folder -> validated animated sprite pack | V8.9 passed scoped |
| AI-assisted 2D action workflow | V8.10 prompt-only workflow accepted scoped | multi-frame action storyboard and import checklist | V8.10 passed scoped |
| Animated 2D visual QA | V8.11 visual QA accepted scoped | runtime visual evidence for all core multi-frame actions | V8.11 passed scoped |

V8 must not treat MiniMax image generation, fixture GLB import, local sample 3D
rendering, local animated sprite assembly, or prompt-only animated sprite
instructions as automatic photo-to-3D or AI generation readiness evidence.

## V9.x Partial Gap

V9 owns AI asset generation evidence, not the full runtime animation experience.

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| MiniMax static 2D generation | real provider generated eight core action images | static 2D action pack generation | V9.2 passed scoped |
| MiniMax dynamic 2D generation | real provider generated second animation frames for all core actions | minimal two-frame dynamic 2D action pack | V9.3 passed scoped |
| Tripo3D 3D generation | no Tripo credential/consent/terms and no real provider GLB output | named provider GLB output, scan, import, activation | V9.4 blocked |
| Runtime animation product experience | V10.1-V10.10 passed scoped for bundled animated 2D path, safe local animation format adapter, `work-cat-v1` visual smoke, micro-interactions, Manager preview polish, and final QA | maintain scoped boundary | V10 scoped accepted |

## V10.x Animation Experience Gap

V10 owns the visible action gap identified against Petdex-style animated pets:

```text
default or imported cat -> previewable actions -> visible state-linked animation
```

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Animation format | local `pet.json + spritesheet/png-sequence` adapter passed scoped | consumed by product-grade `work-cat-v1` and Manager polish | V10.6 passed scoped |
| Default pet motion | high-quality bundled `work-cat-v1` visual smoke passed scoped | runtime use with micro-interactions and final QA | V10.7 passed scoped |
| Runtime behavior | local micro-interaction controller passed scoped | final integrated QA with Manager workflow | V10.8 passed scoped |
| Manager UX | active/fallback pack display, all actions, restore default modeling, readable metadata passed scoped | final integrated QA | V10.9 passed scoped |
| Final animation QA | product-grade visual QA, regression, security, claim, PRD/spec, and drawio sync passed | maintain scoped boundary | V10.10 passed |
| Animated 3D proof | static/procedural GLB is not enough; safe clip detection implemented | excluded unless real accepted clips exist later | excluded from V10 product-grade target |

V10 must not claim Petdex parity, broad 3D readiness, automatic photo-to-3D
readiness, or provider integration readiness.

V10 model design:

- `AnimationActionModel`: all core actions with loop/priority/duration/frame
  expectations.
- `BundledAnimated2DPackModel`: implemented `sprite-v3-animated` target; existing
  `sprite-v2` remains fallback/baseline only.
- `ImportedSpritePackModel`: existing `frameFiles + fps` imported sprite
  contract.
- `AnimationCoverageResolver`: safe `animated/static/fallback/missing`
  coverage metadata.
- `ActionPreviewModel`: isolated Desktop Manager preview, no live state
  mutation.
- `RuntimePlaybackModel`: state-linked target PetInstance animation.
- `AnimatedGLTFClipModel`: static GLB blocked from animated claims unless real
  accepted clips play.
- `EvidenceModel`: visible playback, nonblank, fallback, isolation, security,
  and claim evidence.

## V7.x Advanced Planned Gap

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| V7 advanced scope | V7.0-V7.7 scoped passed | updated advanced roadmap and claim gates | V7.8 passed |
| MiniMax image provider | provider boundary feasibility only | real explicit-consent MiniMax image smoke | V7.9 passed scoped |
| Generated 2D action assets | MiniMax-generated sprite pack imported and activated for one target PetInstance | generated image outputs assembled into full core action pack | V7.10 passed scoped |
| External GLB/GLTF intake | local GLB/GLTF intake contract passed; external provider output remains not-ready | real externally generated GLB/GLTF intake contract | V7.11 passed scoped local intake |
| Runtime 3D action mapping | passed scoped with 1x/0.75x runtime GLTF evidence, action-state evidence, and corrupt fallback | tested local imported GLB/GLTF runtime mapping | V7.12 passed scoped |
| End-to-end orchestration | accepted scoped for tested local 2D generated and external GLB import workflows; real provider 3D branch blocked | guided photo-to-asset orchestration with stable reason codes | V7.13 passed scoped |
| Advanced visual QA | accepted scoped for generated 2D contact sheet and imported GLB/GLTF runtime screenshots | generated 2D and imported GLB/GLTF screenshots/recordings/performance | V7.14 passed scoped |
| Advanced gate | accepted scoped with evidence-matched final claim | evidence-matched final V7 advanced claim | V7.15 passed scoped |

V7.8-V7.15 must not imply production signed release, cross-platform readiness, Windows readiness, MCP ready, OS-level Codex window binding, all Codex workflows verified, broad provider integration, or broad 3D readiness. Automatic photo-to-3D may only be claimed for a named tested provider scenario if real photo input, real 3D provider output, GLTF scan, runtime action mapping, and visual QA all pass.

V7.13-V7.15 detailed architecture and acceptance planning:

- `docs/V7.x/v7_remaining_target_architecture.md`
- `docs/V7.x/v7_remaining_development_and_acceptance_plan.md`

V8.x planning:

- `docs/active/agent_desktop_pet_prd_v8.md`
- `docs/V8.x/v8_x-current-gap-analysis.md`
- `docs/V8.x/v8_x-target-architecture.md`
- `docs/V8.x/v8_x-development-plan.md`
- `docs/V8.x/v8_x-acceptance-plan.md`
- `docs/V8.x/v8_x-claim-matrix.md`
- `docs/V8.x/v8_x-remote-milestones.md`
- `docs/V8.x/v8_x-doc-audit-2026-06-01.md`
- `docs/V8.x/v8_9-animated-sprite-assembler-development-plan.md`
- `docs/V8.x/v8_10-ai-assisted-animated-sprite-workflow-development-plan.md`
- `docs/V8.x/v8_11-animated-sprite-visual-qa-development-plan.md`
- `docs/V10.x/v10_x-model-detailed-design.md`
- `docs/V10.x/v10_x-development-plan.md`
- `docs/V10.x/v10_x-acceptance-plan.md`
- `docs/V10.x/v10_x-target-architecture.md`
- `docs/V10.x/v10_x-milestones.md`
- `docs/V10.x/v10_x-exit-criteria.md`

## V6.x Closed Gap

V6.x has productized the accepted local baseline without widening readiness claims. V6.0-V6.9 are closed scoped for tested local macOS developer workflow scenarios.

| Gap | Current | Target | Status |
| --- | --- | --- | --- |
| Productization scope | V6.0 docs and claim boundaries frozen | V6.0 scope freeze accepted | passed V6.0 |
| Release/distribution | local app bundle smoke, first-run guidance, permission notes, diagnostics export boundary | package, first-run, diagnostics, permissions | passed V6.1 foundation |
| Codex work-cat UX | Desktop Manager onboarding, wrapper command guidance, hooks trust instruction, unsupported already-open explanation | Desktop Manager onboarding and diagnostics | passed V6.2 |
| Runtime imported rendering | V6-named revalidation passed | V6-named revalidation / carry-forward evidence | passed V6.3 |
| Asset manager UX | preview, rollback, delete, rename, status, health accepted for local imported packs | productized asset manager UX | passed V6.4 |
| Photo-guided workflow | user-facing privacy-preserving prompt/import guide accepted | provider generation remains out of scope | passed V6.5 |
| Provider boundary | explicit consent/cost/privacy/retention/license boundary accepted, no real provider smoke | optional real smoke remains future work | passed V6.6 feasibility |
| Renderer QA | bundled/imported nonblank visual QA revalidated and GLTF hidden-state hardening accepted | broader production visual/performance readiness remains future work | passed V6.7 |
| Developer integration | local contract/MCP smoke and developer guide accepted for tested examples | real third-party product verification remains future work | passed V6.8 |
| Governance | phase-based evidence culture closed with final scans | V6-wide no-false-green gate | passed V6.9 |
| Productization Gate | V6 final evidence and scans complete | scoped local macOS developer workflow acceptance | passed V6.9 |

## Forbidden Claims

Forbidden as ready / passed:

```text
OS-level Codex window binding ready
interactive Codex TUI monitoring ready
already-open Codex window auto-detection ready
already-open Codex window auto-monitoring ready
all Codex workflows verified
Codex internal reasoning exact mapping ready
MCP ready
Third-party agent integration verified
Claude Code integration verified
Windows ready
cross-platform ready
USB ready
production signed release ready
per-instance queue ready
Rive / Live2D / 3D ready
photo customization ready
user asset upload ready
remote asset download ready
custom asset pack import ready
asset marketplace ready
automatic photo-to-3D ready
provider integration verified
```

## Audit Files

Current active docs:

- `docs/active/development-plan.md`
- `docs/active/acceptance-plan.md`
- `docs/active/current-vs-target-gap.md`
- `docs/active/current-vs-target-gap.drawio`
- `docs/active/agent_desktop_pet_prd_v11.md`
- `docs/active/agent_desktop_pet_prd_v3x.md` historical compatibility reference

V11.x planned living interaction track:

- `docs/V11.x/v11_x-development-plan.md`
- `docs/V11.x/v11_x-acceptance-plan.md`
- `docs/V11.x/v11_x-target-architecture.md`
- `docs/V11.x/v11_x-current-gap-analysis.md`
- `docs/V11.x/v11_x-claim-matrix.md`
- `docs/V11.x/v11_x-milestones.md`
- `docs/V11.x/v11_x-doc-audit.md`

V4.x planning:

- `docs/V4.x/v4_x-development-plan.md`
- `docs/V4.x/v4_x-acceptance-plan.md`
- `docs/V4.x/v4_x-current-gap-analysis.md`
- `docs/V4.x/v4_x-claim-matrix.md`
- `docs/V4.x/v4_0-development-plan.md`
- `docs/V4.x/v4_0-acceptance-plan.md`
- `docs/V4.x/v4_0-prd-spec-review.md`
- `docs/V4.x/v4_0-plan-audit.md`
- `docs/V4.x/v4_0-os-binding-feasibility-review.md`
- `docs/V4.x/v4_1-development-plan.md`
- `docs/V4.x/v4_1-acceptance-plan.md`
- `docs/V4.x/v4_1-prd-spec-review.md`
- `docs/V4.x/v4_1-plan-audit.md`
- `docs/V4.x/evidence/v4_1-safe-field-probe-2026-05-26.md`
- `docs/V4.x/v4_1-final-acceptance-report.md`

V5.x future planning:

- `docs/V5.x/v5_x-development-plan.md`
- `docs/V5.x/v5_x-acceptance-plan.md`
- `docs/V5.x/v5_x-current-gap-analysis.md`
- `docs/V5.x/v5_x-claim-matrix.md`
- `docs/V5.x/v5_11-final-acceptance-report.md`
- `docs/V5.x/evidence/v5_11-import-ui-smoke-2026-05-28.md`
- `docs/V5.x/v5_4-final-acceptance-report.md`
- `docs/V5.x/v5_5-final-acceptance-report.md`
- `docs/V5.x/v5_11-import-ui-development-plan.md`
- `docs/V5.x/v5_12-runtime-imported-pack-rendering-development-plan.md`
- `docs/V5.x/v5_13-photo-to-asset-guided-workflow-development-plan.md`
- `docs/V5.x/v5_14-provider-adapter-feasibility-and-consent-plan.md`
- `docs/V5.x/v5_15-visual-quality-action-qa-plan.md`
- `docs/V5.x/v5_x-productization-gate-plan.md`

V3.x closed baseline:

- `docs/V3.x/v3_x-final-acceptance-report.md`
- `docs/V3.x/v3_x-codex-monitoring-strategy.md`
- `docs/V3.7/v3_7-final-acceptance-report.md`
- `docs/V3.6/v3_6-final-acceptance-report.md`
