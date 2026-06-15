# V18.1 Reference Photo Consent Smoke

status: passed
date: 2026-06-12
phase: V18.1 Reference Photo Consent and Provider Boundary
scope: real local cat photo intake, safe preview metadata, upload/generation consent boundary, provider disclosure boundary, credential-missing reasonCode.

## Real Input

| Field | Safe value |
| --- | --- |
| Source | repo cat photo reference |
| Media type | image/jpeg |
| Size bucket | small |
| Dimensions | 3072x4096 |
| Selected state | true |
| Local path recorded | no |
| Original filename recorded | no |

## Intake State / ReasonCode Table

| Case | State | reasonCode | selected | consent |
| --- | --- | --- | --- | --- |
| no photo | idle | photo_required | false | false |
| photo selected, no consent | consent_required | consent_required | true | false |
| photo selected, consent, no traits | traits_required | traits_required | true | true |
| photo selected, consent, traits | generation_ready | generation_ready | true | true |

## Provider Boundary Table

| Case | Status | reasonCode | uploadConsent | credentialConfigured |
| --- | --- | --- | --- | --- |
| no upload consent | blocked | consent_required | false | false |
| terms missing | blocked | provider_terms_required | true | false |
| cost disclosure missing | blocked | provider_cost_disclosure_required | true | false |
| privacy disclosure missing | blocked | provider_privacy_disclosure_required | true | false |
| retention disclosure missing | blocked | provider_retention_disclosure_required | true | false |
| license disclosure missing | blocked | provider_license_disclosure_required | true | false |
| credential missing after all disclosures | blocked | provider_credential_missing | true | false |

## Provider Generation Boundary

| Field | Result |
| --- | --- |
| mode | provider_api |
| jobState | blocked |
| reasonCode | provider_credential_missing |
| canStartProvider | false |
| provider output accepted | false |

## DOM Capture

```html
<section id="photo-2d-wizard-modal" data-wizard-state="generation_ready" data-reason-code="generation_ready" data-provider-boundary-status="blocked" data-provider-boundary-reason-code="provider_credential_missing" data-accepted-pet-events="0" data-calls-notify="false" data-writes-cat-state-machine="false" data-mutates-live-pet="false"></section>
```

## Safe Evidence Snapshot

```json
{
  "intake": {
    "state": "generation_ready",
    "reasonCode": "generation_ready",
    "safeMetadata": {
      "selected": true,
      "mediaType": "image/jpeg",
      "sizeBucket": "small",
      "dimensions": "3072x4096",
      "safeSourceRef": "selected-local-photo"
    },
    "targetPackId": "v18-docs-cat",
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
  },
  "providerBoundary": {
    "providerName": "minimax",
    "status": "blocked",
    "reasonCode": "provider_credential_missing",
    "uploadConsent": true,
    "termsReviewed": true,
    "costDisclosureAccepted": true,
    "privacyDisclosureAccepted": true,
    "retentionDisclosureAccepted": true,
    "licenseDisclosureAccepted": true,
    "attributionDisclosureAccepted": true,
    "credentialConfigured": false,
    "safeFieldList": [
      "providerName",
      "uploadConsent",
      "termsReviewed",
      "costDisclosureAccepted",
      "privacyDisclosureAccepted",
      "retentionDisclosureAccepted",
      "licenseDisclosureAccepted",
      "attributionDisclosureAccepted",
      "credentialConfigured",
      "status",
      "reasonCode"
    ]
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
| stores source image bytes | false |
| stores EXIF/GPS | false |
| exposes original filename | false |
| exposes full local path | false |
| records provider response body | false |
| exposes credential value | false |

## Security Scan

Result: passed.

Evidence stores only safe metadata, state names, reasonCodes, and boolean disclosure states. It does not record credential values, provider response bodies, source image bytes, location metadata, original filenames, private filesystem references, workspace/config paths, or provider account data.

## PRD / Spec Review

V18.1 meets the PRD requirement that the user can select a real local cat photo, see safe metadata, and be blocked from provider generation until upload consent, disclosures, and credential handling are ready.

V18.2 remains Conditional Go and must run provider capability preflight before any provider job or final claim.

## Allowed Claim

V18.1 reference photo consent and provider boundary passed for tested local UI scenarios.

## Forbidden Claims

This evidence does not claim automatic photo-to-2D readiness for arbitrary cats, provider integration, Petdex parity, 3D readiness, photo-to-3D readiness, production release readiness, Windows readiness, or cross-platform readiness.
