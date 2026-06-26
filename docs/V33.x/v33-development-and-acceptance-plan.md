# V33 Development and Acceptance Plan

文档状态：planned total-control plan；不得跳过阶段直接进入 final gate。
当前日期：2026-06-25。

## Stage Objective

V33 将 V32 的高质量本地 frameSequence 基线推进到真实照片样本驱动的产品化闭环。每个子阶段必须先有开发计划和验收标准，再产生真实 evidence；若验收失败，回到该阶段计划修正，不 silent pass。

## Required Specs

实施前必须读取：

- `docs/V33.x/v33-engineering-implementation-blueprint.md`
- `docs/V33.x/v33-implementation-contract.md`
- `docs/V33.x/v33-evidence-and-scan-checklist.md`
- `docs/V33.x/v33_1-real-sample-intake-spec.md`
- `docs/V33.x/v33_2-trait-identity-contract-spec.md`
- `docs/V33.x/v33_3-photo-action-candidates-spec.md`
- `docs/V33.x/v33_4-rig-frame-runtime-route-spec.md`
- `docs/V33.x/v33_5-in-app-preview-apply-rollback-spec.md`
- `docs/V33.x/v33_6-real-data-e2e-report-spec.md`

## Phase Table

| Phase | Development Action | Acceptance Action | Evidence |
| --- | --- | --- | --- |
| V33.0 scope and doc freeze | 更新 PRD、目标架构、gap、drawio、claim matrix、milestones、acceptance plan。 | doc audit、drawio page count、claim scan、security scan。 | `docs/V33.x/evidence/v33_0-scope-freeze-YYYY-MM-DD.md` |
| V33.1 real sample intake | 建立 named real photo sample set、隐私边界、样本分类和 reasonCode。 | 证明样本元数据安全，清晰/困难/blocked/negative 样本都有 intake 结论。 | `docs/V33.x/evidence/v33_1-real-sample-intake-YYYY-MM-DD.md` |
| V33.2 trait and identity contract | 实现或记录 trait extraction、character design contract、identity QA 输入。 | 通过样本有安全 trait summary；失败样本有 identity/suitability reason。 | `docs/V33.x/evidence/v33_2-trait-identity-contract-YYYY-MM-DD.md` |
| V33.3 action candidate production | 为通过样本执行主体检测、分割/遮罩、姿态/解剖估计、身份锚点、角色设计、rig/frame seed 和 8 动作合成。 | 候选包含 technical pipeline status、manifest、frames、contact sheet、GIF 或等效播放证据；只有整图变形的候选必须 failed。 | `docs/V33.x/evidence/v33_3-photo-action-candidates-YYYY-MM-DD.md` |
| V33.4 professional route runtime | 让 frameSequence 或 professional rig 输出进入 runtime 可验收形态。 | V30 semantic、V31 art、V32 measured、V33 identity gates pass 或稳定 blocked。 | `docs/V33.x/evidence/v33_4-rig-frame-runtime-route-YYYY-MM-DD.md` |
| V33.5 in-app product path | 接入 asset manager/photo wizard/gallery 的 preview、target apply、rollback。 | failed candidate blocked；approved candidate preview/apply/rollback passed。 | `docs/V33.x/evidence/v33_5-in-app-preview-apply-rollback-YYYY-MM-DD.md` |
| V33.6 real-data E2E report | 汇总真实样本、候选、QA、应用路径、截图。 | 生成中文 HTML 报告，嵌入截图/播放证据，不做虚假验收。 | `docs/V33.x/evidence/v33_6-real-data-e2e-report-YYYY-MM-DD.html` |
| V33.7 final gate | 汇总 V33.0-V33.6 evidence。 | PRD/spec review、baseline regression、claim scan、security scan、narrow final claim。 | `docs/V33.x/v33-final-acceptance-report.md` |

## First Implementation Slice

第一轮实质开发不直接做 final gate，也不先接 provider。第一切片是：

```text
V33.1 safe sample intake
  + V33.2 identity / character contract
  + one V33.3 local_frame_sequence candidate
```

必须新增或更新：

- `apps/desktop/src/assets/v33-sample-intake.ts`
- `apps/desktop/src/assets/v33-identity-contract.ts`
- `apps/desktop/src/assets/v33-photo-action-pipeline.ts`
- `apps/desktop/src/assets/v33-action-candidate-gate.ts`
- matching `*.test.ts`
- `scripts/v33_1_real_sample_intake_smoke.mjs`
- `scripts/v33_2_trait_identity_contract_smoke.mjs`
- `scripts/v33_3_photo_action_candidates_smoke.mjs`

第一切片出门条件：

- safe sample records 不包含 raw photo、EXIF/GPS、完整本地路径或 provider raw payload；
- passing sample 有 identity/character contract；
- local frameSequence candidate 有 8 个动作、manifest、contact sheet/GIF 或等效播放证据；
- transform-only negative candidate failed；
- V30/V31/V32/V33 QA 给出 passed、blocked 或 failed，不能 silent pass。

## Required Baseline Commands

每个实现阶段至少运行或记录稳定 blocked reason：

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
pnpm --filter desktop exec node --import tsx ../../scripts/v32_quality_rescue_smoke.mjs
```

V33 专属 smoke scripts 必须在实现阶段补齐，命名建议：

- `scripts/v33_1_real_sample_intake_smoke.mjs`
- `scripts/v33_2_trait_identity_contract_smoke.mjs`
- `scripts/v33_3_photo_action_candidates_smoke.mjs`
- `scripts/v33_4_rig_frame_runtime_route_smoke.mjs`
- `scripts/v33_5_in_app_preview_apply_rollback_smoke.mjs`
- `scripts/v33_6_real_data_e2e_report_smoke.mjs`

## Pass, Partial, Blocked, Failed

- `passed scoped`：真实 named sample set 内至少一个通过样本完成照片到动作候选、QA、preview、apply、rollback，且 blocked/failed 样本安全可解释。
- `partial scoped`：部分路径通过，但核心目标仍缺某一层，例如只有角色候选没有动作候选。
- `blocked scoped`：真实环境、样本、工具或隐私前置条件不可用，且无法在不扩大声明的情况下继续。
- `failed`：前置条件可用但实现违反 PRD、QA、隐私、安全或 claim boundary。

## Human Review Stop Conditions

出现以下任一情况时，停止进入实质开发并要求人工确认：

- 需要上传真实用户照片到外部 provider；
- 样本授权或隐私边界不清；
- 计划要求保存原始照片、EXIF/GPS、完整本地路径或 provider raw payload；
- 验收标准试图把 named sample set 通过扩大成任意猫 ready；
- provider、3D、production、Windows 或 cross-platform ready 被写成已验证。
