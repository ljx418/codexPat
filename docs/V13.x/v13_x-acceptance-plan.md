# V13 Acceptance Plan

日期：2026-06-08  
状态：passed scoped。  

## V13.1 Scope Freeze Acceptance

- V13 PRD exists and identifies V13 as beta distribution/user-ready closure.
- Allowed and forbidden claims are documented.
- Active docs point to V13 as the passed scoped beta closure stage.
- V12 remains scoped accepted baseline and is not renamed as V13 evidence.
- Drawio gap document shows V13 target/current architecture difference.
- `docs/V13.x/v13_x-implementation-contract.md` exists and defines phase evidence, reasonCodes, diagnostics boundaries, stability thresholds, and final HTML structure.

## V13.2 Packaging Foundation Acceptance

- Local macOS package/build smoke completes or records a hard blocker.
- Packaged app launches in the tested local environment.
- First launch does not require terminal-only hidden steps.
- Signing, notarization, and auto-update are documented as checklist/planned unless real evidence exists.
- Evidence includes command/result summary but no full local paths, tokens, raw payloads, or config paths.
- Evidence file: `docs/V13.x/evidence/v13_2-packaging-smoke-YYYY-MM-DD.md`.

## V13.3 First-run User Journey Acceptance

- User can understand the product from first-run screen/settings without reading internal phase docs.
- A visible desktop cat appears and is captured in screenshot-backed evidence.
- User can navigate to Codex work-cat onboarding.
- Recommended JSONL wrapper command is shown/copyable.
- Managed TUI hooks path explains `/hooks review/trust`.
- Already-open Codex window auto-monitoring is explicitly unsupported.
- Default and unrelated pets are not changed by onboarding preview or guide.
- Evidence file: `docs/V13.x/evidence/v13_3-first-run-user-journey-YYYY-MM-DD.md`.

## V13.4 Diagnostics Export Acceptance

- Diagnostics export can be generated from user-facing path or documented CLI fallback.
- Export contains useful version, environment, window, renderer, asset, and recent diagnostic reasonCode summaries.
- Export does not contain token, Authorization, raw payload, prompt text, tool command text, workspace path, config path, full `/Users` path, `api-token.json`, shell history, clipboard, or screen contents.
- Redaction scan passes on exported archive/files.
- Evidence file: `docs/V13.x/evidence/v13_4-diagnostics-export-redaction-YYYY-MM-DD.md`.

## V13.5 Stability / Performance Acceptance

- Long-run animation baseline is recorded.
- Multi-cat scenario remains visible and responsive.
- CPU/memory baseline is recorded with environment notes.
- Cat remains visible after app focus changes and settings open/close.
- No blank/transparent/off-canvas regression is observed in evidence captures.
- Minimum shape: 10-minute run or documented shorter smoke with environment reason, at least 3 pets, start/end screenshots, and CPU/memory sample.
- Evidence file: `docs/V13.x/evidence/v13_5-stability-performance-baseline-YYYY-MM-DD.md`.

## V13.6 Artifact / License / Claim Hygiene Acceptance

- `git status --short` is recorded.
- `dist/`, `target/`, `node_modules/`, generated temporary capture folders, and provider raw outputs are not staged for commit.
- Asset licenses/attribution for bundled/generated assets are present.
- Evidence files do not leak sensitive fields.
- Forbidden claims appear only in forbidden/not-ready/not-implied contexts.
- Evidence file: `docs/V13.x/evidence/v13_6-artifact-license-claim-hygiene-YYYY-MM-DD.md`.

## V13.7 Beta Readiness Gate

V13.7 may pass only if:

- V13.1-V13.6 reports are passed or explicitly blocked with scoped final decision.
- Packaging smoke, first-run journey, diagnostics export, stability baseline, artifact/license scan, security scan, and claim scan pass.
- Final HTML report embeds screenshots and result tables.
- Final claim uses the narrow allowed wording.
- Final report: `docs/V13.x/v13_7-final-acceptance-report.md`.
- Final HTML: `docs/V13.x/evidence/v13_7-beta-readiness-html-YYYY-MM-DD.html`.

Allowed final claim:

```text
V13 beta distribution and user-ready closure passed for tested local macOS beta workflow scenarios.
```

Forbidden:

```text
production signed release ready
notarized release ready
auto update ready
cross-platform ready
Windows ready
Petdex parity achieved
3D ready
automatic photo-to-3D ready
provider integration verified
OS-level Codex window binding ready
already-open Codex auto-monitoring ready
all Codex workflows verified
```
