# V22 Current Gap Analysis

文档状态：scoped accepted gap analysis。  
当前日期：2026-06-15。

## Original Gap

V21 could produce and compare candidate animation packs, but a candidate could still be visually unacceptable. The latest premium pixel report was rejected by the operator as ugly. The system had technical QA but lacked a mandatory product-quality review gate.

## Accepted Target

V22 ensures generated assets are blocked unless they pass technical QA, motion QA, and visual review. Rejected assets must not enter gallery/apply flow. Users receive clear guidance after repeated failure.

## Gap Table

| Gap | Current | Target | V22 Owner |
| --- | --- | --- | --- |
| Bad asset rejection | manual after-the-fact complaint | architecture-level rejection before apply | V22.2-V22.4 |
| Ugly asset handling | report could say technical passed | visual acceptance can fail final candidate | V22.4 |
| Motion too weak | can pass with action count only | motion amplitude/readability gate | V22.3 |
| Retry guidance | ad hoc | reasonCode-driven guidance | V22.5 |
| Runtime safety | candidate may be treated as usable | approved-only apply | V22.6 |
| Evidence clarity | pass reports may hide ugly outputs | accepted + rejected examples embedded | V22.7 |

## Accepted Evidence

- `docs/V22.x/v22_7-final-acceptance-report.md`
- `docs/V22.x/evidence/v22_7-quality-review-dashboard-2026-06-15.html`
- `docs/V22.x/evidence/v22_7-regression-checks-2026-06-15.md`

## Current User Impact

Without V22, a user may see:

- ugly generated cats；
- weak motion；
- inconsistent identity；
- confusing failure；
- bad assets presented as successful。

After V22, the user sees:

- rejected result with reason；
- suggested fix or route；
- only approved assets in apply flow；
- previous visible pet preserved。
