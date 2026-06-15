# V7.15 Advanced Productization Gate Smoke

status: passed
date: 2026-06-01

## Scope

This final gate covers V7.13 and V7.14 accepted paths only:

- generated 2D local sprite path.
- external GLB/GLTF import path.

The real 3D provider output path remains blocked, so automatic photo-to-3D remains not-ready.

## Claim Basis Table

| Claim Basis | Evidence Path | Result | Claim Impact |
| --- | --- | --- | --- |
| generated 2D path | `docs/V7.13/v7_13-final-acceptance-report.md`, `docs/V7.14/evidence/v7_14-generated-2d-actions-2026-06-01.png` | passed | supports generated 2D workflow claim |
| external GLB import path | `docs/V7.13/v7_13-final-acceptance-report.md`, V7.12 GLB runtime screenshots | passed | supports imported GLB/GLTF runtime scenario claim |
| real 3D provider output | `docs/V7.13/v7_13-final-acceptance-report.md` | blocked | no provider 3D claim |
| automatic photo-to-3D | V7.13/V7.14 final reports | not-ready | forbidden because real 3D provider output is missing |
| final allowed claim | this evidence | passed | V7 advanced personalized cat asset workflow passed for tested generated 2D and imported GLB/GLTF runtime scenarios; automatic photo-to-3D remains not-ready. |

## Case Results

| Case | Result | Details |
| --- | --- | --- |
| V7.13 final report passed | passed | V7.13 scoped orchestration final report exists |
| V7.14 final report passed | passed | V7.14 scoped visual QA final report exists |
| generated 2D path basis | passed | generated 2D path accepted |
| external GLB import path basis | passed | external GLB import path accepted |
| real provider 3D branch blocked | passed | automatic photo-to-3D remains not-ready |
| V7.14 generated 2D visual evidence | passed | generated 2D contact sheet retained |
| V7.14 visual QA evidence | passed | advanced visual QA evidence passed |
| V7.13 orchestration smoke rerun | passed | V7.13 smoke rerun |
| V7.14 visual QA smoke rerun | passed | V7.14 smoke rerun |
| desktop check | passed | desktop typecheck |
| petctl test | passed | petctl unit/regression |
| security scan | passed | no forbidden secret/path/raw-payload leakage in final evidence set |
| claim scan | passed | forbidden ready claims appear only in forbidden/not-ready/conditional contexts |
| license/attribution scan | passed | claimed fixture manifests include attribution |
| artifact scan | passed | generated dist/, target/, and node_modules/ are not present as source changes |

## Final Decision

Passed. Allowed claim: V7 advanced personalized cat asset workflow passed for tested generated 2D and imported GLB/GLTF runtime scenarios; automatic photo-to-3D remains not-ready.
