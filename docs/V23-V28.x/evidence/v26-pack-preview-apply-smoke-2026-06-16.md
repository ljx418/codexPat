# V26 Pack Preview Apply Smoke Evidence

status: passed
date: 2026-06-16

## Scope

V26 verifies safe pack assembly, isolated 8-action preview, user-approved
target-only apply, and rollback. It does not run V27 retry guidance or V28 final
gate.

## Results

| Check | Result | Details |
| --- | --- | --- |
| V25 prerequisite evidence exists and passed | passed | docs/V23-V28.x/evidence/v25-same-cat-motion-qa-smoke-2026-06-16.md |
| all 8 actions preview | passed | previewActionCount=8 |
| preview sends zero PetEvent and no state writes | passed | preview is isolated |
| QA failed candidate cannot apply | passed | previous_pack_preserved, qa_not_accepted |
| approved candidate applies target-only | passed | target changed; default and unrelated unchanged |
| rollback restores previous visible pack | passed | rollback restored pre-apply assignments |
| desktop target test passed | passed | pack-preview-apply-rollback.test.ts passed |
| security scan | passed | no credential, auth header, private file identifiers, provider body, image bytes, geodata |
| claim scan | passed | forbidden claims are not used as passed |

## Flow Summary

| Scenario | Status | Preview actions | Apply | Rollback | Reason codes |
| --- | --- | --- | --- | --- | --- |
| accepted | passed | 8 | applied | rolled_back | pack_assembled, preview_ready, rollback_available, rollback_restored_previous_pack, target_pack_applied |
| qaFailed | blocked | 0 | blocked | not-run | previous_pack_preserved, qa_not_accepted |
| unapproved | blocked | 0 | blocked | not-run | previous_pack_preserved, user_approval_required |

## PRD / Spec Review

V26 satisfies the PRD requirement that only approved candidates can be previewed
and applied to the target pet, while QA-failed and unapproved candidates preserve
the previous visible pack. V27 remains responsible for retry, cost, and failure
guidance.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| QA failed pack can apply | High | blocked by qa_not_accepted |
| Preview mutates live pet | High | zero PetEvent / no notify / no CatStateMachine |
| Apply changes default or unrelated pets | High | target-only assignment verified |
| Rollback missing | High | rollback restores pre-apply assignments |

## Allowed Claim

V26 pack preview, target apply, and rollback passed for tested approved and rejected candidate scenarios.

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for arbitrary cats
- arbitrary cats automatic photo-to-animation ready
- provider integration verified
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- 3D ready
- production signed release ready
