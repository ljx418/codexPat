# V6 Remaining Development and Acceptance Plan

status: closure-plan

date: 2026-05-31

## Summary

V6.0 through V6.9 are scoped accepted for tested local macOS developer workflow scenarios.

There are no remaining V6 feature implementation subphases. Remaining V6 work is limited to closure hygiene: evidence review, PRD conformance review, regression reruns, security scan, claim scan, license/artifact scan, and commit readiness review.

This plan must not create an additional V6 phase or expand V6 into production release, Windows/cross-platform, real provider generation, production 3D readiness, MCP readiness, third-party product verification, or OS-level already-open Codex monitoring.

## Current State

| Area | Status | Evidence |
| --- | --- | --- |
| V6.0 Productization Scope Freeze | passed scoped | `docs/V6.0/v6_0-final-acceptance-report.md` |
| V6.1 Release / Distribution Foundation | passed scoped | `docs/V6.1/v6_1-final-acceptance-report.md` |
| V6.2 Codex Work-Cat Product UX | passed scoped | `docs/V6.2/v6_2-final-acceptance-report.md` |
| V6.3 Runtime Imported Pack Rendering | passed scoped | `docs/V6.3/v6_3-final-acceptance-report.md` |
| V6.4 Asset Manager Product UX | passed scoped | `docs/V6.4/v6_4-final-acceptance-report.md` |
| V6.5 Photo-Guided Personalization | passed scoped | `docs/V6.5/v6_5-final-acceptance-report.md` |
| V6.6 Provider Feasibility / Consent | passed scoped | `docs/V6.6/v6_6-final-acceptance-report.md` |
| V6.7 Visual QA / Renderer Hardening | passed scoped | `docs/V6.7/v6_7-final-acceptance-report.md` |
| V6.8 Agent / Third-party Developer Productization | passed scoped | `docs/V6.8/v6_8-final-acceptance-report.md` |
| V6.9 Productization Gate | passed scoped | `docs/V6.9/v6_9-final-acceptance-report.md` |

Allowed final V6 claim:

```text
V6 productization acceptance passed for tested local macOS developer workflow scenarios.
```

## Remaining V6 Work

### Closure Hygiene

The remaining V6 work is:

1. Verify V6 active docs, V6.x docs, and V6.9 final report agree that V6.0-V6.9 are passed scoped.
2. Verify V6 Productization Gate is not described as production signed release readiness.
3. Verify no V6 document opens a new V6 implementation phase.
4. Verify evidence links resolve to local docs/evidence.
5. Rerun regression checks and runtime smoke where a fresh acceptance snapshot is required.
6. Run security, claim, license, and artifact scans.
7. Review git status for project-scoped changes and generated artifacts.

If any closure hygiene check fails, V6.9 must be treated as blocked until the failing phase-specific evidence or document is corrected. Do not create an additional fallback phase under V6.

### Explicitly Out Of Scope For V6

The following items require separate post-V6 planning and acceptance:

- production signing, notarization, auto-update, and public release distribution.
- Windows or cross-platform support.
- real external provider upload/generation smoke.
- automatic photo-to-3D generation.
- production 3D renderer readiness.
- Rive or Live2D readiness.
- asset marketplace or remote asset loading.
- MCP readiness.
- real third-party product integration verification.
- Claude Code integration verification.
- OS-level already-open Codex window auto-monitoring.
- all Codex workflows verified.

## Post-V6 Track Split

| Future Track | Owns | V6 Relationship |
| --- | --- | --- |
| Release Track | signing, notarization, auto-update, installer, crash reporting | Builds on V6.1 but requires independent acceptance |
| Platform Track | Windows, Linux, cross-platform packaging | Not covered by V6 |
| Provider / Personalization Track | explicit-consent provider upload, real generation, photo-to-asset workflow | Builds on V6.5/V6.6 but no provider claim is made by V6 |
| Renderer Track | production 3D, Rive, Live2D, performance budgets | Builds on V6.7 but no 3D ready claim is made by V6 |
| Integration Maturity Track | MCP ready, third-party product verification, SDK maturity | Builds on V6.8 but no MCP/third-party ready claim is made by V6 |
| OS Integration Track | already-open Codex discovery, routing, monitoring feasibility | Separate from wrapper-managed V6 Codex UX |

## Development Plan

No new V6 feature development is planned.

Implementation work allowed under this closure plan:

- update documentation that incorrectly implies V6 is still in planning.
- update evidence links if a moved or missing document is found.
- correct forbidden claim wording when it appears outside forbidden/not-ready contexts.
- update closure evidence after rerunning checks.

Implementation work not allowed under this closure plan:

- add a new runtime feature.
- add a new UI workflow.
- add a new provider or upload path.
- change V3/V4 Codex monitoring semantics.
- change V5 asset validation or renderer security boundaries except to fix a regression found by V6 closure checks.
- claim production distribution, cross-platform, provider, MCP, 3D, or OS-level binding readiness.

## Acceptance Plan

### Documentation Consistency

Required result: passed.

Checks:

```bash
rg -n "Go for V6\\.0|Go for V6\\.1|Go for V6\\.2|Go for V6\\.3|V6 Productization Gate remains No-Go|No-Go for V6 Productization Gate" docs/active docs/V6.x docs/V6.9 --glob '!v6_remaining_development_and_acceptance_plan_2026-05-31.md'
```

Expected result: no matches.

Required review files:

- `docs/V6.x/v6_x-development-plan.md`
- `docs/V6.x/v6_x-acceptance-plan.md`
- `docs/V6.x/v6_x-claim-matrix.md`
- `docs/V6.x/v6_x-productization-gate-plan.md`
- `docs/V6.9/v6_9-final-acceptance-report.md`
- `docs/active/agent_desktop_pet_prd_v6.md`
- `docs/active/current-vs-target-gap.md`

### Regression Baseline

Required result: passed, except documented environment-only warnings from `pnpm run doctor`.

Commands:

```bash
pnpm run doctor
pnpm --filter @agent-desktop-pet/pet-protocol check
pnpm --filter @agent-desktop-pet/pet-protocol test
pnpm --filter @agent-desktop-pet/petctl test
pnpm --filter @agent-desktop-pet/pet-mcp check
pnpm --filter @agent-desktop-pet/pet-mcp test
pnpm --filter desktop test
pnpm --filter desktop check
pnpm --filter desktop build
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm --filter desktop tauri build -b app
```

Doctor warnings for network access or sandboxed port binding are non-blocking only when the final result says no hard failures.

### Runtime Smoke

Required result: passed.

Commands:

```bash
node scripts/v3_1_runtime_smoke.mjs
node scripts/v3_2_mcp_adapter_smoke.mjs
node scripts/v3_2_third_party_contract_smoke.mjs
node scripts/v3_7_codex_exec_jsonl_monitor_smoke.mjs
node scripts/v4_4_managed_session_smoke.mjs
node scripts/v4_5_managed_tui_preflight_smoke.mjs
node scripts/v5_12_runtime_imported_pack_smoke.mjs
node scripts/v5_13_guided_workflow_smoke.mjs
node scripts/v5_14_provider_feasibility_smoke.mjs
node scripts/v5_3_png_nonblank_smoke.mjs docs/V5.x/evidence/v5_1-sprite-visual-fixture-2026-05-28.png
node scripts/v5_3_png_nonblank_smoke.mjs docs/V5.x/evidence/v5_15-imported-orange-tabby-visual-fixture-2026-05-30.png
```

Run instance-limit smoke sequentially rather than in parallel. Parallel smoke can temporarily consume shared PetInstance capacity and create false failures in hard-limit assertions.

### Security Scan

Required result: passed.

Evidence, docs, smoke output, screenshots, and diagnostic exports must not leak:

```text
token
Authorization
raw payload
raw hook payload
raw JSONL payload
prompt text
tool command text
terminal text
shell history
screen contents
clipboard contents
transcript_path
full /Users path
workspace path
config path
api-token.json
photo raw bytes
EXIF/GPS
provider credential
raw provider response
```

Allowed matches are only in redaction, forbidden, not-collected, or scan-policy contexts.

### Claim Scan

Required result: passed.

Forbidden ready claims must only appear in forbidden, not-ready, no-go, or not-implied contexts:

```text
production signed release ready
cross-platform ready
Windows ready
all Codex workflows verified
OS-level Codex window binding ready
already-open Codex auto-monitoring ready
MCP ready
Third-party agent integration verified
Claude Code integration verified
photo customization ready
automatic photo-to-3D ready
provider integration verified
remote generation ready
3D ready
Rive ready
Live2D ready
asset marketplace ready
```

### License / Attribution / Artifact Scan

Required result: passed.

Checks:

```bash
git ls-files | rg '(^|/)(node_modules|dist|target)/'
git diff --check --
git status --short -- .
```

Expected:

- no tracked `node_modules`, `dist`, or `target` artifacts.
- no whitespace errors.
- generated build outputs may exist locally but must not be staged or committed.
- asset evidence retains license/attribution notes for bundled, generated, and fixture assets.

## Final Decision Rule

V6 closure remains passed only when:

- V6.0-V6.9 final reports exist and are scoped passed.
- V6.9 final report remains the only Productization Gate decision.
- all regression and smoke checks pass.
- no security leakage is found.
- no forbidden claim appears as ready.
- no generated artifacts are tracked for commit.

If a high-risk drift or false-green issue is found, stop and revise the affected phase-specific plan or evidence before making any new claim.
