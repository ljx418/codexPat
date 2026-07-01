# V40.1A WebUI Aki Smoke Evidence

Date: 2026-06-29

## Development And Acceptance Plan
- Phase: V40.1A WebUI Aki smoke.
- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.
- Phase spec: docs/V40.x/v40-phase-specs.md.
- Objective: verify the scriptable WebUI Aki API/model boundary before any candidate generation or quality claim.
- Audit opinion before implementation: no fatal or major specification deviation; this phase must stop as blocked if WebUI API is unavailable.

## PRD / Spec Review
- V40 active route is no-Comfy WebUI Aki candidate generation with V39 same-sample comparison and product gates.
- This phase does not generate image candidates and does not prove asset quality.
- Ollama is advisory only and cannot approve assets.
- ComfyUI remains a historical blocked route, not an active V40 dependency.
- V39 A2++ remains baseline and fallback.

## Real Tool Probe Summary
- GPU status: available.
- GPU summary: local_gpu_available.
- Ollama status: available.
- Ollama model summary: gemma4:26b.
- WebUI API status: unavailable.
- WebUI model status: available.
- WebUI model summary: anything-v5.
- WebUI Python runtime status: incompatible.
- Safe output directory contract: ready.
- Safe output directory reference: docs/V40.x/evidence/assets/v40-webui-candidates.
- Generation attempted: false.
- Reason codes: gpu_available, ollama_available, webui_api_unavailable, webui_python_runtime_incompatible, webui_model_available, webui_safe_output_dir_ready, webui_generation_not_attempted, v40_1a_smoke_blocked.

## User-Visible Impact
- If blocked, users still cannot expect V40 WebUI-generated high-quality action assets.
- Later candidate generation may start only after WebUI API/model smoke passes or the route is explicitly narrowed to accepted manual/import assets.

## Claim Scan
- Status: passed.
- Hits: none.

## Security Scan
- Status: passed.
- Hits: none.

## Decision
- Status: blocked.
- Next phase: V40.2 may start only if this phase passed scoped, or if the route is explicitly narrowed to accepted import/manual assets.
