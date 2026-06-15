# V17.6 Productized Photo-to-2D Wizard Final Acceptance Report

Date: 2026-06-11
Status: passed

This report is the V17 final gate only. It does not upgrade provider API, arbitrary-cat generation, Petdex parity, 3D, marketplace, release signing, or cross-platform claims.

Post-closure addendum: V17.7 later added scoped MiniMax text-to-image
action-sheet API evidence. See `docs/V17.x/v17_7-provider-api-addendum-report.md`.
V17.7 does not change this report's V17.6 scope and still does not prove local
cat photo upload to provider or arbitrary-cat automatic generation.

## Scope

- Local photo intake wizard with consent and safe metadata.
- Host/manual generation mode and provider-not-ready UX.
- Local 4x2 action sheet import and auto-packaging.
- In-modal 8-action preview QA.
- Target-only apply and rollback model.

## Evidence

- V17.0: `docs/V17.x/evidence/v17_0-scope-freeze-2026-06-11.md`
- V17.1: `docs/V17.x/evidence/v17_1-wizard-shell-photo-intake-2026-06-11.md`
- V17.2: `docs/V17.x/evidence/v17_2-generation-mode-loading-2026-06-11.md`
- V17.3: `docs/V17.x/evidence/v17_3-action-sheet-packaging-2026-06-11.md`
- V17.4: `docs/V17.x/evidence/v17_4-modal-preview-qa-2026-06-11.md`
- V17.5: `docs/V17.x/evidence/v17_5-apply-rollback-2026-06-11.md`
- V17.6 HTML: `docs/V17.x/evidence/v17_6-productized-wizard-html-2026-06-11.html`

## Check Results

| Check | Result | Details |
| --- | --- | --- |
| V17.0 scope freeze | passed | v17_0-scope-freeze-2026-06-11.md |
| V17.1 wizard shell | passed | v17_1-wizard-shell-photo-intake-2026-06-11.md |
| V17.2 generation mode | passed | v17_2-generation-mode-loading-2026-06-11.md |
| V17.3 action sheet packaging | passed | v17_3-action-sheet-packaging-2026-06-11.md |
| V17.4 modal preview QA | passed | v17_4-modal-preview-qa-2026-06-11.md |
| V17.5 apply rollback | passed | v17_5-apply-rollback-2026-06-11.md |
| desktop check | passed | exit=0 |
| desktop test | passed | exit=0 |
| desktop build | passed | exit=0 |
| V15.12 continuity assembly regression | passed | exit=0 |
| V15.13 preview/apply regression | passed | exit=0 |
| V16.6 provider/photo2d final regression | passed | exit=0 |
| V17.1-V17.5 smoke evidence review | passed | passed evidence files reviewed; nested tsx rerun excluded from final gate because the sandbox blocks tsx temporary IPC pipes |
| V17 generated pack exists | passed | generated pack pet.json present |
| V17 action sheet source exists | passed | sanitized action sheet source present |
| V15 GUI screenshot regression evidence exists | passed | screenshot evidence present |
| V15 runtime capture regression evidence exists | passed | runtime capture evidence present |
| security scan | passed | no token, Authorization, raw payload, raw photo bytes, prompt text, provider payload, full local path, or api-token filename in scanned V17 text evidence |
| claim scan | passed | final claim is scoped; forbidden claims remain forbidden/not-ready/not-implied |
| PRD/spec review | passed | active V17 PRD, architecture, acceptance, claim matrix, and implementation contract align with the productized wizard scope |

## Claim Basis Table

| Capability | Evidence | Claim Basis |
| --- | --- | --- |
| local photo wizard | V17.1 | tested local safe photo intake |
| generation mode UX | V17.2 | host/manual path and provider-not-ready state |
| action-sheet import | V17.3 | tested 4x2 local action sheet |
| modal preview QA | V17.4 | all 8 actions visible in isolated preview |
| target apply/rollback | V17.5 | target-only model/store apply and rollback |
| provider API | no accepted provider API evidence in V17 | not-ready |
| arbitrary cats | one tested local cat photo/action-sheet path | not claimed |

## Allowed Claim

V17 photo-to-2D wizard passed for tested local photo and action-sheet import scenarios; direct provider API generation remains not-ready.

## Forbidden Claims

- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- remote asset loading ready
- asset marketplace ready
- production signed release ready
- notarized release ready
- auto update ready
- cross-platform ready
- Windows ready
- OS-level Codex window binding ready
- already-open Codex auto-monitoring ready
- all Codex workflows verified
- MCP ready
- Third-party agent integration verified
- Claude Code integration verified
