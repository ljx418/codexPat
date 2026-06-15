# V9.x Current Gap Analysis

status: active-partial
date: 2026-06-03

## Baseline

V8.0-V8.11 are accepted scoped. V8 includes provider-backed 3D evidence,
prototype GLB rendering quality, local animated sprite assembly, prompt-only
animated sprite workflow, and animated sprite visual QA.

## Remaining Product Gaps Owned By V9

| Gap | Current | V9 Target |
| --- | --- | --- |
| AI static 2D generation | MiniMax single-action smoke exists | in-app 8-action static pack generation |
| AI dynamic 2D generation | V8 prompt-only + local assembler exists | real provider multi-frame generated pack |
| AI 3D generation UX | V8 provider evidence exists, no broad product flow | Tripo3D generation path with scan/import/activation |
| Unified activation | import/activation exists | generated assets can be previewed and activated from guided flow |
| Failure hardening | V8 fallback evidence scoped | provider output failures preserve visible safe cat |

## Current Evidence Status

| Phase | Status | Evidence |
| --- | --- | --- |
| V9.1 | blocked-partial | MiniMax readiness passed; Tripo3D credential/consent/terms missing. |
| V9.2 | passed | MiniMax generated eight static 2D core action images and import/activation contract passed. |
| V9.3 | passed | MiniMax generated second animation frames for all core actions and animated import/activation contract passed. |
| V9.4 | blocked | Tripo3D real 3D provider output missing because credential/consent/terms are not configured. |

## Go / No-Go

V9.2 and V9.3 are accepted for tested explicit-consent MiniMax local scenarios.
V9.4 remains No-Go until Tripo3D credential, consent flags, provider adapter,
and real GLB provider output evidence are available. V9.x Productization Gate is
No-Go while V9.4 is blocked.
