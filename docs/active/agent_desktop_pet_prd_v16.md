# PRD: Agent Desktop Pet V16 Provider-backed Photo-to-2D Action Generation

版本：V16 active PRD  
日期：2026-06-10  
状态：planned；V15.0-V15.13 是 scoped accepted baseline，不得复用为 V16 provider evidence。  

## 1. Product Positioning

V16 的目标是把 V15 已验收的“照片引导、prompt/import-ready、多帧导入校验、预览和目标猫应用”推进到“真实 provider 生成多动作 2D 资产”的普通用户流程。

用户希望上传或选择一张猫照片后，系统能在明确同意和隐私边界内生成同一只猫的 8 个核心动作多帧 2D 资产，并自动打包为可预览、可应用、可回滚的本地 sprite pack。

V16 只做 provider-backed 2D 动作生成产品化，不做 3D ready、photo-to-3D、远程 marketplace、生产签名发布、Windows、cross-platform、Petdex parity 或 provider integration verified 的泛化声明。

## 2. Current Baseline

已完成能力：

- V15.9：本地照片 intake、consent、EXIF/path redaction。
- V15.10：用户批准猫特征和 8-action prompt pack。
- V15.11：import-ready branch passed scoped；provider branch not-run。
- V15.12：生成/导入帧的连续性组装和安全校验。
- V15.13：Desktop Manager 预览和只应用到目标猫。

未完成能力：

- 未证明真实 provider 根据猫照片生成全部动作帧。
- 未证明 8 个动作的同一只猫一致性。
- 未证明 provider 输出可自动标准化打包并通过连续性校验。
- 未证明普通用户可在 GUI 中完成“照片 -> provider 生成 -> 预览 -> 应用 -> 回滚”闭环。

## 3. V16 Product Goal

V16 完成后，用户应该能体验：

1. 在 Desktop Manager 中选择一张猫照片。
2. 查看并确认隐私、成本、provider retention、license/attribution。
3. 由系统提取或让用户确认猫的安全视觉特征。
4. 显式选择 provider 并同意上传。
5. 触发 8 个核心动作的多帧 2D 生成任务。
6. 查看 provider job 状态和稳定 reasonCode。
7. 系统把 provider 输出标准化为本地 `pet.json + frame sequence`。
8. 系统自动执行连续性、一致性、安全、license 和 redaction 校验。
9. 用户在隔离 preview 中查看所有动作。
10. 用户一键应用到目标猫；失败时保留上一只可见猫。

## 4. Core Actions

V16 provider-generated pack must cover:

```text
idle
thinking
running
success
warning
error
need_input
sleeping
```

Minimum frame requirements:

- `idle / thinking / running / sleeping`: at least 6 frames.
- `success / warning / error / need_input`: at least 3 frames.
- Every action must close first/final frame.
- Adjacent-frame delta must stay within V15.12 continuity threshold.
- All frames must be nonblank, visible, in-canvas, and safe local image assets.

## 5. User Scenarios

| Scenario | User Experience | Acceptance Signal |
| --- | --- | --- |
| Make my cat a desktop pet | User selects a local cat photo and confirms traits. | No raw path/EXIF/GPS/photo bytes in evidence. |
| Generate work actions | User starts provider generation for 8 actions. | Provider job summary has safe status/reasonCodes only. |
| Same cat consistency | User sees the same cat identity across actions. | Automated trait consistency score plus manual pass/fail. |
| Preview before apply | User previews all actions without changing live pets. | zero PetEvent, no CatStateMachine write, target unchanged. |
| Apply to one cat | User applies generated pack to one selected pet. | Target changes; default/unrelated pets unchanged. |
| Bad provider output | Corrupt/mismatched/unsafe output fails safely. | Previous active pack preserved and visible fallback shown. |
| Delete/rollback | User removes generated pack or restores previous pack. | No stale active assignment; visible safe cat remains. |

## 6. V16 Scope

| Phase | Goal | Status |
| --- | --- | --- |
| V16.0 | Scope freeze, provider decision, claim boundaries | planned |
| V16.1 | Provider credential, consent, disclosure, and redaction harness | planned |
| V16.2 | Real provider multi-action 2D generation smoke | planned |
| V16.3 | Same-cat consistency review and rejection model | planned |
| V16.4 | Auto package generated frames into local animation pack | planned |
| V16.5 | Desktop Manager generation job UX and preview/apply/rollback | planned |
| V16.6 | Visual QA, security, license, regression, final gate | planned |

## 7. Target Architecture

```text
Desktop Manager Photo Wizard
  -> PhotoIntakeConsentBoundary
  -> CatTraitReviewModel
  -> ProviderConsentCredentialBoundary
  -> Photo2DProviderAdapter
  -> ProviderJobStore
  -> ProviderOutputNormalizer
  -> SameCatConsistencyReviewer
  -> Photo2DContinuityAssembler
  -> AssetManifestRegistry
  -> GeneratedPackPreviewApplyFlow
  -> RendererRegistry
```

Runtime renderer still receives only safe fields:

- safe action ID
- renderer kind
- safe profile/pack IDs
- playback intent
- scale
- visibility

Runtime renderer must never receive raw photo, prompt text, provider payload, raw provider response, token, Authorization, local path, workspace path, config path, shell command, or raw HTTP body.

## 8. Acceptance Model

V16 can pass only if all phase evidence exists with explicit `passed / blocked / failed` status.

Required final evidence:

- real provider generation evidence or explicit `blocked` result.
- 8-action generated pack output summary.
- provider redaction scan.
- same-cat consistency review.
- continuity assembly evidence.
- preview/apply GUI evidence.
- target-only apply evidence.
- fallback/rollback evidence.
- license/attribution evidence.
- security scan.
- claim scan.
- V15 regression checks.

If provider generation cannot produce accepted output, V16 must be `blocked` or must narrow to an import-ready/local packaging claim. It may not claim automatic photo-to-2D readiness.

## 9. Allowed Claims

Allowed only after V16.6 with real accepted provider output:

```text
V16 provider-backed photo-to-2D multi-action generation passed for the tested named provider and local cat-photo scenario.
```

If provider output is blocked:

```text
V16 provider-backed photo-to-2D generation remains blocked on accepted named-provider multi-action output.
```

## 10. Forbidden Claims

V16 must not claim:

```text
automatic photo-to-2D ready for arbitrary cats
automatic photo-to-animation ready
provider integration verified
Petdex parity achieved
3D ready
automatic photo-to-3D ready
remote asset loading ready
asset marketplace ready
production signed release ready
cross-platform ready
Windows ready
```

## 11. Review Sources

- `docs/V16.x/v16_x-development-plan.md`
- `docs/V16.x/v16_x-acceptance-plan.md`
- `docs/V16.x/v16_x-target-architecture.md`
- `docs/V16.x/v16_x-claim-matrix.md`
- `docs/V16.x/v16_x-current-gap-analysis.md`
- `docs/V16.x/v16_x-milestones.md`
- `docs/V16.x/v16_x-exit-criteria.md`
- `docs/V16.x/v16_x-implementation-contract.md`
- `docs/active/current-vs-target-gap.drawio`

