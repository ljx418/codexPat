# V18 Wizard State and Evidence Spec

日期：2026-06-12  
状态：planned implementation spec。

## Purpose

This file defines the user-visible wizard states, reasonCodes, and evidence template for V18. It closes the gap between architecture-level planning and implementation-level UI acceptance.

## Wizard States

| State | User Meaning | Allowed Next |
| --- | --- | --- |
| `idle` | no photo selected | `photo_selected` |
| `photo_selected` | safe preview and metadata visible | `consent_required`, `traits_required` |
| `consent_required` | provider upload/generation consent missing | `consent_ready` |
| `traits_required` | user must approve cat traits and pack name | `generation_ready` |
| `generation_ready` | provider job may be started | `queued` |
| `queued` | job created but not uploading/generating | `uploading`, `blocked` |
| `uploading` | approved reference image is being sent | `generating`, `blocked`, `failed` |
| `generating` | provider is generating action output | `output_received`, `blocked`, `failed` |
| `output_received` | provider output is available for normalization | `packaging` |
| `packaging` | output is being normalized into pack | `qa_ready`, `blocked`, `failed` |
| `qa_ready` | QA results and 8-action preview are visible | `apply_ready`, `qa_failed` |
| `apply_ready` | user may apply to target pet | `applied`, `rollback_ready` |
| `applied` | target pet uses generated pack | `rollback_ready` |
| `rollback_ready` | previous pack can be restored | `rolled_back` |
| `blocked` | user or environment action required | terminal until fixed |
| `failed` | unrecoverable error in current attempt | terminal until retry |

## UI Requirements

The wizard must show:

- current step.
- next action.
- stable reasonCode.
- safe photo metadata.
- provider disclosure status.
- job status.
- generated action coverage.
- QA result.
- target pet selection.
- apply and rollback state.

The wizard must not show:

- full local path.
- raw filename if privacy-revealing.
- EXIF/GPS.
- raw provider response.
- token.
- Authorization.
- raw prompt with private data.

## Evidence Template

Each V18 runtime evidence file should include:

```text
status: passed / blocked / failed
date:
phase:
scope:
input:
  mediaType:
  dimensions:
  sizeBucket:
  localPathRecorded: no
consent:
  uploadConsent:
  costDisclosure:
  privacyDisclosure:
  retentionDisclosure:
  licenseDisclosure:
provider:
  name:
  model:
  capabilityDecision:
  jobStatesObserved:
  rawResponseRecorded: no
output:
  outputKind:
  actionCoverage:
  normalizedPack:
qa:
  sameCat:
  nonblank:
  offCanvas:
  loopClosure:
  frameDelta:
  scaleReadability:
runtime:
  previewZeroPetEvent:
  targetOnlyApply:
  rollback:
securityScan:
claimScan:
finalDecision:
```

## Screenshot Evidence

V18.5 and V18.6 must include screenshot-backed evidence for:

- photo selected and preview visible.
- provider job status visible.
- generated 8-action preview visible.
- target apply result visible.
- rollback result visible.

Screenshots must be sanitized and should not expose private file paths, provider credentials, prompt private data, or raw provider response.

## Hard Fail

- State jumps from `photo_selected` to `applied` without generation/QA.
- Provider call occurs before consent.
- QA failed pack can be applied.
- Preview mutates live pet state.
- Evidence records sensitive fields.
