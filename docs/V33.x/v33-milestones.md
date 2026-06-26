# V33 Milestones

文档状态：planned milestones；所有里程碑均未通过。
当前日期：2026-06-25。

| Milestone | Target Outcome | Exit Condition |
| --- | --- | --- |
| M33.0 Documentation Control | 人类和 agent 都能理解 V33 目标体验、目标架构、阶段计划和验收边界。 | V33 docs、active docs、drawio、claim/security scan 通过。 |
| M33.1 Safe Sample Intake | named real sample set 被安全分类。 | 每个样本有 passed/blocked/failed intake status 和 reasonCode。 |
| M33.2 Identity Contract | 照片特征进入安全角色设计合同。 | 通过样本有 trait summary 和 identity QA 输入，敏感数据不进入 evidence。 |
| M33.3 Action Candidate | 至少一个通过样本产生 8 动作候选。 | manifest、frames、contact sheet、GIF/播放证据存在。 |
| M33.4 Runtime Quality Route | 候选通过语义、美术、帧质量和身份 gates。 | V30/V31/V32/V33 gates pass 或稳定 blocked reason。 |
| M33.5 Product Path | 用户能在应用内预览、应用和回滚候选。 | approved-only preview/apply/rollback 通过，failed candidate blocked。 |
| M33.6 Real-data E2E | 人类可读的真实数据验收报告形成。 | 中文 HTML 报告包含截图、QA 表、场景路径和真实结论。 |
| M33.7 Final Gate | V33 scoped 结论形成。 | final report 给出 passed/partial/blocked/failed，含 PRD/spec review、baseline commands、claim/security scan。 |

## Milestone Dependencies

```text
M33.0
  -> M33.1
  -> M33.2
  -> M33.3
  -> M33.4
  -> M33.5
  -> M33.6
  -> M33.7
```

M33.7 在 M33.1-M33.6 没有真实 evidence 前保持 No-Go。

## Expected Evidence Index

- `docs/V33.x/evidence/v33_0-scope-freeze-YYYY-MM-DD.md`
- `docs/V33.x/evidence/v33_0-document-readiness-review-2026-06-25.md`
- `docs/V33.x/evidence/v33_1-real-sample-intake-YYYY-MM-DD.md`
- `docs/V33.x/evidence/v33_2-trait-identity-contract-YYYY-MM-DD.md`
- `docs/V33.x/evidence/v33_3-photo-action-candidates-YYYY-MM-DD.md`
- `docs/V33.x/evidence/v33_4-rig-frame-runtime-route-YYYY-MM-DD.md`
- `docs/V33.x/evidence/v33_5-in-app-preview-apply-rollback-YYYY-MM-DD.md`
- `docs/V33.x/evidence/v33_6-real-data-e2e-report-YYYY-MM-DD.html`
- `docs/V33.x/v33-final-acceptance-report.md`
