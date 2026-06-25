# V31.6 E2E Real-data Acceptance Spec

文档状态：planned execution spec；V31.6 entry document。
当前日期：2026-06-24。

## Purpose

V31.6 defines the full end-to-end acceptance loop for real V31 evidence. It
prevents silent pass by requiring real visual assets, real screenshots, PRD
review, claim scan, security scan, and a clear pass/partial/block/fail result.

## Required End-to-end Paths

| Path | Required Result |
| --- | --- |
| Flagship asset path | One high-quality 8-action pack passes visual QA, semantic QA, preview, apply, rollback. |
| Placeholder rejection path | Current simplified SVG or transform-only pack is rejected with visible reason. |
| Visual report path | HTML report embeds screenshots/contact sheets/playback and QA table. |
| Photo sample path | Named real sample set either produces candidates or records blocked/failed reasons. |
| Claim/security path | Scans close without forbidden ready claims or sensitive data. |

## Minimum Commands

Run existing regression commands:

```text
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Future implementation must add V31-specific smoke scripts before V31.7. The
final gate must not mark V31 passed if V31-specific visual evidence exists only
as manual text.

## Evidence Package

Create:

```text
docs/V31.x/evidence/v31_6-e2e-real-data-acceptance-YYYY-MM-DD.md
docs/V31.x/evidence/v31_3-visual-review-report-YYYY-MM-DD.html
docs/V31.x/v31-final-acceptance-report.md
```

The evidence package must list:

- exact tested pack IDs and sample IDs;
- route used for each candidate;
- visual evidence inventory;
- QA results and reasonCodes;
- apply/rollback result;
- failed or blocked samples;
- PRD/spec review;
- claim scan;
- security scan.

## Final Decisions

| Decision | Meaning |
| --- | --- |
| passed scoped | flagship path passed, evidence is visual, target apply/rollback passed, scans clean; photo route result is accurately scoped. |
| partial | flagship passed but photo route remains blocked/failed and is honestly documented. |
| blocked | environment, asset source, license, sample, or tooling prevents real validation. |
| failed | target visual quality, runtime safety, apply/rollback, scans, or claim boundaries fail. |

## Non-negotiable Exit Conditions

V31 final cannot pass if:

- no high-quality flagship 8-action asset passes;
- evidence is text-only;
- failed assets can apply;
- rollback does not restore the previous visible pack;
- arbitrary-cat readiness is claimed from insufficient samples;
- provider output bypasses local QA;
- sensitive data appears in evidence.
