# V40.1A Direct Local Runner Smoke Evidence

Date: 2026-06-29

## Development And Acceptance Plan
- Phase: V40.1A Direct Local Runner smoke.
- Controlling PRD: docs/active/agent_desktop_pet_prd_v40.md.
- Phase spec: docs/V40.x/v40-phase-specs.md.
- Pre-development audit: docs/V40.x/evidence/v40_1a-direct-runner-predev-audit-2026-06-29.md.
- Development scope: verify no-WebUI direct runner dependency, local model, safe output, GPU, and Ollama advisory boundaries.
- Out of scope: image generation, action packaging, product apply, WebUI, ComfyUI, provider integration, production readiness.

## PRD / Spec Review
- V40 active PRD reviewed.
- V40 target architecture reviewed.
- V40 implementation contract reviewed.
- Boundary: no WebUI or ComfyUI active runtime dependency.
- Boundary: this phase cannot claim high-quality generated 2D action assets.

## Real Command Results
- GPU status: available.
- GPU summary: local_gpu_available.
- Python status: available.
- Required dependency summary: torch=available, diffusers=available, transformers=available, safetensors=available, PIL=available, numpy=available.
- Direct model summary: anything-v5.
- Safe output directory status: ready.
- Safe output directory ref: docs/V40.x/evidence/assets/v40-direct-runner-candidates.
- Ollama status: available.
- Ollama model summary: gemma4:26b.
- Generation attempted: false.

## User-Visible Impact
- Users still cannot expect V40 no-WebUI generated action assets from this phase.
- The project now has a scoped, sanitized direct-runner readiness gate.
- Later candidate generation remains blocked unless missing direct-model dependencies are installed in a project-controlled environment.

## Claim Scan
- Status: passed.
- Hits: none.

## Security Scan
- Status: passed.
- Hits: none.

## Decision
- Status: passed scoped.
- Reason codes: gpu_available, python_available, direct_runner_dependency_available, direct_runner_model_available, safe_output_dir_ready, ollama_available, direct_runner_ready, v40_1a_direct_runner_passed_scoped.

## Next Phase Gate
- V40.2 is No-Go until V40.1A passes or the route is explicitly narrowed to accepted manual/import assets.
- Current evidence does not satisfy V40.2 entry criteria if the decision is blocked.
