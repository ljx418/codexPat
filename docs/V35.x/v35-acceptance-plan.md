# V35 Acceptance Plan

文档状态：active acceptance plan；V35.0 documentation readiness passed scoped；V35.1-V35.6 planned。
当前日期：2026-06-25。

## Acceptance Objective

V35 验收目标是判断 named sample 范围内的 2D 动作资产是否达到目标用户体验级，并判断 Route A2 quality uplift 与 Route B professional assisted import 哪条路线更适合作为下一阶段主线。

## Gate Table

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| V35.0 | document and architecture freeze | `docs/V35.x/evidence/v35_0-document-readiness-review-2026-06-25.md` | passed scoped for documentation only |
| V35.1 | target-experience rubric | `docs/V35.x/v35_1-target-experience-rubric-spec.md`；rubric、non-pass examples、human/automated review rules | planned |
| V35.2 | Route A2 quality uplift | `docs/V35.x/v35_2-route-a2-quality-uplift-spec.md`；Route A2 uplift plan、visual evidence requirements、failure thresholds | planned |
| V35.3 | Route B source boundary | `docs/V35.x/v35_3-route-b-source-boundary-spec.md`；professional-assisted source boundary、sample binding、provenance、QA requirements | planned |
| V35.4 | same-sample route comparison | `docs/V35.x/v35_4-same-sample-route-comparison-spec.md`；Route A2 / Route B side-by-side evidence using the same samples and standards | planned |
| V35.5 | product UX E2E evidence | `docs/V35.x/v35_5-product-ux-evidence-spec.md`；preview/apply/rollback、blocked failed candidates、Chinese HTML report | planned |
| V35.6 | final route decision | `docs/V35.x/v35_6-final-route-decision-spec.md`；final report、route recommendation、claim/security scan | planned |

## User-Visible Acceptance

通过时，用户或审查者应能看到：

- 同一只猫的 8 动作候选；
- 每个动作的视觉证据；
- 是否达到目标体验级；
- 为什么失败或只达到工程通过；
- 哪条路线更适合继续投入；
- 通过候选可以预览、应用、回滚；
- 失败候选不能应用。

## Non-Pass Criteria

- 动作仍是简单线条占位或整图变形；
- Route A2 和 Route B 使用不同样本或不同标准比较；
- Route B 缺少专业辅助来源边界；
- failed candidate 可应用；
- evidence 缺视觉证据；
- 文档或报告扩大声明为任意猫、provider、production、Windows 或 cross-platform ready。

## Allowed Final Decisions

- `Route A2 target-experience scoped pass`
- `Route A2 engineering pass; Route B recommended`
- `Route B target-experience scoped pass`
- `V35 partial scoped`
- `V35 blocked scoped`
- `V35 failed`

任何 final decision 都必须附带剩余风险和窄声明。
