# V27 Retry Cost Guidance Smoke Evidence

status: passed
date: 2026-06-16

## Scope

V27 verifies route retry budgets, repeated-failure repair guidance, provider
credential/consent/cost/privacy/retention/license gates, and user-facing next
steps. It does not create assets, call a provider, apply a pack, or run the V28
final gate.

## Results

| Check | Result | Details |
| --- | --- | --- |
| V26 prerequisite evidence exists and passed | passed | docs/V23-V28.x/evidence/v26-pack-preview-apply-smoke-2026-06-16.md |
| retry budget enforced | passed | alternate_route_recommended, cost_time_disclosure_ready, live_pet_unchanged, previous_pack_preserved, retry_budget_exhausted, stop_and_keep_current_pet, total_budget_exhausted |
| repeated reason requires repair before retry | passed | cost_time_disclosure_ready, live_pet_unchanged, previous_pack_preserved, repeated_reason_requires_repair |
| provider route blocked without consent, credential, and disclosures | passed | alternate_route_recommended, live_pet_unchanged, previous_pack_preserved, provider_consent_required, provider_cost_disclosure_required, provider_credential_missing, provider_execution_blocked, provider_license_disclosure_required, provider_privacy_disclosure_required, provider_retention_disclosure_required |
| budget exhaustion shows actionable next step | passed | repair_generation_strategy, stop_keep_current_pet, switch_route |
| better-photo guidance is actionable | passed | use_single_cat_photo |
| previous visible pet remains unchanged | passed | previousPackPreserved=true; livePetMutationAttempted=false |
| desktop target test passed | passed | retry-cost-failure-guidance.test.ts passed |
| security scan | passed | no credential, auth header, private file identifiers, provider body, image bytes, geodata |
| claim scan | passed | forbidden claims are not used as passed |

## Guidance Summary

| Scenario | Status | Reason codes | Next actions |
| --- | --- | --- | --- |
| repeated same reason | repair_required | cost_time_disclosure_ready, live_pet_unchanged, previous_pack_preserved, repeated_reason_requires_repair | repair_generation_strategy |
| budget exhausted | budget_exhausted | alternate_route_recommended, cost_time_disclosure_ready, live_pet_unchanged, previous_pack_preserved, retry_budget_exhausted, stop_and_keep_current_pet, total_budget_exhausted | repair_generation_strategy, stop_keep_current_pet, switch_route |
| provider blocked | provider_blocked | alternate_route_recommended, live_pet_unchanged, previous_pack_preserved, provider_consent_required, provider_cost_disclosure_required, provider_credential_missing, provider_execution_blocked, provider_license_disclosure_required, provider_privacy_disclosure_required, provider_retention_disclosure_required | add_provider_credential, review_provider_terms, switch_route |
| better photo | retry_allowed | better_photo_required, cost_time_disclosure_ready, live_pet_unchanged, previous_pack_preserved, retry_allowed | use_single_cat_photo |

## PRD / Spec Review

V27 satisfies the PRD requirement that repeated failures must not blindly retry,
provider routes must not start without consent/credential/disclosures, exhausted
budgets must show actionable next steps, and the previous visible pet remains
unchanged.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Repeated failure silently retries | High | blocked by repeated_reason_requires_repair |
| Provider route starts without consent/credential/disclosure | High | providerExecutionStarted=false |
| Budget exhaustion keeps trying | High | budget_exhausted with switch/stop guidance |
| Guidance mutates live pet | High | livePetMutationAttempted=false |

## Allowed Claim

V27 retry, cost, and failure guidance passed for tested local failure and provider-gate scenarios.

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for arbitrary cats
- arbitrary cats automatic photo-to-animation ready
- provider integration verified
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved
- 3D ready
- production signed release ready
