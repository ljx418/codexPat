# V22 Quality Review Gate Spec

文档状态：scoped accepted implementation contract。  
当前日期：2026-06-15。

## Candidate Schema

```text
candidateId
sourceRoute
safePackId
status
actionCoverage
technicalQaResult
motionQaResult
visualReviewResult
retryCount
reasonCodes[]
guidance[]
approvedAt
appliedAt
rollbackPackId
```

## Stable ReasonCodes

```text
missing_core_action
blank_frame_detected
transparent_frame_detected
off_canvas_frame_detected
background_not_removed
watermark_detected
loop_closure_failed
frame_delta_too_large
motion_amplitude_too_low
identity_drift_detected
style_inconsistent
cat_not_cute_enough
candidate_not_reviewed
candidate_rejected
provider_output_unusable
retry_budget_exceeded
better_photo_required
alternate_route_recommended
unsafe_field_detected
apply_blocked_non_approved_candidate
previous_pack_preserved
```

## Technical QA Rules

Reject when:

- any core action is missing；
- any required frame is blank / fully transparent；
- cat bounding box leaves viewport；
- forbidden URL/path/script field is detected；
- frame count is below action minimum；
- image size exceeds configured limit；
- non-app-managed file reference appears；
- background/watermark cannot be removed or safely accepted。

Recommended measurable thresholds for V22 implementation:

| Check | Minimum Rule | ReasonCode |
| --- | --- | --- |
| Core actions | all 8 required actions exist | `missing_core_action` |
| Required frames | loop/base action >= 6 frames; transient action >= 3 frames | `missing_core_action` |
| Nonblank | visible non-transparent pixel ratio >= 1% per frame | `blank_frame_detected` |
| Transparency | frame cannot be fully transparent | `transparent_frame_detected` |
| Bounding box | visible subject must stay inside canvas with >= 2px margin at source scale | `off_canvas_frame_detected` |
| Background | non-transparent background must be accepted by explicit style policy or rejected | `background_not_removed` |
| Unsafe fields | no URL, path traversal, absolute path, script/event handler, shell command | `unsafe_field_detected` |

## Motion QA Rules

Reject when:

- running/success/need_input/warning/error have no visible pose difference；
- adjacent frame delta causes flicker or sudden jump；
- loop/base action first and final frames do not close；
- body anchor drifts beyond threshold；
- more than 25% of actions are static or near-static；
- sleeping/running/need_input cannot be understood by a human reviewer。

Recommended measurable thresholds for V22 implementation:

| Check | Minimum Rule | ReasonCode |
| --- | --- | --- |
| Motion amplitude | running / success / need_input / warning / error must have visible pose delta above idle jitter baseline | `motion_amplitude_too_low` |
| Near-static actions | no more than 25% of core actions can be static or near-static | `motion_amplitude_too_low` |
| Frame delta | adjacent frame displacement must not create obvious pop/flicker | `frame_delta_too_large` |
| Loop closure | loop/base first-final delta must be within closure tolerance | `loop_closure_failed` |
| Anchor drift | body anchor must stay stable unless action explicitly moves | `frame_delta_too_large` |
| Human readability | action label must be visually guessable from representative frames | `motion_amplitude_too_low` |

## Visual Review Rules

Visual review is required after technical and motion QA. It can be manual first, automated later.

Reviewer decisions:

```text
approve
reject
request_retry
switch_route
ask_better_photo
```

Reject examples:

- cat looks ugly or not installable；
- generated pet lacks character；
- same pack looks like multiple different cats；
- too mechanical / template-like；
- style does not match requested direction；
- user would not reasonably want to use it as a desktop pet。

Minimum review record:

```text
candidateId
reviewerKind: operator | user | automated-assisted
decision
reasonCodes[]
commentSummary
reviewedAt
```

The review record must not contain full local paths, prompt private text, raw
provider response, raw photo bytes, token, Authorization, EXIF/GPS, or private
filenames.

## Retry Policy

Default:

- route attempt limit: 2；
- total attempt limit: 6；
- repeated same reason twice: use repair or switch route；
- repeated provider output unusable: recommend local rig / motion sheet route；
- repeated photo-related failure: ask for better photo。

## Apply Enforcement

Rules:

- `approved` candidate can apply；
- `visual_review_required` cannot apply；
- `technical_failed` cannot apply；
- `motion_failed` cannot apply；
- `visual_rejected` cannot apply；
- failed apply must preserve previous active pack；
- apply must be target-only；
- default and unrelated pets must remain unchanged。

## Evidence Output Contract

Each V22 evidence file should include:

- candidate summary table；
- status transition table；
- rejected fixture table；
- approved fixture table if available；
- representative contact sheet or screenshot；
- reasonCode table；
- retry/guidance result；
- apply/rollback result where relevant；
- security scan；
- claim scan。

Final HTML evidence must embed visual examples directly, not only link to them.
