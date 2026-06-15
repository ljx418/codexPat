# V21.0 Scope Freeze Spec

文档状态：planned scope-freeze spec。  
当前日期：2026-06-14。

## Goal

V21.0 只做范围冻结、证据链确认和 false-claim 防护。它不产出动画资产，不证明任何路线 passed，也不解锁 V21.7 final gate。

## Required Evidence File

`docs/V21.x/evidence/v21_0-scope-freeze-YYYY-MM-DD.md`

## Required Checks

V21.0 evidence must confirm:

- V21 PRD exists: `docs/active/agent_desktop_pet_prd_v21.md`；
- V21 target architecture exists；
- V21 development plan exists；
- V21 detailed development and acceptance plan exists；
- V21 acceptance plan exists；
- V21 claim matrix exists；
- V21 implementation contract exists；
- V21 route specs exist for Route A/B/C/D and comparator；
- active gap points to V21 scoped accepted after closure, or V21 planned before implementation；
- V20 provider outputs may be used as Route A input, but cannot be used as V21 pass evidence；
- V19 local motion-sheet workflow remains the accepted fallback baseline；
- three local cat photos are available, or `sample_missing` is recorded；
- drawio XML parses；
- if feasible, drawio PNG/SVG snapshot is exported as evidence；
- forbidden claims only appear in forbidden / not-ready / not-implied contexts。

## Sample Photo Check

Expected local sample names:

- `docs/猫.jpg`
- `docs/猫_1.jpg`
- `docs/猫_2.jpg`

Evidence must not record full local absolute paths. It may record safe basenames and presence/size buckets.

## Claim Boundary

Allowed after V21.0 only:

```text
V21 multi-route animation asset recovery scope frozen with claim boundaries.
```

Still forbidden:

- V21 route passed；
- V21 final passed；
- provider integration verified；
- arbitrary cats automatic photo-to-animation ready；
- low-retry provider reliability for arbitrary cats；
- Petdex parity achieved；
- 3D ready；
- production signed release ready。

## Go / No-Go After V21.0

If V21.0 passes:

- V21.1-V21.4 may proceed route-by-route.

If V21.0 is blocked:

- do not start route implementation；
- fix missing docs / sample availability / drawio / claim scan first。
