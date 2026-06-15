# V12.x Target Architecture: Desktop Visibility Evidence Layer

status: planned
date: 2026-06-07

## Target Flow

```text
Tauri Desktop App
  -> PetWindowLifecycleController
  -> WindowVisibilityDiagnostics
  -> WindowLayeringPolicy
  -> SafePositionController
  -> ScreenshotEvidenceHarness
  -> AcceptanceHtmlReporter
```

## Current vs Target

| Area | Current V11 | V12 Target |
| --- | --- | --- |
| Visual proof | runtime capture HTML shows cat | real desktop screenshots also show cat |
| Window diagnostics | list API shows visible/position | diagnostics explain visible, hidden, offscreen, occluded/capture failure |
| Re-show/reset | manual UI and Tauri commands exist | evidence harness can force safe visible state |
| Report | summary page links evidence and embeds runtime screenshots | final report embeds real desktop screenshots and failure labels |
| Claim boundary | V11 living interaction passed scoped | V12 desktop visibility and screenshot-backed acceptance passed scoped |

## Safe Diagnostic Fields

Allowed:

- instanceId.
- displayName.
- windowLabel.
- visible boolean.
- sanitized position.
- sanitized size.
- monitor summary.
- last visibility action.
- reasonCode.
- screenshot observed result.

Forbidden:

- raw screen text.
- raw window title.
- prompt text.
- tool command text.
- token.
- Authorization.
- raw payload.
- full local path.
- workspace path.
- config path.
- clipboard contents.
- shell history.

## Evidence Boundary

V12 evidence may include screenshots of the desktop and app UI. It must not
include credential values, local path dumps, raw terminal output, prompt text,
or provider payloads.

## Implementation Contract

Detailed command names, diagnostics schema, screenshot artifact paths, pixel
visibility checks, and final HTML requirements are defined in:

- `docs/V12.x/v12_x-implementation-contract.md`

## Compatibility

V12 must preserve:

- V3/V4 Codex monitoring semantics.
- V5-V10 asset and renderer safety boundaries.
- V11 micro-interaction zero PetEvent boundary.
