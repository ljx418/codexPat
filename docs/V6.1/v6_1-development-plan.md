# V6.1 Release / Distribution Foundation Development Plan

status: planning-ready

date: 2026-05-30

## Goal

Create a macOS local release foundation that is understandable, diagnosable, and auditable without claiming production release readiness.

V6.1 is a foundation phase. It may prove local packaging and release-readiness planning, but it must not imply a notarized production release, automatic updates, cross-platform support, or Windows readiness.

## Development Content

### macOS local packaging foundation

- Define app identity fields: bundle id, app display name, version source, icon source, build flavor.
- Distinguish build labels:
  - development build.
  - local unsigned build.
  - signed build planned.
  - notarized build planned.
- Add or document a repeatable packaging smoke command using existing desktop/Tauri build flow.
- Record the produced local macOS artifact type and safe metadata only.

### First-run guide

Add a first-run guide plan or minimal UI copy covering:

- what the desktop pet does.
- local HTTP/Event Bridge and token safety boundary.
- Codex work-cat recommended start path.
- managed TUI hooks `/hooks` trust requirement.
- already-open Codex window limitation.
- asset import safety.
- diagnostics entry point.

### Permission explanation

Document permission behavior:

- which features need no macOS permissions.
- when Accessibility / Automation may be required.
- what happens if permissions are denied.
- what the app does not collect: terminal text, prompt text, tool command, workspace path, token, Authorization.

### Diagnostics export boundary

Define or minimally implement a diagnostics export boundary:

- export summary is user-previewable before sharing.
- export contains only sanitized app/version/health/instance/renderer/diagnostic status.
- export does not contain secret values, raw payloads, prompt text, tool command text, local full paths, config paths, workspace paths, or `api-token.json`.

### Signing / notarization / auto-update planning only

Create checklists for:

- signing identity.
- notarization requirements.
- Gatekeeper first-open notes.
- DMG / installer options.
- auto-update requirements: signature, channel, rollback, failure handling.

Unless a later phase explicitly implements and accepts these items, V6.1 must keep them as plan/checklist only.

## Out Of Scope

- Notarized production release.
- Production signing acceptance.
- Auto-update implementation.
- Cross-platform packaging.
- Windows packaging.
- Release distribution channel.

## Required Evidence

- packaging smoke evidence.
- first-run guide review.
- permission text review.
- diagnostics export redaction scan.
- signing / notarization / auto-update checklist.
- claim scan.

## Allowed Claim

```text
V6.1 release and distribution foundation passed for tested local macOS packaging scenarios.
```

## Forbidden Claims

```text
production signed release ready
notarized release ready
auto update ready
cross-platform ready
Windows ready
```

