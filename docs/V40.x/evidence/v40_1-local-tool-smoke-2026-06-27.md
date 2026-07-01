# V40.1 Local Tool Smoke Evidence

Date: 2026-06-27

## Development And Acceptance Plan
- Phase: V40.1 local tool smoke.
- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.
- Phase spec: docs/V40.x/v40-phase-specs.md.
- Objective: verify whether the local hybrid tool route is scriptable before any candidate generation phase.

## PRD / Spec Review
- V40 target remains local hybrid candidate generation followed by normalization, same-sample V39 comparison, product preview, target-only apply, rollback, visual evidence, and scans.
- V40.1 does not prove generation quality, product path readiness, or final asset acceptance.
- V39 remains the quality baseline and fallback.

## Real Tool Probe Summary
- GPU status: available.
- GPU summary: local_gpu_available.
- Ollama status: available.
- Ollama model summary: gemma4:26b.
- Comfy status: blocked.
- Comfy mode: none.
- Comfy local install indicator: detected.
- Reason codes: gpu_available, ollama_available, comfy_api_unavailable, comfy_cli_unavailable, comfy_install_detected_but_not_scriptable, tool_smoke_blocked.

## User-Visible Impact
- If this phase is blocked, V40 cannot honestly continue to automated local candidate generation.
- A blocked result still reduces risk by proving which local boundary must be fixed before asset generation.

## Claim Scan
- Status: passed.
- Hits: none.

## Security Scan
- Status: passed.
- Hits: none.

## Decision
- Status: blocked.
- Next phase: V40.2 may start only if V40.1 passed, or if the route is explicitly narrowed to an accepted import/manual route.
