# V6.1 Release / Distribution Foundation Smoke

status: passed

date: 2026-05-30

## Scope

This evidence covers local macOS packaging foundation, first-run guidance, permission explanation, and sanitized diagnostics export boundary.

It does not cover signed release, notarized release, installer readiness, auto-update readiness, Windows, or cross-platform distribution.

## Packaging Smoke

| Check | Result |
| --- | --- |
| desktop unit tests | passed |
| desktop typecheck | passed |
| desktop build | passed |
| cargo check | passed |
| Tauri local app bundle build | passed |

Safe artifact metadata:

| Field | Value |
| --- | --- |
| productName | Agent Desktop Pet |
| version | 0.1.0 |
| bundleIdentifier | com.agentdesktoppet.desktop |
| buildFlavor | local_unsigned |
| artifactType | macOS app bundle |

The generated bundle path is intentionally not recorded in this evidence file.

## First-Run Guide Review

Passed.

The settings UI now includes V6.1 first-run guidance covering:

- local Event Bridge health.
- Codex Work-Cat recommended JSONL path.
- managed TUI hooks trust requirement.
- already-open Codex auto-monitoring limitation.
- local asset import safety.
- diagnostics export preview.

## Permission Text Review

Passed.

The settings UI explains:

- basic pet display and wrapper-launched JSONL monitoring do not need terminal text access.
- optional Accessibility / Automation permissions only apply to OS-level probe/binding experiments.
- denied optional permissions must degrade safely.
- diagnostics must not collect terminal text, prompt text, tool command text, workspace paths, credentials, clipboard contents, or screen contents.

## Diagnostics Export Boundary

Passed.

The settings UI now shows a previewable diagnostics export summary with:

- schema version.
- product name and version.
- build flavor.
- local bridge health summary.
- runtime instance count.
- imported pack count.
- last event summary by safe level/source-kind/reason-code only.
- redaction booleans.

The diagnostics export does not include raw events, local full paths, prompt text, tool command text, provider response, or credential values.

## Signing / Notarization / Auto-Update Boundary

Passed as checklist-only.

V6.1 records release checklist items for signing identity, notarization workflow, Gatekeeper note, installer strategy, and updater requirements. None of these are implemented or accepted as ready in V6.1.

## Security Scan

Passed.

The generated diagnostics export test fixture rejects local full paths, credential-like strings, raw event markers, and config-file references.

## Claim Scan

Passed.

Allowed claim:

```text
V6.1 release and distribution foundation passed for tested local macOS packaging scenarios.
```

Forbidden claims remain not-ready:

```text
production signed release ready
notarized release ready
signed release ready
auto update ready
installer ready
cross-platform ready
Windows ready
```

