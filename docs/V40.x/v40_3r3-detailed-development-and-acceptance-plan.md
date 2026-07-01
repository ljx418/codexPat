# V40.3R3 Detailed Development And Acceptance Plan

Date: 2026-06-30

## Objective

V40.3R3 decides the next credible candidate source after V40.3R2 failed visual
review. It is an in-place V40 gate, not V41 and not runtime code work by itself.

The phase may end in one of three decisions:

- `accepted_manual_import_first`;
- `new_direct_runner_route_allowed`;
- `remain_failed_or_blocked`.

V40.3R3 cannot claim V40 image-to-action asset generation is ready. V40.4 remains
No-Go until at least two same-sample candidates pass explicit visual review.

## Development Sequence

1. Read controlling docs:
   - `docs/active/agent_desktop_pet_prd_v40.md`;
   - `docs/V40.x/v40-target-architecture.md`;
   - `docs/V40.x/v40-phase-specs.md`;
   - `docs/V40.x/v40-implementation-contract.md`;
   - `docs/V40.x/v40-evidence-and-scan-checklist.md`.
2. Audit failed evidence:
   - V40.3 prompt-only candidate generation;
   - V40.3R img2img recovery;
   - V40.3R2 identity-conditioned repair and stylized retry.
3. Check candidate-source availability:
   - manual/import assets with source, license, sample binding, and visual
     acceptance evidence;
   - materially different direct-runner route with new identity/action controls;
   - otherwise no credible source.
4. Record one route decision in evidence:
   - chosen decision;
   - rejected alternatives and reasons;
   - next-phase entry criteria;
   - claim/security scan results.
5. Update active docs only if the audit finds a contradiction or missing gate.

## Acceptance Criteria

### Pass As V40.3R3 Documentation / Route Decision

Pass only if:

- exactly one route decision is recorded;
- V40.3/V40.3R/V40.3R2 failures are acknowledged;
- V40.4 entry remains locked behind two explicitly visually accepted candidates;
- source/license/sample-binding requirements are explicit for manual/import;
- material difference requirements are explicit for any new direct-runner route;
- claim scan and security scan pass.

### Block

Block if:

- no accepted manual/import assets exist;
- no materially different direct-runner route is available;
- the phase cannot inspect required prior evidence.

### Fail

Fail if:

- the plan repeats V40.3R2 failed outputs as accepted inputs;
- tool readiness is treated as asset quality;
- the plan implies arbitrary-cat automation, Petdex parity, provider readiness,
  WebUI/ComfyUI readiness, production readiness, Windows readiness, or
  cross-platform readiness;
- evidence requires raw prompts, raw payloads, raw image bytes, raw photo bytes,
  full local paths, token values, or Authorization values.

## Route Evaluation Matrix

| Route | Entry Requirement | Development Allowed After Pass | Exit Risk |
| --- | --- | --- | --- |
| `accepted_manual_import_first` | Two same-sample source-bound assets with source/license/sample-binding/visual acceptance evidence | V40.4 normalization against those assets only | Does not prove automatic arbitrary-cat generation |
| `new_direct_runner_route_allowed` | Predev audit proves materially different identity controls, full-body action controls, and visual acceptance strategy | A new bounded candidate generation attempt before V40.4 | High risk of another visual failure |
| `remain_failed_or_blocked` | No credible source exists | No V40.4 work; V39 fallback remains active | V40 target experience remains unmet |

## Required Evidence

Create or update:

- `docs/V40.x/evidence/v40_3r3-candidate-source-decision-YYYY-MM-DD.md`;
- `docs/V40.x/evidence/v40_3r3-documentation-support-audit-YYYY-MM-DD.md`;
- claim/security scan notes in the route-decision evidence.

The evidence must include:

- route decision;
- prior evidence audit;
- candidate-source availability;
- pass/block/fail decision;
- next-phase entry criteria;
- explicit no-claim list.

## Next-Phase Gate

This historical V40.3R3 plan has been superseded by V40.3R4/R5/R6 for current
execution. V40.4 may start only after:

- V40.3R4 records the constrained selected route;
- V40.3R5 direct-runner predev audit passes scoped;
- V40.3R6 controlled candidate frame generation produces at least two
  same-sample candidates that pass explicit visual review.

If those conditions are not met, V40 must stay failed/blocked with V39 fallback.
