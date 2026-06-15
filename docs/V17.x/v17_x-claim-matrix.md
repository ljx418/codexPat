# V17 Claim Matrix

状态：V17.0-V17.7 scoped passed；MiniMax text-to-image action-sheet API passed scoped；arbitrary-cat/provider integration readiness remain not-ready。  
日期：2026-06-11。

## Allowed Claims

| Phase | Allowed Claim |
| --- | --- |
| V17.0 | V17 photo-to-2D productized wizard scope frozen with claim boundaries. Status: passed scoped. |
| V17.1 | V17 photo-to-2D wizard shell passed for tested local photo intake and consent preview scenarios. Status: passed scoped. |
| V17.2 | V17 generation mode and loading UX passed for tested host/manual and not-ready provider scenarios. Status: passed scoped. |
| V17.3 | V17 local action-sheet intake and auto-packaging passed for tested 4x2 action sheet scenarios. Status: passed scoped. |
| V17.4 | V17 in-modal 8-action preview QA passed for tested generated sprite pack scenarios. Status: passed scoped. |
| V17.5 | V17 target-pet apply and rollback passed for tested local generated pack scenarios. Status: passed scoped. |
| V17.6 | V17 photo-to-2D wizard passed for tested local photo and action-sheet import scenarios; direct provider API generation remains not-ready. Status: passed scoped. |
| V17.7 | V17.7 MiniMax provider API action-sheet generation passed for the tested explicit-consent local scenario. Status: passed scoped. |

Final V17 allowed claim after V17.7:

```text
V17 photo-to-2D wizard passed for tested local photo/action-sheet import and tested MiniMax text-to-image action-sheet API scenarios; local cat photo upload to provider and arbitrary-cat automatic generation remain not-ready.
```

## Forbidden Claims

The following may only appear in forbidden / not-ready / not-implied contexts:

```text
automatic photo-to-2D ready for arbitrary cats
automatic photo-to-animation ready
provider integration verified
Petdex parity achieved
3D ready
automatic photo-to-3D ready
remote asset loading ready
asset marketplace ready
production signed release ready
notarized release ready
auto update ready
cross-platform ready
Windows ready
OS-level Codex window binding ready
already-open Codex auto-monitoring ready
all Codex workflows verified
MCP ready
Third-party agent integration verified
Claude Code integration verified
```

## Claim Basis Table Required in V17.6

| Capability | Evidence Required | Claim Basis |
| --- | --- | --- |
| local photo wizard | V17.1 screenshot/DOM evidence | productized local intake |
| host/manual generation path | V17.2 evidence | assisted path only |
| action-sheet import | V17.3 smoke | local 4x2 sheet path |
| modal preview QA | V17.4 evidence | visual QA path |
| target apply/rollback | V17.5 evidence | target-only runtime apply |
| provider API | V17.7 MiniMax API smoke | text-to-image action-sheet path only |
| local photo upload to provider | real upload consent/request/output evidence | not-ready |
| arbitrary cats | multiple accepted cat photos and failure cases | not claimed in V17 unless separately evidenced |
