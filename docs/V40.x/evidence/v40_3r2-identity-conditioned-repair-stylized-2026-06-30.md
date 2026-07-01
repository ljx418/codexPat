# V40.3R2 Identity-Conditioned Runner Repair Evidence

Date: 2026-06-30

## Development And Acceptance Plan
- Phase: V40.3R2 identity-conditioned Direct Local Runner repair.
- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.
- Phase spec: docs/V40.x/v40-phase-specs.md.
- Pre-development audit: docs/V40.x/evidence/v40_3r2-identity-runner-predev-audit-2026-06-30.md.
- Development scope: repair the no-WebUI IP-Adapter path using real V38 sanitized public cat samples.
- Out of scope: WebUI, ComfyUI, provider integration, Petdex parity, 3D readiness, production/platform readiness, and V40.4 unlock without visual review.

## PRD / Spec Review
- V40.3 prompt-only candidates failed visual review.
- V40.3R direct img2img candidates failed visual review.
- V40.3R identity-conditioned generation was previously blocked by runner-stack compatibility.
- V40.3R2 may unlock V40.4 only if at least two same-sample candidates pass explicit visual review.
- Selected model summary: dreamshaper-8-local-checkpoint; identity conditioner summary: ip-adapter-sd15.

## Real Candidate Results
- Generation status: generated.
- Generated candidate count: 2.
- Candidate refs: docs/V40.x/evidence/assets/v40-direct-ip-adapter-candidates-r2-stylized/v38-a-cat-public-contact-sheet.png, docs/V40.x/evidence/assets/v40-direct-ip-adapter-candidates-r2-stylized/v38-tuxedo-public-contact-sheet.png.
- Manifest ref: docs/V40.x/evidence/assets/v40-direct-ip-adapter-candidates-r2-stylized/manifest.json.
- Negative/blocked sample: v38-negative-non-cat; reasons negative_non_cat_rejected.
- Visual review ref: docs/V40.x/evidence/v40_3r2-identity-conditioned-stylized-visual-review-2026-06-30.json.

## Validation Results
- Candidate 1: accepted; reasons v40_no_webui_contract_passed.
- Candidate 2: accepted; reasons v40_no_webui_contract_passed.


## Visual Quality Review
- Candidate 1: failed; reasons visual_review_failed, action_semantics_unclear, text_or_logo_artifact, target_experience_quality_failed.
  - Observations: The stylized retry reduces some indoor room clutter, but the candidate still reads as semi-photographic generated cat images rather than a clean desktop-pet sprite action pack.; Multiple frames contain bright accessory-like artifacts around the mouth, chest, or body.; The eight action poses remain weak: eat, play, alert, and celebrate are not clearly readable as distinct action states.; The output is not reliably normalizable into a product action pack and is not clearly better than the V39 target-experience baseline..
- Candidate 2: failed; reasons visual_review_failed, action_semantics_unclear, text_or_logo_artifact, target_experience_quality_failed.
  - Observations: The stylized retry creates a more illustrated tuxedo cat, but action semantics are still not reliable across all eight actions.; Several frames include container, panel, or mark-like artifacts that would pollute a desktop-pet sprite pack.; Eat, play, alert, and celebrate do not read as robust action states at desktop-pet scale.; The candidate is visually more pleasant than the first retry but still fails the V40 requirement for accepted same-sample action assets..


## Claim Scan
- Status: passed.
- Hits: none.

## Security Scan
- Status: passed.
- Hits: none.

## Decision
- Status: failed.
- Reason: identity_conditioned_visual_target_experience_failed_or_missing.
- V40.4 gate: No-Go.
