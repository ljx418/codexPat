# V17.2 Generation Mode Loading Smoke

Date: 2026-06-11
Status: passed
Scope: Generation mode selector and loading/status UX only. V17.3 crop/package, V17.4 QA preview, V17.5 apply/rollback, and V17.6 final gate remain not-run.

## Real Inputs

| Input | Safe metadata |
| --- | --- |
| Local cat photo | image/jpeg; small; 3072x4096 |
| Local action sheet | image/png; small; 1088x630 |

## Mode / Loading State Table

| Case | Mode | Job state | reasonCode | copy prompt | select sheet | start provider |
| --- | --- | --- | --- | --- | --- | --- |
| no mode selected | none | pending_user_action | generation_mode_required | false | false | false |
| host image tool assisted | host_image_tool_assisted | waiting_for_output | host_tool_prompt_ready | true | true | false |
| provider api not configured | provider_api | blocked | provider_not_configured | false | false | false |
| local action sheet import | local_action_sheet_import | output_ready | action_sheet_output_ready | false | true | false |

## DOM Capture

```html
<section class="photo-2d-intake-shell" data-wizard-state="generation_ready" data-reason-code="generation_ready" data-generation-mode="local_action_sheet_import" data-job-state="output_ready" data-generation-reason-code="action_sheet_output_ready" data-accepted-pet-events="0" data-calls-notify="false" data-writes-cat-state-machine="false" data-mutates-live-pet="false"></section>
```

## Safe Generation Evidence Snapshot

```json
{
  "mode": "local_action_sheet_import",
  "jobState": "output_ready",
  "reasonCode": "action_sheet_output_ready",
  "canCopyPrompt": false,
  "canSelectActionSheet": true,
  "canStartProvider": false,
  "actionSheetMetadata": {
    "selected": true,
    "mediaType": "image/png",
    "sizeBucket": "small",
    "dimensions": "1088x630",
    "safeSourceRef": "selected-local-photo"
  },
  "safeFieldList": [
    "mode",
    "jobState",
    "reasonCode",
    "actionSheetMetadata.mediaType",
    "actionSheetMetadata.sizeBucket",
    "actionSheetMetadata.dimensions",
    "canCopyPrompt",
    "canSelectActionSheet",
    "canStartProvider"
  ],
  "mutationBoundary": {
    "acceptedPetEvents": 0,
    "callsNotify": false,
    "writesCatStateMachine": false,
    "mutatesLivePetInstance": false,
    "storesRawProviderResponse": false,
    "exposesRawPromptInStatus": false,
    "exposesCredential": false,
    "exposesFullLocalPath": false
  }
}
```

## Acceptance Result

| Check | Result |
| --- | --- |
| Host/manual path gives copy-prompt and upload entry | passed |
| Provider path safely not-ready without configuration | passed |
| Local action sheet path reaches output_ready | passed |
| Status excludes raw prompt and provider response | passed |
| Status excludes credential and private filesystem references | passed |
| Zero PetEvent / notify / CatStateMachine mutation | passed |

## PRD / Spec Review

V17.2 matches the PRD requirement for generation mode choice and loading/status UX. It intentionally does not crop, package, QA-preview, apply, or rollback assets.

## Claim Boundary

Allowed claim:
V17.2 generation mode and loading UX passed for tested host/manual and not-ready provider scenarios.

Direct provider API generation remains not-ready.
V17.3-V17.6 remain not-run.
