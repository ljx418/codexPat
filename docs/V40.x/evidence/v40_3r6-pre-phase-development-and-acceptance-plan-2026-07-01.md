# V40.3R6 Pre-Phase Development And Acceptance Plan

Date: 2026-07-01

## Objective
Run one bounded direct local candidate generation attempt only after V40.3R5 passed scoped.

## Entry Check
- V40.3R5 evidence: docs/V40.x/evidence/v40_3r5-direct-runner-predev-audit-2026-07-01.json.
- V40.3R5 passed scoped: yes.

## Development Plan
- Use only the R5-approved sample matrix and identity/action controls.
- Generate review candidates for the two tested public cat samples.
- Keep the negative sample blocked.
- Store only safe relative candidate refs and sanitized manifest summaries.
- Run conservative visual review before any normalization decision.

## Acceptance Plan
- Pass only if at least two same-sample candidates pass explicit visual review for identity, action readability, artifact safety, desktop scale, and preference over V39.
- Block if the audited runner cannot execute or no reviewable outputs are produced.
- Fail if outputs are not clearly better than V39, are single-image/card-like, weak in action semantics, unsafe, or identity-drifted.

## Audit Opinion
- R6 may run because R5 passed scoped.
- V40.4 remains No-Go unless R6 records at least two explicit visual passes.
