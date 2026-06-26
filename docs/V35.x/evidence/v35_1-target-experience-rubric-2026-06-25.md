# V35.1 Target-Experience Rubric Evidence

Date: 2026-06-25

## PRD / Spec Review
- PRD: docs/active/agent_desktop_pet_prd_v35.md reviewed for V35.1 target-experience rubric.
- Spec: docs/V35.x/v35_1-target-experience-rubric-spec.md reviewed and mapped to this evidence.
- Boundary: named samples only; no arbitrary-cat, provider, production, Windows, or cross-platform readiness claim.

## Rubric Table
- Rubric ID: v35_target_experience_2d_action_asset
- Sample scope: named_samples_only
- Required actions: idle, walk, jump, sleep, eat, play, alert, celebrate
- Minimum distinct sample count: 2
- Minimum average local part motion: 0.74
- Minimum per-action local part motion: 0.55
- Minimum pose readability: 0.7
- Minimum expression or symbol score: 0.65
- Status scale: target_experience, engineering_only, blocked, failed
- Review method: automated_metrics_plus_human_visual_review

## Hard Non-Pass Examples
- simple line placeholder art
- whole-image transform only
- same pack reused across different cat identities
- missing target action
- unreadable action intent
- identity drift
- failed candidate entering preview/apply
- visual evidence missing

## Evidence Requirements
- contact_sheet
- playback_summary
- product_path_summary

## Decision
- Status: passed scoped
- Rationale: later candidates can be evaluated without inventing new V35 quality thresholds.
## Claim Scan
- Status: passed
- Hits: none

## Security Scan
- Status: passed
