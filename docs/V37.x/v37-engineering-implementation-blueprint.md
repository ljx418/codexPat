# V37 Engineering Implementation Blueprint

文档状态：active engineering blueprint；V37.1-V37.7 scoped product-path evidence generated on 2026-06-26。
当前日期：2026-06-26。

## Purpose

本文把 V37 PRD 和目标架构落到代码开发的具体实体、阶段输入输出、UI 验收锚点、自动化脚本和出门门槛。V37.1-V37.7 已按本文生成 scoped product-path evidence；该 evidence 不证明 raw-photo pixel generation、截图级真实照片动画播放或任意猫自动生成。

V37 开发按阶段推进：

```text
V37.1 product UX contract
  -> V37.2 named photo sample set
  -> V37.3 identity and character asset binding
  -> V37.4 action asset candidate generation
  -> V37.5 product preview/apply/rollback
  -> V37.6 visual review report
  -> V37.7 final scoped gate
```

## Implementation Route Decision

V37 主路线采用 Route A2：local deterministic generation productization。

选择原因：

- 当前仓库已有 `v34-rig-frame-synthesis.ts`、`v34-generation-quality-gate.ts`、`v35-target-experience-quality.ts`、`v36-risk-closure.ts`，Route A2 能在本地、可审计、可重复的条件下继续推进；
- 不依赖外部 provider 或专业资产供应，因此能用真实 named samples 做阶段验收；
- 失败时可以明确落到 `partial_scoped`、`blocked_scoped` 或 `failed`，不会 silent pass。

Route B 必须保留在开发过程和验收报告中：

- 只有真实 source-bound professional-assisted 资产存在时才可参与同样本比较；
- 没有真实 Route B 资产时，Route B 状态必须是 `blocked_not_executed`；
- V37 final gate 必须判断 Route B 是否可能带来更好的开发结果，但不得把未执行 Route B 写成通过。

## Implemented Code Entities

本轮实现以这些代码实体为主，避免把逻辑散落在 UI 字符串或脚本里。

| Entity | Type | File | Responsibility |
| --- | --- | --- | --- |
| `V37NamedPhotoSampleSet` | new TS module | `apps/desktop/src/assets/v37-named-photo-sample-set.ts` | 维护 tested named samples、负例、blocked 样本、安全 metadata、source boundary、difficulty。 |
| `V37PhotoToActionProductPath` | new TS module | `apps/desktop/src/assets/v37-photo-to-action-product-path.ts` | 串联 intake、subject detection、mask、pose part map、identity、character asset、action candidate、product path status。 |
| `V37PhotoIdentityAssetContract` | new TS module or exported type | `apps/desktop/src/assets/v37-photo-to-action-product-path.ts` | 绑定 `sampleId`、`traitSummaryId`、`identityAnchorIds`、`characterAssetId`，防止跨样本复用。 |
| `V37ActionAssetCandidate` | new TS module or exported type | `apps/desktop/src/assets/v37-photo-to-action-product-path.ts` | 表示该猫的 8 动作候选，绑定 route、action coverage、QA、人审、product status。 |
| `V37ProductPreviewApplyRollbackGate` | new TS module or exported type | `apps/desktop/src/assets/v37-photo-to-action-product-path.ts` | 证明 preview、target-only apply、rollback、failed candidate blocked。 |
| `V37HumanVisualAcceptanceGate` | new TS module | `apps/desktop/src/assets/v37-human-visual-acceptance.ts` | 聚合 V36 human visual review，强制目标体验必须有人审。 |
| `V37FinalPhotoToActionDecision` | new TS module or report record | `apps/desktop/src/assets/v37-photo-to-action-product-path.ts` | 输出 scoped / partial / blocked / failed、narrow claim、remaining risks。 |

## Implemented Test Files

每个新增模块有同名测试：

- `apps/desktop/src/assets/v37-named-photo-sample-set.test.ts`
- `apps/desktop/src/assets/v37-photo-to-action-product-path.test.ts`
- `apps/desktop/src/assets/v37-human-visual-acceptance.test.ts`

这些测试不能只测 happy path，至少覆盖：

- 2 个通过样本；
- 1 个 negative sample；
- 1 个 blocked sample；
- identity drift；
- built-in cat reuse；
- transform-only candidate；
- failed/blocked candidate apply。

## Existing Reuse Points

后续实现必须复用这些已存在实体：

| Existing Entity | Required Reuse |
| --- | --- |
| `createV33SampleIntakeRecord` | 生成安全样本接入记录，不记录 raw photo bytes、EXIF/GPS、完整路径。 |
| `createV33TraitSummaryRecord` / `createV33CharacterDesignContract` | 生成 trait summary 和 identity anchors。 |
| `createV34SubjectDetectionRecord` | 判定 single-cat / multi-cat / low-visibility。 |
| `createV34SegmentationMaskRecord` | 生成 foreground/mask 安全摘要。 |
| `createV34PosePartMapRecord` | 生成可见部位和姿态部位图。 |
| `createV34CharacterAssetContract` | 生成独立 `characterAssetId`。 |
| `createV34RigFrameSeed` / `createV34GeneratedActionPack` | Route A2 生成 8 动作 frameSequence candidate。 |
| `runV34GenerationQualityGate` / `runV34GenerationProductE2E` | 工程 QA 和产品路径 QA。 |
| `assessV35RouteCandidate` | 目标体验 rubric。 |
| `createV36HumanVisualReviewGate` and final risk records | 人审、风险闭环、claim boundary。 |
| `main.ts` photo intake / photo 2D wizard / gallery / asset manager areas | 用户可见入口、候选列表、preview/apply/rollback。 |

## Product UI Contract

V37.1 必须先把产品路径合同定死，再改 UI。

### Required User-Visible Areas

| Area | Required DOM Anchor | User-Visible Requirement |
| --- | --- | --- |
| Photo entry | `#v37-photo-action-entry` | 用户能选择 tested named sample 或导入真实照片，并看到安全边界说明。 |
| Sample status | `#v37-sample-status` | 显示 sampleId、difficulty、intake/subject/mask/pose/identity 状态。 |
| Candidate list | `#v37-action-candidate-list` | 显示每个 candidate 的 routeId、8 动作覆盖、quality status、human review status。 |
| Preview stage | `#v37-action-preview-stage` | 显示该 candidate 的动作预览，不能显示内置默认猫伪装结果。 |
| Apply button | `[data-v37-apply-candidate]` | 只允许 passed candidate 应用到目标 pet。 |
| Rollback button | `#v37-rollback-candidate` | 回滚到前一个资产并显示结果。 |
| Blocked state | `#v37-blocked-candidate-reason` | failed / blocked / human rejected candidate 必须显示原因且不可 apply。 |

这些 DOM anchor 是后续 Playwright/Chrome 自动化验收的稳定锚点。若实现时必须改名，必须先更新本文档、PRD/spec review 和 V37.1 evidence。

## Sample Data Contract

V37.2 必须创建真实 named sample set。允许记录安全 metadata，不允许记录 raw photo bytes、EXIF/GPS、完整本地路径或 provider raw payload。

最低样本矩阵：

| Sample Class | Count | Required Status |
| --- | --- | --- |
| clear single cat | >= 1 | must pass intake and be attempted through V37.4 |
| second distinct cat identity | >= 1 | must pass intake and prove distinct `characterAssetId` |
| negative non-cat or invalid image | >= 1 | must fail or be rejected with reasonCode |
| blocked risk sample | >= 1 | must be blocked with stable reason, not silently skipped |

每个 passed sample 必须产生：

- `sampleId`
- `displayName`
- `difficultyClass`
- `sourceKind`
- `permissionSummary`
- `intakeStatus`
- `subjectStatus`
- `segmentationStatus`
- `posePartMapStatus`
- `identityStatus`
- `characterAssetId`

## Action Candidate Contract

V37.4 输出必须满足：

- 每个 passed sample 至少 1 个 `V37ActionAssetCandidate`；
- 每个 passed candidate 覆盖 8 个目标动作：`idle`、`walk`、`jump`、`sleep`、`eat`、`play`、`alert`、`celebrate`；
- candidate 必须绑定 `sampleId`、`characterAssetId`、`routeId`；
- Route A2 candidate 必须声明 `sourceBoundary=local_deterministic_template`；
- Route B candidate 必须有真实 source-bound professional-assisted asset，否则状态为 `blocked_not_executed`；
- transform-only、占位图、内置猫复用、跨样本复用必须 rejected。

## Acceptance Scripts

本轮新增这些脚本，且每个脚本生成或更新对应 evidence：

| Phase | Script |
| --- | --- |
| V37.1 | `scripts/v37_1_product_ux_contract_smoke.mjs` |
| V37.2 | `scripts/v37_2_named_photo_sample_set_smoke.mjs` |
| V37.3 | `scripts/v37_3_identity_character_asset_smoke.mjs` |
| V37.4 | `scripts/v37_4_action_candidate_generation_smoke.mjs` |
| V37.5 | `scripts/v37_5_product_preview_apply_rollback_smoke.mjs` |
| V37.6 | `scripts/v37_6_visual_review_report_smoke.mjs` |
| V37.7 | `scripts/v37_7_final_photo_to_action_gate_smoke.mjs` |

Baseline command set for every implementation phase:

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v34_8_final_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v35_6_final_route_decision_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v36_8_final_risk_closure_smoke.mjs
```

## Phase Exit Gates

| Phase | Required Exit Gate |
| --- | --- |
| V37.1 | UI contract and stable DOM anchors exist in docs/evidence; no code may claim photo-to-action pass. |
| V37.2 | sample set has at least 2 passing named samples, 1 negative, 1 blocked; metadata is sanitized. |
| V37.3 | each passing sample has distinct `characterAssetId`; cross-sample reuse and built-in cat reuse tests fail closed. |
| V37.4 | each passing sample has a sample-bound 8-action candidate or explicit failed/blocked reason. |
| V37.5 | passed candidate can preview/apply/rollback; failed/blocked/rejected candidate cannot apply. |
| V37.6 | Chinese HTML visual report includes model-level review table, conflict table, current/target architecture summary; screenshot-backed raw-photo animation remains future risk. |
| V37.7 | final report chooses `tested named samples photo-to-action product-path scoped pass`, `partial scoped`, `blocked scoped`, or `failed`; claim/security scan pass. |

## Risk Burn-Down Logic

V37 文档可以降低“开发方向不清晰”的风险，但不能消除“目标体验质量可能失败”的风险。该风险只能通过真实样本、真实候选、视觉证据和人审来关闭。

| Risk | Closure Mechanism | If Not Closed |
| --- | --- | --- |
| Route A2 视觉上限仍像模板或僵硬动作 | V37.4 生成候选 + V37.6 人审和视觉报告 | V37 partial scoped or failed; Route B becomes recommended next route |
| 产品仍显示内置猫 | V37.5 DOM/screenshot checks against candidate sampleId and characterAssetId | No-Go |
| 样本不足导致虚假泛化 | V37.2 named sample matrix and final narrow claim | No-Go for scoped pass |
| 自动评分替代人审 | V37.6 human visual gate required | No-Go |
| Route B 未执行但被写成更优 | Route B source-bound asset invariant | No-Go |
| 安全信息泄漏 | evidence scan and contract forbidden fields | No-Go |

## Development Readiness Decision

V37.1-V37.7 scoped product-path implementation 已完成。当前文档可以支撑后续继续开发，但不能保证下一阶段 raw-photo pixel generation 或 screenshot-backed target-experience pass。原因是视觉质量必须由真实照片像素、可播放动画截图和人审结果决定。

允许进入实质开发的前提：

- V37.1 先生成 phase-specific development and acceptance plan；
- 每个阶段完成后有真实 evidence；
- 任一阶段出现目标体验重大偏差、内置猫伪通过、Route B 虚假通过或安全扫描失败，必须停止并回到计划阶段。
