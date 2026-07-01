# V40.3R4 Candidate Source Replan Development And Acceptance Plan

Date: 2026-07-01

## Objective

V40.3R4 is a documentation-only route replan gate inside the existing V40
stage. It follows the V40.3R3 `remain_failed_or_blocked` decision and must not
start product code, normalize candidates, or claim V40 image-to-action asset
quality.

The goal is to define a credible next candidate source before implementation
resumes. V40.4 remains No-Go until a later implementation produces at least two
same-sample candidates that pass explicit visual review.

## Current Facts

- V40.1A Direct Local Runner smoke passed scoped.
- V40.2 no-WebUI workflow contract passed scoped.
- V40.3 prompt-only candidates failed explicit visual review.
- V40.3R img2img candidates failed explicit visual review.
- V40.3R2 identity-conditioned candidates and stylized retry failed explicit
  visual review.
- V40.3R3 recorded `remain_failed_or_blocked`.
- The 2026-07-01 host synthetic cat image plus deterministic template GIF probe
  is process-only evidence and is not accepted V40 image-to-action evidence.
- V39 remains the product fallback.

## Route Options Reviewed

| Route | Entry Requirement | Main Risk | V40.4 Entry Condition |
| --- | --- | --- | --- |
| Materially different direct runner | predev audit proves new identity/action controls not present in failed routes | another model-quality failure | two same-sample candidates pass explicit visual review |
| Source-bound manual/professional import | source, license, sample binding, and visual acceptance evidence exist before implementation | cannot prove automatic generation | two imported same-sample candidates pass explicit visual review |
| Hybrid assisted route | human/model-assisted edits have source boundary, edit provenance, and visual acceptance | route may be manual-heavy and not automatic | two same-sample candidates pass explicit visual review and final claim names the route |
| No credible route | none | target remains unmet | keep V40 failed/blocked with V39 fallback |

Selected route: `new_direct_runner_route_allowed`.

Reason: manual/professional import assets have not been supplied with
source/license/sample-binding evidence, WebUI/ComfyUI are explicitly excluded,
and failed prompt-only/img2img/identity-conditioned outputs cannot be reused.
The only route that can still pursue the V40 target without overclaiming is a
constrained direct local runner route with source records, subject mask/crop
planning, identity anchors, action pose conditions, candidate quality review,
and V39 same-sample comparison.

## Required Documentation Updates

- PRD and target architecture must name V40.3R4 as the next documentation gate.
- Active gap, active development plan, and active acceptance plan must no longer
  call V40.3R3 `next planned`.
- Development and acceptance documents must keep V40.4-V40.7 No-Go.
- Drawio must remain Chinese, parse as XML, use no more than eight pages, and
  show concrete code/document/evidence entities.
- Evidence checklist must require claim/security scans and explicit rejection of
  host synthetic template GIFs as V40 pass evidence.
- Add `docs/V40.x/v40_3r4-route-decision-and-predev-audit.md` as the controlling
  route decision for later automation.

## Acceptance Criteria

Pass documentation readiness only if:

- V40.3R3 is consistently recorded as blocked scoped with
  `remain_failed_or_blocked`;
- V40.3R4 is consistently recorded as the next documentation-only route replan;
- `new_direct_runner_route_allowed` is recorded as the selected route and is
  constrained by predev audit before implementation;
- the selected or blocked route has sample, source/license, visual review, and
  evidence requirements;
- no document unlocks V40.4 without two explicit visual-review passes;
- claim scan and security scan pass;
- drawio XML parses and has no more than eight Chinese pages.

Block if:

- no route can be specified without high false-pass risk.

Fail if:

- any document treats process-only checks, host synthetic template GIFs, or
  failed V40.3/V40.3R/V40.3R2 outputs as accepted V40 assets;
- any document implies arbitrary-cat automation, Petdex parity, provider
  verification, WebUI/ComfyUI readiness, production readiness, Windows
  readiness, or cross-platform readiness.

## Required Evidence

Create:

```text
docs/V40.x/evidence/v40_3r4-documentation-readiness-2026-07-01.md
```

The evidence must include:

- updated document list;
- drawio page count and page names;
- PRD/spec review;
- claim scan result;
- security scan result;
- final Go/No-Go decision.

## Remaining Development Path After Documentation Acceptance

V40.3R4 documentation acceptance does not start product code and does not unlock
V40.4. The remaining implementation must proceed in this order:

1. V40.3R5 Direct Runner Predev Audit.
   Prove source/license records, sample matrix, local model/control availability,
   mask/crop plans, identity anchors, action pose controls, safe runner
   invocation, and visual review rubric. If any required prerequisite is missing,
   record blocked/failed and keep V39 fallback.
2. V40.3R6 Controlled Candidate Frame Generation.
   Run one bounded generation attempt only after V40.3R5 passes. Produce
   candidate frame sequences, candidate quality review, blocked/negative sample
   evidence, and same-sample V39 comparison. If fewer than two same-sample
   candidates pass explicit visual review, V40.4 remains No-Go.
3. V40.4 Normalization And Action Packaging.
   Start only from accepted V40.3R6 candidates. Normalize safe manifests and
   eight-action coverage.
4. V40.5 Product Preview / Apply / Rollback.
   Expose only accepted normalized candidates to product UI.
5. V40.6 Visual Report.
   Produce Chinese HTML evidence with screenshots/rendered artifacts and honest
   failed/blocked status.
6. V40.7 Final Gate.
   Run baseline commands, PRD/spec review, claim scan, security scan, and produce
   a scoped passed/blocked/failed decision.

This path is complete enough to guide later automation because each step has an
entry gate, required evidence, pass/block/fail decision, and a No-Go condition
for false quality claims.
