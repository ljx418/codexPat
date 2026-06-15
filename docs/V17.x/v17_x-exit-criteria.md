# V17 Exit Criteria

状态：V17.0-V17.7 scoped passed exit criteria；local photo upload to provider remains not-ready。  
日期：2026-06-11。

## V17 May Pass Only If

- V17.1-V17.5 have explicit `passed / blocked / failed` evidence.
- A real local cat photo is selected or represented in the wizard without full path leakage.
- A real 4x2 action sheet is uploaded or supplied to the V17 packaging path.
- The system packages 8 core actions into a safe local sprite pack.
- The modal previews all 8 core actions.
- QA failures block apply.
- Apply changes only the selected target PetInstance.
- Rollback restores previous pack.
- Default and unrelated pets remain unchanged.
- Security scan passes.
- Claim scan passes.
- Regression checks pass.

## Hard Fail

- UI displays full local path, token, Authorization, raw provider response, raw prompt, EXIF/GPS, workspace path, config path, or raw HTTP body.
- Preview sends PetEvent or writes CatStateMachine.
- Apply falls back to default pet silently.
- Invalid generated pack replaces previous visible pack.
- Transparent/blank/off-canvas action can be applied without visible fallback.
- Final report claims arbitrary automatic photo-to-2D readiness without matching evidence.

## V17.6 Final Decision

Allowed final decision values:

```text
passed
blocked
failed
```

No silent pass is allowed.
