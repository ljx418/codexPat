# V40.1A Direct Local Runner Pre-Development Audit

Date: 2026-06-29

## Controlling PRD / Spec

- PRD: `docs/active/agent_desktop_pet_prd_v40.md`
- Target architecture: `docs/V40.x/v40-target-architecture.md`
- Phase spec: `docs/V40.x/v40-phase-specs.md`
- Implementation contract: `docs/V40.x/v40-implementation-contract.md`
- Acceptance plan: `docs/V40.x/v40-acceptance-plan.md`

## Phase Objective

Verify whether the revised V40 no-WebUI route has a project-owned Direct Local
Runner boundary that can safely report GPU, Python dependency, local model,
safe output directory, and Ollama advisory readiness.

This phase does not generate final action assets and does not claim asset
quality.

## Files In Scope

- `apps/desktop/src/assets/v40-direct-local-runner.ts`
- `apps/desktop/src/assets/v40-direct-local-runner.test.ts`
- `scripts/v40_1a_direct_runner_smoke.mjs`
- `apps/desktop/package.json`
- `docs/V40.x/evidence/v40_1a-direct-runner-smoke-2026-06-29.md`

## Files Out Of Scope

- WebUI and ComfyUI adapters or launch scripts.
- Product UI wiring for V40 candidates.
- Candidate generation, normalization, visual report, and final V40 gate.
- Any provider/cloud integration.

## Real Environment Facts Before Development

- GPU probe: RTX 4090 with 24564 MiB is visible through `nvidia-smi`.
- Python probe: `python3` is available.
- Python direct-model dependency probe: `torch`, `diffusers`, `transformers`,
  and `safetensors` are currently missing in the WSL Python environment.
- Local model file probe: at least one local Stable Diffusion checkpoint name is
  discoverable from a historical local tool directory, but the active route must
  not depend on WebUI/ComfyUI runtime services.

## Pass / Block / Fail Criteria

Pass only if:

- GPU summary is available.
- Python is available.
- required direct runner dependencies are available.
- at least one local model/checkpoint summary is available.
- safe output directory reference is valid.
- claim and security scans pass.

Block if:

- required direct runner dependencies are unavailable;
- local model/checkpoint is missing;
- GPU is unavailable;
- Python runner cannot start;
- safe output directory cannot be represented as a safe relative reference.

Fail if:

- evidence leaks raw prompt, raw runner payload, raw generated image bytes, raw
  photo bytes, full local path, token, Authorization value, or credential path;
- smoke claims image/action quality without generated candidate evidence;
- WebUI/ComfyUI is treated as an active runtime dependency.

## Audit Opinion

No fatal or major specification deviation is open for V40.1A implementation.
The expected realistic outcome is likely `blocked` until direct-model Python
dependencies are installed in a project-controlled environment.

## Decision

Proceed to V40.1A smoke implementation only.
