# V6.0 Current Gap Analysis

status: v6-planning-ready

date: 2026-05-30

## Current Accepted Baseline

| Area | Status | Boundary |
| --- | --- | --- |
| Desktop pet foundation | passed | macOS local app baseline only. |
| Codex JSONL monitor | passed scoped | wrapper-launched `codex exec --json` only. |
| Managed TUI hooks | passed scoped | trusted wrapper-launched local scenario only. |
| OS-level discovery | passed feasibility/prototype scoped | not lifecycle monitoring. |
| Asset system and renderer | passed scoped | not production 3D / Rive / Live2D ready. |
| Personalized local import | passed scoped | no provider integration. |
| V5 Productization Gate | passed scoped local | no production signed release. |

## V6 Productization Gaps

| Gap | Current | V6 Target |
| --- | --- | --- |
| Release/distribution | local build/dev flow | packaged, guided, diagnosable macOS workflow |
| Codex work-cat UX | CLI/wrapper knowledge required | Desktop Manager onboarding and diagnostics |
| Asset management UX | scoped import/rendering works | preview, rollback, delete, rename, health |
| Photo-guided workflow | scoped prompt generation works | clearer product UX and privacy guardrails |
| Provider integration | feasibility-only | consent boundary, optional real smoke later |
| Renderer QA | scoped visual evidence | productized QA and performance hardening |
| Developer integration | contract smoke | docs, examples, diagnostics tooling |
| Governance | established per phase | V6-wide evidence, claim, and security discipline |

## Go / No-Go

Go for V6.1 planning and V6.2 planning.

No-Go for V6 Productization Gate, production signed release, provider integration, MCP ready, photo-to-3D, 3D ready, and cross-platform readiness.

