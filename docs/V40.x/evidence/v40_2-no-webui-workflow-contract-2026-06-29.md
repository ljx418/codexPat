# V40.2 No-WebUI Workflow Contract Evidence

Date: 2026-06-29

## Development And Acceptance Plan
- Phase: V40.2 No-WebUI workflow contract.
- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.
- Phase spec: docs/V40.x/v40-phase-specs.md.
- Pre-development audit: docs/V40.x/evidence/v40_2-no-webui-workflow-contract-predev-audit-2026-06-29.md.
- Development scope: safe run requests, candidate summaries, product gate summaries, reason codes, claim scan, and security scan.

## PRD / Spec Review
- V40.1A Direct Local Runner smoke passed scoped.
- This phase defines contracts only; it does not generate assets.
- WebUI and ComfyUI remain historical blocked routes, not active dependencies.

## Contract Results
- Safe run request: accepted.
- Unsafe run request: failed; reasons action_set_invalid, baseline_ref_invalid, raw_path_leak_detected, remote_url_rejected, source_ref_invalid.
- Safe candidate summary: accepted.
- Malformed candidate summary: blocked; reasons action_coverage_invalid.
- Safe product gate: accepted.
- Blocked product gate: blocked; reasons product_preview_not_ready, rollback_failed, target_apply_failed.

## Claim Scan
- Status: passed.
- Hits: none.

## Security Scan
- Status: passed.
- Hits: none.

## Decision
- Status: passed scoped.
