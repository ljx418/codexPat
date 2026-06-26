import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createV33SampleIntakeRecord, type V33SafeSampleInput } from "./v33-sample-intake";
import {
  buildV34PhotoSampleSetRecord,
  buildV34SubjectDetectionEvidenceSnapshot,
  createV34SubjectDetectionRecord,
  v34SubjectDetectionHasForbiddenContent
} from "./v34-subject-detection";

describe("V34.1 subject detection", () => {
  it("accepts at least three single-cat samples and rejects negative subjects", () => {
    const records = [
      createV33SampleIntakeRecord(clearSample("v34_clear_orange_tabby", "orange", "tabby")),
      createV33SampleIntakeRecord(clearSample("v34_clear_silver_tabby", "silver", "tabby")),
      createV33SampleIntakeRecord(clearSample("v34_clear_calico", "calico", "patched")),
      createV33SampleIntakeRecord(multiSubjectSample()),
      createV33SampleIntakeRecord(notCatSample())
    ];
    const detections = records.map((record) => createV34SubjectDetectionRecord(record));
    const sampleSet = buildV34PhotoSampleSetRecord({
      sampleSetId: "v34_subject_detection_named_samples",
      records,
      evidenceRefs: ["docs/V34.x/evidence/v34_1-subject-detection"]
    });
    const snapshot = buildV34SubjectDetectionEvidenceSnapshot({ sampleSet, detections });

    assert.equal(snapshot.singleCatPassedCount, 3);
    assert.equal(snapshot.negativeRejectedCount, 2);
    assert.equal(snapshot.sampleSet.hasClearSamples, true);
    assert.equal(snapshot.sampleSet.hasNegativeSamples, true);
    assert.equal(v34SubjectDetectionHasForbiddenContent(snapshot), false);
  });

  it("blocks low-visibility single-cat samples before segmentation", () => {
    const intake = createV33SampleIntakeRecord({
      ...clearSample("v34_low_visible_single_cat", "orange", "tabby"),
      sampleClass: "difficult",
      qualitySignals: {
        ...clearSignals(),
        catVisibleRatio: 0.5
      }
    });
    const detection = createV34SubjectDetectionRecord(intake);

    assert.equal(detection.status, "blocked");
    assert.equal(detection.subjectCount, "one");
    assert.equal(detection.visibleRatio, "low");
    assert.equal(detection.reasonCodes.includes("insufficient_body_visibility"), true);
  });

  it("keeps detection records privacy-safe", () => {
    const intake = createV33SampleIntakeRecord(clearSample("v34_privacy_safe_single_cat", "black", "solid"));
    const detection = createV34SubjectDetectionRecord(intake);

    assert.equal(detection.status, "passed");
    assert.equal(detection.safeBoundingBoxBucket, "full_body");
    assert.equal(v34SubjectDetectionHasForbiddenContent(detection), false);
  });
});

function clearSample(sampleId: string, coatColor: string, pattern: string): V33SafeSampleInput {
  return {
    sampleId,
    sampleClass: "clear",
    catName: "Named Cat",
    approvedTraits: `${coatColor} ${pattern}, compact body, round face, amber eyes, visible tail`,
    localReferenceConsent: true,
    photo: {
      mediaType: "image/png",
      sizeBytes: 1_300_000,
      fileExtension: "png"
    },
    width: 1024,
    height: 1024,
    qualitySignals: clearSignals(),
    visualHints: {
      coatColor,
      pattern,
      faceShape: "round",
      eyeColor: "amber",
      earShape: "upright",
      bodyPose: "compact_sitting",
      tailVisibility: "visible"
    },
    evidenceRefs: ["docs/V34.x/evidence/safe-subject-detection"]
  };
}

function multiSubjectSample(): V33SafeSampleInput {
  return {
    ...clearSample("v34_negative_multi_subject", "orange", "tabby"),
    sampleClass: "negative",
    qualitySignals: {
      ...clearSignals(),
      catCount: 2
    }
  };
}

function notCatSample(): V33SafeSampleInput {
  return {
    ...clearSample("v34_negative_not_cat", "unknown", "unknown"),
    sampleClass: "negative",
    qualitySignals: {
      ...clearSignals(),
      catCount: 0
    }
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
