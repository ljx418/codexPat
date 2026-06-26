# V34.6 Generation Product E2E Execution Spec

文档状态：active phase spec。
当前日期：2026-06-25。

## Objective

V34.6 把 V34.5 通过的生成候选接入现有 V33 productized photo flow，完成预览、target-only apply 和 rollback。该阶段验证用户可体验路径，而不是扩大任意猫 ready 声明。

V34.6 的输入事实源是 `docs/V34.x/evidence/v34_5-rig-frame-synthesis-2026-06-25.md`。当前只允许使用 V34.5 Route A2 passed scoped candidates；Route B 在本阶段仅作为后续报告中的质量比较项，不作为已执行输入。

## Planned Code Entities

- `apps/desktop/src/assets/v34-generation-quality-gate.ts`
- existing `apps/desktop/src/assets/v33-productized-photo-flow.ts`
- product flow tests for generated V34 candidates
- `scripts/v34_6_generation_product_e2e_smoke.mjs`

## Inputs

- V34.5 passed Route A2 `V34GeneratedActionPack` records；
- corresponding `V34GenerationQaResult` records with `overallStatus: passed`；
- existing V33 target pack registry and preview/apply/rollback contract；
- one failed Route A2 candidate for blocked-path verification；
- V34.5 visual evidence refs: manifest、contact sheet、playback summary。

不得把以下输入接入 product path：

- `overallStatus` 不是 `passed` 的 candidate；
- `reasonCodes` 包含 `whole_image_transform`、`weak_motion`、`same_pack_reuse_identity_drift`、`missing_core_action` 的 candidate；
- 只有 runtime core projection、没有 V34 target action coverage 的 candidate；
- Route B professional assisted import candidate，除非后续阶段另有独立 evidence。

## Outputs

- product preview state
- apply result
- rollback result
- blocked failed-candidate result
- screenshot or sanitized headless visual evidence refs
- product-path evidence linking each applied candidate back to sampleId、characterAssetId、candidateId

## Acceptance

通过条件：

- at least 2 V34.5 passed Route A2 candidates can enter preview；
- approved generated candidate can target-only apply without changing non-target packs；
- rollback restores previous target state；
- failed, blocked, transform-only, or identity-drift candidate cannot preview/apply；
- evidence links preview/apply/rollback to `sampleId`、`characterAssetId`、`candidateId` and V34.5 visual refs；
- evidence includes user-visible screenshots or sanitized headless screenshots；
- PRD/spec review、claim scan、security scan all pass。

失败条件：

- failed candidate enters preview/apply；
- apply modifies non-target pack；
- rollback cannot restore previous state；
- screenshots do not show the generated candidate path；
- product path accepts Route B without independent source-boundary evidence；
- product path treats runtime core projection as semantic equivalence with V34 target actions。

## Route B Handling

V34.6 不执行 Route B。验收只记录：

- Route B remains a future quality comparison / fallback candidate；
- Route B would need professional assisted source boundary、sampleId binding、part map、visual evidence、QA and product-path evidence before it can be accepted；
- Route B cannot be used to claim automatic generation.

## Evidence

生成：

`docs/V34.x/evidence/v34_6-generation-product-e2e-YYYY-MM-DD.md`

evidence 必须包含 PRD/spec review、command results、candidate table、preview/apply/rollback summary、failed-candidate blocked result、screenshots、Route B comparison note、claim/security scan。
