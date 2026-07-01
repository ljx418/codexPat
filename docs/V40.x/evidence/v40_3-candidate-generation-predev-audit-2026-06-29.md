# V40.3 Candidate Generation Pre-Development Audit

Date: 2026-06-29

## Controlling PRD / Spec

- PRD: `docs/active/agent_desktop_pet_prd_v40.md`
- Phase spec: `docs/V40.x/v40-phase-specs.md`
- Implementation contract: `docs/V40.x/v40-implementation-contract.md`
- V40.1A evidence: `docs/V40.x/evidence/v40_1a-direct-runner-smoke-2026-06-29.md`
- V40.2 evidence: `docs/V40.x/evidence/v40_2-no-webui-workflow-contract-2026-06-29.md`

## Entry Criteria Review

- V40.1A Direct Local Runner smoke: passed scoped after project-isolated Python
  dependencies were installed.
- V40.2 No-WebUI workflow contract: passed scoped.
- Local model summary: `anything-v5`.
- Route: `direct_local_runner_no_webui`.

## Files In Scope

- `scripts/v40_direct_runner_generate_candidates.py`
- `scripts/v40_3_candidate_generation_smoke.mjs`
- generated sanitized files under
  `docs/V40.x/evidence/assets/v40-direct-runner-candidates/`
- `docs/V40.x/evidence/v40_3-candidate-generation-2026-06-29.md`

## Files Out Of Scope

- Normalization into final runtime asset packs.
- Product UI preview/apply/rollback.
- Final V40 scoped pass.
- WebUI/ComfyUI/provider routes.

## Real Data Set

- Passing tested samples: `v38-a-cat-public`, `v38-b-cat-public`.
- Negative/blocked sample: `v38-negative-non-cat`.
- Baseline comparison reference: V39 same-sample evidence.

## Pass / Block / Fail Criteria

Pass only if:

- at least two sample-bound candidate character images are generated or imported;
- each candidate has safe relative output refs and safe candidate summary;
- one negative/blocked sample has a stable reason code;
- claim and security scans pass.

Block if:

- the local model cannot load;
- generation fails due memory/runtime/config dependency;
- no accepted manual/import assets are available after generation is blocked.

Fail if:

- outputs leak raw prompt, raw runner payload, raw image bytes, raw photo bytes,
  full local paths, tokens, or credentials;
- outputs bypass sample binding;
- evidence claims final quality before V40.4/V40.5.

## Audit Opinion

No fatal or major specification deviation is open. Continue to V40.3 candidate
generation attempt. A blocked result is acceptable if the local single-file
model cannot be loaded by the direct runner.
