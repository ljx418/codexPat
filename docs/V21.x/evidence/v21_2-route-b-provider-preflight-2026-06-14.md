# V21.2 Route B Provider Preflight Evidence

status: passed
date: 2026-06-14

## Scope

V21.2 classifies provider families for alternate route exploration. It does not
call providers in this run and does not prove provider integration. MiniMax
remains a candidate-limited provider because V20 proved real outputs but V20.3
blocked direct 8x9 normalization.

## Provider Matrix

| Provider | Family | Evidence basis | Reference image | Image-to-image | Image-to-video | Alpha/background | Credential | Verdict | ReasonCode |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MiniMax | mainland_image_generation | project_v20_real_reference_image_outputs | true | true | false | false | present | candidate_limited | direct_sheet_output_blocked |
| Seedream / Jimeng family | mainland_reference_image_or_image_editing_candidate | public_capability_review_only | candidate_unverified | candidate_unverified | unknown | unknown | missing | candidate_unverified | credential_and_contract_missing |
| Kling / Kuaishou family | image_to_video_candidate | public_capability_review_only | candidate_unverified | unknown | candidate_unverified | unknown | missing | candidate_unverified | credential_and_contract_missing |
| Tongyi Wanxiang family | image_editing_candidate | public_capability_review_only | unknown | candidate_unverified | unknown | unknown | missing | candidate_unverified | credential_and_contract_missing |

## Results

| Check | Result | Details |
| --- | --- | --- |
| V21.0 evidence exists | passed | V21.2 requires V21.0 scope-freeze evidence |
| V21.2 spec exists | passed | provider preflight spec |
| MiniMax plus two alternative provider families classified | passed | MiniMax:candidate_limited, Seedream / Jimeng family:candidate_unverified, Kling / Kuaishou family:candidate_unverified, Tongyi Wanxiang family:candidate_unverified |
| MiniMax scoped evidence boundary | passed | V20 MiniMax output exists but direct 8x9 sheet remains blocked |
| no unconsented live smoke | passed | Route B did not call any provider; live smoke requires credential, consent, cost/privacy/retention/license boundary |
| safe matrix fields only | passed | matrix has safe booleans/enums, no credential values or raw payload |
| security scan | passed | no token, Authorization, raw request/response, raw photo bytes, full local path, prompt private text |
| claim scan | passed | Route B review does not imply provider integration verified or V21 final passed |

## PRD / Spec Review

Route B serves V21 by preventing another single-provider dead end. This evidence
classifies candidates and explicitly avoids live smoke without credentials,
consent, cost/privacy/retention/license disclosures, and accepted output
handling. Route B alone cannot satisfy V21 final passed.

## Drift / False-green Risk

| Risk | Severity | Decision |
| --- | --- | --- |
| Provider review treated as final product evidence | High | blocked; final requires route output QA + preview/apply/rollback |
| MiniMax V20 output treated as direct provider success | High | blocked; marked candidate_limited |
| Alternative provider capabilities overclaimed | Medium | marked candidate_unverified without live smoke |

## Allowed Claim

V21 alternate provider capability review completed with scoped go/no-go decisions.

## Forbidden Claims

- provider integration verified
- arbitrary cats automatic photo-to-animation ready
- low-retry provider reliability for arbitrary cats
- V21 final passed
- Petdex parity achieved
