# V19 Motion Sheet Format and QA Spec

日期：2026-06-12  
状态：planned implementation spec。

## 1. Supported Input Modes

| Mode | Purpose | Claim Boundary |
| --- | --- | --- |
| `local_motion_sheet_import` | User imports a local motion sheet with ownership/license confirmation. | Can prove local import, crop, QA, preview, apply, rollback. |
| `provider_single_motion_sheet` | Provider generates one same-cat motion sheet from a user cat photo. | Can prove provider generation only with real provider output evidence. |

V19 must not use independent per-action provider images as final same-cat sheet evidence.

## 2. Motion Sheet Layout

Preferred layout:

- `rows`: 8
- `columns`: 9
- `frameWidth`: 192 or scaled equivalent
- `frameHeight`: 208 or scaled equivalent
- `framesPerAction`: 6 to 9 accepted; 9 preferred
- `imageType`: png, webp
- `background`: transparent preferred; flat removable background allowed only if QA output is transparent or visually non-distracting

Accepted row mapping:

| Row | Project Action | Notes |
| --- | --- | --- |
| 1 | idle | loop/base action |
| 2 | thinking | loop/base action |
| 3 | running | loop/base action; must show visible body/leg movement |
| 4 | success | transient or loopable celebration |
| 5 | warning | loop/base alert action |
| 6 | error | loop/base failure action |
| 7 | need_input | loop/base attention/request action |
| 8 | sleeping | loop/base sleep/nap action |

Petdex-compatible source rows may be mapped only through an explicit safe mapping table. Unknown rows are ignored unless allowlisted.

## 3. Safe Manifest Fields

Required safe metadata:

- `packId`
- `displayName`
- `rendererKind`
- `layout.rows`
- `layout.columns`
- `layout.frameWidth`
- `layout.frameHeight`
- `actions[].actionId`
- `actions[].row`
- `actions[].frameStart`
- `actions[].frameCount`
- `actions[].fps`
- `actions[].loop`
- `actions[].fallbackActionId`

Allowed `rendererKind`:

- `sprite`
- `frameSequence`

## 4. Rejected Fixture Matrix

Every rejected fixture must return a stable reasonCode.

| Fixture | reasonCode |
| --- | --- |
| remote URL | `remote_url_rejected` |
| absolute local path | `absolute_path_rejected` |
| path traversal | `path_traversal_rejected` |
| full local path in metadata | `raw_local_path_rejected` |
| external href | `external_href_rejected` |
| script field | `script_field_rejected` |
| event handler field | `event_handler_rejected` |
| shell command field | `shell_command_rejected` |
| token / Authorization field | `credential_field_rejected` |
| raw provider payload field | `raw_provider_payload_rejected` |
| prompt private text field | `prompt_private_text_rejected` |
| unsupported renderer kind | `renderer_kind_invalid` |
| wrong row count | `sheet_row_count_invalid` |
| wrong column count | `sheet_column_count_invalid` |
| missing core action row | `action_coverage_incomplete` |
| transparent/blank row | `blank_action_frames` |
| off-canvas frames | `frame_off_canvas` |
| corrupt image | `image_decode_failed` |
| oversized image | `image_size_limit_exceeded` |
| missing license confirmation | `license_confirmation_required` |
| provider sheet not returned | `provider_motion_sheet_missing` |
| provider returned independent action images | `provider_output_not_single_sheet` |

## 5. Motion Amplitude QA

V19 compares candidate packs against the V18 transform-derived baseline.

Minimum automated signals:

- `meanFrameDelta` per action.
- `maxFrameDelta` per action.
- `bboxCenterShiftPx` per action.
- `bboxAreaChangeRatio` per action.
- `uniquePoseCount` per action.

Acceptance thresholds:

- At least 6 of 8 actions must be `amplitudeState=passed`.
- `running`, `success`, `error`, and `need_input` must pass amplitude.
- Loop/base actions must have at least 4 unique poses.
- Transient actions must have at least 3 unique poses.
- For visible motion, an action passes if either:
  - `meanFrameDelta >= 22` and `maxFrameDelta >= 35`, or
  - `bboxCenterShiftPx >= 18`, or
  - operator visual acceptance explicitly marks the action as high-motion with screenshot evidence.

These thresholds may be calibrated in V19.4, but evidence must record the final values used.

## 6. Continuity QA

Required:

- no blank frame.
- no fully transparent frame.
- no off-canvas frame.
- first/final closure for loop actions.
- adjacent-frame delta must not show unrelated cat/object substitution.
- 1x and 0.75x preview readability.
- same-cat review must pass for all rows.

Failure reasonCodes:

- `loop_closure_failed`
- `frame_delta_spike`
- `same_cat_identity_failed`
- `scale_readability_failed`
- `qa_failed_pack_blocked`

## 7. Preview and Apply Safety

Preview must:

- send zero PetEvent.
- not call notify.
- not write CatStateMachine.
- not mutate live PetInstance.
- receive only safe pack/action/render fields.

Apply must:

- require selected target PetInstance.
- not fallback to default.
- preserve previous active pack before switching.
- rollback to previous pack on user command or failed activation.

Failure reasonCodes:

- `target_pet_required`
- `pet_instance_not_found`
- `activation_failed`
- `previous_pack_preserved`
- `rollback_succeeded`

## 8. Evidence Requirements

Each V19.1-V19.6 evidence file must include:

- status: passed / blocked / failed.
- tested input mode.
- safe sheet metadata table.
- rejected fixture table where applicable.
- action coverage table.
- QA metric table.
- screenshot/contact sheet/capture path with sanitized relative path only.
- security scan result.
- claim scan result.

Evidence must not include raw provider payload, raw photo bytes, token, Authorization, full local path, workspace path, config path, or private prompt text.
