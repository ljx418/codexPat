# V40.3R5 Direct Runner Predev Audit Evidence

Date: 2026-07-01

## Decision
- Status: passed scoped.
- Scope: pre-generation audit only.
- V40.4 entry: No-Go.

## PRD / Spec Review
- V40.3R4 selected constrained `new_direct_runner_route_allowed`.
- R5 may only prove or block pre-generation readiness.
- R6 may start only when R5 is `passed scoped`.
- This evidence does not accept any generated asset and does not prove product readiness.

## Sample Matrix
- v38_a_cat_public: tested_cat; license usable; source docs/V38.x/evidence/assets/v38_a_cat_public/sanitized.png; baseline /v39/v38_a_cat_public/contact-sheet.svg; reasons v38_public_sanitized_derivative_ready, source_ref_exists_or_not_required, baseline_ref_exists_or_not_required.
- v38_tuxedo_public: tested_cat; license usable; source docs/V38.x/evidence/assets/v38_tuxedo_public/sanitized.png; baseline /v39/v38_tuxedo_public/contact-sheet.svg; reasons v38_public_sanitized_derivative_ready, source_ref_exists_or_not_required, baseline_ref_exists_or_not_required.
- v38_negative_dog_public: negative_or_blocked; license blocked; source none; baseline none; reasons negative_non_cat_rejected, source_ref_exists_or_not_required, baseline_ref_exists_or_not_required.

## Local Model / Control Inventory
- Model summary: dreamshaper-8-local-checkpoint.
- python_wrapper: available; label v40-runner-venv-python; reasons python_wrapper_available.
- torch: available; label torch; reasons torch_available.
- diffusers: available; label diffusers; reasons diffusers_available.
- local_checkpoint: available; label dreamshaper-8-local-checkpoint; reasons local_checkpoint_available.
- identity_conditioner: available; label ip-adapter-sd15; reasons identity_conditioner_available.
- image_io: available; label PIL; reasons image_io_available.

## Mask / Crop Plans
- v38_a_cat_public: subject_centered_square_crop; subject_silhouette_or_alpha_hint; preview docs/V38.x/evidence/assets/v38_a_cat_public/sanitized.png; reasons subject_mask_crop_plan_defined, raw_photo_bytes_not_recorded.
- v38_tuxedo_public: subject_centered_square_crop; subject_silhouette_or_alpha_hint; preview docs/V38.x/evidence/assets/v38_tuxedo_public/sanitized.png; reasons subject_mask_crop_plan_defined, raw_photo_bytes_not_recorded.

## Identity Anchor Packs
- v38_a_cat_public: soft gray brown coat, subtle tabby mask, medium striped tail, green eyes; reasons identity_anchor_pack_defined, same_cat_requirement_defined.
- v38_tuxedo_public: black and white tuxedo coat, white muzzle, white chest, dark curved tail; reasons identity_anchor_pack_defined, same_cat_requirement_defined.

## Action Pose Condition Packs
- idle: centered full-body cat, relaxed standing or sitting, tiny breathing-ready pose; fallback rejected whole_image_transform.
- walk: side-readable full-body cat, alternating paw intent, tail counter-balance; fallback rejected whole_image_transform.
- jump: crouch-to-airborne full-body cat, clear vertical motion intent; fallback rejected whole_image_transform.
- sleep: curled single cat, closed-eye sleeping silhouette, no duplicate subject; fallback rejected whole_image_transform.
- eat: head dip toward small bowl, front paws braced, body remains cat-like; fallback rejected whole_image_transform.
- play: front paw raised, playful tail curve, readable toy/play energy without extra subjects; fallback rejected whole_image_transform.
- alert: ears up, wide eyes, tense body, readable surprise pose; fallback rejected whole_image_transform.
- celebrate: happy upright or lifted expression, tail arc, positive completion pose; fallback rejected whole_image_transform.

## Action Name Mapping
- idle -> idle
- thinking -> alert
- running -> walk
- success -> celebrate
- warning -> alert
- error -> alert
- need_input -> alert
- sleeping -> sleep

## Safe Runner Invocation
- Runner: v40_direct_diffusers_frame_runner.
- Route: direct_local_runner_no_webui.
- Output dir ref: docs/V40.x/evidence/assets/v40-3r6-controlled-candidates.
- Generation allowed for next phase: yes.
- Redaction: safe relative refs only; unredacted prompt text, unredacted runner request bodies, binary image content, source photo bytes, local absolute paths, and terminal transcripts are not written to evidence.

## Visual Review Rubric
- Reject photo-card output.
- Reject identity drift.
- Reject weak action semantics.
- Reject unsafe artifacts.
- Require desktop-scale readability.
- Require preference over same-sample V39.

## Claim Scan
- Status: passed.
- Hits: none.

## Security Scan
- Status: passed.
- Hits: none.

## Final Phase Result
- Decision: passed scoped.
- Reason codes: v40_3r5_predev_audit_passed_scoped.
