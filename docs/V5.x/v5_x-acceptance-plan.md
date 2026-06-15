# V5.x Acceptance Plan

status: productization-gate-passed-scoped

date: 2026-05-30

## Acceptance Principle

V5.x cannot pass by only showing the existing CSS cat profiles.

Every renderer or asset claim must have visual evidence, security evidence, and regression evidence. A 3D prototype does not imply Rive, Live2D, user upload, marketplace, or photo customization readiness.

V5.11-V5.15 extend the accepted CLI pipeline into productized local import, runtime rendering, guided personalization, provider consent, and visual QA. Each phase requires its own acceptance report before the associated claim can move from planned to passed.

V5.11 is accepted for local Desktop Manager import UI only. V5.12 is accepted for runtime imported-pack rendering in tested local PetInstance scenarios. V5.13 is accepted for local prompt and import-instruction generation only. V5.14 is accepted feasibility-only and does not verify a provider integration. V5.15 is accepted for tested bundled/imported visual QA scenarios.

V5.x Productization Gate is accepted for scoped local productization only. External provider generation and production signed release readiness remain not ready.

Historical V5.x baseline evidence must be described as `V5.x scoped renderer/import pipeline baseline passed`. The future final gate is `V5.x Productization Gate`; no baseline report may imply Productization Gate has passed.

## Required Gates

| Gate | Required Result |
| --- | --- |
| Asset manifest validation | Valid packs load; invalid packs fail safely. |
| Core action coverage | `idle`, `thinking`, `running`, `success`, `warning`, `error`, `need_input`, `sleeping` have accepted visual behavior. |
| Fallback behavior | Missing optional action falls back to `idle` and records warning. |
| Renderer isolation | Renderer consumes safe action IDs only, not raw Agent payloads. |
| Window behavior | Transparent window, drag, scale, and position persistence still work. |
| Performance | CPU/GPU usage and memory remain acceptable on target macOS hardware. |
| Security scan | No external paths, URLs, scripts, shell commands, or raw Agent payloads in asset packs. |
| Claim scan | Forbidden asset claims appear only in forbidden / not-ready contexts. |
| License / attribution | Bundled assets have recorded license and attribution. |
| Visual evidence index | Screenshots or recordings are indexed per renderer and core action. |

## Manual Visual Scenarios

1. Switch through every core state and confirm the animation is visually distinct.
2. Confirm `thinking` and `running` are low-distraction loops.
3. Confirm `error` and `need_input` are obvious enough to notice.
4. Confirm `success` does not override an active `error` state incorrectly.
5. Confirm drag remains smooth while the renderer is animating.
6. Confirm hidden/minimized pets do not waste renderer work.
7. Confirm switching asset packs does not reset unrelated instance state.

## Required Regression

V5.x must preserve:

```bash
node scripts/v3_1_runtime_smoke.mjs
node scripts/v3_7_codex_exec_jsonl_monitor_smoke.mjs
node scripts/v4_4_managed_session_smoke.mjs
node scripts/v4_5_managed_tui_preflight_smoke.mjs
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop check
pnpm --filter desktop build
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Additional renderer-specific smoke should be added when implementation begins.

## Required Evidence

Planned files:

- `docs/V5.x/v5_0-asset-system-freeze.md`
- `docs/V5.x/v5_0-asset-manifest-schema.md`
- `docs/V5.x/v5_0-security-boundary.md`
- `docs/V5.x/v5_0-architecture-design.md`
- `docs/V5.x/v5_1-sprite-asset-pack-v2-evidence-YYYY-MM-DD.md`
- `docs/V5.x/v5_1-visual-regression-YYYY-MM-DD.md`
- `docs/V5.x/v5_2-renderer-plugin-interface-evidence-YYYY-MM-DD.md`
- `docs/V5.x/v5_3-gltf-3d-prototype-evidence-YYYY-MM-DD.md`
- `docs/V5.x/v5_3-performance-baseline-YYYY-MM-DD.md`
- `docs/V5.x/evidence/v5_4-3d-action-pack-evidence-2026-05-28.md`
- `docs/V5.x/evidence/v5_5-renderer-selection-smoke-2026-05-28.md`
- `docs/V5.x/v5_x-final-visual-evidence-index.md`
- `docs/V5.x/v5_x-final-security-scan.md`
- `docs/V5.x/v5_x-final-claim-scan.md`
- `docs/V5.x/v5_x-final-acceptance-report.md`
- `docs/V5.x/evidence/v5_11-import-ui-smoke-YYYY-MM-DD.md`
- `docs/V5.x/evidence/v5_11-import-ui-smoke-2026-05-28.md`
- `docs/V5.x/v5_11-final-acceptance-report.md`
- `fixtures/manual/v5_11/README.md`
- `docs/V5.x/evidence/v5_12-runtime-imported-pack-rendering-smoke-YYYY-MM-DD.md`
- `docs/V5.x/evidence/v5_13-photo-guided-workflow-smoke-YYYY-MM-DD.md`
- `docs/V5.x/evidence/v5_14-provider-adapter-smoke-YYYY-MM-DD.md`
- `docs/V5.x/evidence/v5_15-visual-quality-action-qa-YYYY-MM-DD.md`

## Forbidden Claims Before Final Acceptance

```text
Rive / Live2D / 3D ready
bundled 3D action pack ready
photo customization ready
user asset upload ready
remote asset download ready
custom asset pack import ready
asset marketplace ready
production signed release ready
automatic photo-to-3D ready
provider integration verified
remote asset loading ready
```

## Per-phase Acceptance Rules

- V5.0 may pass with schema, validator, fallback, and security tests only; it does not imply visual readiness.
- V5.1 may pass with bundled 2D sprite evidence only; it does not imply GLTF/3D readiness.
- V5.2 may pass with renderer interface tests only; it does not imply any non-CSS renderer is ready.
- V5.3 may pass as a bundled GLTF prototype only; it does not imply 3D ready.
- V5.4 may pass for bundled 3D action clips only; it does not imply user import readiness or 3D production readiness.
- V5.5 may pass for explicit local renderer selection only; it does not imply custom import readiness.
- V5.11 may pass for local import UI only; it does not imply runtime rendering of imported packs.
- V5.12 may pass for runtime local imported pack rendering only after clean manual visual evidence exists; it does not imply provider generation.
- V5.13 may pass for guided prompt and import-instruction generation only; it does not imply automatic photo-to-3D.
- V5.14 may pass only with explicit consent and separate provider evidence; feasibility alone is not provider integration verified.
- V5.15 may pass for visual QA only; it does not imply production signed release readiness.

## Remaining V5 Acceptance Gates

| Phase | Required Evidence | Manual Acceptance | Claim Boundary |
| --- | --- | --- | --- |
| V5.12 | runtime smoke, screenshots, P0 GLTF/GLB deep scan result, sanitized renderer payload snapshot | target imported sprite/GLTF pack renders, default and unrelated pets unchanged, restart mapping restores, fallback visible | local runtime imported rendering only |
| V5.13 | prompt workflow smoke, privacy review closure, redaction scan | user can generate prompt/import instructions without default photo upload | guided instructions only, no automatic photo-to-3D |
| V5.14 | feasibility report or explicit-consent provider smoke evidence | consent/cost/privacy/retention/license shown before any upload | no provider integration verified |
| V5.15 | visual recordings/screenshots, nonblank check, performance baseline | all core actions readable and stable at required scales | visual QA only, no release readiness |
| V5.x Productization Gate | final acceptance report, evidence index, security scan, claim scan, license scan | end-to-end tested local import -> activation -> runtime rendering, with V5.13/V5.14 included only if accepted | scoped productization only |

V5.x Productization Gate must remain blocked until V5.12 passes, V5.13 passes or is explicitly excluded, V5.14 passes or is explicitly excluded, V5.15 passes, and forbidden claims appear only in forbidden/not-ready contexts.

## V5.12 P0 Runtime Evidence Requirements

V5.12 must not pass unless evidence proves:

- imported pack activation to a specified PetInstance.
- imported sprite and imported GLTF runtime rendering.
- only target PetInstance uses imported visuals.
- default and unrelated pets remain unchanged.
- restart restores PetInstance active pack mapping.
- invalid pack, corrupt frame, and corrupt GLB fallback to CSS.
- renderer kind mismatch returns a stable error and no partial render.
- two pets using the same imported pack do not share mutable renderer state.
- GLTF/GLB deep scan rejects remote URI schemes, external `.bin` / image references, absolute paths, traversal, unknown required extensions, over-limit complexity, and unaccepted action clip names.
- renderer input snapshot contains only safe action ID, renderer kind, safe profile/pack IDs, playback intent, scale, and visibility.

V5.12 evidence must never include raw GLTF JSON chunks, raw manifest paths, prompt text, photo metadata, provider payloads, tokens, Authorization, workspace path, config path, full local path, or raw Agent / Codex / terminal / MCP / HTTP payload.
