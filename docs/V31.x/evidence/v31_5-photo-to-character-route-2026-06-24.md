# V31.5 Photo-to-character Candidate Route

status: passed_scoped_candidate_only
date: 2026-06-24

## Summary

- Development plan: use real local cat samples only for candidate workflow evidence, with V29 synthetic samples excluded from readiness claims.
- Acceptance standard: consent/privacy boundary, suitability result, safe trait summary, and candidate-only claim boundary.
- Real sample count: 3.
- Sample results: [
    {
      "safeSampleId": "real-cat-front-1",
      "result": {
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
      "result": {
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
      "result": {
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
- Boundary: candidate workflow only; not arbitrary-cat automatic animation readiness.
- Audit opinion: this is candidate workflow evidence only and does not prove arbitrary-cat automatic high-quality animation.

## Required Boundary

This evidence does not claim Petdex parity, arbitrary-cat automatic animation ready, provider integration verified, 3D ready, production release ready, Windows ready, cross-platform ready, MCP ready, Claude Code integration verified, OS-level Codex window binding ready, or all Codex workflows verified.
