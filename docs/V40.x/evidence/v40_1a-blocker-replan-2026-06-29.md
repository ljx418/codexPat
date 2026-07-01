# V40.1A Blocker Replan

Date: 2026-06-29

## Trigger

V40.1A WebUI Aki smoke produced real blocked evidence:
`docs/V40.x/evidence/v40_1a-webui-aki-smoke-2026-06-29.md`.

## PRD / Spec Review

- Current PRD: `docs/active/agent_desktop_pet_prd_v40.md`.
- Target architecture: `docs/V40.x/v40-target-architecture.md`.
- Phase spec: `docs/V40.x/v40-phase-specs.md`.
- V40.1A must prove scriptable WebUI API/model access before any WebUI-generated
  asset or quality claim.
- V40.2/V40.3 cannot start from the current blocked state unless the route is
  explicitly narrowed to accepted manual/import assets.

## Blocked Reason

- GPU: available.
- Ollama advisory boundary: available.
- Local WebUI checkpoint summary: available.
- Safe output directory contract: available.
- WebUI API: unavailable.
- WebUI Python runtime: incompatible.
- Generation attempted: false.

The launch diagnostic indicates the WebUI runtime is using a Python version that
cannot install the pinned torch version required by the local WebUI package. The
diagnostic is not treated as generation evidence and no raw command transcript,
absolute path, raw payload, raw prompt, or generated image is retained here.

## Risk Closure Options

| Option | Action | Benefit | Cost / Risk | Decision |
| --- | --- | --- | --- | --- |
| Fix WebUI runtime | Recreate or point WebUI to a Python 3.10-compatible environment, then launch with API enabled and rerun V40.1A. | Preserves active no-Comfy WebUI route. | Requires local environment repair outside project code; may consume time/GPU. | Recommended next |
| Use a running external WebUI API | Start WebUI manually with API enabled and set `V40_WEBUI_AKI_API_URL` before rerunning smoke. | Fast if user already has a working WebUI service. | Still requires real API/model proof; cannot skip smoke. | Acceptable |
| Narrow to manual/import route | Supply source-bound high-quality same-sample assets and continue V40.2 under `manual_import_no_comfy`. | Avoids WebUI runtime blocker. | Does not prove automatic WebUI generation; final claim must name import route. | Conditional fallback |
| Keep blocked | Stop V40 implementation until local tool prerequisites are repaired. | Avoids false pass. | No asset-generation progress. | Safe fallback |

## Acceptance Re-entry Criteria

Before V40.2 or V40.3 can resume:

- `scripts/v40_1a_webui_aki_smoke.mjs` must pass scoped against a real WebUI
  API/model boundary; or
- V40 route must be explicitly narrowed to accepted manual/import assets with
  source, consent, retention, and visual evidence boundaries.

## Claim Scan

- Status: passed.
- Hits: none.

## Security Scan

- Status: passed.
- Hits: none.

## Decision

- Status: blocked.
- Current implementation must stop at V40.1A.
- Next recommended action: repair WebUI Python/runtime/API boundary and rerun
  V40.1A smoke.
