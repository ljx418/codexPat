# V17 Implementation Contract

状态：V17.0-V17.7 scoped passed implementation contract；MiniMax text-to-image action-sheet API passed scoped；local photo upload to provider remains not-ready。  
日期：2026-06-11。

## Code Ownership Targets

| Area | Likely Surface |
| --- | --- |
| wizard view model | `apps/desktop/src/assets/photo-to-2d-wizard*.ts` |
| settings modal UI | `apps/desktop/src/main.ts`, `apps/desktop/src/styles.css` |
| photo/action sheet intake | `apps/desktop/src/assets/photo-to-2d-*` |
| action sheet crop/package | `scripts/v17_*`, existing V16 pack generator rebaseline |
| preview/apply | `apps/desktop/src/assets/photo-to-2d-preview-apply-flow.ts` |
| tests | `apps/desktop/src/assets/*.test.ts` |
| smoke scripts | `scripts/v17_*_smoke.mjs` |

## Required ReasonCodes

```text
photo_required
photo_preview_ready
consent_required
traits_required
generation_mode_required
host_tool_prompt_ready
provider_not_configured
provider_consent_required
provider_output_missing
action_sheet_required
action_sheet_invalid
action_sheet_grid_detected
action_sheet_crop_failed
frame_package_created
continuity_failed
same_cat_review_required
same_cat_review_failed
modal_preview_ready
apply_blocked_by_qa
target_instance_required
target_instance_not_found
target_pack_applied
rollback_completed
previous_pack_preserved
security_scan_failed
```

## UI Safety Contract

Wizard preview must:

- send zero PetEvent.
- not call notify.
- not write CatStateMachine.
- not mutate live PetInstance.
- not activate/delete/rollback pack until explicit apply/rollback.

## Runtime Safety Contract

Renderer input may contain only:

- safe action ID.
- renderer kind.
- safe pack ID.
- playback intent.
- scale.
- visibility.

## Forbidden Payloads

No wizard state, evidence, diagnostics, or renderer payload may contain:

- raw photo bytes.
- raw prompt.
- raw provider response.
- provider credential.
- token.
- Authorization.
- full local path.
- workspace path.
- config path.
- EXIF/GPS.
- shell command.
- raw HTTP body.

## Provider API Boundary

Provider API mode is optional in V17. If credentials, explicit upload consent,
cost/privacy/retention/license disclosure, redaction, and accepted output are
not all available, provider API mode must remain not-ready while host/manual and
action-sheet import paths can continue.
