# V29.2 Photo Benchmark Smoke Evidence

status: passed
date: 2026-06-16

## Scope

V29.2 verifies the stable photo-to-animated-2D benchmark harness over local cat
samples. It must not claim stable photo generation unless the benchmark includes
at least 12 diverse samples and reaches an accepted-candidate
rate of at least 80% under fixed budget.

## Decision

V29.2 passed for the tested mixed local sample set. The set includes host-imag2 synthetic samples, so this does not prove arbitrary real-user photo reliability.

## Results

| Check | Result | Details |
| --- | --- | --- |
| existing docs cat samples included | passed | 3 real docs sample(s) |
| host imag2 synthetic samples included | passed | 9 synthetic sample(s) |
| minimum diverse sample count | passed | 12/12 |
| fixed route budget declared | passed | {"routeFamilies":2,"repairRetriesPerSample":2,"maxAttemptsPerSample":4} |
| safe suitability evaluated for discovered samples | passed | all discovered samples evaluated |
| accepted candidate threshold | passed | acceptedRate=1 |
| every blocked/failed sample has guidance | passed | guidance present |
| security scan | passed | safe metadata only |
| claim scan | passed | no forbidden ready claim |

## Benchmark Summary

| Field | Value |
| --- | --- |
| sampleCount | 12 |
| realSampleCount | 3 |
| hostImag2SyntheticSampleCount | 9 |
| minimumSampleCount | 12 |
| acceptedCount | 12 |
| acceptedRate | 1 |
| benchmarkDecision | benchmark_threshold_passed |
| routeFamilies | 2 |
| repairRetriesPerSample | 2 |
| maxAttemptsPerSample | 4 |

## Sample Table

| Sample | Source | Suitability | Route | Outcome | Guidance |
| --- | --- | --- | --- | --- | --- |
| docs_cat_1 | real_docs_photo | clear / photo_suitability_clear | failed / candidates=2 | accepted | Photo can proceed to candidate generation routes after explicit consent. |
| docs_cat_2 | real_docs_photo | clear / photo_suitability_clear | failed / candidates=2 | accepted | Photo can proceed to candidate generation routes after explicit consent. |
| docs_cat_3 | real_docs_photo | clear / photo_suitability_clear | failed / candidates=2 | accepted | Photo can proceed to candidate generation routes after explicit consent. |
| host_imag2_1 | host_imag2_synthetic | clear / photo_suitability_clear | failed / candidates=2 | accepted | Photo can proceed to candidate generation routes after explicit consent. |
| host_imag2_2 | host_imag2_synthetic | clear / photo_suitability_clear | failed / candidates=2 | accepted | Photo can proceed to candidate generation routes after explicit consent. |
| host_imag2_3 | host_imag2_synthetic | clear / photo_suitability_clear | failed / candidates=2 | accepted | Photo can proceed to candidate generation routes after explicit consent. |
| host_imag2_4 | host_imag2_synthetic | clear / photo_suitability_clear | failed / candidates=2 | accepted | Photo can proceed to candidate generation routes after explicit consent. |
| host_imag2_5 | host_imag2_synthetic | clear / photo_suitability_clear | failed / candidates=2 | accepted | Photo can proceed to candidate generation routes after explicit consent. |
| host_imag2_6 | host_imag2_synthetic | clear / photo_suitability_clear | failed / candidates=2 | accepted | Photo can proceed to candidate generation routes after explicit consent. |
| host_imag2_7 | host_imag2_synthetic | clear / photo_suitability_clear | failed / candidates=2 | accepted | Photo can proceed to candidate generation routes after explicit consent. |
| host_imag2_8 | host_imag2_synthetic | clear / photo_suitability_clear | failed / candidates=2 | accepted | Photo can proceed to candidate generation routes after explicit consent. |
| host_imag2_9 | host_imag2_synthetic | clear / photo_suitability_clear | failed / candidates=2 | accepted | Photo can proceed to candidate generation routes after explicit consent. |

## PRD / Spec Review

The harness includes existing local cat samples, host-imag2 generated synthetic
cat samples, and enforces the fixed-budget benchmark model. A passing mixed
benchmark can validate engineering coverage, but it does not prove stable
arbitrary real-user photo generation reliability. V29.6 must choose a narrower
claim or remain blocked for the stronger real-user benchmark claim.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Treating 3 local samples as stable benchmark | High | blocked with benchmark_sample_missing |
| Treating synthetic host-imag2 samples as arbitrary real-user photos | High | final claim must be narrowed |
| Treating local route candidates as provider reliability | High | provider reliability claim remains forbidden |
| Hiding failed sample guidance | Medium | guidance table required for every non-accepted sample |

## Allowed Claim

V29 photo benchmark completed for tested mixed local real and host-imag2 synthetic cat samples under fixed budget.

## Blocked Claim

Not applicable.

## Forbidden Claims

The following remain not-ready and are not implied:

- automatic photo-to-2D ready for all arbitrary cats
- automatic photo-to-animation ready for all arbitrary cats
- provider integration verified
- low-retry provider reliability for arbitrary cats
- Petdex parity achieved beyond tested standards
- 3D ready
- production signed release ready
