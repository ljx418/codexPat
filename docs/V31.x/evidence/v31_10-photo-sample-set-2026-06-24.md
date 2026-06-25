# V31.10 Named Photo Sample Set

status: partial
date: 2026-06-24

## Pre-execution Development And Acceptance Plan

- Execute only the scoped V31 continuation phase named in this evidence.
- Use existing PRD and target architecture as the source of truth.
- Stop or mark blocked instead of passing if real visual, runtime, or photo-derived evidence is missing.

## Evidence

- Development plan: use existing local real cat photos as named positive/difficult samples, and keep missing negative real samples explicit.
- Acceptance standard: a full pass requires real accepted/difficult/blocked/negative samples; simulated negative coverage cannot prove the full sample set.
- PRD/spec review: arbitrary-cat photo-to-action readiness requires named sample-set evidence; current run is limited to local real cat photos plus simulated negative metadata.
- Real photo suitability snapshots: [
    {
      "safeSampleId": "real-cat-front-1",
      "sourceKind": "real_local_photo",
      "snapshot": {
        "status": "clear",
        "primaryReasonCode": "photo_suitability_clear",
        "reasonCodes": [
          "photo_suitability_clear",
          "trait_summary_ready"
        ],
        "safePhotoFields": [
          "dimensions",
          "mediaTypeBucket",
          "safeSampleId",
          "selectedState",
          "sizeBucket"
        ],
        "safeMetadata": {
          "mediaTypeBucket": "jpeg",
          "sizeBucket": "small",
          "dimensions": {
            "widthBucket": "large",
            "heightBucket": "large",
            "aspectRatioBucket": "portrait"
          },
          "selectedState": "selected",
          "safeSampleId": "real-cat-front-1"
        },
        "traitSummaryFields": [
          "bodyPose",
          "coatColorBucket",
          "confidence",
          "earShapeBucket",
          "eyeColorBucket",
          "faceShapeBucket",
          "patternBucket",
          "source",
          "tailVisibility"
        ],
        "traitSummary": {
          "coatColorBucket": "orange",
          "patternBucket": "tabby",
          "faceShapeBucket": "unknown-face",
          "eyeColorBucket": "unknown-eye",
          "earShapeBucket": "unknown-ear",
          "tailVisibility": "partial",
          "bodyPose": "front",
          "confidence": "medium",
          "source": "safe_visual_hints"
        },
        "privacyBoundary": {
          "storesSourceImageBytes": false,
          "persistsExifGps": false,
          "persistsSourceFileName": false,
          "persistsFullPath": false,
          "callsProvider": false,
          "mutatesLivePet": false
        }
      }
    },
    {
      "safeSampleId": "real-cat-sample-2",
      "sourceKind": "real_local_photo",
      "snapshot": {
        "status": "clear",
        "primaryReasonCode": "photo_suitability_clear",
        "reasonCodes": [
          "photo_suitability_clear",
          "trait_summary_ready"
        ],
        "safePhotoFields": [
          "dimensions",
          "mediaTypeBucket",
          "safeSampleId",
          "selectedState",
          "sizeBucket"
        ],
        "safeMetadata": {
          "mediaTypeBucket": "jpeg",
          "sizeBucket": "small",
          "dimensions": {
            "widthBucket": "large",
            "heightBucket": "large",
            "aspectRatioBucket": "landscape"
          },
          "selectedState": "selected",
          "safeSampleId": "real-cat-sample-2"
        },
        "traitSummaryFields": [
          "bodyPose",
          "coatColorBucket",
          "confidence",
          "earShapeBucket",
          "eyeColorBucket",
          "faceShapeBucket",
          "patternBucket",
          "source",
          "tailVisibility"
        ],
        "traitSummary": {
          "coatColorBucket": "mixed",
          "patternBucket": "tabby",
          "faceShapeBucket": "unknown-face",
          "eyeColorBucket": "unknown-eye",
          "earShapeBucket": "unknown-ear",
          "tailVisibility": "partial",
          "bodyPose": "three-quarter",
          "confidence": "medium",
          "source": "safe_visual_hints"
        },
        "privacyBoundary": {
          "storesSourceImageBytes": false,
          "persistsExifGps": false,
          "persistsSourceFileName": false,
          "persistsFullPath": false,
          "callsProvider": false,
          "mutatesLivePet": false
        }
      }
    },
    {
      "safeSampleId": "real-cat-sample-3",
      "sourceKind": "real_local_photo",
      "snapshot": {
        "status": "unsuitable",
        "primaryReasonCode": "photo_blurry",
        "reasonCodes": [
          "photo_blurry",
          "cat_cropped",
          "trait_summary_ready"
        ],
        "safePhotoFields": [
          "dimensions",
          "mediaTypeBucket",
          "safeSampleId",
          "selectedState",
          "sizeBucket"
        ],
        "safeMetadata": {
          "mediaTypeBucket": "jpeg",
          "sizeBucket": "small",
          "dimensions": {
            "widthBucket": "large",
            "heightBucket": "large",
            "aspectRatioBucket": "portrait"
          },
          "selectedState": "selected",
          "safeSampleId": "real-cat-sample-3"
        },
        "traitSummaryFields": [
          "bodyPose",
          "coatColorBucket",
          "confidence",
          "earShapeBucket",
          "eyeColorBucket",
          "faceShapeBucket",
          "patternBucket",
          "source",
          "tailVisibility"
        ],
        "traitSummary": {
          "coatColorBucket": "mixed",
          "patternBucket": "unknown",
          "faceShapeBucket": "unknown-face",
          "eyeColorBucket": "unknown-eye",
          "earShapeBucket": "unknown-ear",
          "tailVisibility": "hidden",
          "bodyPose": "partial",
          "confidence": "medium",
          "source": "safe_visual_hints"
        },
        "privacyBoundary": {
          "storesSourceImageBytes": false,
          "persistsExifGps": false,
          "persistsSourceFileName": false,
          "persistsFullPath": false,
          "callsProvider": false,
          "mutatesLivePet": false
        }
      }
    }
  ].
- Sample-set result: {
    "status": "partial",
    "reasonCodes": [
      "named_photo_sample_set_partial_real_data",
      "photo_negative_samples_simulated_only",
      "photo_sample_blocked"
    ],
    "realSampleCount": 3,
    "realPassingOrRiskCount": 2,
    "simulatedNegativeCount": 2,
    "sampleSummaries": [
      {
        "safeSampleId": "real-cat-front-1",
        "sampleKind": "real_positive",
        "suitabilityStatus": "clear",
        "primaryReasonCode": "photo_suitability_clear"
      },
      {
        "safeSampleId": "real-cat-sample-2",
        "sampleKind": "real_positive",
        "suitabilityStatus": "clear",
        "primaryReasonCode": "photo_suitability_clear"
      },
      {
        "safeSampleId": "real-cat-sample-3",
        "sampleKind": "real_difficult",
        "suitabilityStatus": "unsuitable",
        "primaryReasonCode": "photo_blurry"
      },
      {
        "safeSampleId": "simulated-non-cat-negative",
        "sampleKind": "simulated_negative",
        "suitabilityStatus": "unsuitable",
        "primaryReasonCode": "multi_cat_ambiguous"
      },
      {
        "safeSampleId": "simulated-low-quality-blocked",
        "sampleKind": "simulated_blocked",
        "suitabilityStatus": "unsuitable",
        "primaryReasonCode": "photo_blurry"
      }
    ],
    "boundary": "partial_real_data_with_simulated_negative"
  }.
- Audit opinion: V31.10 is partial because the positive/difficult samples use real local photos, while negative/blocked samples are simulated metadata only.
- Claim/security scan: passed/passed; doc audit: passed.

## Required Boundary

This evidence does not claim Petdex parity, arbitrary-cat automatic animation ready, automatic photo-to-2D ready for arbitrary cats, provider integration verified, 3D ready, production signed release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
