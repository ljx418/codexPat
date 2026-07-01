# V40.2 No-WebUI Workflow Contract Pre-Development Audit

Date: 2026-06-29

## Controlling PRD / Spec

- PRD: `docs/active/agent_desktop_pet_prd_v40.md`
- Phase spec: `docs/V40.x/v40-phase-specs.md`
- Implementation contract: `docs/V40.x/v40-implementation-contract.md`
- V40.1A evidence: `docs/V40.x/evidence/v40_1a-direct-runner-smoke-2026-06-29.md`

## Entry Criteria Review

- V40.1A Direct Local Runner smoke: passed scoped.
- WebUI and ComfyUI: historical blocked evidence only, not active dependencies.
- Next work: define safe no-WebUI request, candidate, product-gate, and reason
  code contracts before generation starts.

## Files In Scope

- `apps/desktop/src/assets/v40-no-webui-workflow-contract.ts`
- `apps/desktop/src/assets/v40-no-webui-workflow-contract.test.ts`
- `scripts/v40_2_no_webui_workflow_contract_smoke.mjs`
- `apps/desktop/package.json`
- `docs/V40.x/evidence/v40_2-no-webui-workflow-contract-2026-06-29.md`

## Files Out Of Scope

- Actual image generation.
- Candidate normalization.
- Product UI wiring.
- Visual report and final gate.

## Pass / Block / Fail Criteria

Pass only if:

- safe run request fixtures pass;
- unsafe raw paths, remote URLs, raw prompts, raw runner payloads, malformed
  action coverage, and missing sample binding are rejected;
- candidate summaries and product gate summaries only expose safe fields;
- claim and security scans pass.

Block if:

- V40.1A evidence becomes unavailable or the route must be narrowed before code.

Fail if:

- unsafe candidate data can reach V40.3;
- contract tests require WebUI/ComfyUI;
- evidence leaks sensitive values.

## Audit Opinion

No fatal or major specification deviation is open. Continue to V40.2 contract
implementation.
