# V29.4 Productized Wizard Smoke Evidence

status: passed
date: 2026-06-16

## Scope

V29.4 verifies a tested productized wizard model for upload/generate/QA/preview/
apply/rollback semantics. It does not prove the V29.2 diverse photo benchmark,
provider integration, or V29 final readiness.

## Results

| Check | Result | Details |
| --- | --- | --- |
| approved candidate completes preview/apply/rollback | passed | apply_target_only_passed, rollback_passed, wizard_generation_ready, wizard_preview_ready |
| preview remains isolated | passed | zero PetEvent / no notify / no CatStateMachine |
| QA failed candidate cannot apply | passed | previous_pack_preserved, qa_failed_candidate_blocked, wizard_generation_ready |
| missing photo blocks wizard | passed | previous_pack_preserved, wizard_photo_required |
| missing target blocks apply | passed | apply_target_missing, previous_pack_preserved, wizard_generation_ready, wizard_preview_ready |
| wizard target test passed | passed | productized-generation-wizard.test.ts passed |
| security scan | passed | safe wizard snapshot only |
| claim scan | passed | no forbidden ready claim |

## Scenario Table

| Scenario | Status | States | Reason codes |
| --- | --- | --- | --- |
| accepted | passed | checking -> generating -> qa_running -> preview_ready -> apply_ready -> applied -> rolled_back | apply_target_only_passed, rollback_passed, wizard_generation_ready, wizard_preview_ready |
| qaFailed | blocked | checking -> generating -> qa_running -> blocked | previous_pack_preserved, qa_failed_candidate_blocked, wizard_generation_ready |
| noPhoto | blocked | photo_required -> blocked | previous_pack_preserved, wizard_photo_required |
| noTarget | blocked | checking -> generating -> qa_running -> preview_ready -> blocked | apply_target_missing, previous_pack_preserved, wizard_generation_ready, wizard_preview_ready |

## PRD / Spec Review

The tested wizard path shows that an approved candidate can reach preview,
target-only apply, and rollback without shell commands or raw manifest editing.
QA-failed candidates, missing photos, and missing target instances are blocked
with stable reasonCodes.

V29.2 remains blocked by insufficient benchmark sample count, so V29.6 remains
No-Go.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| QA failed candidate can apply | High | qa_failed_candidate_blocked and previewApply=null |
| Preview mutates live state | High | zero PetEvent / no notify / no CatStateMachine |
| Missing target silently falls back to default | High | apply_target_missing blocks apply |
| Wizard evidence mistaken for stable photo benchmark | High | V29.2 remains blocked; no final claim |

## Allowed Claim

V29 productized photo generation wizard passed for tested upload, generate, preview, apply, and rollback scenario.

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for all arbitrary cats
- provider integration verified
- Petdex parity achieved beyond tested standards
- Petdex asset reuse authorization
- 3D ready
- production signed release ready
