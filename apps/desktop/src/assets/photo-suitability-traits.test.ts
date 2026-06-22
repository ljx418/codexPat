import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPhotoSuitabilityEvidenceSnapshot,
  evaluatePhotoSuitability,
  photoSuitabilityHasForbiddenContent
} from "./photo-suitability-traits";

describe("V23 photo suitability and safe trait extraction", () => {
  it("accepts a clear single-cat photo with safe trait buckets", () => {
    const result = evaluatePhotoSuitability({
      mediaType: "image/jpeg",
      sizeBytes: 456_492,
      width: 1024,
      height: 1024,
      selectedState: "selected",
      safeSampleId: "sample_orange_cat_clear",
      qualitySignals: {
        blurScore: 0.86,
        catCount: 1,
        catVisibleRatio: 0.84,
        occlusionScore: 0.05,
        backgroundComplexity: 0.32,
        bodyVisible: true,
        tailVisible: true
      },
      visualHints: {
        coatColor: "orange",
        pattern: "tabby",
        faceShape: "round",
        eyeColor: "amber",
        earShape: "upright",
        bodyPose: "sitting",
        tailVisibility: "visible"
      }
    });
    const evidence = buildPhotoSuitabilityEvidenceSnapshot(result);

    assert.equal(result.status, "clear");
    assert.equal(result.primaryReasonCode, "photo_suitability_clear");
    assert.equal(result.traitSummary.confidence, "high");
    assert.equal(result.traitSummary.coatColorBucket, "orange");
    assert.equal(result.privacyBoundary.callsProvider, false);
    assert.equal(result.privacyBoundary.mutatesLivePet, false);
    assert.equal(photoSuitabilityHasForbiddenContent({ result, evidence }), false);
  });

  it("rejects low resolution and unsupported media before generation routes", () => {
    const lowResolution = evaluatePhotoSuitability({
      mediaType: "image/png",
      sizeBytes: 10_000,
      width: 200,
      height: 180,
      selectedState: "selected",
      safeSampleId: "sample_tiny"
    });
    const unsupported = evaluatePhotoSuitability({
      mediaType: "image/gif",
      sizeBytes: 10_000,
      width: 900,
      height: 900,
      selectedState: "selected",
      safeSampleId: "sample_gif"
    });

    assert.equal(lowResolution.status, "unsuitable");
    assert.ok(lowResolution.reasonCodes.includes("photo_low_resolution"));
    assert.equal(unsupported.status, "unsuitable");
    assert.ok(unsupported.reasonCodes.includes("photo_type_unsupported"));
  });

  it("rejects blurry, cropped, occluded, and multi-cat fixtures with stable reason codes", () => {
    const blurry = evaluatePhotoSuitability({
      mediaType: "image/jpeg",
      sizeBytes: 400_000,
      width: 900,
      height: 900,
      selectedState: "selected",
      safeSampleId: "sample_blurry",
      qualitySignals: { blurScore: 0.2, catCount: 1, catVisibleRatio: 0.8 }
    });
    const cropped = evaluatePhotoSuitability({
      mediaType: "image/jpeg",
      sizeBytes: 400_000,
      width: 900,
      height: 900,
      selectedState: "selected",
      safeSampleId: "sample_cropped",
      qualitySignals: { blurScore: 0.8, catCount: 1, catVisibleRatio: 0.25 }
    });
    const occluded = evaluatePhotoSuitability({
      mediaType: "image/jpeg",
      sizeBytes: 400_000,
      width: 900,
      height: 900,
      selectedState: "selected",
      safeSampleId: "sample_occluded",
      qualitySignals: { blurScore: 0.8, catCount: 1, catVisibleRatio: 0.7, occlusionScore: 0.8 }
    });
    const multiCat = evaluatePhotoSuitability({
      mediaType: "image/jpeg",
      sizeBytes: 400_000,
      width: 900,
      height: 900,
      selectedState: "selected",
      safeSampleId: "sample_multi_cat",
      qualitySignals: { blurScore: 0.8, catCount: 2, catVisibleRatio: 0.8 }
    });

    assert.equal(blurry.status, "unsuitable");
    assert.ok(blurry.reasonCodes.includes("photo_blurry"));
    assert.equal(cropped.status, "unsuitable");
    assert.ok(cropped.reasonCodes.includes("cat_cropped"));
    assert.equal(occluded.status, "unsuitable");
    assert.ok(occluded.reasonCodes.includes("cat_occluded"));
    assert.equal(multiCat.status, "unsuitable");
    assert.ok(multiCat.reasonCodes.includes("multi_cat_ambiguous"));
  });

  it("marks complex backgrounds as usable with risk instead of silent clear", () => {
    const result = evaluatePhotoSuitability({
      mediaType: "image/webp",
      sizeBytes: 800_000,
      width: 1200,
      height: 900,
      selectedState: "selected",
      safeSampleId: "sample_busy_background",
      qualitySignals: {
        blurScore: 0.8,
        catCount: 1,
        catVisibleRatio: 0.78,
        backgroundComplexity: 0.88
      },
      visualHints: {
        coatColor: "gray",
        pattern: "solid",
        faceShape: "round"
      }
    });

    assert.equal(result.status, "usable_with_risk");
    assert.ok(result.reasonCodes.includes("background_too_complex"));
    assert.ok(result.reasonCodes.includes("trait_summary_ready"));
  });

  it("rejects unsafe metadata and does not echo private content", () => {
    const result = evaluatePhotoSuitability({
      mediaType: "image/jpeg",
      sizeBytes: 400_000,
      width: 900,
      height: 900,
      selectedState: "selected",
      safeSampleId: "sample_unsafe",
      sourceLabel: "/Users/example/private-cat.jpg",
      visualHints: {
        coatColor: "orange"
      }
    });
    const evidence = buildPhotoSuitabilityEvidenceSnapshot(result);
    const serialized = JSON.stringify(evidence);

    assert.equal(result.status, "unsuitable");
    assert.ok(result.reasonCodes.includes("unsafe_metadata_rejected"));
    assert.doesNotMatch(serialized, /\/Users\//);
    assert.doesNotMatch(serialized, /private-cat/);
    assert.equal(photoSuitabilityHasForbiddenContent({ path: "/Users/example/private-cat.jpg" }), true);
  });
});
