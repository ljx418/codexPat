# V17.1 Wizard Shell Photo Intake Smoke

Date: 2026-06-11
Status: passed
Scope: Productized local photo intake shell only. At V17.1 evidence time,
V17.2-V17.6 were not yet accepted; current V17 closure status is tracked in
`docs/V17.x/v17_6-final-acceptance-report.md`.

## Real Input

| Field | Safe value |
| --- | --- |
| Source | docs cat photo reference |
| Media type | image/jpeg |
| Size bucket | small |
| Dimensions | 3072x4096 |
| Selected state | true |

## State / ReasonCode Table

| Case | State | reasonCode | selected | consent |
| --- | --- | --- | --- | --- |
| idle | idle | photo_required | false | false |
| photo selected | consent_required | consent_required | true | false |
| consent checked | traits_required | traits_required | true | true |
| generation ready | generation_ready | generation_ready | true | true |

## DOM Capture

The shell exposes only safe state and mutation-boundary data:

```html
<section id="photo-2d-wizard-modal" data-wizard-state="generation_ready" data-reason-code="generation_ready" data-accepted-pet-events="0" data-calls-notify="false" data-writes-cat-state-machine="false" data-mutates-live-pet="false"></section>
```

## Safe Evidence Snapshot

```json
{
  "state": "generation_ready",
  "reasonCode": "generation_ready",
  "safeMetadata": {
    "selected": true,
    "mediaType": "image/jpeg",
    "sizeBucket": "small",
    "dimensions": "3072x4096",
    "safeSourceRef": "selected-local-photo"
  },
  "targetPackId": "docs-cat-action-pack",
  "consent": true,
  "safeFieldList": [
    "state",
    "reasonCode",
    "safeMetadata.mediaType",
    "safeMetadata.sizeBucket",
    "safeMetadata.dimensions",
    "safeMetadata.selected",
    "consent",
    "targetPackId"
  ],
  "mutationBoundary": {
    "acceptedPetEvents": 0,
    "callsNotify": false,
    "writesCatStateMachine": false,
    "mutatesLivePetInstance": false,
    "storesRawPhoto": false,
    "storesExifGps": false,
    "exposesFullLocalPath": false,
    "exposesOriginalFilename": false
  }
}
```

## Zero Event / Mutation Proof

| Check | Result |
| --- | --- |
| accepted PetEvent | 0 |
| calls notify | false |
| writes CatStateMachine | false |
| mutates live PetInstance | false |
| stores raw photo | false |
| stores EXIF/GPS | false |
| exposes original filename | false |
| exposes full local path | false |

## Security Scan

Result: passed.

Evidence stores only the safe fields shown above. Secret values, auth headers, original image bytes, location metadata, user prompts, tool commands, provider responses, original filenames, and private filesystem references are not recorded.

## Claim Boundary

Allowed claim:
V17.1 productized photo-to-2D wizard shell photo intake passed for tested local photo intake scenario.

Forbidden claims remain not-ready:
- automatic photo-to-2D ready for arbitrary cats
- automatic photo-to-animation ready
- provider integration verified
- Petdex parity achieved
- 3D ready
- automatic photo-to-3D ready
- remote asset loading ready
- asset marketplace ready
- production signed release ready
- cross-platform ready
- Windows ready
