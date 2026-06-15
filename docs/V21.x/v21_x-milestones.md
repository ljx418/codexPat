# V21 Milestones

文档状态：planned milestones。  
当前日期：2026-06-14。

## Milestone Table

| Milestone | Owner Scope | Target Result | Exit Status |
| --- | --- | --- | --- |
| M0 Scope Freeze | V21.0 | Docs, drawio, route matrix, claim boundary frozen | passed / blocked |
| M1 Key-pose Route | V21.1 | Provider-derived key poses become safe animation pack or blocked | passed / blocked / failed |
| M2 Provider Route | V21.2 | Alternate provider capability decisions | passed / blocked / failed |
| M3 Local Rig Route | V21.3 | Same-cat local rig pack or blocked | passed / blocked / failed |
| M4 Video Route | V21.4 | Video-to-frame pack or blocked/excluded | passed / blocked / failed / excluded |
| M5 Visual Comparator | V21.5 | Side-by-side route results visible to operator | passed / blocked / failed |
| M6 Product Spike | V21.6 | Best route preview/apply/rollback | passed / blocked / failed |
| M7 Final Gate | V21.7 | Narrow final decision | passed / blocked / failed |

## Milestone Dependency

V21.7 cannot start until V21.0-V21.6 all have explicit evidence. V21.6 cannot select a best route unless at least one route has passed QA.

## Remote / Future Milestones

These are not V21 pass conditions:

- provider marketplace；
- cloud generation queue；
- arbitrary user asset marketplace；
- production signing/notarization；
- Windows/cross-platform packaging；
- 3D production renderer。
