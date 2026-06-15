# V20 Milestones

文档状态：planned milestones；V20 Mainland Provider Motion Sheet。  
当前日期：2026-06-14。

## Milestone Map

| Milestone | Exit Condition | Evidence |
| --- | --- | --- |
| M0 Provider Scope | MiniMax P0 and mainland candidate matrix documented; V19 fallback preserved | V20.0 |
| M1 Safe Provider Boundary | Consent, credential, terms, cost/privacy/retention/license visible and redacted | V20.1 |
| M2 Real MiniMax Benchmark | Real provider benchmark returns accepted outputs or blocked/failed reasonCode; reliability claim requires 3 samples and bounded retry stats | V20.2 |
| M3 Pack Assembly | Provider output becomes safe local pack or blocks | V20.3 |
| M4 Visual QA | Same-cat, amplitude, loop, background, readability gates pass | V20.4 |
| M5 Product UX | Preview/apply/rollback target-only path passes | V20.5 |
| M6 Final Gate | Evidence-matched final claim; no forbidden claims | V20.6 |

## Go / No-Go

- V20.0: Go after document sync.
- V20.1: Go after V20.0 evidence.
- V20.2: Conditional Go; requires credential, consent, terms, provider availability, and user-provided sample photos. One sample can only support scoped smoke.
- V20.3: No-Go until V20.2 has accepted output.
- V20.4: No-Go until V20.3 has normalized pack candidate.
- V20.5: No-Go until V20.4 QA passes.
- V20.6: No-Go until V20.0-V20.5 have passed/blocked/failed evidence.
