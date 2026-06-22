# V23-V28 Evidence Index

文档状态：active evidence map；V23-V28 accepted scoped.
当前日期：2026-06-16。

| Stage | Evidence |
| --- | --- |
| V23 | `docs/V23-V28.x/evidence/v23-photo-suitability-trait-smoke-2026-06-16.md` |
| V24 | `docs/V23-V28.x/evidence/v24-multi-route-generation-smoke-2026-06-16.md` |
| V25 | `docs/V23-V28.x/evidence/v25-same-cat-motion-qa-smoke-2026-06-16.md` |
| V26 | `docs/V23-V28.x/evidence/v26-pack-preview-apply-smoke-2026-06-16.md` |
| V27 | `docs/V23-V28.x/evidence/v27-retry-cost-guidance-smoke-2026-06-16.md` |
| V28 | `docs/V23-V28.x/v28-final-acceptance-report.md` |
| V28 dashboard | `docs/V23-V28.x/evidence/v28-productized-photo-to-2d-dashboard-2026-06-16.html` |
| drawio sync | `docs/V23-V28.x/evidence/v23-v28-drawio-sync-snapshot-YYYY-MM-DD.png` or `.svg` |

Every phase must resolve to passed / blocked / failed. Silent pass is forbidden.

The drawio snapshot is recommended whenever the diagram is used for external
audit. It is not a substitute for V23-V27 runtime evidence.

## Accepted Scoped Evidence

V23 photo suitability and safe trait extraction passed for tested local photo
samples and quality fixtures. This evidence is not generation, preview, apply,
or final productized workflow evidence.

V24 multi-route generation orchestrator passed for tested route registration,
budget, safe candidate metadata, and non-mutating route state scenarios. This
evidence is not same-cat/motion QA, visual review, preview, apply, rollback, or
final productized workflow evidence.

V25 same-cat and motion QA passed for tested candidate metric and rejection
scenarios. This evidence is not user visual approval, preview, apply, rollback,
or final productized workflow evidence.

V26 pack preview/apply/rollback passed for tested approved-candidate assembly,
isolated 8-action preview, target-only apply, and rollback scenarios. This
evidence is not retry/cost/failure guidance or final productized workflow
acceptance evidence.

V27 retry/cost/failure guidance passed for tested retry budget, repeated
failure repair, provider preflight blocking, actionable next-step, and previous
pack preservation scenarios. This evidence is not final productized workflow
acceptance evidence.

V28 final acceptance passed scoped for the tested local workflow gate with
phase evidence, embedded dashboard visual evidence, regression checks, security
scan, and claim scan.
