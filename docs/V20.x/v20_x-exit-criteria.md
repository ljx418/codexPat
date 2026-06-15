# V20 Exit Criteria

文档状态：planned exit criteria；V20 Mainland Provider Motion Sheet。  
当前日期：2026-06-13。

## Product Exit Criteria

V20 may pass only if:

- A real MiniMax reference-image provider job is executed with explicit consent.
- If low-retry reliability is claimed, at least 3 real user-provided cat photos
  are benchmarked and at least 2 pass within the attempt budget.
- Provider returns one usable motion sheet or a documented accepted equivalent explicitly scoped by the claim.
- Output covers all 8 core actions.
- Output passes background/transparent gate.
- Output passes same-cat consistency.
- Output passes motion amplitude QA.
- Output passes loop closure and adjacent-frame continuity checks.
- User can preview all 8 actions.
- Accepted pack applies only to target PetInstance.
- Rollback restores previous active pack.
- Security scan passes.
- Claim scan passes.

## Blocked Outcome

V20 must remain blocked if:

- Credential is unavailable.
- Provider terms or user consent are missing.
- MiniMax reference-image capability is unavailable.
- Provider output is text-to-image only.
- Provider output is not a parseable sheet.
- Provider output has unremovable background.
- Provider output fails same-cat/motion/loop QA.
- Sample count is too small for the reliability claim being made.

Blocked V20 does not invalidate V19 local motion-sheet acceptance.

## Regression Exit Criteria

Required:

- desktop type check.
- desktop test.
- petctl test.
- V19 local motion-sheet smoke.
- security scan.
- claim scan.
