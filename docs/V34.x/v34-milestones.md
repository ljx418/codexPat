# V34 Milestones

文档状态：active milestones；V34.1-V34.8 evidence-matched scoped passed。
当前日期：2026-06-25。

| Milestone | Target Outcome | Exit Condition |
| --- | --- | --- |
| M34.0 Documentation Control | 人类能从 PRD、架构图和计划理解 V34 如何从照片生成动作资产。 | 文档、drawio、claim/security scan 通过。 |
| M34.1 Subject Detection | 系统区分单猫、多猫、非猫或不可用样本。 | passed scoped；`docs/V34.x/evidence/v34_1-subject-detection-2026-06-25.md`。 |
| M34.2 Segmentation Mask | 系统生成去背景主体或稳定 blocked。 | passed scoped；`docs/V34.x/evidence/v34_2-segmentation-mask-2026-06-25.md`。 |
| M34.3 Pose Part Map | 系统记录可见部位和低置信部位。 | passed scoped；`docs/V34.x/evidence/v34_3-pose-part-map-2026-06-25.md`。 |
| M34.4 Character Asset | 每只通过样本有自己的角色资产合同。 | passed scoped；`docs/V34.x/evidence/v34_4-character-asset-contract-2026-06-25.md`。 |
| M34.5 Action Synthesis | 至少 2 个不同猫样本生成各自 8 动作候选；若 Route A 质量不足，按风险计划切换 Route B。 | passed scoped via Route A2；`docs/V34.x/evidence/v34_5-rig-frame-synthesis-2026-06-25.md`，Route B 已记录为后续质量比较项。 |
| M34.6 QA/Product Path | 通过候选可预览、应用、回滚。 | passed scoped；`docs/V34.x/evidence/v34_6-generation-product-e2e-2026-06-25.md`。 |
| M34.7 E2E Report | 人类可读报告呈现真实通过、失败、Route A2 局限和 Route B 质量比较。 | passed scoped；`docs/V34.x/evidence/v34_7-real-data-report-2026-06-25.html`。 |
| M34.8 Final Gate | V34 scoped 结论形成。 | passed scoped；`docs/V34.x/v34-final-acceptance-report.md`。 |

## Dependencies

```text
M34.0
  -> M34.1
  -> M34.2
  -> M34.3
  -> M34.4
  -> M34.5
  -> M34.6
  -> M34.7
  -> M34.8
```

M34.8 已在 M34.1-M34.7 真实 evidence 存在后完成 scoped final gate。

## Risk Milestones

- M34.1-M34.3：消减输入理解风险；不通过则不进入动作生成。
- M34.4：消减身份复用风险；不同样本必须有独立 `characterAssetId`。
- M34.5：消减动作僵硬风险；transform-only 是硬失败。
- M34.6：消减产品误应用风险；failed candidate 不能 preview/apply。
- M34.7-M34.8：消减虚假验收风险；没有视觉证据、Route B 比较或 claim/security scan 失败则不能出门。

## Expected Evidence Index

- `docs/V34.x/evidence/v34_0-document-readiness-review-2026-06-25.md`
- `docs/V34.x/evidence/v34_1-subject-detection-YYYY-MM-DD.md`
- `docs/V34.x/evidence/v34_2-segmentation-mask-YYYY-MM-DD.md`
- `docs/V34.x/evidence/v34_3-pose-part-map-YYYY-MM-DD.md`
- `docs/V34.x/evidence/v34_4-character-asset-contract-YYYY-MM-DD.md`
- `docs/V34.x/evidence/v34_5-rig-frame-synthesis-YYYY-MM-DD.md`
- `docs/V34.x/evidence/v34_6-generation-product-e2e-YYYY-MM-DD.md`
- `docs/V34.x/evidence/v34_7-real-data-report-YYYY-MM-DD.html`
- `docs/V34.x/v34-final-acceptance-report.md`
