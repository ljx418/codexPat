import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createV33SampleIntakeRecord, type V33SafeSampleInput } from "./v33-sample-intake";
import { createV34SubjectDetectionRecord } from "./v34-subject-detection";
import {
  buildV34SegmentationMaskEvidenceSnapshot,
  createV34SegmentationMaskRecord,
  v34SegmentationMaskHasForbiddenContent
} from "./v34-segmentation-mask";

describe("V34.2 segmentation mask", () => {
  it("creates passed mask records for V34.1 passed single-cat samples", () => {
    const detections = [
      clearDetection("v34_mask_orange_tabby"),
      clearDetection("v34_mask_silver_tabby"),
      clearDetection("v34_mask_calico")
    ];
    const masks = detections.map((detection) => createV34SegmentationMaskRecord({ detection }));
    const snapshot = buildV34SegmentationMaskEvidenceSnapshot(masks);

    assert.equal(snapshot.passedCount, 3);
    assert.equal(snapshot.eligibleForCharacterAssetCount, 3);
    assert.equal(snapshot.records.every((record) => record.transparentCropEvidenceRef.includes("transparent-crop")), true);
    assert.equal(v34SegmentationMaskHasForbiddenContent(snapshot), false);
  });

  it("blocks high leakage masks instead of allowing them into character assets", () => {
    const mask = createV34SegmentationMaskRecord({
      detection: clearDetection("v34_mask_leakage_case"),
      backgroundLeakageRatio: 0.36
    });

    assert.equal(mask.status, "blocked");
    assert.equal(mask.backgroundLeakageBucket, "high");
    assert.equal(mask.reasonCodes.includes("mask_background_leakage"), true);
  });

  it("does not create passed masks from blocked or failed subject detection records", () => {
    const blockedDetection = createV34SubjectDetectionRecord(createV33SampleIntakeRecord({
      ...clearSample("v34_low_visible_before_mask"),
      sampleClass: "difficult",
      qualitySignals: { ...clearSignals(), catVisibleRatio: 0.5 }
    }));
    const failedDetection = createV34SubjectDetectionRecord(createV33SampleIntakeRecord({
      ...clearSample("v34_not_cat_before_mask"),
      sampleClass: "negative",
      qualitySignals: { ...clearSignals(), catCount: 0 }
    }));

    const blockedMask = createV34SegmentationMaskRecord({ detection: blockedDetection });
    const failedMask = createV34SegmentationMaskRecord({ detection: failedDetection });

    assert.equal(blockedMask.status, "blocked");
    assert.equal(failedMask.status, "failed");
    assert.equal(blockedMask.reasonCodes.includes("subject_detection_failed"), true);
    assert.equal(failedMask.reasonCodes.includes("subject_detection_failed"), true);
  });
});

function clearDetection(sampleId: string) {
  return createV34SubjectDetectionRecord(createV33SampleIntakeRecord(clearSample(sampleId)));
}

function clearSample(sampleId: string): V33SafeSampleInput {
  return {
    sampleId,
    sampleClass: "clear",
    catName: "Named Cat",
    approvedTraits: "orange tabby, compact body, round face, amber eyes, visible tail",
    localReferenceConsent: true,
    photo: { mediaType: "image/png", sizeBytes: 1_300_000, fileExtension: "png" },
    width: 1024,
    height: 1024,
    qualitySignals: clearSignals(),
    visualHints: {
      coatColor: "orange",
      pattern: "tabby",
      faceShape: "round",
      eyeColor: "amber",
      earShape: "upright",
      bodyPose: "compact_sitting",
      tailVisibility: "visible"
    },
    evidenceRefs: ["docs/V34.x/evidence/safe-segmentation-mask"]
  };
}

function clearSignals() {
  return {
    blurScore: 0.82,
    catCount: 1,
    catVisibleRatio: 0.82,
    occlusionScore: 0.08,
    backgroundComplexity: 0.28,
    bodyVisible: true,
    tailVisible: true
  };
}
