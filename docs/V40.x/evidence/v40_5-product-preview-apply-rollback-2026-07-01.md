# V40.5 Product Preview / Apply / Rollback Evidence

Date: 2026-07-01

## Decision
- Status: blocked.

## PRD / Spec Review
- V40.5 requires accepted V40.4 candidates.
- Current accepted V40.4 candidates: 0.
- Failed R6 candidates are not preview/apply candidates.

## Product Gate Summary
- Preview ready: false.
- Target-only apply ready: false.
- Rollback ready: true.
- Product gate validation: blocked; reasons product_preview_not_ready, target_apply_failed.

## Safety Result
- Previous active pack is preserved because no V40 candidate is applied.
- V40.6 may still create an honest visual report using failed candidate evidence.

## Scans
- Claim scan: passed.
- Security scan: passed.

## Final Phase Result
- Decision: blocked.
- Reason codes: v40_4_no_accepted_candidates, product_preview_not_ready, target_apply_blocked.
