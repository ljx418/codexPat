# Post-V30 Acceptance Plan

文档状态：active acceptance plan；Post-V30.1-Post-V30.5 passed scoped。
当前日期：2026-06-24。

## Acceptance Principle

Post-V30 accepts runtime and architecture remediation evidence, not intention.
Static checks, unit tests, and V30 semantic animation gate are required
baselines, but they do not replace real desktop runtime evidence.

Detailed execution order is controlled by:

- `docs/V30.x/post-v30-detailed-development-and-acceptance-plan.md`

Current execution decision:

| Phase | Decision | Constraint |
| --- | --- | --- |
| Post-V30.1 | passed scoped | real host-side Tauri runtime, bridge, petctl, and runtime smoke passed |
| Post-V30.2 | passed scoped | one local wrapper-launched managed workflow smoke passed against the running bridge |
| Post-V30.3 | passed scoped | FE-1 through FE-5 frontend slices have per-slice evidence, PRD/spec review, checks, and scans |
| Post-V30.4 | passed scoped | RS-1 through RS-6 have per-slice evidence; RS-5/RS-6 passed with real WSL frontend plus Windows Cargo runtime smoke |
| Post-V30.5 | passed scoped | final regression, real runtime smoke, managed smoke, PRD/spec review, claim scan, and security scan passed |

Documentation completeness is not acceptance evidence. Runtime, managed
workflow, slice, and final-gate claims require their own phase evidence.

## Acceptance Gates

| Phase | Gate | Required Evidence | Status |
| --- | --- | --- | --- |
| Post-V30.0 | fact-source sync | `post-v30-architecture-remediation-2026-06-23.md` | passed scoped |
| Documentation development | executable specs and templates | `post-v30-documentation-development-2026-06-23.md` | passed scoped |
| Post-V30.1 | runtime desktop smoke | `post-v30_1-runtime-desktop-smoke-2026-06-23.md` | passed scoped |
| Post-V30.2 | managed Codex workflow smoke | `post-v30_2-managed-codex-workflow-smoke-2026-06-23.md` | passed scoped |
| Post-V30.3 | frontend architecture slices | FE-1 through FE-5 evidence files dated 2026-06-23 | passed scoped |
| Post-V30.4 | Tauri / HTTP bridge architecture slices | RS-1 through RS-6 evidence plus `post-v30_4-tauri-bridge-slice-closure-2026-06-24.md` | passed scoped |
| Post-V30.5 | final remediation gate | `post-v30_5-final-remediation-gate-2026-06-24.md` | passed scoped |

## Required Baseline Commands

Every Post-V30 phase must run or explicitly justify why it cannot run:

```bash
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter desktop exec node --import tsx ../../scripts/v30_semantic_animation_gate_smoke.mjs
```

Runtime phases must also run their phase-specific commands:

- Post-V30.1: `docs/active/post-v30-runtime-smoke-spec.md`
- Post-V30.2: `docs/active/post-v30-managed-codex-smoke-spec.md`

## User Experience Gates

Acceptance must include what the user or maintainer can actually experience:

| Phase | User-visible or maintainer-visible target experience |
| --- | --- |
| Post-V30.1 | The desktop pet app is running, the local bridge answers health checks, and `petctl` can list instances, send a notification, and return sanitized diagnostics. |
| Post-V30.2 | A managed local Codex workflow can drive the running bridge in one wrapper-launched scenario without exposing prompt, command, token, terminal, or path data. |
| Post-V30.3 | Frontend refactor work is no longer a vague large-module task; each UI or asset workflow slice has a named boundary, tests, risks, and evidence before code movement. |
| Post-V30.4 | Tauri/runtime/HTTP bridge refactor work has named route, auth, diagnostics, instance, event, and startup boundaries before code movement. |
| Post-V30.5 | The reviewer can tell exactly what passed, what was blocked, what remains unready, and which claims are still forbidden. |

## PRD / Spec Review

Each phase evidence must confirm:

- It matches `docs/active/agent_desktop_pet_prd_post_v30.md`.
- It does not expand `docs/active/agent_desktop_pet_prd_v30.md`.
- It uses the matching execution spec or architecture slice template.
- Post-V30.3 uses `docs/active/post-v30-frontend-architecture-slices.md`.
- Post-V30.4 uses `docs/active/post-v30-tauri-bridge-architecture-slices.md`.
- It records `passed scoped`, `blocked`, or `failed` explicitly.

## Claim Scan

Forbidden ready claims may appear only in forbidden / not-ready / must-not-claim contexts:

- Petdex parity achieved；
- automatic photo-to-animation ready for arbitrary cats；
- provider integration verified；
- all Codex workflows verified；
- OS-level Codex window binding ready；
- MCP ready；
- Claude Code integration verified；
- 3D ready；
- production signed release ready；
- Windows ready；
- cross-platform ready。

## Security Scan

Evidence must not contain:

- token；
- Authorization value；
- raw HTTP payload；
- raw provider response；
- raw JSONL；
- raw prompt；
- raw command text；
- TTY；
- terminal title；
- raw photo bytes；
- EXIF/GPS；
- full local path；
- workspace path；
- config path；
- `api-token.json` contents。

## Exit Conditions

Post-V30.5 may pass only if:

- Post-V30.1 and Post-V30.2 have passed or are explicitly blocked with stable reasons.
- Architecture slice specs exist for planned frontend and Tauri/HTTP bridge code movement.
- Baseline tests/checks pass.
- PRD/spec review passes.
- Claim scan passes.
- Security scan passes.
- Final evidence states the narrowest allowed claim.

Post-V30.5 must block if:

- desktop runtime cannot be started or reached from the test environment;
- managed Codex smoke cannot run because Codex CLI or bridge is unavailable;
- architecture slice specs are missing before code movement;
- evidence would require forbidden ready claims.
